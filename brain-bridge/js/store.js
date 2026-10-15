/*
 * Brain Bridge — progress storage.
 *
 * Everything lives in the browser's localStorage under one key, so the site
 * works as plain static files with no account. The parent corner can export
 * the JSON (for a backup or to move to another device) and import it again.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.BBStore = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const KEY = 'brainbridge.v1';
  const VERSION = 1;

  function defaultState() {
    return {
      version: VERSION,
      profile: { name: '', schools: ['bgs', 'qeh'], sessionDay: 6, weeklyTokenLimit: 1, pin: '', sound: true, created: Date.now() },
      mastery: {},
      seen: {},
      passages: {},
      wordBank: {},
      sessions: [],
      practiceLog: [],
      tokens: { earned: 0, spent: 0, history: [] },
      writing: [],
      interview: [],
      badges: [],
      xp: 0,
      current: null
    };
  }

  function migrate(state) {
    const d = defaultState();
    const out = Object.assign({}, d, state || {});
    out.profile = Object.assign({}, d.profile, (state && state.profile) || {});
    out.tokens = Object.assign({}, d.tokens, (state && state.tokens) || {});
    ['mastery', 'seen', 'passages', 'wordBank'].forEach((k) => { if (!out[k] || typeof out[k] !== 'object') out[k] = {}; });
    ['sessions', 'practiceLog', 'writing', 'interview', 'badges'].forEach((k) => { if (!Array.isArray(out[k])) out[k] = []; });
    out.version = VERSION;
    return out;
  }

  function storage() {
    try { return typeof localStorage !== 'undefined' ? localStorage : null; } catch (e) { return null; }
  }

  function load() {
    const s = storage();
    if (!s) return defaultState();
    try { const raw = s.getItem(KEY); return raw ? migrate(JSON.parse(raw)) : defaultState(); } catch (e) { return defaultState(); }
  }

  function save(state) {
    const s = storage();
    if (!s) return false;
    try { s.setItem(KEY, JSON.stringify(state)); return true; } catch (e) { return false; }
  }

  function reset() {
    const s = storage();
    if (s) s.removeItem(KEY);
    return defaultState();
  }

  function exportJson(state) {
    return JSON.stringify(Object.assign({}, state, { exportedAt: new Date().toISOString() }), null, 2);
  }

  function importJson(text) {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object' || !parsed.profile) throw new Error('That file does not look like a Brain Bridge backup.');
    return migrate(parsed);
  }

  return { KEY, VERSION, defaultState, migrate, load, save, reset, exportJson, importJson };
});
