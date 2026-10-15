'use strict';
/* Study Quest UI. Depends on SQEngine, SQStore and the SQ_DATA subject files. */
(function () {
  const E = window.SQEngine;
  const SUBJECTS = window.SQ_DATA || [];
  const store = window.SQStore.createStore();

  const $ = sel => document.querySelector(sel);
  let session = null;          // active learning session
  let rewardTick = null;       // countdown interval
  let timesUpPlayed = false;

  // ------------------------------------------------------------------ utils

  function esc(s) {
    return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function el(tag, attrs, html) {
    const n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(k => {
      if (k === 'class') n.className = attrs[k];
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), attrs[k]);
      else n.setAttribute(k, attrs[k]);
    });
    if (html != null) n.innerHTML = html;
    return n;
  }

  let toastTimer = null;
  function toast(msg) {
    let t = $('#toast');
    if (!t) { t = el('div', { id: 'toast', class: 'toast' }); document.body.appendChild(t); }
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 3600);
  }

  // In-page modal (the artifact viewer suppresses confirm(), so we build our own).
  function modal(title, bodyHtml, buttons) {
    const back = el('div', { class: 'modal-back' });
    const box = el('div', { class: 'modal' });
    box.appendChild(el('h3', null, esc(title)));
    box.appendChild(el('div', null, bodyHtml));
    const row = el('div', { class: 'row' });
    buttons.forEach(b => {
      row.appendChild(el('button', {
        class: 'btn ' + (b.kind || 'secondary'),
        onclick: () => { document.body.removeChild(back); if (b.fn) b.fn(); }
      }, esc(b.label)));
    });
    box.appendChild(row);
    back.appendChild(box);
    document.body.appendChild(back);
  }

  // ------------------------------------------------------------------ sound

  let audioCtx = null;
  function soundOn() { try { return localStorage.getItem('sq.sound') !== 'off'; } catch (e) { return true; } }
  function setSound(on) { try { localStorage.setItem('sq.sound', on ? 'on' : 'off'); } catch (e) {} }
  function beep(freq, start, dur, vol) {
    if (!soundOn()) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = 'triangle'; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, audioCtx.currentTime + start);
      g.gain.exponentialRampToValueAtTime(vol || 0.12, audioCtx.currentTime + start + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + start + dur);
      o.connect(g); g.connect(audioCtx.destination);
      o.start(audioCtx.currentTime + start); o.stop(audioCtx.currentTime + start + dur + 0.05);
    } catch (e) { /* no sound available */ }
  }
  const sfx = {
    correct: () => { beep(660, 0, 0.12); beep(880, 0.1, 0.16); },
    wrong: () => beep(196, 0, 0.25, 0.08),
    token: () => { beep(523, 0, 0.12); beep(659, 0.11, 0.12); beep(784, 0.22, 0.12); beep(1047, 0.33, 0.3); },
    timesup: () => { beep(880, 0, 0.3); beep(880, 0.45, 0.3); beep(880, 0.9, 0.5); }
  };

  function confetti() {
    const canvas = el('canvas', { id: 'confetti' });
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width = innerWidth; canvas.height = innerHeight;
    const colors = ['#eda100', '#2a78d6', '#1baf7a', '#e87ba4', '#eb6834'];
    const parts = Array.from({ length: 130 }, () => ({
      x: Math.random() * canvas.width, y: -20 - Math.random() * canvas.height * 0.4,
      vy: 2.2 + Math.random() * 3.4, vx: -1.4 + Math.random() * 2.8,
      s: 5 + Math.random() * 6, r: Math.random() * Math.PI, vr: -0.1 + Math.random() * 0.2,
      c: colors[Math.floor(Math.random() * colors.length)]
    }));
    const t0 = Date.now();
    (function frame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      parts.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
        ctx.restore();
      });
      if (Date.now() - t0 < 2600) requestAnimationFrame(frame);
      else canvas.remove();
    })();
  }

  // ------------------------------------------------------------------ state helpers

  function settings() { return E.settingsWithDefaults(store.state.settings); }
  function wallet() { return E.walletTotals(store.state.sessions, store.state.redemptions, store.state.adjustments); }
  function subjectColor(id) { return 'var(--c-' + id + ')'; }
  function nowIso() { return new Date().toISOString(); }

  function bestForTopic(topicId) {
    const done = store.state.sessions.filter(s => s.topicId === topicId && s.status === 'completed');
    if (!done.length) return null;
    return { best: Math.max(...done.map(s => s.accuracy || 0)), times: done.length };
  }

  // ------------------------------------------------------------------ routing

  function route() {
    const h = (location.hash || '#home').slice(1);
    if (session) return { name: 'session' };
    if (h.startsWith('subject-')) return { name: 'subject', id: h.slice(8) };
    if (['home', 'rewards', 'records', 'parent'].includes(h)) return { name: h };
    return { name: 'home' };
  }

  window.addEventListener('hashchange', () => {
    if (session && session.phase !== 'done' && location.hash !== '#session') {
      const target = location.hash;
      location.hash = '#session';
      modal('Leave this session?', '<p>If you stop now, the session is recorded as unfinished and no token is earned.</p>', [
        { label: 'Keep learning', kind: 'secondary' },
        { label: 'Stop session', kind: 'danger', fn: () => { abandonSession(); location.hash = target; } }
      ]);
      return;
    }
    render();
  });

  window.addEventListener('beforeunload', e => {
    if (session && session.phase !== 'done') { e.preventDefault(); e.returnValue = ''; }
  });

  // ------------------------------------------------------------------ shell

  function renderShell() {
    const root = route();
    const w = wallet();
    const tabs = [
      ['home', 'Learn'], ['rewards', 'Rewards'], ['records', 'Records'], ['parent', 'Parent']
    ].map(([id, label]) =>
      '<a href="#' + id + '" class="' + (root.name === id || (id === 'home' && root.name === 'subject') ? 'active' : '') + '">' + label + '</a>'
    ).join('');
    $('#topbar').innerHTML =
      '<div class="topbar-inner">' +
      '<a class="logo" href="#home"><span class="spark">⚡</span>Study Quest</a>' +
      '<nav class="tabs">' + tabs + '</nav>' +
      '<span class="wallet" title="Game tokens"><span class="coin"></span>' + w.balance + '</span>' +
      '</div>';
  }

  function updateWalletBadge() {
    const n = document.querySelector('.wallet');
    if (n) n.innerHTML = '<span class="coin"></span>' + wallet().balance;
  }

  function render() {
    renderShell();
    const main = $('#view');
    const r = route();
    if (r.name === 'session') return renderSession(main);
    stopSessionTick();
    if (r.name === 'subject') return renderSubject(main, r.id);
    if (r.name === 'rewards') return renderRewards(main);
    if (r.name === 'records') return renderRecords(main);
    if (r.name === 'parent') return renderParent(main);
    return renderHome(main);
  }

  // ------------------------------------------------------------------ home

  function renderHome(main) {
    const s = settings();
    const sum = E.summary(store.state.sessions);
    const streak = E.streak(store.state.sessions, nowIso());
    const w = wallet();
    const capNote = s.dailyTokenCap > 0 ? ' (max ' + s.dailyTokenCap + ' token' + (s.dailyTokenCap > 1 ? 's' : '') + ' a day)' : '';
    main.innerHTML =
      '<h1>Ready to earn, Eli?</h1>' +
      '<p class="lede">Pick a subject, complete a session, earn a token. One token = <b>' + s.rewardMinutes + ' minutes of gaming</b>.</p>' +
      '<div class="hero">' +
      '  <div class="card balance"><div class="big"><span class="coin"></span>' + w.balance + ' token' + (w.balance === 1 ? '' : 's') + '</div>' +
      '    <div class="rules">Earned ' + w.earned + ' · spent ' + w.spent + (w.adjusted ? ' · adjusted ' + (w.adjusted > 0 ? '+' : '') + w.adjusted : '') + '</div></div>' +
      '  <div class="card"><h3>How to earn a token</h3><div class="rules">Finish every question, score <b>' + s.passMark + '%+</b> on first tries, and stay focused for at least <b>' + s.minActiveMinutes + ' minutes</b>' + capNote + '. Hints are always free.</div></div>' +
      '</div>' +
      '<div class="statrow">' +
      '  <div class="stat"><div class="v">' + streak + '</div><div class="l">day streak 🔥</div></div>' +
      '  <div class="stat"><div class="v">' + sum.sessions + '</div><div class="l">sessions done</div></div>' +
      '  <div class="stat"><div class="v">' + sum.activeMinutes + '</div><div class="l">minutes learned</div></div>' +
      '  <div class="stat"><div class="v">' + sum.accuracy + '%</div><div class="l">overall accuracy</div></div>' +
      '</div>' +
      '<h2>Choose your subject</h2>' +
      '<div class="subjects" id="subjects"></div>' +
      '<footer class="app-foot">Materials written to the MYP2 / KS3 curriculum, with go-deeper links to BBC Bitesize, Oak National Academy, Khan Academy, NASA, the RSC and more on every topic. <span class="mode-badge">' + (store.mode === 'cloud' ? '☁ Progress syncs across devices' : '💾 Progress saved on this device') + '</span></footer>';
    const grid = $('#subjects');
    SUBJECTS.forEach(sub => {
      const done = store.state.sessions.filter(x => x.subjectId === sub.id && x.status === 'completed').length;
      const card = el('button', { class: 'subject-card', style: '--sc:' + subjectColor(sub.id), onclick: () => { location.hash = 'subject-' + sub.id; } });
      card.innerHTML = '<span class="name">' + sub.emoji + ' ' + esc(sub.name) + '</span>' +
        '<span class="tag">' + esc(sub.tagline) + '</span>' +
        '<span class="done">' + sub.topics.length + ' topics · ' + done + ' session' + (done === 1 ? '' : 's') + ' done</span>';
      grid.appendChild(card);
    });
  }

  // ------------------------------------------------------------------ subject

  function renderSubject(main, id) {
    const sub = SUBJECTS.find(s => s.id === id);
    if (!sub) { location.hash = 'home'; return; }
    main.innerHTML =
      '<p style="margin-top:20px"><a class="btn quiet" href="#home">← All subjects</a></p>' +
      '<h1>' + sub.emoji + ' ' + esc(sub.name) + '</h1>' +
      '<p class="lede">' + esc(sub.tagline) + '. Each topic is one session: learn cards, quick checks and a quiz — about 15–20 minutes.</p>' +
      '<div class="topic-list" id="topics"></div>' +
      '<div class="card linkbox"><h3>Go deeper — trusted sites for ' + esc(sub.short) + '</h3><ul id="sublinks"></ul></div>';
    const list = $('#topics');
    sub.topics.forEach(t => {
      const b = bestForTopic(t.id);
      const row = el('button', { class: 'topic-row', style: '--sc:' + subjectColor(sub.id), onclick: () => startSession(sub, t) });
      row.innerHTML = '<span class="dot"></span><span class="t"><span class="n">' + esc(t.name) + '</span><br><span class="s">' + esc(t.strand) + ' · ' + esc(t.intro) + '</span></span>' +
        '<span class="best">' + (b ? 'best ' + b.best + '% · ×' + b.times : 'new!') + '</span>';
      list.appendChild(row);
    });
    const seen = new Set();
    const ul = $('#sublinks');
    sub.topics.forEach(t => (t.links || []).forEach(l => {
      if (seen.has(l.url)) return;
      seen.add(l.url);
      ul.appendChild(el('li', null, '<a href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.label) + '</a>'));
    }));
  }

  // ------------------------------------------------------------------ session

  function startSession(sub, topic) {
    const seq = E.buildSequence(topic);
    session = {
      subject: sub, topic, seq, pos: 0,
      startedAt: nowIso(), startMs: Date.now(),
      activeSeconds: 0, lastActivity: Date.now(), focusLosses: 0, hintsUsed: 0,
      results: {}, firstTryCorrect: 0, answered: 0,
      phase: 'main', fixQueue: [], fixPos: 0, reviewedCorrect: 0,
      mcqCache: {}, decision: null, record: null
    };
    location.hash = 'session';
    render();
    startSessionTick();
  }

  function startSessionTick() {
    stopSessionTick();
    session.tick = setInterval(() => {
      if (!session) return;
      const active = document.visibilityState === 'visible' && (Date.now() - session.lastActivity) < 75000;
      if (active && session.phase !== 'done') session.activeSeconds++;
      const clock = $('#sclock');
      if (clock) {
        clock.textContent = '⏱ ' + E.fmtClock(session.activeSeconds);
        clock.classList.toggle('paused', !active);
        clock.title = active ? 'Active learning time' : 'Paused — come back to the page or wiggle the mouse!';
      }
    }, 1000);
  }
  function stopSessionTick() { if (session && session.tick) { clearInterval(session.tick); session.tick = null; } }

  ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(ev =>
    window.addEventListener(ev, () => { if (session) session.lastActivity = Date.now(); }, { passive: true }));
  document.addEventListener('visibilitychange', () => {
    if (session && session.phase !== 'done' && document.visibilityState === 'hidden') session.focusLosses++;
  });

  function currentItem() {
    if (session.phase === 'main') return session.seq[session.pos];
    if (session.phase === 'fixit') return { kind: 'q', q: session.fixQueue[session.fixPos], fix: true };
    return null;
  }

  function mcqFor(q) {
    if (!session.mcqCache[q.id] || session.phase === 'fixit') {
      session.mcqCache[q.id] = E.shuffledMcq(q);
    }
    return session.mcqCache[q.id];
  }

  function renderSession(main) {
    const it = currentItem();
    if (session.phase === 'done') return renderSummary(main);
    const totalItems = session.seq.length;
    const prog = session.phase === 'main'
      ? session.pos / totalItems
      : 1;
    const color = subjectColor(session.subject.id);
    let head =
      '<div class="session-top" style="--sc:' + color + '">' +
      '<span class="pill">' + esc(session.subject.short) + ' · ' + esc(session.topic.name) + (it && it.fix ? ' · power-up round' : '') + '</span>' +
      '<div class="progress"><div style="width:' + Math.round(prog * 100) + '%"></div></div>' +
      '<span class="session-clock" id="sclock">⏱ ' + E.fmtClock(session.activeSeconds) + '</span>' +
      '</div>';
    main.innerHTML = head + '<div id="sbody"></div>' +
      '<div class="session-foot"><button class="btn quiet" id="squit">✕ Stop session</button>' +
      '<button class="btn quiet" id="ssound" title="Toggle sound">' + (soundOn() ? '🔊 Sound on' : '🔇 Sound off') + '</button></div>';
    $('#squit').addEventListener('click', () => {
      modal('Stop this session?', '<p>Stopping now records the session as unfinished — no token this time.</p>', [
        { label: 'Keep learning', kind: 'secondary' },
        { label: 'Stop session', kind: 'danger', fn: () => { abandonSession(); location.hash = 'home'; render(); } }
      ]);
    });
    $('#ssound').addEventListener('click', e => { setSound(!soundOn()); e.target.textContent = soundOn() ? '🔊 Sound on' : '🔇 Sound off'; });
    const body = $('#sbody');
    if (it.kind === 'card') renderLearnCard(body, it);
    else renderQuestion(body, it);
  }

  function renderLearnCard(body, it) {
    const c = it.card;
    body.innerHTML = '<div class="card learn-card" style="--sc:' + subjectColor(session.subject.id) + '">' +
      '<span class="pill">Learn it</span><h3>' + esc(c.title) + '</h3>' +
      '<div class="body">' + c.body + '</div>' +
      '<p style="margin-top:18px"><button class="btn" id="snext">Got it →</button></p></div>';
    $('#snext').addEventListener('click', advance);
    $('#snext').focus();
  }

  function renderQuestion(body, it) {
    const q = it.q;
    const res = session.results[q.id] || (session.results[q.id] = { firstTry: null, attempts: 0, hint: false });
    let inner =
      '<div class="card qcard">' +
      '<span class="pill">' + (it.fix ? 'Power-up: one more go' : 'Quick check') + '</span>' +
      '<div class="qtext">' + q.q + '</div>';
    if (q.type === 'input') {
      inner += '<div class="typed"><input id="qin" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="' + esc(q.placeholder || 'Type your answer') + '">' +
        '<button class="btn" id="qgo">Check</button></div>';
    } else {
      const m = mcqFor(q);
      inner += '<div class="options">' + m.options.map((o, i) =>
        '<button class="opt" data-i="' + i + '">' + esc(o) + '</button>').join('') + '</div>';
    }
    inner += '<div class="hintline">' + (q.hint ? '<button class="btn quiet" id="qhint">💡 Hint</button><div class="hint-text" id="qhinttext" hidden></div>' : '') + '</div>' +
      '<div id="qfeedback"></div></div>';
    body.innerHTML = inner;

    if (q.hint) $('#qhint').addEventListener('click', () => {
      $('#qhinttext').textContent = q.hint;
      $('#qhinttext').hidden = false;
      if (!res.hint) { res.hint = true; session.hintsUsed++; }
    });

    function conclude(correct, givenLabel) {
      res.attempts++;
      const firstAttempt = res.firstTry === null;
      if (firstAttempt && !it.fix) {
        res.firstTry = correct;
        session.answered++;
        if (correct) session.firstTryCorrect++;
      }
      if (it.fix && correct) session.reviewedCorrect++;
      (correct ? sfx.correct : sfx.wrong)();
      const fb = $('#qfeedback');
      const praise = ['Nailed it!', 'Boom — correct!', 'Nice one!', 'Exactly right!', 'You got it!'];
      const encourage = ['Not quite —', 'Close one.', 'Good try —'];
      const correctAnswer = q.type === 'input' ? (q.accept[0].charAt(0) === '#' ? q.accept[0].slice(1) : q.accept[0]) : q.options[q.answer];
      fb.innerHTML = '<div class="feedback ' + (correct ? 'good' : 'bad') + '">' +
        '<div class="verdict">' + (correct ? praise[Math.floor(Math.random() * praise.length)] : encourage[Math.floor(Math.random() * encourage.length)] + ' the answer is: ' + esc(String(correctAnswer))) + '</div>' +
        '<div class="explain">' + esc(q.explain || '') + '</div>' +
        '<p style="margin:12px 0 0"><button class="btn" id="snext">Next →</button></p></div>';
      $('#snext').addEventListener('click', advance);
      $('#snext').focus();
    }

    if (q.type === 'input') {
      const go = () => {
        const v = $('#qin').value;
        if (!v.trim()) return;
        $('#qin').disabled = true; $('#qgo').disabled = true;
        conclude(E.checkTyped(q, v), v);
      };
      $('#qgo').addEventListener('click', go);
      $('#qin').addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
      $('#qin').focus();
    } else {
      const m = mcqFor(q);
      body.querySelectorAll('.opt').forEach(btn => btn.addEventListener('click', () => {
        const i = Number(btn.dataset.i);
        body.querySelectorAll('.opt').forEach((b, j) => {
          b.disabled = true;
          if (j === m.answer) b.classList.add('correct');
        });
        const correct = i === m.answer;
        if (!correct) btn.classList.add('wrong');
        conclude(correct);
      }));
    }
  }

  function advance() {
    if (session.phase === 'main') {
      session.pos++;
      if (session.pos >= session.seq.length) {
        const missed = session.seq.filter(x => x.kind === 'q' && session.results[x.q.id] && session.results[x.q.id].firstTry === false).map(x => x.q);
        if (missed.length) {
          session.phase = 'fixit';
          session.fixQueue = E.shuffle(missed);
          session.fixPos = 0;
        } else {
          return finishSession();
        }
      }
    } else if (session.phase === 'fixit') {
      session.fixPos++;
      if (session.fixPos >= session.fixQueue.length) return finishSession();
    }
    render();
  }

  async function finishSession() {
    stopSessionTick();
    session.phase = 'done';
    const questions = session.seq.filter(x => x.kind === 'q').length;
    const tokensToday = E.tokensEarnedOnDay(store.state.sessions, nowIso());
    const decision = E.tokenDecision(settings(), {
      completed: true,
      firstTryCorrect: session.firstTryCorrect,
      questions,
      activeSeconds: session.activeSeconds,
      tokensToday
    });
    const record = {
      id: E.uid(),
      startedAt: session.startedAt,
      endedAt: nowIso(),
      subject: session.subject.name,
      subjectId: session.subject.id,
      topic: session.topic.name,
      topicId: session.topic.id,
      activeSeconds: session.activeSeconds,
      totalSeconds: Math.round((Date.now() - session.startMs) / 1000),
      questions,
      firstTryCorrect: session.firstTryCorrect,
      accuracy: decision.accuracy,
      hintsUsed: session.hintsUsed,
      focusLosses: session.focusLosses,
      reviewed: session.fixQueue.length,
      reviewedCorrect: session.reviewedCorrect,
      tokenEarned: decision.earned,
      tokenReasons: decision.reasons,
      status: 'completed',
      detail: session.seq.filter(x => x.kind === 'q').map(x => ({
        id: x.q.id, firstTry: !!(session.results[x.q.id] && session.results[x.q.id].firstTry),
        hint: !!(session.results[x.q.id] && session.results[x.q.id].hint)
      }))
    };
    session.decision = decision;
    session.record = record;
    await store.addSession(record);
    if (decision.earned) { sfx.token(); confetti(); }
    render();
  }

  function abandonSession() {
    stopSessionTick();
    if (session && session.answered > 0) {
      const questions = session.seq.filter(x => x.kind === 'q').length;
      store.addSession({
        id: E.uid(), startedAt: session.startedAt, endedAt: nowIso(),
        subject: session.subject.name, subjectId: session.subject.id,
        topic: session.topic.name, topicId: session.topic.id,
        activeSeconds: session.activeSeconds,
        totalSeconds: Math.round((Date.now() - session.startMs) / 1000),
        questions, firstTryCorrect: session.firstTryCorrect,
        accuracy: E.accuracy(session.firstTryCorrect, questions),
        hintsUsed: session.hintsUsed, focusLosses: session.focusLosses,
        reviewed: 0, reviewedCorrect: 0,
        tokenEarned: false, tokenReasons: ['The session was stopped early.'],
        status: 'abandoned', detail: []
      });
    }
    session = null;
  }

  function renderSummary(main) {
    const d = session.decision, r = session.record;
    const links = (session.topic.links || []).map(l =>
      '<li><a href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.label) + '</a></li>').join('');
    main.innerHTML =
      '<div class="card summary-hero">' +
      '<div class="headline">' + (d.earned ? '🏆 Token earned!' : 'Session complete!') + '</div>' +
      '<div class="token-line">' + (d.earned
        ? 'One shiny token added — that’s <b>' + settings().rewardMinutes + ' minutes of gaming</b> in the bank.'
        : 'No token this time, but every session makes you stronger.') + '</div>' +
      (d.earned ? '' : '<div class="reason-list"><ul>' + d.reasons.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul></div>') +
      '<div class="summary-grid">' +
      '  <div class="stat"><div class="v">' + d.accuracy + '%</div><div class="l">first-try score</div></div>' +
      '  <div class="stat"><div class="v">' + r.firstTryCorrect + '/' + r.questions + '</div><div class="l">correct</div></div>' +
      '  <div class="stat"><div class="v">' + E.fmtMinutes(r.activeSeconds) + '</div><div class="l">active time</div></div>' +
      '  <div class="stat"><div class="v">' + r.hintsUsed + '</div><div class="l">hints used</div></div>' +
      '</div>' +
      '<p style="margin-top:22px"><button class="btn" id="sdone">Back to subjects</button> ' +
      (d.earned ? '<a class="btn gold" href="#rewards" id="sspend">Spend it →</a>' : '<button class="btn secondary" id="sretry">Try again</button>') + '</p>' +
      '</div>' +
      (links ? '<div class="card linkbox"><h3>Keep exploring ' + esc(session.topic.name) + '</h3><ul>' + links + '</ul></div>' : '');
    $('#sdone').addEventListener('click', () => { const sub = session.subject; session = null; location.hash = 'subject-' + sub.id; render(); });
    const retry = $('#sretry');
    if (retry) retry.addEventListener('click', () => { const sub = session.subject, top = session.topic; session = null; startSession(sub, top); });
    const spend = $('#sspend');
    if (spend) spend.addEventListener('click', () => { session = null; });
  }

  // ------------------------------------------------------------------ rewards

  function renderRewards(main) {
    const s = settings();
    const w = wallet();
    const t = store.state.timer;
    const now = Date.now();
    clearInterval(rewardTick); rewardTick = null;
    let timerHtml = '';
    if (t && t.endsAt) {
      const remaining = Math.max(0, Math.round((new Date(t.endsAt).getTime() - now) / 1000));
      if (remaining > 0) {
        timerHtml =
          '<div class="card timer-ring"><h3>🎮 Gaming time is ON</h3>' +
          '<svg viewBox="0 0 200 200" role="img" aria-label="Gaming countdown">' +
          '<circle class="ring-track" cx="100" cy="100" r="90" fill="none" stroke-width="12"/>' +
          '<circle class="ring-fill" id="ringfill" cx="100" cy="100" r="90" fill="none" stroke-width="12" stroke-linecap="round" stroke-dasharray="565.49" transform="rotate(-90 100 100)"/>' +
          '<text x="100" y="112" text-anchor="middle" id="ringdigits" style="font: 800 34px var(--font-display); fill: var(--ink); font-variant-numeric: tabular-nums">' + E.fmtClock(remaining) + '</text>' +
          '</svg>' +
          '<div>Ends at <b>' + E.fmtTime(t.endsAt) + '</b>. Enjoy — you earned it!</div>' +
          '<button class="btn secondary" id="tdone">I’m done early</button></div>';
      } else {
        if (!timesUpPlayed) { sfx.timesup(); timesUpPlayed = true; }
        timerHtml = '<div class="card timer-ring"><h3>⏰ Time’s up!</h3><div class="timer-digits">0:00</div>' +
          '<div>Great gaming session. Save your game and power down like a legend.</div>' +
          '<button class="btn" id="tdone">All done ✓</button></div>';
      }
    }
    main.innerHTML =
      '<h1>Rewards</h1>' +
      '<p class="lede">One token buys <b>' + s.rewardMinutes + ' minutes</b> of video gaming. The timer keeps everyone honest.</p>' +
      timerHtml +
      (!t ? '<div class="card"><div class="big" style="font-family:var(--font-display);font-weight:800;font-size:2rem;display:flex;align-items:center;gap:10px"><span class="coin"></span>' + w.balance + ' token' + (w.balance === 1 ? '' : 's') + ' available</div>' +
        '<p style="margin:12px 0 0"><button class="btn gold" id="redeem" ' + (w.balance < 1 ? 'disabled' : '') + '>🎮 Spend 1 token — start ' + s.rewardMinutes + ' minutes</button></p>' +
        (w.balance < 1 ? '<p class="rules" style="margin-top:10px">No tokens yet — a session is only ever ~20 minutes away. 😉</p>' : '') +
        '</div>' : '') +
      '<div class="card" style="margin-top:14px"><h3>How it works</h3><div class="rules">' +
      '• Complete a learning session → earn 1 token.<br>' +
      '• Spend a token here → a ' + s.rewardMinutes + '-minute countdown starts (it keeps running even if the page closes).<br>' +
      '• When the alarm sounds, gaming time is over. Every spend is logged in Records.</div></div>';
    const redeem = $('#redeem');
    if (redeem) redeem.addEventListener('click', () => {
      modal('Spend 1 token?', '<p>This starts your <b>' + s.rewardMinutes + '-minute</b> gaming countdown right away.</p>', [
        { label: 'Not yet', kind: 'secondary' },
        { label: 'Let’s go! 🎮', kind: 'gold', fn: doRedeem }
      ]);
    });
    const tdone = $('#tdone');
    if (tdone) tdone.addEventListener('click', async () => { await store.clearTimer(); timesUpPlayed = false; render(); });
    if (t && t.endsAt && new Date(t.endsAt).getTime() > now) startRewardTick(t);
  }

  async function doRedeem() {
    const s = settings();
    const id = E.uid();
    const at = nowIso();
    const endsAt = new Date(Date.now() + s.rewardMinutes * 60000).toISOString();
    await store.addRedemption({ id, at, minutes: s.rewardMinutes, note: '' });
    await store.setTimer({ redemptionId: id, startedAt: at, endsAt, minutes: s.rewardMinutes });
    timesUpPlayed = false;
    toast('Token spent — ' + s.rewardMinutes + ' minutes on the clock! 🎮');
    render();
  }

  function startRewardTick(t) {
    const total = t.minutes * 60;
    const C = 565.49;
    rewardTick = setInterval(() => {
      const remaining = Math.max(0, Math.round((new Date(t.endsAt).getTime() - Date.now()) / 1000));
      const digits = $('#ringdigits'), fill = $('#ringfill');
      if (digits) digits.textContent = E.fmtClock(remaining);
      if (fill) fill.style.strokeDashoffset = String(C * (1 - remaining / total));
      if (remaining <= 0) { clearInterval(rewardTick); rewardTick = null; render(); }
    }, 1000);
  }

  // ------------------------------------------------------------------ records

  function renderRecords(main) {
    const sessions = store.state.sessions.slice().sort((a, b) => String(b.startedAt).localeCompare(String(a.startedAt)));
    const sum = E.summary(sessions);
    const w = wallet();
    const streak = E.streak(sessions, nowIso());
    main.innerHTML =
      '<h1>Records</h1>' +
      '<p class="lede">The full log of every session and reward — time spent, scores, hints, focus. The receipts.</p>' +
      '<div class="statrow">' +
      '  <div class="stat"><div class="v">' + w.earned + '</div><div class="l">tokens earned</div></div>' +
      '  <div class="stat"><div class="v">' + w.spent + '</div><div class="l">tokens spent</div></div>' +
      '  <div class="stat"><div class="v">' + sum.activeMinutes + '</div><div class="l">minutes learned</div></div>' +
      '  <div class="stat"><div class="v">' + sum.accuracy + '%</div><div class="l">overall accuracy</div></div>' +
      '  <div class="stat"><div class="v">' + streak + '</div><div class="l">day streak</div></div>' +
      '</div>' +
      '<div class="card chart-card"><div class="chart-title">Learning minutes — last 14 days</div><div id="chart-days"></div></div>' +
      '<div class="card chart-card"><div class="chart-title">First-try accuracy by subject</div><div class="hbars" id="chart-subjects"></div></div>' +
      '<h2>Sessions</h2>' +
      '<div class="filters"><select id="fsub"><option value="">All subjects</option>' +
      SUBJECTS.map(s => '<option value="' + s.id + '">' + esc(s.name) + '</option>').join('') +
      '</select><button id="exportcsv">⬇ Export sessions CSV</button><button id="exportred">⬇ Export rewards CSV</button></div>' +
      '<div class="table-scroll"><table class="records" id="stable"></table></div>' +
      '<h2>Rewards spent</h2><div class="table-scroll"><table class="records" id="rtable"></table></div>' +
      (store.state.adjustments.length ? '<h2>Parent adjustments</h2><div class="table-scroll"><table class="records" id="atable"></table></div>' : '');
    drawDayChart($('#chart-days'), E.minutesByDay(sessions, nowIso(), 14));
    drawSubjectBars($('#chart-subjects'), E.accuracyBySubject(sessions));
    const renderTable = () => {
      const f = $('#fsub').value;
      const rows = sessions.filter(s => !f || s.subjectId === f);
      $('#stable').innerHTML =
        '<tr><th>Date</th><th>Subject · topic</th><th>Active</th><th>Score</th><th>Hints</th><th>Focus-outs</th><th>Token</th><th>Status</th></tr>' +
        (rows.length ? rows.map(s =>
          '<tr><td>' + E.fmtDate(s.startedAt) + ' ' + E.fmtTime(s.startedAt) + '</td>' +
          '<td>' + esc(s.subject) + ' · ' + esc(s.topic) + '</td>' +
          '<td class="num">' + E.fmtMinutes(s.activeSeconds || 0) + '</td>' +
          '<td class="num">' + (s.firstTryCorrect || 0) + '/' + (s.questions || 0) + ' (' + (s.accuracy || 0) + '%)</td>' +
          '<td class="num">' + (s.hintsUsed || 0) + '</td>' +
          '<td class="num">' + (s.focusLosses || 0) + '</td>' +
          '<td class="' + (s.tokenEarned ? 'tok-yes">🪙 yes' : 'tok-no">—') + '</td>' +
          '<td>' + esc(s.status || '') + '</td></tr>').join('')
          : '<tr><td colspan="8" style="color:var(--muted)">No sessions yet — the first one is the hardest to start and the easiest to finish.</td></tr>');
    };
    renderTable();
    $('#fsub').addEventListener('change', renderTable);
    const reds = store.state.redemptions.slice().sort((a, b) => String(b.at).localeCompare(String(a.at)));
    $('#rtable').innerHTML = '<tr><th>Date</th><th>Time</th><th>Minutes</th></tr>' +
      (reds.length ? reds.map(r => '<tr><td>' + E.fmtDate(r.at) + '</td><td>' + E.fmtTime(r.at) + '</td><td class="num">' + r.minutes + '</td></tr>').join('')
        : '<tr><td colspan="3" style="color:var(--muted)">No tokens spent yet.</td></tr>');
    const atable = $('#atable');
    if (atable) {
      atable.innerHTML = '<tr><th>Date</th><th>Change</th><th>Reason</th></tr>' +
        store.state.adjustments.slice().sort((a, b) => String(b.at).localeCompare(String(a.at))).map(a =>
          '<tr><td>' + E.fmtDate(a.at) + '</td><td class="num">' + (a.delta > 0 ? '+' : '') + a.delta + '</td><td>' + esc(a.reason || '') + '</td></tr>').join('');
    }
    $('#exportcsv').addEventListener('click', () => exportCsv('study-quest-sessions.csv', E.sessionsCsv(store.state.sessions)));
    $('#exportred').addEventListener('click', () => exportCsv('study-quest-rewards.csv', E.redemptionsCsv(store.state.redemptions)));
  }

  function drawDayChart(host, data) {
    const W = 700, H = 190, padL = 34, padR = 10, padT = 18, padB = 26;
    const max = Math.max(10, ...data.map(d => d.minutes));
    const bw = (W - padL - padR) / data.length;
    const y = v => padT + (H - padT - padB) * (1 - v / max);
    let svg = '<svg class="barchart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Learning minutes per day, last 14 days">';
    [0, 0.5, 1].forEach(f => {
      const v = Math.round(max * f);
      svg += '<line class="grid" x1="' + padL + '" x2="' + (W - padR) + '" y1="' + y(v) + '" y2="' + y(v) + '" stroke-width="1"/>' +
        '<text x="' + (padL - 6) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + v + '</text>';
    });
    data.forEach((d, i) => {
      const x = padL + i * bw + bw * 0.18;
      const w = bw * 0.64;
      const h = Math.max(d.minutes > 0 ? 3 : 0, y(0) - y(d.minutes));
      const date = new Date(d.day + 'T12:00:00Z');
      const lbl = date.toLocaleDateString('en-GB', { weekday: 'narrow' });
      if (h > 0) {
        svg += '<rect class="bar" x="' + x + '" y="' + (y(0) - h) + '" width="' + w + '" height="' + h + '" rx="3"><title>' +
          date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) + ': ' + d.minutes + ' min</title></rect>';
        if (d.minutes > 0) svg += '<text class="val" x="' + (x + w / 2) + '" y="' + (y(d.minutes) - 5) + '" text-anchor="middle">' + d.minutes + '</text>';
      }
      svg += '<text x="' + (x + w / 2) + '" y="' + (H - 8) + '" text-anchor="middle">' + lbl + '</text>';
    });
    svg += '<line class="axis" x1="' + padL + '" x2="' + (W - padR) + '" y1="' + y(0) + '" y2="' + y(0) + '" stroke-width="1.5"/></svg>';
    host.innerHTML = svg;
  }

  function drawSubjectBars(host, rows) {
    if (!rows.length) { host.innerHTML = '<span style="color:var(--muted)">Complete a session to see your subject strengths.</span>'; return; }
    host.innerHTML = rows.sort((a, b) => b.accuracy - a.accuracy).map(r =>
      '<div class="hbar" style="--sc:' + subjectColor(r.subjectId) + '">' +
      '<span class="lbl">' + esc(r.subject) + '</span>' +
      '<span class="track"><span class="fill" style="width:' + r.accuracy + '%" title="' + r.accuracy + '%"></span></span>' +
      '<span class="v">' + r.accuracy + '% · ' + r.sessions + ' sess.</span></div>').join('');
  }

  async function exportCsv(filename, text) {
    try {
      if (window.claude && typeof window.claude.use === 'function') {
        const downloads = await window.claude.use('downloads');
        if (downloads) {
          await downloads.save({ filename, data: text });
          toast('Saved ' + filename);
          return;
        }
      }
    } catch (e) { /* fall through to the next option */ }
    try {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
      a.download = filename;
      document.body.appendChild(a); a.click(); a.remove();
      toast('Downloading ' + filename);
      return;
    } catch (e) { /* fall through */ }
    try {
      await navigator.clipboard.writeText(text);
      toast('Download unavailable here — CSV copied to clipboard instead.');
    } catch (e) {
      toast('Could not export on this device.');
    }
  }

  // ------------------------------------------------------------------ parent corner

  function parentUnlocked() {
    const s = settings();
    if (!s.pin) return true;
    try { return sessionStorage.getItem('sq.unlocked') === '1'; } catch (e) { return false; }
  }

  function renderParent(main) {
    const s = settings();
    if (!parentUnlocked()) {
      main.innerHTML = '<h1>Parent corner</h1><div class="card" style="max-width:380px">' +
        '<h3>Enter PIN</h3><div class="typed"><input id="pin" type="password" inputmode="numeric" placeholder="PIN">' +
        '<button class="btn" id="pingo">Unlock</button></div></div>';
      $('#pingo').addEventListener('click', () => {
        if ($('#pin').value === s.pin) {
          try { sessionStorage.setItem('sq.unlocked', '1'); } catch (e) {}
          render();
        } else toast('Wrong PIN.');
      });
      return;
    }
    const w = wallet();
    const t = store.state.timer;
    main.innerHTML =
      '<h1>Parent corner</h1>' +
      '<p class="lede">The rules of the token economy, token adjustments and the audit trail. Mode: <b>' + (store.mode === 'cloud' ? 'synced to the shared record (cloud)' : 'saved on this device only') + '</b>.</p>' +
      '<div class="card"><h3>Token rules</h3><div class="form-grid">' +
      '<div class="field"><label for="set-pass">Pass mark (%)</label><input id="set-pass" type="number" min="0" max="100" step="5" value="' + s.passMark + '"><div class="help">First-try score needed to earn the token.</div></div>' +
      '<div class="field"><label for="set-min">Minimum active minutes</label><input id="set-min" type="number" min="0" max="60" value="' + s.minActiveMinutes + '"><div class="help">Focused time required (the timer pauses when idle or tabbed away).</div></div>' +
      '<div class="field"><label for="set-cap">Daily token cap</label><input id="set-cap" type="number" min="0" max="12" value="' + s.dailyTokenCap + '"><div class="help">0 = unlimited.</div></div>' +
      '<div class="field"><label for="set-mins">Gaming minutes per token</label><input id="set-mins" type="number" min="5" max="180" step="5" value="' + s.rewardMinutes + '"></div>' +
      '<div class="field"><label for="set-pin">Parent PIN</label><input id="set-pin" type="text" inputmode="numeric" value="' + esc(s.pin) + '" placeholder="empty = no PIN"><div class="help">Locks this page only. A determined hacker-child could bypass it — the Records page is the real referee.</div></div>' +
      '</div><p style="margin-top:14px"><button class="btn" id="saveset">Save rules</button></p></div>' +
      '<div class="card" style="margin-top:14px"><h3>Adjust tokens (balance: ' + w.balance + ')</h3>' +
      '<div class="typed"><input id="adj-reason" placeholder="Reason (e.g. bonus for great effort / correction)">' +
      '<button class="btn secondary" id="adj-minus">−1</button><button class="btn" id="adj-plus">+1</button></div>' +
      '<div class="help" style="color:var(--muted);font-size:0.8rem;margin-top:6px">Every adjustment is logged in Records with its reason.</div></div>' +
      (t ? '<div class="card" style="margin-top:14px"><h3>Gaming timer is running</h3><p>Ends at ' + E.fmtTime(t.endsAt) + '.</p>' +
        '<button class="btn danger" id="endtimer">End now</button> <button class="btn secondary" id="endrefund">End now & refund the token</button></div>' : '') +
      '<div class="card" style="margin-top:14px"><h3>Data</h3>' +
      '<p class="rules">Sessions: ' + store.state.sessions.length + ' · rewards: ' + store.state.redemptions.length + ' · adjustments: ' + store.state.adjustments.length + '</p>' +
      '<p><button class="btn secondary" id="pexport">⬇ Export sessions CSV</button> ' +
      (store.mode === 'local' ? '<button class="btn danger" id="preset">Reset all data</button>' : '') + '</p>' +
      (store.mode === 'cloud' ? '<p class="help" style="color:var(--muted);font-size:0.82rem">Records live in the artifact’s shared database — ask Claude to prune or edit them if ever needed.</p>' : '') +
      '</div>';
    $('#saveset').addEventListener('click', async () => {
      const next = {
        passMark: Math.min(100, Math.max(0, Number($('#set-pass').value) || 0)),
        minActiveMinutes: Math.min(60, Math.max(0, Number($('#set-min').value) || 0)),
        dailyTokenCap: Math.min(12, Math.max(0, Number($('#set-cap').value) || 0)),
        rewardMinutes: Math.min(180, Math.max(5, Number($('#set-mins').value) || 40)),
        pin: String($('#set-pin').value || '').trim()
      };
      await store.saveSettings(next);
      toast('Rules saved.');
      render();
    });
    const doAdjust = async delta => {
      const reason = String($('#adj-reason').value || '').trim();
      if (!reason) { toast('Add a reason first — it goes in the log.'); return; }
      await store.addAdjustment({ id: E.uid(), at: nowIso(), delta, reason });
      toast((delta > 0 ? '+1' : '−1') + ' token (' + reason + ')');
      render();
    };
    $('#adj-plus').addEventListener('click', () => doAdjust(1));
    $('#adj-minus').addEventListener('click', () => doAdjust(-1));
    const endt = $('#endtimer');
    if (endt) endt.addEventListener('click', async () => { await store.clearTimer(); toast('Timer ended.'); render(); });
    const endr = $('#endrefund');
    if (endr) endr.addEventListener('click', async () => {
      await store.clearTimer();
      await store.addAdjustment({ id: E.uid(), at: nowIso(), delta: 1, reason: 'Refund: gaming session ended early' });
      toast('Timer ended and token refunded.');
      render();
    });
    $('#pexport').addEventListener('click', () => exportCsv('study-quest-sessions.csv', E.sessionsCsv(store.state.sessions)));
    const preset = $('#preset');
    if (preset) preset.addEventListener('click', () => {
      modal('Reset ALL data?', '<p>This permanently deletes every session, token and setting stored on this device.</p>', [
        { label: 'Keep everything', kind: 'secondary' },
        { label: 'Delete it all', kind: 'danger', fn: () => {
          try { localStorage.removeItem(window.SQStore.KEY); localStorage.removeItem(window.SQStore.PENDING_KEY); } catch (e) {}
          store.state = window.SQStore.blankState();
          render();
          toast('All data reset.');
        } }
      ]);
    });
  }

  // ------------------------------------------------------------------ boot

  store.onNotice = toast;
  store.onChange = () => {
    if (session && session.phase !== 'done') { updateWalletBadge(); return; }
    render();
  };

  function boot() {
    render(); // first paint from empty state; store fills in as it loads
    store.init().then(() => render());
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
