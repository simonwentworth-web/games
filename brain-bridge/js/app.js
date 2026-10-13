/*
 * Brain Bridge — page behaviour.
 *
 * A small hash-routed single-page app: home dashboard, the 40-minute session
 * player, free practice, the writing and interview studios, progress, the exam
 * guide and the parent corner. All state is kept by store.js in localStorage.
 */
(function () {
  'use strict';

  const D = window.BBData, G = window.BBGen, E = window.BBEngine, S = window.BBStore;
  let state = S.load();
  const save = () => S.save(state);

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const main = $('#main');
  const mmss = (s) => `${Math.floor(s / 60)}:${(s % 60 < 10 ? '0' : '') + (s % 60)}`;
  const fmtDate = (t) => new Date(t).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  const subjectOf = (skillId) => (G.SKILL_BY_ID[skillId] || {}).subject || 'maths';
  const skillLabel = (id) => (G.SKILL_BY_ID[id] || {}).label || id;
  const name = () => state.profile.name || 'champion';

  /* ------------------------------ toast / sound / confetti ------------- */

  let toastTimer;
  function toast(msg, ms) {
    const t = $('#toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, ms || 2200);
  }

  let audioCtx;
  function beep(kind) {
    if (!state.profile.sound) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const notes = kind === 'good' ? [[523, 0], [784, 0.09]] : kind === 'great' ? [[523, 0], [659, 0.08], [784, 0.16], [1047, 0.24]] : [[220, 0]];
      notes.forEach(([f, t]) => { const o = audioCtx.createOscillator(), g = audioCtx.createGain(); o.type = 'sine'; o.frequency.value = f; g.gain.value = 0.0001; o.connect(g); g.connect(audioCtx.destination); const at = audioCtx.currentTime + t; g.gain.exponentialRampToValueAtTime(0.12, at + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.18); o.start(at); o.stop(at + 0.2); });
    } catch (e) { /* no sound available */ }
  }

  function confetti(n) {
    const c = $('#confetti'); const ctx = c.getContext('2d'); c.width = innerWidth; c.height = innerHeight;
    const colours = ['#f2c94c', '#2f80ed', '#eb5757', '#27ae60', '#9b51e0', '#f2994a'];
    const parts = Array.from({ length: n || 140 }, () => ({ x: Math.random() * c.width, y: -20 - Math.random() * c.height * 0.5, vx: (Math.random() - 0.5) * 3, vy: 2 + Math.random() * 4, r: 4 + Math.random() * 6, col: pick(colours), rot: Math.random() * 6 }));
    let frames = 0;
    (function draw() {
      ctx.clearRect(0, 0, c.width, c.height);
      parts.forEach((p) => { p.x += p.vx; p.y += p.vy; p.rot += 0.1; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.col; ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6); ctx.restore(); });
      if (++frames < 220) requestAnimationFrame(draw); else ctx.clearRect(0, 0, c.width, c.height);
    })();
  }

  function xpPop(amount, anchor) {
    const el = document.createElement('div'); el.className = 'xp-pop'; el.textContent = `+${amount} XP`;
    const r = anchor && anchor.getBoundingClientRect ? anchor.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2 };
    el.style.left = r.left + 20 + 'px'; el.style.top = r.top + 'px'; document.body.appendChild(el); setTimeout(() => el.remove(), 1000);
  }

  const XP_TITLES = [[0, 'Bridge Apprentice'], [200, 'Tower Climber'], [500, 'Chain Linker'], [1000, 'Gorge Explorer'], [1800, 'Bridge Engineer'], [3000, 'Brunel’s Heir']];
  const xpTitle = () => XP_TITLES.filter(([x]) => state.xp >= x).pop()[1];

  /* ------------------------------ router ------------------------------ */

  const views = {};
  function navigate() {
    const hash = (location.hash || '#home').slice(1).split('/');
    const view = views[hash[0]] ? hash[0] : 'home';
    if (state.current && state.current.phase !== 'wrap' && view !== 'session' && view !== 'home' && view !== 'parent' && view !== 'guide') {
      // a session is in progress; allow browsing but keep it easy to get back
    }
    $$('.nav a').forEach((a) => a.classList.toggle('active', a.dataset.nav === view));
    stopTimers();
    main.innerHTML = '';
    views[view](hash.slice(1));
    renderHeaderStats();
    window.scrollTo({ top: 0 });
  }
  window.addEventListener('hashchange', navigate);

  function renderHeaderStats() {
    const avail = state.tokens.earned - state.tokens.spent;
    $('#header-stats').innerHTML = `<span class="chip" title="Games tokens available">🎟️ ${avail}</span><span class="chip" title="Experience points">⭐ ${state.xp} XP</span>`;
  }

  function sessionsDone() { return state.sessions.length; }

  /* ------------------------------ HOME --------------------------------- */

  views.home = function () {
    const now = Date.now();
    const schools = state.profile.schools.length ? state.profile.schools : ['bgs', 'qeh'];
    const wk = E.weekKey(now);
    const doneThisWeek = state.sessions.some((s) => E.weekKey(s.finishedAt || s.startedAt) === wk);
    const plan = state.current && state.current.plan ? state.current.plan : E.composeSession(state, state.profile, sessionsDone());
    const avail = state.tokens.earned - state.tokens.spent;
    const ov = E.overview(state);
    const focus = E.focusSuggestions(state, 3);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    main.innerHTML = `
      <section class="hero">
        <div class="card">
          <div class="row between">
            <div><h1>${state.profile.name ? `Hi ${esc(state.profile.name)}!` : 'Welcome to Brain Bridge!'}</h1>
            <p class="muted">Your weekly 40-minute training for the <b>BGS</b> and <b>QEH</b> 11+ exams and interviews. One full session = one games token. ${!state.profile.name ? '<a href="#parent">Add your name in the Parent corner.</a>' : ''}</p></div>
            <div class="mascot" aria-hidden="true">🦉</div>
          </div>
          <div class="countdown">
            ${schools.map((id) => `<div class="cd"><span class="small muted">${D.SCHOOLS[id].short} exam</span><b>${E.weeksUntil(D.SCHOOLS[id].examDate, now)} weeks</b><span class="small muted">${esc(D.SCHOOLS[id].examDateLabel.split(' (')[0])}</span></div>`).join('')}
            <div class="cd"><span class="small muted">Rank</span><b style="font-size:1.1rem">${xpTitle()}</b><span class="small muted">${state.xp} XP</span></div>
          </div>
          ${focus.length ? `<p class="small"><b>Focus this week:</b> ${focus.map((f) => esc(f.label)).join(', ')}. The next session will lean that way.</p>` : '<p class="small muted">After your first session, Brain Bridge works out what to practise most.</p>'}
        </div>
        <div class="card session-card">
          <span class="pill ${plan.style}">${state.current ? 'Session in progress' : plan.style === 'qeh' ? 'QEH-style week: fast, multiple choice' : 'BGS-style week: written answers & writing'}</span>
          <h2 style="margin-top:8px">${state.current ? 'Carry on where you left off' : `Session ${sessionsDone() + 1}: 40 minutes`}</h2>
          <p class="muted">${doneThisWeek && !state.current ? `You have already done this week’s session. Extra sessions earn bonus stars and XP; the next token unlocks next week (weeks run Monday to Sunday).` : `Session day: ${days[state.profile.sessionDay]}. Finish all 40 minutes to earn a token worth 40 minutes of video games.`}</p>
          <ul>${plan.blocks.filter((b) => b.type !== 'wrap').map((b) => `<li>${esc(b.label)} · ${b.minutes} min${b.boosted ? ' ⬆' : ''}</li>`).join('')}</ul>
          <div class="btn-row"><a class="btn big" href="#session">${state.current ? 'Resume session' : 'Start session'}</a>${state.current ? '<button class="btn ghost sm" id="abandon">Abandon</button>' : ''}</div>
        </div>
      </section>
      <section class="grid two">
        <div class="card">
          <h2>Token vault</h2>
          <div class="vault"><span class="coin" aria-hidden="true">🎟️</span><div><span class="count">${avail}</span><div class="muted">token${avail === 1 ? '' : 's'} to spend = ${avail * 40} minutes of games</div><div class="small muted">${state.tokens.earned} earned · ${state.tokens.spent} spent. A grown-up redeems them in the Parent corner.</div></div></div>
        </div>
        <div class="card">
          <h2>How you are doing</h2>
          ${Object.keys(D.SUBJECTS).map((s) => `<div class="subject-row"><span class="lbl">${D.SUBJECTS[s].emoji} ${esc(D.SUBJECTS[s].label)}</span><div class="bar"><i style="width:${Math.round(ov[s].score)}%;background:${D.SUBJECTS[s].colour}"></i></div><span class="small muted">${ov[s].attempts ? Math.round(ov[s].score) : '–'}</span></div>`).join('')}
          <a class="small" href="#progress">See every skill →</a>
        </div>
      </section>
      <section class="card">
        <h2>Badges</h2>
        <div class="badges">${D.BADGES.map((b) => `<span class="badge ${state.badges.some((x) => x.id === b.id) ? '' : 'locked'}" title="${esc(b.desc)}"><span class="em">${b.emoji}</span>${esc(b.name)}</span>`).join('')}</div>
      </section>
      <section class="card">
        <h2>Extra practice (no timer, no pressure)</h2>
        <div class="quick-links">
          <a href="#practice"><span class="em">🧠</span>Practice any topic</a>
          <a href="#writing"><span class="em">✍️</span>Writing studio</a>
          <a href="#interview"><span class="em">🎤</span>Interview studio</a>
          <a href="#progress"><span class="em">📈</span>Progress</a>
          <a href="#guide"><span class="em">🏫</span>Exam guide</a>
        </div>
      </section>`;
    const ab = $('#abandon');
    if (ab) ab.onclick = () => { if (confirm('Abandon this session? Progress on answered questions is kept, but no token is earned.')) { state.current = null; save(); navigate(); } };
  };

  /* --------------------------- question rendering ---------------------- */

  let keyHandler = null;
  document.addEventListener('keydown', (e) => {
    if (!keyHandler) return;
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'textarea' || tag === 'select') return;
    if (tag === 'input' && e.key !== 'Enter') return;
    keyHandler(e);
  });

  // Draws one question into `container`. opts: { streak, onDone(result, { seconds, meta }) }
  function renderQuestion(container, qn, opts) {
    const startedAt = Date.now();
    let answered = false;
    container.innerHTML = `<div class="question">
      ${qn.mode === 'stretch' ? `<div class="q-mode"><span class="pill grape">🦾 ${esc(pick(D.STRETCH_INTRO))}</span></div>` : qn.mode === 'confidence' ? `<div class="q-mode"><span class="pill mint">${esc(pick(D.CONFIDENCE_INTRO))}</span></div>` : ''}
      <div class="q-prompt">${qn.prompt}</div>
      ${qn.visual ? `<div class="q-visual">${qn.visual}</div>` : ''}
      <div class="answer-area"></div>
      <div class="feedback-area"></div>
    </div>`;
    const area = $('.answer-area', container), fb = $('.feedback-area', container);

    if (qn.format === 'mc') {
      const isSvg = qn.options.some((o) => String(o).startsWith('<svg'));
      area.innerHTML = `<div class="options ${isSvg ? 'svg' : ''}">${qn.options.map((o, i) => `<button type="button" class="option ${isSvg ? 'svg' : ''}" data-i="${i}"><span class="key">${i + 1}</span>${isSvg ? o : `<span>${o}</span>`}</button>`).join('')}</div>`;
      $$('.option', area).forEach((btn) => {
        btn.onclick = () => {
          if (answered) return; answered = true;
          const i = +btn.dataset.i; const g = E.grade(qn, i);
          $$('.option', area).forEach((x, k) => { x.disabled = true; if (k === qn.answer) x.classList.add('correct'); else if (k === i) x.classList.add('wrong'); });
          finish(g, { chosen: i });
        };
      });
      keyHandler = (e) => { const n = +e.key; if (n >= 1 && n <= qn.options.length) { const b = $$('.option', area)[n - 1]; if (b) b.click(); } };
    } else {
      const long = qn.long || (qn.keywords && qn.keywords.length);
      area.innerHTML = `<form class="typed">${long ? '<textarea rows="3" placeholder="Answer in a full sentence, using evidence from the text..."></textarea>' : `<input type="text" inputmode="${qn.numeric ? 'decimal' : 'text'}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type your answer">`}${qn.unit && qn.unit !== '£' ? `<span class="unit">${esc(qn.unit)}</span>` : qn.unit === '£' ? '<span class="unit">£ (e.g. 4.50)</span>' : ''}<button class="btn" type="submit">Check</button><button class="btn ghost sm" type="button" data-skip>I don’t know</button>${long ? '<span class="small muted">Ctrl + Enter to check</span>' : ''}</form>`;
      const input = $('textarea, input', area); input.focus();
      const submit = () => { if (answered) return; const val = input.value.trim(); if (!val) { input.focus(); return; } answered = true; input.disabled = true; finish(E.grade(qn, val), { typed: val }); };
      $('form', area).onsubmit = (e) => { e.preventDefault(); submit(); };
      if (long) input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); submit(); } });
      $('[data-skip]', area).onclick = () => { if (answered) return; answered = true; input.disabled = true; finish({ result: 'wrong', skipped: true }, { typed: '' }); };
      keyHandler = null;
    }

    function finish(g, meta) {
      const seconds = Math.round((Date.now() - startedAt) / 1000);
      if (g.result === 'self') { showSelfMark(seconds); return; }
      showFeedback(g.result, g.note, Object.assign({ skipped: g.skipped }, meta), seconds);
    }

    function showSelfMark(seconds) {
      fb.innerHTML = `<div class="feedback self"><div class="headline">Now compare with the model answer</div><div class="model">${esc(qn.model || '')}</div><p class="small muted">Mark yourself honestly: that is how you get better.</p><div class="selfmark"><button type="button" class="btn mint sm" data-r="correct">I got it ✅</button><button type="button" class="btn sun sm" data-r="partial">Partly 🟡</button><button type="button" class="btn coral sm" data-r="wrong">Not yet ❌</button></div></div>`;
      $$('[data-r]', fb).forEach((b) => { b.onclick = () => showFeedback(b.dataset.r, null, { self: true }, seconds); });
    }

    function showFeedback(result, note, meta, seconds) {
      const ok = result === 'correct';
      const streak = (opts.streak || 0) + (ok ? 1 : 0);
      const headline = ok ? (streak >= 3 && streak % 3 === 0 ? pick(D.PRAISE_STREAK) : pick(D.PRAISE)) : result === 'partial' ? 'So close!' : meta.skipped ? 'No problem. Here is how it works:' : pick(D.ENCOURAGE);
      const answerText = qn.format === 'mc' ? (String(qn.options[qn.answer]).startsWith('<svg') ? 'the one highlighted in green' : qn.options[qn.answer]) : esc(G.displayAnswer(qn));
      fb.innerHTML = `<div class="feedback ${ok ? 'ok' : result === 'partial' ? 'partial' : 'bad'}">
        <div class="headline">${esc(headline)}</div>
        ${note ? `<p>${esc(note)}</p>` : ''}
        ${!ok && qn.answer != null && !meta.self ? `<p><b>Answer:</b> ${answerText}</p>` : ''}
        ${qn.model && !meta.self ? `<div class="model"><b>Model answer:</b> ${esc(qn.model)}</div>` : ''}
        <p class="explain">${ok ? '💡 ' : '🔎 '}${qn.explain || ''}</p>
        ${qn.hint && !ok ? `<p class="small muted">Tip: ${esc(qn.hint)}</p>` : ''}
        <div class="btn-row"><button type="button" class="btn" data-next>Next →</button><span class="small muted">${seconds}s</span></div>
      </div>`;
      beep(ok ? (streak >= 3 ? 'great' : 'good') : 'bad');
      const nextBtn = $('[data-next]', fb); nextBtn.focus();
      let done = false;
      const go = () => { if (done) return; done = true; keyHandler = null; opts.onDone(result, { seconds, meta }); };
      nextBtn.onclick = go;
      keyHandler = (e) => { if (e.key === 'Enter' && document.activeElement !== nextBtn) { e.preventDefault(); go(); } };
    }
  }

  // Update mastery, XP, seen-lists and the word bank after any answer.
  function applyAnswer(qn, result) {
    E.recordAnswer(state, qn.skill, result, qn.level);
    if (qn.bank && qn.id) state.seen[qn.id] = (state.seen[qn.id] || 0) + 1;
    if (qn.word && result !== 'correct') { const w = state.wordBank[qn.word] = state.wordBank[qn.word] || { misses: 0 }; w.misses += 1; w.last = Date.now(); }
    if (qn.word && result === 'correct' && state.wordBank[qn.word]) state.wordBank[qn.word].hits = (state.wordBank[qn.word].hits || 0) + 1;
    const xp = result === 'correct' ? (qn.mode === 'stretch' ? 20 : 10) : result === 'partial' ? 5 : 2;
    state.xp += xp;
    return xp;
  }

  function passageHtml(p) {
    return `<details class="passage ${p.poem ? 'poem' : ''}" open><summary>${esc(p.title)} <span class="pill">${esc(p.kind)}</span></summary><p class="small muted"><i>${esc(p.intro)}</i></p>${p.text.map((t) => (p.data && t.startsWith('<') ? t : `<p>${esc(t)}</p>`)).join('')}</details>`;
  }

  /* ------------------------------ SESSION ------------------------------ */

  let tickTimer = null;
  function stopTimers() { clearInterval(tickTimer); tickTimer = null; keyHandler = null; $$('.pause-overlay').forEach((o) => o.remove()); }
  const cur = () => state.current;
  const curBlock = () => cur().plan.blocks[cur().blockIndex];
  const sessionRng = () => G.makeRng((cur().seed + cur().answers.length * 7919 + cur().blockIndex * 104729) % 2147483647);
  const remaining = () => Math.max(0, E.SESSION_MINUTES * 60 - cur().activeSeconds);
  const BLOCK_EMOJI = { quiz: '🧠', passage: '📖', writing: '✍️', interview: '🎤', wrap: '🏁' };

  views.session = function () {
    if (!state.current) {
      const plan = E.composeSession(state, state.profile, sessionsDone());
      state.current = { plan, blockIndex: 0, phase: 'intro', startedAt: Date.now(), activeSeconds: 0, blockSeconds: 0, answers: [], seed: Math.floor(Math.random() * 1e9), streak: 0, bestStreak: 0, q: null, block: {}, paused: false };
      save();
    }
    renderSession();
    tickTimer = setInterval(tick, 1000);
  };

  function tick() {
    const c = cur(); if (!c) return;
    if (!['question', 'feedback', 'task'].includes(c.phase) || c.paused || document.visibilityState !== 'visible') return;
    c.activeSeconds += 1; c.blockSeconds += 1;
    updateTimerUI();
    if (c.activeSeconds % 10 === 0) save();
    const b = curBlock();
    if (c.phase === 'task') {
      const left = b.minutes * 60 - c.blockSeconds;
      if (left === 60) toast('One minute left: start finishing off.');
      if (left <= 0) finishTask(true);
    }
  }

  function updateTimerUI() {
    const t = $('#timer'); if (!t) return;
    const r = remaining(); t.textContent = mmss(r); t.classList.toggle('warn', r < 120);
    const b = curBlock(); const bb = $('#block-bar i'); if (bb) bb.style.width = Math.min(100, (cur().blockSeconds / (b.minutes * 60)) * 100) + '%';
    const bt = $('#block-time'); if (bt) bt.textContent = mmss(Math.max(0, b.minutes * 60 - cur().blockSeconds));
    const tl = $('#task-left'); if (tl) tl.textContent = mmss(Math.max(0, b.minutes * 60 - cur().blockSeconds));
  }

  function renderSession() {
    const c = cur(); const b = curBlock(); const blocks = c.plan.blocks;
    main.innerHTML = `
      <div class="player-top">
        <div class="timer" id="timer" aria-label="Session time remaining">${mmss(remaining())}</div>
        <div><div class="block-label">${BLOCK_EMOJI[b.type] || ''} ${esc(b.label)}</div><div class="small muted">Block ${c.blockIndex + 1} of ${blocks.length} · <span id="block-time">${mmss(Math.max(0, b.minutes * 60 - c.blockSeconds))}</span> left in block · <span class="pill ${c.plan.style}">${c.plan.style.toUpperCase()} style</span></div></div>
        <div class="block-bar" id="block-bar" aria-hidden="true"><i style="width:${Math.min(100, (c.blockSeconds / (b.minutes * 60)) * 100)}%"></i></div>
        <div class="dots" aria-hidden="true">${blocks.map((x, i) => `<i class="${i < c.blockIndex ? 'done' : i === c.blockIndex ? 'now' : ''}"></i>`).join('')}</div>
        <div class="streak" id="streak">${c.streak >= 2 ? `🔥 ${c.streak} in a row` : ''}</div>
        <button type="button" class="btn ghost sm" id="pause">Pause</button>
        <a class="btn ghost sm" href="#home" title="Your place is saved">Home</a>
      </div>
      <div id="stage" class="card"></div>`;
    $('#pause').onclick = () => { if (cur().phase === 'intro' || cur().phase === 'wrap') return; cur().paused = true; save(); renderPause(); };
    renderPhase();
  }

  function renderPause() {
    if ($('.pause-overlay')) return;
    const o = document.createElement('div'); o.className = 'pause-overlay';
    o.innerHTML = '<div class="box"><h2>Paused</h2><p>The clock is stopped. Stretch, have a drink, then carry on.</p><button type="button" class="btn big" id="resume">Carry on</button></div>';
    document.body.appendChild(o);
    $('#resume').onclick = () => { cur().paused = false; o.remove(); save(); const i = $('#stage input, #stage textarea'); if (i) i.focus(); };
  }

  function renderPhase() {
    const c = cur(); const b = curBlock(); const stage = $('#stage');
    if (c.paused) renderPause();
    if (c.phase === 'intro') renderBlockIntro(stage, b);
    else if (c.phase === 'question' || c.phase === 'feedback') renderCurrentQuestion(stage);
    else if (c.phase === 'task') renderTask(stage, b);
  }

  function blockTip(b, style) {
    if (b.type === 'passage') return style === 'qeh' ? 'Skim the passage, then read each question and go back to find proof.' : D.ADVICE.reading;
    if (b.type === 'writing') return D.ADVICE.writing;
    if (b.type === 'interview') return D.ADVICE.interview;
    if (b.subject === 'nvr') return 'Check one feature at a time: shape, shading, size, rotation.';
    if (b.subject === 'vr') return 'Say the words in your head. If stuck, rule out the ones that are definitely wrong.';
    if (b.subject === 'ps') return 'Read it twice. Draw a quick picture or table if it helps.';
    return style === 'qeh' ? D.ADVICE.pacing : D.ADVICE.workings;
  }

  function renderBlockIntro(stage, b) {
    const c = cur();
    stage.innerHTML = `<div class="block-intro"><div class="em">${BLOCK_EMOJI[b.type] || '🧠'}</div><h2>${esc(b.label)}</h2><p class="muted">${b.minutes} minute${b.minutes === 1 ? '' : 's'} · ${b.format === 'mc' ? 'multiple choice, like the QEH online test' : b.type === 'quiz' || b.type === 'passage' ? 'typed answers, like the BGS written papers' : b.type === 'writing' ? 'one piece of writing' : 'one interview question'}${b.boosted ? ' · extra time here because it is your weakest area right now' : ''}</p><p class="tip">💡 ${esc(blockTip(b, c.plan.style))}</p><div class="btn-row" style="justify-content:center"><button type="button" class="btn big" id="go">Go!</button></div></div>`;
    const go = () => startBlock();
    $('#go').onclick = go;
    keyHandler = (e) => { if (e.key === 'Enter') { e.preventDefault(); go(); } };
  }

  function startBlock() {
    const c = cur(); const b = curBlock();
    c.blockSeconds = 0; c.block = {}; c.lastSkill = null;
    if (b.type === 'wrap') { finishSession(); return; }
    if (b.type === 'passage') {
      const level = E.levelFor(E.subjectScore(state, 'english').score);
      const p = E.choosePassage(state, sessionRng(), level);
      c.block = { passageId: p.id, qIndex: 0 };
      const u = state.passages[p.id] = state.passages[p.id] || { count: 0, last: 0 }; u.count += 1; u.last = Date.now();
    }
    if (b.type === 'writing') { const p = E.chooseWritingPrompt(state, sessionRng()); c.block = { promptId: p.id, text: '', plan: '' }; c.phase = 'task'; save(); renderSession(); return; }
    if (b.type === 'interview') { const iq = E.chooseInterviewQuestion(state, sessionRng()); c.block = { qid: iq.id, text: '' }; c.phase = 'task'; save(); renderSession(); return; }
    nextQuestion();
    renderSession();
  }

  function nextQuestion() {
    const c = cur(); const b = curBlock(); const rng = sessionRng();
    const seen = new Set(Object.keys(state.seen));
    let qn;
    if (b.type === 'passage' && !c.block.exhausted) {
      const p = D.PASSAGES.find((x) => x.id === c.block.passageId);
      const qs = E.passageQuestions(p, b.format);
      if (c.block.qIndex < qs.length) { qn = qs[c.block.qIndex]; c.block.qIndex += 1; }
      else c.block.exhausted = true;
    }
    if (!qn) {
      const block = b.type === 'passage' ? Object.assign({}, b, { type: 'quiz', skills: ['e.punct', 'e.grammar', 'e.spelling', 'vr.synonym', 'vr.cloze'] }) : b;
      qn = E.nextQuizQuestion(state, block, rng, seen, c.lastSkill);
      c.lastSkill = qn.skill;
    }
    c.q = qn; c.phase = 'question'; c.qStarted = Date.now();
    save();
  }

  function renderCurrentQuestion(stage) {
    const c = cur(); const b = curBlock(); const qn = c.q;
    if (!qn) { nextQuestion(); }
    const p = b.type === 'passage' && !c.block.exhausted ? D.PASSAGES.find((x) => x.id === c.block.passageId) : null;
    stage.innerHTML = (p ? passageHtml(p) : '') + '<div id="qbox"></div>';
    renderQuestion($('#qbox'), c.q, {
      streak: c.streak,
      onDone: (result, info) => {
        const xp = applyAnswer(c.q, result);
        c.answers.push({ skill: c.q.skill, subject: subjectOf(c.q.skill), level: c.q.level, mode: c.q.mode, result, seconds: info.seconds, format: c.q.format, qid: c.q.id, block: b.id });
        c.streak = result === 'correct' ? c.streak + 1 : result === 'wrong' ? 0 : c.streak;
        c.bestStreak = Math.max(c.bestStreak, c.streak);
        xpPop(xp, $('#timer'));
        const blockDone = c.blockSeconds >= b.minutes * 60;
        if (remaining() <= 0) { finishSession(); return; }
        if (blockDone) { nextBlock(); return; }
        nextQuestion(); renderSession();
      }
    });
    updateTimerUI();
  }

  function nextBlock() {
    const c = cur();
    c.blockIndex += 1;
    if (c.blockIndex >= c.plan.blocks.length) { finishSession(); return; }
    const nb = curBlock();
    // If tasks finished early there may be spare minutes: fill them with a bonus round before the wrap-up.
    if (nb.type === 'wrap' && remaining() > 30) {
      const ov = E.overview(state);
      const weakest = ['maths', 'english', 'vr', 'nvr', 'ps'].sort((a, b2) => ov[a].score - ov[b2].score)[0];
      c.plan.blocks.splice(c.blockIndex, 0, { id: 'bonus', type: 'quiz', subject: weakest, label: `Bonus round: ${D.SUBJECTS[weakest].label}`, minutes: Math.max(1, Math.ceil(remaining() / 60)), format: c.plan.style === 'qeh' ? 'mc' : 'typed', bonus: true });
    }
    c.phase = 'intro'; c.blockSeconds = 0; c.q = null; c.block = {};
    save(); renderSession();
  }

  /* ---- writing and interview tasks inside a session ---- */

  function renderTask(stage, b) {
    const c = cur();
    if (b.type === 'interview') {
      const iq = D.INTERVIEW_QUESTIONS.find((x) => x.id === c.block.qid); const fw = D.INTERVIEW_FRAMEWORKS[iq.fw];
      stage.innerHTML = `<div class="row between"><h2>🎤 Interview question</h2><span class="pill sun">⏱ <span id="task-left">${mmss(b.minutes * 60 - c.blockSeconds)}</span></span></div>
        <p class="q-prompt">“${esc(iq.q)}”</p>
        <p class="tip">💡 ${esc(iq.tip)}</p>
        <details><summary class="small">Framework: ${fw.emoji} ${esc(fw.name)}</summary><div class="fw-steps">${fw.steps.map(([k, v]) => `<div><b>${esc(k)}:</b> ${esc(v)}</div>`).join('')}</div></details>
        <p class="small muted" style="margin-top:10px">Type what you would SAY. Short, real and personal beats long and perfect.</p>
        <textarea id="task-text" placeholder="I think... For example... That matters to me because...">${esc(c.block.text || '')}</textarea>
        <div class="btn-row"><button type="button" class="btn" id="task-finish">Finish answer</button><span class="wordcount" id="wc"></span></div>
        <div id="task-feedback"></div>`;
    } else {
      const p = D.WRITING_PROMPTS.find((x) => x.id === c.block.promptId);
      stage.innerHTML = `<div class="row between"><h2>✍️ ${esc(p.type)}: ${esc(p.title)}</h2><span class="pill sun">⏱ <span id="task-left">${mmss(b.minutes * 60 - c.blockSeconds)}</span></span></div>
        <p class="q-prompt">${esc(p.prompt)}</p>
        <details ${c.blockSeconds < 60 ? 'open' : ''}><summary class="small">Planning ideas (spend 2 minutes planning, then write)</summary><ul class="plan-list">${p.plan.map((x) => `<li>${esc(x)}</li>`).join('')}</ul><label class="field"><span>My plan (a few words per part)</span><textarea id="task-plan" rows="2" placeholder="Beginning... Middle... End... Wow words...">${esc(c.block.plan || '')}</textarea></label></details>
        <p class="tip">💡 ${esc(D.ADVICE.writing)} This is a ${b.minutes}-minute sprint: a strong opening, one vivid middle section and a proper ending.</p>
        <textarea id="task-text" class="writing" placeholder="Start writing here...">${esc(c.block.text || '')}</textarea>
        <div class="btn-row"><button type="button" class="btn" id="task-finish">Finish early</button><span class="wordcount" id="wc"></span></div>
        <div id="task-feedback"></div>`;
      $('#task-plan').oninput = (e) => { c.block.plan = e.target.value; };
    }
    const ta = $('#task-text'); const wc = $('#wc');
    const updateWc = () => { const n = ta.value.trim().split(/\s+/).filter(Boolean).length; wc.textContent = `${n} word${n === 1 ? '' : 's'}`; };
    updateWc(); ta.focus();
    let saveTimer;
    ta.oninput = () => { c.block.text = ta.value; updateWc(); clearTimeout(saveTimer); saveTimer = setTimeout(save, 1500); };
    $('#task-finish').onclick = () => finishTask(false);
    keyHandler = null;
  }

  function finishTask(timeUp) {
    const c = cur(); const b = curBlock();
    if (c.phase !== 'task') return;
    const ta = $('#task-text'); if (ta) { c.block.text = ta.value; ta.disabled = true; }
    const fbBox = $('#task-feedback'); const fin = $('#task-finish'); if (fin) fin.disabled = true;
    c.phase = 'feedback';
    if (b.type === 'interview') {
      const iq = D.INTERVIEW_QUESTIONS.find((x) => x.id === c.block.qid);
      const a = E.analyseInterview(c.block.text, iq);
      state.interview.push({ at: Date.now(), qid: iq.id, text: c.block.text, score: a.score, mode: 'typed' });
      E.recordAnswer(state, iq.skill, a.score >= 4 ? 'correct' : a.score >= 2 ? 'partial' : 'wrong', 2);
      state.xp += 10 + a.score * 2;
      c.answers.push({ skill: iq.skill, subject: 'interview', level: 2, result: a.score >= 4 ? 'correct' : a.score >= 2 ? 'partial' : 'wrong', seconds: c.blockSeconds, format: 'task', qid: iq.id, block: b.id });
      if (fbBox) fbBox.innerHTML = feedbackListHtml(timeUp ? 'Time is up. Here is your feedback:' : `Interview score: ${'⭐'.repeat(a.score)}`, a.praise, a.targets) + '<div class="btn-row"><button type="button" class="btn" id="task-next">Next →</button></div>';
    } else {
      const p = D.WRITING_PROMPTS.find((x) => x.id === c.block.promptId);
      const a = E.analyseWriting(c.block.text, p);
      state.writing.push({ at: Date.now(), promptId: p.id, text: c.block.text, plan: c.block.plan, metrics: a.metrics, scores: a.scores, minutes: b.minutes });
      const avg = Object.values(a.scores).reduce((x, y) => x + y, 0) / 6;
      E.recordAnswer(state, p.skill, avg >= 3.5 ? 'correct' : avg >= 2.5 ? 'partial' : 'wrong', 2);
      state.xp += 15 + Math.round(a.metrics.words / 20);
      c.answers.push({ skill: p.skill, subject: 'writing', level: 2, result: avg >= 3.5 ? 'correct' : avg >= 2.5 ? 'partial' : 'wrong', seconds: c.blockSeconds, format: 'task', qid: p.id, block: b.id });
      if (fbBox) fbBox.innerHTML = feedbackListHtml(timeUp ? 'Pens down! Here is your feedback:' : 'Feedback on your writing', a.praise, a.targets) + rubricHtml(a.scores, false) + '<p class="small muted">A grown-up can add their own marks in the Parent corner.</p><div class="btn-row"><button type="button" class="btn" id="task-next">Next →</button></div>';
    }
    save(); beep('great');
    const nb = $('#task-next'); if (nb) { nb.focus(); nb.onclick = () => { if (remaining() <= 0) finishSession(); else nextBlock(); }; }
    keyHandler = (e) => { if (e.key === 'Enter' && document.activeElement !== nb) { e.preventDefault(); nb.click(); } };
  }

  function feedbackListHtml(title, praise, targets) {
    return `<div class="feedback ok" style="margin-top:14px"><div class="headline">${esc(title)}</div>${praise.length ? `<p><b>What worked:</b></p><ul>${praise.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}${targets.length ? `<p><b>Next time, try:</b></p><ul>${targets.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '<p>Nothing to fix. Seriously impressive.</p>'}</div>`;
  }

  function rubricHtml(scores, editable, id) {
    return `<div class="rubric" ${id ? `data-rubric="${id}"` : ''}>${D.WRITING_RUBRIC.map((r) => `<div class="rubric-row"><div><b>${esc(r.label)}</b><div class="small muted">${esc(r.help)}</div></div><div class="stars" data-crit="${r.id}">${[1, 2, 3, 4, 5].map((n) => `<button type="button" class="${n <= (scores[r.id] || 0) ? 'on' : ''}" data-n="${n}" ${editable ? '' : 'disabled'} aria-label="${n} star${n > 1 ? 's' : ''}">⭐</button>`).join('')}</div></div>`).join('')}</div>`;
  }

  /* ---- finishing a session ---- */

  function finishSession() {
    const c = cur(); if (!c) return;
    const summary = E.summarise(c);
    const decision = E.tokenDecision(state, state.profile, c.activeSeconds, Date.now());
    const session = { id: 's' + Date.now(), startedAt: c.startedAt, finishedAt: Date.now(), style: c.plan.style, minutes: Math.round(c.activeSeconds / 60), summary, token: !!decision.token, bonus: !!decision.bonus, answers: c.answers.length };
    state.sessions.push(session);
    if (decision.token) { state.tokens.earned += 1; state.tokens.history.push({ type: 'earned', at: Date.now(), session: session.id }); }
    if (decision.bonus) state.xp += 50;
    const badges = E.checkBadges(state, c, summary);
    const focus = E.focusSuggestions(state, 3);
    state.current = null;
    save();
    stopTimers();
    renderWrap({ session, summary, decision, badges, focus });
  }

  function renderWrap(r) {
    const s = r.summary; const avail = state.tokens.earned - state.tokens.spent;
    const subj = Object.entries(s.bySubject).map(([k, v]) => `<div class="stat"><b>${Math.round((v.correct / v.total) * 100)}%</b><span class="small">${D.SUBJECTS[k] ? D.SUBJECTS[k].emoji + ' ' + esc(D.SUBJECTS[k].label) : esc(k)}</span></div>`).join('');
    main.innerHTML = `<section class="card">
      <h1 class="center">Session complete, ${esc(name())}! 🎉</h1>
      ${r.decision.token ? `<div class="token-award"><span class="coin">🎟️</span><h2>You earned a games token!</h2><p>That is 40 minutes of video games, redeemable with a grown-up. You now have <b>${avail}</b> token${avail === 1 ? '' : 's'}.</p></div>` : `<div class="tip">${esc(r.decision.reason)}${r.decision.bonus ? ' +50 XP bonus star! ⭐' : ''}</div>`}
      <div class="results" style="margin-top:16px">
        <div class="stat"><b>${Math.round(s.accuracy * 100)}%</b><span class="small">overall</span></div>
        <div class="stat"><b>${s.total}</b><span class="small">tasks done</span></div>
        <div class="stat"><b>${s.bestStreak}</b><span class="small">best streak</span></div>
        <div class="stat"><b>${r.session.minutes}</b><span class="small">minutes</span></div>
        ${subj}
      </div>
      ${r.badges.length ? `<h2 style="margin-top:18px">New badges</h2><div class="badges">${r.badges.map((b) => `<span class="badge"><span class="em">${b.emoji}</span>${esc(b.name)}</span>`).join('')}</div>` : ''}
      ${r.focus.length ? `<h2 style="margin-top:18px">Next session will work on</h2><p>${r.focus.map((f) => `<span class="pill">${esc(f.label)} · ${f.score}</span>`).join(' ')}</p>` : ''}
      <div class="btn-row"><a class="btn big" href="#home">Back home</a><button type="button" class="btn secondary" id="share">Copy a summary for a grown-up</button></div>
    </section>`;
    window.scrollTo({ top: 0 });
    if (r.decision.token) { confetti(); beep('great'); }
    $('#share').onclick = () => {
      const text = `${name()} finished a ${r.session.minutes}-minute Brain Bridge session (${r.session.style.toUpperCase()} style): ${Math.round(s.accuracy * 100)}% overall, best streak ${s.bestStreak}. ${r.decision.token ? 'Token earned: 40 minutes of games!' : 'No token this time.'}`;
      if (navigator.share) navigator.share({ text }).catch(() => {}); else if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => toast('Copied!'));
    };
    renderHeaderStats();
  }

  /* ------------------------------ PRACTICE ----------------------------- */

  const practice = { subject: 'maths', skill: 'mix', level: 'auto', format: 'mc', count: 0, correct: 0, streak: 0 };

  views.practice = function (args) {
    if (args && args[0] === 'passage') return renderPassagePractice(args[1]);
    if (args && args[0] === 'words') return renderWordBankPractice();
    const subjects = ['maths', 'english', 'vr', 'nvr', 'ps'];
    const skills = E.SKILLS_BY_SUBJECT[practice.subject].filter((id) => !['e.retrieve', 'e.infer', 'e.vocab', 'e.language'].includes(id));
    const wb = Object.keys(state.wordBank).filter((w) => state.wordBank[w].misses > (state.wordBank[w].hits || 0));
    main.innerHTML = `<section class="card">
      <h1>Practice</h1><p class="muted">No timer, no token, just practice. Every answer still teaches Brain Bridge what to work on in your next session.</p>
      <div class="cat-grid" id="subjects">${subjects.map((s) => `<button type="button" data-s="${s}" class="${practice.subject === s ? 'active' : ''}" style="${practice.subject === s ? 'border-color:' + D.SUBJECTS[s].colour : ''}"><span class="em">${D.SUBJECTS[s].emoji}</span>${esc(D.SUBJECTS[s].label)}</button>`).join('')}</div>
      <div class="grid three" style="margin-top:16px">
        <label class="field"><span>Topic</span><select id="skill"><option value="mix">Mix of everything</option>${skills.map((id) => `<option value="${id}" ${practice.skill === id ? 'selected' : ''}>${esc(skillLabel(id))}</option>`).join('')}</select></label>
        <label class="field"><span>Level</span><select id="level"><option value="auto">Auto (matched to you)</option><option value="1" ${practice.level === '1' ? 'selected' : ''}>1 · warm-up</option><option value="2" ${practice.level === '2' ? 'selected' : ''}>2 · exam level</option><option value="3" ${practice.level === '3' ? 'selected' : ''}>3 · stretch</option></select></label>
        <label class="field"><span>Format</span><select id="format"><option value="mc" ${practice.format === 'mc' ? 'selected' : ''}>Multiple choice (QEH style)</option><option value="typed" ${practice.format === 'typed' ? 'selected' : ''}>Typed answers (BGS style)</option></select></label>
      </div>
      <div class="btn-row"><button type="button" class="btn big" id="start">Start practising</button></div>
    </section>
    <section class="grid two">
      <div class="card"><h2>📖 Reading practice</h2><p class="muted">Work through a whole passage with its questions.</p>${D.PASSAGES.map((p) => `<div class="row between history-item"><span><b>${esc(p.title)}</b> <span class="pill">${esc(p.kind)}</span> <span class="small muted">level ${p.level}${state.passages[p.id] ? ' · done ' + state.passages[p.id].count + '×' : ''}</span></span><span><a class="btn sm secondary" href="#practice/passage/${p.id}/mc">Multiple choice</a> <a class="btn sm secondary" href="#practice/passage/${p.id}/typed">Written</a></span></div>`).join('')}</div>
      <div class="card"><h2>🔤 Word bank</h2><p class="muted">Words you have slipped on. Review them until they stick.</p>${wb.length ? `<p>${wb.slice(0, 20).map((w) => `<span class="pill">${esc(w)}</span>`).join(' ')}</p><a class="btn sm" href="#practice/words">Review my words</a>` : '<p class="small muted">No words yet. They appear here when you miss a vocabulary question.</p>'}</div>
    </section>`;
    $$('#subjects button').forEach((b) => { b.onclick = () => { practice.subject = b.dataset.s; practice.skill = 'mix'; navigate(); }; });
    $('#start').onclick = () => { practice.skill = $('#skill').value; practice.level = $('#level').value; practice.format = $('#format').value; practice.count = 0; practice.correct = 0; practice.streak = 0; runPractice(); };
  };

  function runPractice() {
    main.innerHTML = `<div class="player-top"><div class="block-label">${D.SUBJECTS[practice.subject].emoji} ${esc(practice.skill === 'mix' ? D.SUBJECTS[practice.subject].label : skillLabel(practice.skill))}</div><div class="small muted" id="pscore">0 / 0</div><div class="streak" id="streak"></div><a class="btn ghost sm" href="#practice" id="pstop">Stop</a></div><div class="card" id="stage"></div>`;
    const rng = G.makeRng();
    const next = () => {
      const pool = practice.skill === 'mix' ? E.SKILLS_BY_SUBJECT[practice.subject].filter((id) => !['e.retrieve', 'e.infer', 'e.vocab', 'e.language'].includes(id)) : [practice.skill];
      const block = { skills: pool, subject: practice.subject, format: practice.format, fixedLevel: practice.level === 'auto' ? null : +practice.level };
      const qn = E.nextQuizQuestion(state, block, rng, new Set(Object.keys(state.seen)), practice.last);
      practice.last = qn.skill;
      renderQuestion($('#stage'), qn, { streak: practice.streak, onDone: (result) => {
        const xp = applyAnswer(qn, result); save(); xpPop(xp, $('#streak'));
        practice.count += 1; if (result === 'correct') { practice.correct += 1; practice.streak += 1; } else if (result === 'wrong') practice.streak = 0;
        $('#pscore').textContent = `${practice.correct} / ${practice.count}`; $('#streak').textContent = practice.streak >= 2 ? `🔥 ${practice.streak} in a row` : '';
        renderHeaderStats(); next();
      } });
    };
    next();
  }

  function renderPassagePractice(args) {
    const p = D.PASSAGES.find((x) => x.id === args) || D.PASSAGES.find((x) => x.id === (location.hash.split('/')[2]));
    const format = location.hash.split('/')[3] === 'typed' ? 'typed' : 'mc';
    if (!p) { location.hash = '#practice'; return; }
    const qs = E.passageQuestions(p, format); let i = 0, correct = 0, streak = 0;
    const u = state.passages[p.id] = state.passages[p.id] || { count: 0, last: 0 }; u.count += 1; u.last = Date.now(); save();
    main.innerHTML = `<div class="player-top"><div class="block-label">📖 ${esc(p.title)}</div><div class="small muted" id="pscore">Question 1 of ${qs.length}</div><a class="btn ghost sm" href="#practice">Stop</a></div><div class="card">${passageHtml(p)}<div id="qbox"></div></div>`;
    const ask = () => {
      if (i >= qs.length) { $('#qbox').innerHTML = `<div class="feedback ok"><div class="headline">Passage complete: ${correct} out of ${qs.length}</div><div class="btn-row"><a class="btn" href="#practice">Back to practice</a></div></div>`; return; }
      $('#pscore').textContent = `Question ${i + 1} of ${qs.length}`;
      renderQuestion($('#qbox'), qs[i], { streak, onDone: (result) => { const xp = applyAnswer(qs[i], result); save(); xpPop(xp, $('#pscore')); if (result === 'correct') { correct += 1; streak += 1; } else if (result === 'wrong') streak = 0; else correct += 0.5; i += 1; renderHeaderStats(); ask(); } });
    };
    ask();
  }

  function renderWordBankPractice() {
    const words = Object.keys(state.wordBank).map((w) => D.VOCAB.find((v) => v.w === w)).filter(Boolean);
    if (!words.length) { location.hash = '#practice'; return; }
    const rng = G.makeRng(); let streak = 0;
    main.innerHTML = `<div class="player-top"><div class="block-label">🔤 Word bank review</div><div class="streak" id="streak"></div><a class="btn ghost sm" href="#practice">Stop</a></div><div class="card" id="stage"></div>`;
    const next = () => {
      const v = rng.pick(words); const kind = rng.pick(['syn', 'cloze', 'ant']);
      let qn;
      if (kind === 'syn') { const opts = rng.shuffle([v.s[0]].concat(rng.sample(D.VOCAB.filter((x) => x.w !== v.w), 3).map((x) => x.s[0]))); qn = { id: 'wb', skill: 'vr.synonym', level: v.l, format: 'mc', prompt: `Which word is closest in meaning to <b>${v.w}</b>?`, options: opts, answer: opts.indexOf(v.s[0]), explain: `${v.w} means ${v.d}.`, word: v.w, seconds: 25 }; }
      else if (kind === 'ant' && v.a) { const opts = rng.shuffle([v.a, v.s[0]].concat(rng.sample(D.VOCAB.filter((x) => x.w !== v.w), 2).map((x) => x.w))); qn = { id: 'wb', skill: 'vr.antonym', level: v.l, format: 'mc', prompt: `Which word is most OPPOSITE to <b>${v.w}</b>?`, options: opts, answer: opts.indexOf(v.a), explain: `${v.w} means ${v.d}; the opposite is ${v.a}.`, word: v.w, seconds: 25 }; }
      else { const opts = rng.shuffle([v.w].concat(rng.sample(D.VOCAB.filter((x) => x.w !== v.w), 3).map((x) => x.w))); qn = { id: 'wb', skill: 'vr.cloze', level: v.l, format: 'mc', prompt: `Choose the word that fits:<br><i>${esc(v.eg.replace(/___/g, '______'))}</i>`, options: opts, answer: opts.indexOf(v.w), explain: `${v.w} means ${v.d}.`, word: v.w, seconds: 30 }; }
      renderQuestion($('#stage'), qn, { streak, onDone: (result) => { const xp = applyAnswer(qn, result); save(); xpPop(xp, $('#streak')); streak = result === 'correct' ? streak + 1 : 0; $('#streak').textContent = streak >= 2 ? `🔥 ${streak} in a row` : ''; renderHeaderStats(); next(); } });
    };
    next();
  }

  /* ------------------------------ WRITING STUDIO ----------------------- */

  const studio = { promptId: null, minutes: 25, running: false, left: 0, text: '', plan: '' };

  views.writing = function (args) {
    if (args && args[0] === 'piece') return renderWritingPiece(args[1]);
    if (studio.running) return renderWritingTask();
    const types = ['Story', 'Description', 'Letter', 'Diary', 'Article', 'Speech'];
    main.innerHTML = `<section class="card">
      <h1>✍️ Writing studio</h1>
      <p class="muted">The BGS creative writing paper is 45 minutes and is marked for imagination, form, organisation, sentence structure and SPaG. Pick a prompt, plan for five minutes, write, then read it back.</p>
      <div class="grid two">
        <label class="field"><span>Prompt</span><select id="prompt"><option value="random">Surprise me</option>${types.map((t) => `<optgroup label="${t}">${D.WRITING_PROMPTS.filter((p) => p.type === t).map((p) => `<option value="${p.id}">${esc(p.title)}${state.writing.some((w) => w.promptId === p.id) ? ' ✓' : ''}</option>`).join('')}</optgroup>`).join('')}</select></label>
        <label class="field"><span>Time</span><select id="minutes"><option value="10">10 minutes (sprint)</option><option value="25" selected>25 minutes</option><option value="45">45 minutes (full BGS paper)</option><option value="0">No timer</option></select></label>
      </div>
      <div class="btn-row"><button type="button" class="btn big" id="start">Start writing</button></div>
    </section>
    <section class="card"><h2>Your pieces</h2>${state.writing.length ? state.writing.slice().reverse().map((w, i) => { const p = D.WRITING_PROMPTS.find((x) => x.id === w.promptId) || { title: '?' }; const idx = state.writing.length - 1 - i; return `<div class="row between history-item"><span><b>${esc(p.title)}</b> <span class="small muted">${fmtDate(w.at)} · ${w.metrics.words} words${w.parentScores ? ' · marked by a grown-up' : ''}</span></span><a class="btn sm secondary" href="#writing/piece/${idx}">Read & feedback</a></div>`; }).join('') : '<p class="small muted">Nothing yet. Your first piece will appear here with its feedback.</p>'}</section>
    <section class="card"><h2>Examiner’s checklist</h2><ul>${D.WRITING_RUBRIC.map((r) => `<li><b>${esc(r.label)}:</b> ${esc(r.help)}</li>`).join('')}</ul></section>`;
    $('#start').onclick = () => { const v = $('#prompt').value; studio.promptId = v === 'random' ? E.chooseWritingPrompt(state, G.makeRng()).id : v; studio.minutes = +$('#minutes').value; studio.left = studio.minutes * 60; studio.text = ''; studio.plan = ''; studio.running = true; navigate(); };
  };

  function renderWritingTask() {
    const p = D.WRITING_PROMPTS.find((x) => x.id === studio.promptId);
    main.innerHTML = `<div class="player-top"><div class="block-label">✍️ ${esc(p.type)}: ${esc(p.title)}</div>${studio.minutes ? `<div class="timer" id="timer">${mmss(studio.left)}</div>` : ''}<span class="wordcount" id="wc"></span><button type="button" class="btn ghost sm" id="stop">Finish</button></div>
      <div class="card"><p class="q-prompt">${esc(p.prompt)}</p>
      <details open><summary class="small">Planning ideas</summary><ul class="plan-list">${p.plan.map((x) => `<li>${esc(x)}</li>`).join('')}</ul><label class="field"><span>My plan</span><textarea id="plan" rows="2">${esc(studio.plan)}</textarea></label></details>
      <textarea id="text" class="writing" placeholder="Start writing here...">${esc(studio.text)}</textarea>
      <div id="task-feedback"></div></div>`;
    const ta = $('#text'); const wc = $('#wc');
    const updateWc = () => { const n = ta.value.trim().split(/\s+/).filter(Boolean).length; wc.textContent = `${n} words`; };
    updateWc(); ta.focus();
    ta.oninput = () => { studio.text = ta.value; updateWc(); };
    $('#plan').oninput = (e) => { studio.plan = e.target.value; };
    const finish = (timeUp) => {
      if (!studio.running) return; studio.running = false; clearInterval(tickTimer); ta.disabled = true; $('#stop').disabled = true;
      const a = E.analyseWriting(studio.text, p);
      state.writing.push({ at: Date.now(), promptId: p.id, text: studio.text, plan: studio.plan, metrics: a.metrics, scores: a.scores, minutes: studio.minutes });
      const avg = Object.values(a.scores).reduce((x, y) => x + y, 0) / 6;
      E.recordAnswer(state, p.skill, avg >= 3.5 ? 'correct' : avg >= 2.5 ? 'partial' : 'wrong', 2);
      state.xp += 15 + Math.round(a.metrics.words / 20);
      const badges = E.checkBadges(state, null, null); save(); renderHeaderStats(); beep('great');
      $('#task-feedback').innerHTML = feedbackListHtml(timeUp ? 'Pens down! Here is your feedback:' : 'Feedback on your writing', a.praise, a.targets) + rubricHtml(a.scores, false) + (badges.length ? `<p>New badge: ${badges.map((b) => b.emoji + ' ' + esc(b.name)).join(', ')}</p>` : '') + '<div class="btn-row"><a class="btn" href="#writing">Back to the studio</a></div>';
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    };
    $('#stop').onclick = () => finish(false);
    if (studio.minutes) tickTimer = setInterval(() => { if (document.visibilityState !== 'visible') return; studio.left -= 1; const t = $('#timer'); if (t) { t.textContent = mmss(Math.max(0, studio.left)); t.classList.toggle('warn', studio.left < 180); } if (studio.left === 180) toast('Three minutes left: finish your ending and read it back.'); if (studio.left <= 0) finish(true); }, 1000);
  }

  function renderWritingPiece(idx) {
    const w = state.writing[+idx]; if (!w) { location.hash = '#writing'; return; }
    const p = D.WRITING_PROMPTS.find((x) => x.id === w.promptId) || { title: '?', prompt: '' };
    const a = E.analyseWriting(w.text, p);
    main.innerHTML = `<section class="card"><a href="#writing" class="small">← Writing studio</a><h1>${esc(p.title)}</h1><p class="muted">${fmtDate(w.at)} · ${w.metrics.words} words · ${w.minutes ? w.minutes + ' minutes' : 'untimed'}</p><p class="q-prompt">${esc(p.prompt)}</p>
      <div class="passage" style="max-height:none;white-space:pre-wrap">${esc(w.text)}</div>
      ${feedbackListHtml('Feedback', a.praise, a.targets)}<h3 style="margin-top:14px">Automatic marks</h3>${rubricHtml(w.scores, false)}${w.parentScores ? `<h3 style="margin-top:14px">Grown-up’s marks</h3>${rubricHtml(w.parentScores, false)}${w.parentNote ? `<p class="tip">${esc(w.parentNote)}</p>` : ''}` : ''}</section>`;
  }

  /* ------------------------------ INTERVIEW STUDIO --------------------- */

  const iv = { tab: 'practise', cat: 'iv.you', q: null, mode: 'typed' };

  views.interview = function () {
    const tabs = [['practise', '⌨️ Practise'], ['speak', '🗣️ Say it out loud'], ['rapid', '⚡ Rapid fire'], ['why', '🏫 Why this school'], ['frameworks', '🧭 Frameworks']];
    main.innerHTML = `<section class="card"><h1>🎤 Interview studio</h1><p class="muted">Both schools interview. BGS: a friendly chat with a member of staff about your hobbies, interests and school work. QEH: the Head and Head of Year, on the taster morning. Practise here until talking about yourself feels easy.</p>
      <div class="row" id="tabs">${tabs.map(([id, label]) => `<button type="button" class="btn sm ${iv.tab === id ? '' : 'ghost'}" data-tab="${id}">${label}</button>`).join('')}</div></section><div id="ivbox"></div>`;
    $$('#tabs button').forEach((b) => { b.onclick = () => { iv.tab = b.dataset.tab; iv.q = null; navigate(); }; });
    const box = $('#ivbox');
    if (iv.tab === 'frameworks') renderFrameworks(box);
    else if (iv.tab === 'why') renderWhySchool(box);
    else if (iv.tab === 'rapid') renderRapid(box);
    else renderIvPractice(box, iv.tab === 'speak');
  };

  function renderFrameworks(box) {
    box.innerHTML = Object.values(D.INTERVIEW_FRAMEWORKS).map((fw) => `<section class="card"><h2>${fw.emoji} ${esc(fw.name)}</h2><div class="fw-steps">${fw.steps.map(([k, v]) => `<div><b>${esc(k)}:</b> ${esc(v)}</div>`).join('')}</div><p class="tip" style="margin-top:10px">Example: ${esc(fw.example)}</p></section>`).join('') + `<section class="card"><h2>Interview day tips</h2><ul><li>Walk in, smile, say hello, and sit up straight. Look at the person speaking.</li><li>Listen to the whole question. Repeating it back buys thinking time.</li><li>Answer in two to four sentences with a real example. Avoid one-word answers.</li><li>Be honest. If you do not know, say what you think and how you would find out.</li><li>Have ready: two books, one hobby story, one time you helped someone, one thing you love about the school, one question to ask.</li></ul></section>`;
  }

  function renderIvPractice(box, speak) {
    const cats = [['iv.you', '🙋 About you'], ['iv.school', '🏫 School & learning'], ['iv.reading', '📚 Reading & interests'], ['iv.character', '🤝 Character & teamwork'], ['iv.thinking', '🤔 Thinking questions'], ['iv.why', '💙 Why this school']];
    const counts = {}; state.interview.forEach((d) => { counts[d.qid] = (counts[d.qid] || 0) + 1; });
    if (!iv.q) { const pool = D.INTERVIEW_QUESTIONS.filter((x) => x.skill === iv.cat).sort((a, b) => (counts[a.id] || 0) - (counts[b.id] || 0)); iv.q = pool[Math.floor(Math.random() * Math.min(3, pool.length))]; }
    const qq = iv.q; const fw = D.INTERVIEW_FRAMEWORKS[qq.fw];
    box.innerHTML = `<section class="card"><div class="cat-grid">${cats.map(([id, label]) => `<button type="button" data-cat="${id}" style="${iv.cat === id ? 'border-color:var(--blue-2);background:var(--sky)' : ''}">${label}<span class="small muted" style="display:block;font-weight:600">${D.INTERVIEW_QUESTIONS.filter((x) => x.skill === id && counts[x.id]).length}/${D.INTERVIEW_QUESTIONS.filter((x) => x.skill === id).length} practised</span></button>`).join('')}</div></section>
      <section class="card"><p class="q-prompt">“${esc(qq.q)}”</p><p class="tip">💡 ${esc(qq.tip)}</p>
      <details><summary class="small">Framework: ${fw.emoji} ${esc(fw.name)}</summary><div class="fw-steps">${fw.steps.map(([k, v]) => `<div><b>${esc(k)}:</b> ${esc(v)}</div>`).join('')}</div></details>
      ${speak ? `<div class="stack" style="margin-top:12px"><p>Think for 15 seconds, then say your answer out loud for up to a minute. Record it if you like, listen back, and rate yourself.</p><div class="speak-timer" id="speak-timer">15</div><div class="btn-row" style="justify-content:center"><button type="button" class="btn" id="think">Start thinking time</button><button type="button" class="btn teal" id="rec" hidden>● Record</button><button type="button" class="btn coral" id="stoprec" hidden>■ Stop</button></div><audio id="playback" controls hidden style="width:100%"></audio><div id="rate" hidden><p><b>How did that go?</b> Did you Say, Show and Share?</p><div class="stars" id="selfstars">${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-n="${n}" aria-label="${n} stars">⭐</button>`).join('')}</div></div></div>` : `<textarea id="ivtext" placeholder="Type what you would say..."></textarea><div class="btn-row"><button type="button" class="btn" id="ivcheck">Get feedback</button><button type="button" class="btn ghost sm" id="ivnext">Different question</button></div>`}
      <div id="ivfb"></div></section>`;
    $$('[data-cat]', box).forEach((b) => { b.onclick = () => { iv.cat = b.dataset.cat; iv.q = null; navigate(); }; });
    if (!speak) {
      $('#ivnext').onclick = () => { iv.q = null; navigate(); };
      $('#ivcheck').onclick = () => {
        const text = $('#ivtext').value; const a = E.analyseInterview(text, qq);
        state.interview.push({ at: Date.now(), qid: qq.id, text, score: a.score, mode: 'typed' });
        E.recordAnswer(state, qq.skill, a.score >= 4 ? 'correct' : a.score >= 2 ? 'partial' : 'wrong', 2); state.xp += 10 + a.score * 2;
        const badges = E.checkBadges(state, null, null); save(); renderHeaderStats(); beep(a.score >= 4 ? 'great' : 'good');
        $('#ivfb').innerHTML = feedbackListHtml(`Score: ${'⭐'.repeat(a.score)}`, a.praise, a.targets) + (badges.length ? `<p>New badge: ${badges.map((b) => b.emoji + ' ' + esc(b.name)).join(', ')}</p>` : '') + '<div class="btn-row"><button type="button" class="btn" id="ivanother">Another question →</button></div>';
        $('#ivanother').onclick = () => { iv.q = null; navigate(); };
      };
    } else {
      let timer, recorder, chunks = [];
      $('#think').onclick = () => { let left = 15; const t = $('#speak-timer'); t.textContent = left; $('#think').disabled = true; timer = setInterval(() => { left -= 1; t.textContent = left; if (left <= 0) { clearInterval(timer); beep('good'); t.textContent = 'Speak!'; speakPhase(); } }, 1000); };
      const speakPhase = () => { let left = 60; const t = $('#speak-timer'); $('#rec').hidden = !navigator.mediaDevices; $('#rate').hidden = false; timer = setInterval(() => { left -= 1; t.textContent = mmss(left); if (left <= 0) { clearInterval(timer); t.textContent = 'Time!'; beep('good'); } }, 1000); };
      $('#rec').onclick = async () => { try { const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); recorder = new MediaRecorder(stream); chunks = []; recorder.ondataavailable = (e) => chunks.push(e.data); recorder.onstop = () => { const url = URL.createObjectURL(new Blob(chunks)); const a = $('#playback'); a.src = url; a.hidden = false; stream.getTracks().forEach((tr) => tr.stop()); }; recorder.start(); $('#rec').hidden = true; $('#stoprec').hidden = false; } catch (e) { toast('Microphone not available. Just say it out loud!'); } };
      $('#stoprec').onclick = () => { if (recorder) recorder.stop(); $('#stoprec').hidden = true; };
      $$('#selfstars button').forEach((b) => { b.onclick = () => { const n = +b.dataset.n; $$('#selfstars button').forEach((x) => x.classList.toggle('on', +x.dataset.n <= n)); state.interview.push({ at: Date.now(), qid: qq.id, text: '', score: n, mode: 'spoken' }); E.recordAnswer(state, qq.skill, n >= 4 ? 'correct' : n >= 2 ? 'partial' : 'wrong', 2); state.xp += 8 + n * 2; E.checkBadges(state, null, null); save(); renderHeaderStats(); clearInterval(timer); $('#ivfb').innerHTML = `<div class="feedback ok"><div class="headline">${n >= 4 ? 'Confident and clear. Lovely.' : n >= 2 ? 'Good practice. Each go gets smoother.' : 'That is what practice is for. Try it again with one real example.'}</div><div class="btn-row"><button type="button" class="btn" id="ivanother">Another question →</button></div></div>`; $('#ivanother').onclick = () => { iv.q = null; navigate(); }; }; });
    }
  }

  function renderRapid(box) {
    const qs = G.makeRng().shuffle(D.INTERVIEW_RAPID).slice(0, 8); let i = 0, timer;
    box.innerHTML = `<section class="card center"><h2>Rapid fire</h2><p class="muted">Eight quick questions, 30 seconds each, answered out loud. No right answers: just practise talking without a pause.</p><div class="speak-timer" id="rt">30</div><p class="q-prompt" id="rq">Ready?</p><div class="btn-row" style="justify-content:center"><button type="button" class="btn big" id="rgo">Start</button><button type="button" class="btn secondary" id="rnext" hidden>Next question</button></div></section>`;
    const show = () => { clearInterval(timer); if (i >= qs.length) { $('#rq').textContent = 'Done! That was great practice.'; $('#rt').textContent = '🎉'; $('#rnext').hidden = true; state.xp += 20; save(); renderHeaderStats(); return; } let left = 30; $('#rq').textContent = qs[i]; $('#rt').textContent = left; i += 1; timer = setInterval(() => { left -= 1; $('#rt').textContent = left; if (left <= 0) { beep('good'); show(); } }, 1000); };
    $('#rgo').onclick = () => { $('#rgo').hidden = true; $('#rnext').hidden = false; show(); };
    $('#rnext').onclick = show;
  }

  function renderWhySchool(box) {
    const schools = state.profile.schools.length ? state.profile.schools : ['bgs', 'qeh'];
    box.innerHTML = schools.map((id) => { const s = D.SCHOOLS[id]; return `<section class="card school-card ${id}"><h2>${s.emoji} Why ${esc(s.short)}?</h2><p class="muted">Interviewer: ${esc(s.interview.who)}. ${esc(s.interview.when)}.</p><p><b>Things to know:</b></p><ul>${s.facts.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
      <h3>Build your answer</h3><div class="grid three"><label class="field"><span>A fact about the school</span><input type="text" data-k="fact" placeholder="e.g. it was founded in ${id === 'bgs' ? '1532' : '1590'}"></label><label class="field"><span>Something you saw or heard on your visit</span><input type="text" data-k="saw" placeholder="e.g. the science labs / the theatre"></label><label class="field"><span>A personal reason</span><input type="text" data-k="why" placeholder="e.g. I love drama and want to perform"></label></div>
      <button type="button" class="btn sm" data-build="${id}">Put it together</button><div class="model" data-out="${id}" hidden></div></section>`; }).join('');
    $$('[data-build]', box).forEach((b) => { b.onclick = () => { const sec = b.closest('section'); const v = (k) => ($(`[data-k="${k}"]`, sec).value || '').trim(); const s = D.SCHOOLS[b.dataset.build]; const out = $(`[data-out]`, sec); out.hidden = false; out.innerHTML = `<b>Try saying:</b> “I would love to come to ${esc(s.short)} because ${v('why') || '[your personal reason]'}. When I visited, I ${v('saw') ? 'saw ' + esc(v('saw')) : '[something you noticed]'} and it made me want to be part of it. I also like that ${v('fact') || '[a fact about the school]'}.”<p class="small muted" style="margin:6px 0 0">Now say it in your own words, not from memory. Practise it in “Say it out loud”.</p>`; }; });
  }

  /* ------------------------------ PROGRESS ----------------------------- */

  views.progress = function () {
    const ov = E.overview(state);
    const subjects = Object.keys(D.SUBJECTS);
    const skillRows = (sub) => E.SKILLS_BY_SUBJECT[sub].map((id) => { const m = state.mastery[id]; const sc = m ? m.score : E.START_SCORE; const lv = E.levelFor(sc); return `<tr><td>${esc(skillLabel(id))}</td><td style="width:40%"><div class="bar"><i style="width:${Math.round(sc)}%;background:${D.SUBJECTS[sub].colour}"></i></div></td><td>${m && m.attempts ? Math.round(sc) : '–'}</td><td><span class="lvl lvl-${lv}">L${lv}</span></td><td class="small muted">${m ? `${m.correct}/${m.attempts}` : '0/0'}</td></tr>`; }).join('');
    const wb = Object.entries(state.wordBank).sort((a, b) => b[1].misses - a[1].misses);
    main.innerHTML = `<section class="card"><h1>📈 Progress</h1><p class="muted">Scores run from 0 to 100 and start at 50. Brain Bridge raises them when you get questions right (more for harder questions) and picks each question’s level from them: L1 warm-up, L2 exam level, L3 stretch.</p>
      ${subjects.map((s) => `<div class="subject-row"><span class="lbl">${D.SUBJECTS[s].emoji} ${esc(D.SUBJECTS[s].label)}</span><div class="bar"><i style="width:${Math.round(ov[s].score)}%;background:${D.SUBJECTS[s].colour}"></i></div><span class="small muted">${ov[s].attempts ? Math.round(ov[s].score) : '–'}</span></div>`).join('')}</section>
      <section class="card"><h2>Sessions</h2>${state.sessions.length ? `<table class="skills-table"><tr><th>Date</th><th>Style</th><th>Score</th><th>Best streak</th><th>Minutes</th><th>Token</th></tr>${state.sessions.slice().reverse().map((s) => `<tr><td>${fmtDate(s.finishedAt)}</td><td><span class="pill ${s.style}">${s.style.toUpperCase()}</span></td><td>${Math.round(s.summary.accuracy * 100)}%</td><td>${s.summary.bestStreak}</td><td>${s.minutes}</td><td>${s.token ? '🎟️' : s.bonus ? '⭐' : '–'}</td></tr>`).join('')}</table>` : '<p class="small muted">No sessions yet.</p>'}</section>
      <section class="card"><h2>Badges</h2><div class="badges">${D.BADGES.map((b) => `<span class="badge ${state.badges.some((x) => x.id === b.id) ? '' : 'locked'}" title="${esc(b.desc)}"><span class="em">${b.emoji}</span>${esc(b.name)}</span>`).join('')}</div></section>
      ${subjects.filter((s) => E.SKILLS_BY_SUBJECT[s].length > 1).map((s) => `<section class="card"><h2>${D.SUBJECTS[s].emoji} ${esc(D.SUBJECTS[s].label)}</h2><table class="skills-table"><tr><th>Skill</th><th>Score</th><th></th><th>Level</th><th>Right</th></tr>${skillRows(s)}</table></section>`).join('')}
      <section class="card"><h2>Word bank</h2>${wb.length ? `<table class="skills-table"><tr><th>Word</th><th>Meaning</th><th>Slips</th></tr>${wb.map(([w, m]) => { const v = D.VOCAB.find((x) => x.w === w); return `<tr><td><b>${esc(w)}</b></td><td>${v ? esc(v.d) : ''}</td><td>${m.misses}</td></tr>`; }).join('')}</table><a class="btn sm" href="#practice/words" style="margin-top:10px">Review my words</a>` : '<p class="small muted">Words you miss in vocabulary questions collect here for review.</p>'}</section>`;
  };

  /* ------------------------------ EXAM GUIDE --------------------------- */

  views.guide = function () {
    main.innerHTML = `<section class="card"><h1>🏫 Exam guide</h1><p class="muted">What each school’s 11+ looks like, what to expect in the interview, and the best free familiarisation materials. Details come from the schools’ own pages and well-known 11+ guides, but formats can change: always check with the school.</p></section>` +
      ['bgs', 'qeh'].map((id) => { const s = D.SCHOOLS[id]; return `<section class="card school-card ${id}"><h2>${s.emoji} ${esc(s.name)} (${esc(s.short)})</h2><p><b>Exam:</b> ${esc(s.examDateLabel)}.</p><p>${esc(s.summary)}</p>
        <table class="papers"><tr><th>Paper</th><th>Time</th><th>Format</th><th>What is in it</th></tr>${s.papers.map((p) => `<tr><td><b>${esc(p.name)}</b></td><td>${p.minutes} min</td><td>${esc(p.format)}</td><td>${esc(p.notes)}</td></tr>`).join('')}</table>
        <h3 style="margin-top:14px">Interview</h3><p><b>Who:</b> ${esc(s.interview.who)}. <b>When:</b> ${esc(s.interview.when)}.</p><p><b>Likely topics:</b> ${s.interview.topics.map(esc).join(' · ')}</p><ul>${s.interview.tips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
        <h3>Good to know</h3><ul>${s.facts.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
        <h3>Links</h3><ul>${s.links.map((l) => `<li><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a></li>`).join('')}</ul></section>`; }).join('') +
      `<section class="card"><h2>How Brain Bridge matches the exams</h2><ul><li><b>QEH-style weeks</b> are multiple choice with short timed blocks, like the Atom Learning online test, and the questions get harder as you get them right, just as the adaptive test does.</li><li><b>BGS-style weeks</b> use typed answers and a creative writing sprint, so you practise showing working and writing at length.</li><li>Every week includes an interview question. The Interview studio has the frameworks and a “Why this school” builder for both.</li><li>${esc(D.ADVICE.pacing)}</li><li>${esc(D.ADVICE.workings)}</li></ul></section>`;
  };

  /* ------------------------------ PARENT CORNER ------------------------ */

  let parentUnlocked = false;

  views.parent = function () {
    if (state.profile.pin && !parentUnlocked) {
      main.innerHTML = `<section class="card" style="max-width:420px;margin:auto"><h1>Parent corner</h1><form id="pinform"><label class="field"><span>Enter the 4-digit PIN</span><input type="password" inputmode="numeric" maxlength="4" id="pin" autocomplete="off"></label><button class="btn" type="submit">Unlock</button></form></section>`;
      $('#pinform').onsubmit = (e) => { e.preventDefault(); if ($('#pin').value === state.profile.pin) { parentUnlocked = true; navigate(); } else toast('Wrong PIN'); };
      return;
    }
    const p = state.profile; const avail = state.tokens.earned - state.tokens.spent;
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const unmarked = state.writing.map((w, i) => ({ w, i })).filter(({ w }) => !w.parentScores).reverse();
    const tw = E.tokensThisWeek(state, Date.now());
    main.innerHTML = `<section class="card"><h1>👨‍👩‍👧 Parent corner</h1><p class="muted">Redeem tokens, mark writing, tune the schedule and back up progress.</p></section>
      <section class="grid two">
        <div class="card"><h2>🎟️ Tokens</h2><div class="vault"><span class="coin">🎟️</span><div><span class="count">${avail}</span><div class="muted">available = ${avail * 40} minutes of games</div><div class="small muted">${state.tokens.earned} earned in total · ${state.tokens.spent} spent · ${tw} earned this week</div></div></div>
          <div class="btn-row"><button type="button" class="btn sun" id="redeem" ${avail ? '' : 'disabled'}>Redeem one token (40 min)</button><button type="button" class="btn ghost sm" id="grant">Give a bonus token</button></div>
          ${state.tokens.history.length ? `<details style="margin-top:10px"><summary class="small">History</summary><ul class="small">${state.tokens.history.slice().reverse().slice(0, 20).map((h) => `<li>${fmtDate(h.at)}: ${h.type === 'earned' ? 'earned' : h.type === 'granted' ? 'bonus token given' : 'redeemed'}</li>`).join('')}</ul></details>` : ''}</div>
        <div class="card"><h2>⚙️ Settings</h2><form id="settings" class="stack">
          <label class="field"><span>Child’s first name</span><input type="text" id="s-name" value="${esc(p.name)}" maxlength="24"></label>
          <div class="field"><span>Preparing for</span><div class="checks"><label><input type="checkbox" id="s-bgs" ${p.schools.includes('bgs') ? 'checked' : ''}> BGS</label><label><input type="checkbox" id="s-qeh" ${p.schools.includes('qeh') ? 'checked' : ''}> QEH</label></div><p class="small muted">With both ticked, sessions alternate QEH-style and BGS-style weeks.</p></div>
          <label class="field"><span>Session day</span><select id="s-day">${days.map((d, i) => `<option value="${i}" ${p.sessionDay === i ? 'selected' : ''}>${d}</option>`).join('')}</select></label>
          <label class="field"><span>Tokens per week</span><select id="s-limit"><option value="1" ${p.weeklyTokenLimit === 1 ? 'selected' : ''}>1 (extra sessions earn bonus stars)</option><option value="2" ${p.weeklyTokenLimit === 2 ? 'selected' : ''}>2</option><option value="0" ${p.weeklyTokenLimit === 0 ? 'selected' : ''}>Unlimited</option></select></label>
          <label class="field"><span>Parent PIN (4 digits, blank for none)</span><input type="text" id="s-pin" inputmode="numeric" maxlength="4" value="${esc(p.pin)}" autocomplete="off"></label>
          <label class="checks"><input type="checkbox" id="s-sound" ${p.sound ? 'checked' : ''}> Sound effects</label>
          <button class="btn" type="submit">Save settings</button></form></div>
      </section>
      <section class="card"><h2>✍️ Mark writing</h2><p class="muted">Automatic feedback spots patterns, but a human reads for meaning. Give each piece 1 to 5 stars per criterion and a comment; the child sees it in the Writing studio.</p>
        ${unmarked.length ? unmarked.map(({ w, i }) => { const pr = D.WRITING_PROMPTS.find((x) => x.id === w.promptId) || { title: '?' }; return `<details class="history-item"><summary><b>${esc(pr.title)}</b> · ${fmtDate(w.at)} · ${w.metrics.words} words</summary><div class="passage" style="max-height:300px;white-space:pre-wrap;margin-top:10px">${esc(w.text)}</div>${rubricHtml({}, true, i)}<textarea data-note="${i}" rows="2" placeholder="A comment for ${esc(name())}: one thing to celebrate, one thing to try."></textarea><div class="btn-row"><button type="button" class="btn sm" data-mark="${i}">Save marks</button></div></details>`; }).join('') : '<p class="small muted">Nothing waiting to be marked.</p>'}</section>
      <section class="card"><h2>💾 Backup</h2><p class="muted">Progress lives only in this browser. Export a backup now and then, or to move to another device.</p><div class="btn-row"><button type="button" class="btn secondary" id="export">Download backup</button><label class="btn secondary" for="import">Restore from backup</label><input type="file" id="import" accept="application/json" hidden><button type="button" class="btn coral" id="reset">Reset everything</button></div></section>`;
    $('#redeem').onclick = () => { if (avail < 1) return; if (!confirm('Redeem one token for 40 minutes of games?')) return; state.tokens.spent += 1; state.tokens.history.push({ type: 'spent', at: Date.now() }); save(); toast('Token redeemed. Enjoy the games!'); navigate(); };
    $('#grant').onclick = () => { if (!confirm('Give a bonus token?')) return; state.tokens.earned += 1; state.tokens.history.push({ type: 'granted', at: Date.now() }); save(); navigate(); };
    $('#settings').onsubmit = (e) => { e.preventDefault(); const schools = []; if ($('#s-bgs').checked) schools.push('bgs'); if ($('#s-qeh').checked) schools.push('qeh'); const pin = $('#s-pin').value.trim(); if (pin && !/^\d{4}$/.test(pin)) { toast('PIN must be 4 digits'); return; } Object.assign(state.profile, { name: $('#s-name').value.trim(), schools: schools.length ? schools : ['bgs', 'qeh'], sessionDay: +$('#s-day').value, weeklyTokenLimit: +$('#s-limit').value, pin, sound: $('#s-sound').checked }); save(); toast('Saved'); renderHeaderStats(); };
    $$('[data-rubric] .stars button').forEach((b) => { b.onclick = () => { const n = +b.dataset.n; $$('button', b.parentElement).forEach((x) => x.classList.toggle('on', +x.dataset.n <= n)); }; });
    $$('[data-mark]').forEach((b) => { b.onclick = () => { const i = +b.dataset.mark; const root = $(`[data-rubric="${i}"]`); const scores = {}; $$('.stars', root).forEach((st) => { scores[st.dataset.crit] = $$('button.on', st).length; }); state.writing[i].parentScores = scores; state.writing[i].parentNote = $(`[data-note="${i}"]`).value.trim(); state.xp += 10; save(); toast('Marks saved'); navigate(); }; });
    $('#export').onclick = () => { const blob = new Blob([S.exportJson(state)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `brain-bridge-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click(); };
    $('#import').onchange = (e) => { const f = e.target.files[0]; if (!f) return; f.text().then((t) => { try { state = S.importJson(t); save(); toast('Backup restored'); navigate(); } catch (err) { toast(err.message, 4000); } }); };
    $('#reset').onclick = () => { if (confirm('Delete ALL progress, tokens and writing? This cannot be undone.') && confirm('Really delete everything?')) { state = S.reset(); parentUnlocked = false; save(); navigate(); } };
  };

  /* ------------------------------ boot --------------------------------- */

  // Small debug hook (used by the smoke test): window.BrainBridge.getState().current.activeSeconds += 60; window.BrainBridge.save();
  window.BrainBridge = { getState: () => state, save, navigate };
  window.addEventListener('beforeunload', () => { if (state.current) save(); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') save(); });
  navigate();
})();
