'use strict';
/*
 * Study Quest store: one adapter over two homes for the data.
 *  - Cloud mode: the claude.ai artifact's shared database (window.claude.use('db')),
 *    so sessions, tokens and the gaming timer follow Eli across devices and a
 *    parent can review them from anywhere the artifact is open.
 *  - Local mode: the browser's localStorage, used when the app runs as a plain
 *    static site (this repo) or the database isn't available.
 * The app never talks to either directly; it calls SQStore and re-renders on change.
 */
(function (root, factory) {
  const mod = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  else root.SQStore = mod;
})(typeof self !== 'undefined' ? self : this, function () {

  const KEY = 'studyquest.v1';
  const PENDING_KEY = 'studyquest.pending.v1';

  function blankState() {
    return { sessions: [], redemptions: [], adjustments: [], settings: null, timer: null };
  }

  function safeStorage() {
    try {
      const s = typeof localStorage !== 'undefined' ? localStorage : null;
      if (!s) return null;
      s.setItem('studyquest.probe', '1');
      s.removeItem('studyquest.probe');
      return s;
    } catch (e) { return null; }
  }

  function readJson(storage, key) {
    try {
      const raw = storage && storage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function writeJson(storage, key, value) {
    try {
      if (storage) storage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) { return false; }
  }

  function upsertById(list, item) {
    const i = list.findIndex(x => x.id === item.id);
    if (i >= 0) list[i] = item; else list.push(item);
    return list;
  }

  function createStore() {
    const store = {
      mode: 'boot',          // 'cloud' | 'local' | 'boot'
      degraded: false,       // cloud reads work but a write failed
      state: blankState(),
      onChange: null,
      onNotice: null,
      _db: null,
      _storage: safeStorage(),
      _unsubs: []
    };

    function emit() { if (store.onChange) store.onChange(store.state, store); }
    function notice(msg) { if (store.onNotice) store.onNotice(msg); }

    function loadLocal() {
      const saved = readJson(store._storage, KEY);
      store.state = Object.assign(blankState(), saved || {});
      store.mode = 'local';
      emit();
    }

    function saveLocal() {
      if (!writeJson(store._storage, KEY, store.state)) {
        notice('Could not save on this device — progress may be lost when this page closes.');
      }
    }

    // Writes that could not reach the cloud are kept locally so nothing is lost.
    function stashPending(kind, item) {
      const pending = readJson(store._storage, PENDING_KEY) || [];
      pending.push({ kind, item });
      writeJson(store._storage, PENDING_KEY, pending);
    }

    function applyPendingLocally() {
      const pending = readJson(store._storage, PENDING_KEY) || [];
      pending.forEach(p => {
        if (p.kind === 'sessions') upsertById(store.state.sessions, p.item);
        if (p.kind === 'redemptions') upsertById(store.state.redemptions, p.item);
        if (p.kind === 'adjustments') upsertById(store.state.adjustments, p.item);
      });
    }

    function subscribeCloud(db) {
      const subs = [
        ['sessions', 'sessions'], ['redemptions', 'redemptions'], ['adjustments', 'adjustments']
      ];
      subs.forEach(([coll, field]) => {
        store._unsubs.push(db.collection(coll).onSnapshot(snap => {
          store.state[field] = snap.docs.filter(d => d.exists).map(d => d.data());
          applyPendingLocally();
          emit();
        }, () => { /* terminal error: keep last known state */ }));
      });
      store._unsubs.push(db.doc('app/settings').onSnapshot(snap => {
        store.state.settings = snap.exists ? snap.data() : null;
        emit();
      }, () => {}));
      store._unsubs.push(db.doc('app/timer').onSnapshot(snap => {
        store.state.timer = snap.exists ? snap.data() : null;
        emit();
      }, () => {}));
    }

    store.init = async function init() {
      let db = null;
      try {
        if (typeof window !== 'undefined' && window.claude && typeof window.claude.use === 'function') {
          db = await window.claude.use('db');
        }
      } catch (e) { db = null; }
      if (db) {
        store._db = db;
        store.mode = 'cloud';
        subscribeCloud(db);
        emit();
      } else {
        loadLocal();
      }
      return store.mode;
    };

    async function cloudWrite(kind, writeFn, item) {
      try {
        await writeFn();
        return true;
      } catch (e) {
        store.degraded = true;
        if (item) {
          stashPending(kind, item);
          applyPendingLocally();
          emit();
        }
        notice('Couldn’t save to the shared record (are you signed in with access?). Saved on this device instead.');
        return false;
      }
    }

    store.addSession = async function (session) {
      if (store.mode === 'cloud') {
        // Show it immediately; the snapshot will confirm.
        upsertById(store.state.sessions, session); emit();
        return cloudWrite('sessions', () => store._db.collection('sessions').doc(session.id).set(session), session);
      }
      upsertById(store.state.sessions, session); saveLocal(); emit();
      return true;
    };

    store.addRedemption = async function (r) {
      if (store.mode === 'cloud') {
        upsertById(store.state.redemptions, r); emit();
        return cloudWrite('redemptions', () => store._db.collection('redemptions').doc(r.id).set(r), r);
      }
      upsertById(store.state.redemptions, r); saveLocal(); emit();
      return true;
    };

    store.addAdjustment = async function (a) {
      if (store.mode === 'cloud') {
        upsertById(store.state.adjustments, a); emit();
        return cloudWrite('adjustments', () => store._db.collection('adjustments').doc(a.id).set(a), a);
      }
      upsertById(store.state.adjustments, a); saveLocal(); emit();
      return true;
    };

    store.saveSettings = async function (settings) {
      store.state.settings = settings; emit();
      if (store.mode === 'cloud') {
        return cloudWrite('settings', () => store._db.doc('app/settings').set(settings), null);
      }
      saveLocal();
      return true;
    };

    store.setTimer = async function (timer) {
      store.state.timer = timer; emit();
      if (store.mode === 'cloud') {
        return cloudWrite('timer', () => store._db.doc('app/timer').set(timer), null);
      }
      saveLocal();
      return true;
    };

    store.clearTimer = async function () {
      store.state.timer = null; emit();
      if (store.mode === 'cloud') {
        return cloudWrite('timer', () => store._db.doc('app/timer').delete(), null);
      }
      saveLocal();
      return true;
    };

    store.destroy = function () {
      store._unsubs.forEach(u => { try { u(); } catch (e) {} });
      store._unsubs = [];
    };

    return store;
  }

  return { createStore, blankState, upsertById, KEY, PENDING_KEY };
});
