'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const E = require('../js/engine.js');

test('typed answers are checked forgivingly', () => {
  const num = { type: 'input', accept: ['#-5'] };
  assert.ok(E.checkTyped(num, '-5'));
  assert.ok(E.checkTyped(num, ' -5.0 '));
  assert.ok(!E.checkTyped(num, '5'));
  assert.ok(!E.checkTyped(num, ''));

  const money = { type: 'input', accept: ['#3.5'] };
  assert.ok(E.checkTyped(money, '£3.50'));
  assert.ok(E.checkTyped(money, '3.5'));

  const pct = { type: 'input', accept: ['#35'] };
  assert.ok(E.checkTyped(pct, '35%'));
  assert.ok(E.checkTyped(pct, '35'));

  const frac = { type: 'input', accept: ['#0.75'] };
  assert.ok(E.checkTyped(frac, '3/4'));
  assert.ok(E.checkTyped(frac, '0.75'));

  const deg = { type: 'input', accept: ['#65'] };
  assert.ok(E.checkTyped(deg, '65°'));
  assert.ok(E.checkTyped(deg, '65 degrees'));

  const esp = { type: 'input', accept: ['tengo doce años', 'tengo 12 años'] };
  assert.ok(E.checkTyped(esp, 'Tengo doce años'));
  assert.ok(E.checkTyped(esp, 'tengo doce anos'), 'missing accents are forgiven');
  assert.ok(E.checkTyped(esp, '  TENGO   DOCE  AÑOS!! '));
  assert.ok(!E.checkTyped(esp, 'soy doce años'));
});

test('mcq shuffling keeps track of the right answer', () => {
  const q = { options: ['a', 'b', 'c', 'd'], answer: 2 };
  for (let i = 0; i < 25; i++) {
    const m = E.shuffledMcq(q);
    assert.equal(m.options[m.answer], 'c');
    assert.deepEqual(m.options.slice().sort(), ['a', 'b', 'c', 'd']);
  }
});

test('sessions interleave learning cards with questions', () => {
  const topic = {
    cards: [{ title: 'c1' }, { title: 'c2' }, { title: 'c3' }],
    questions: [1, 2, 3, 4, 5].map(n => ({ id: 'q' + n }))
  };
  const seq = E.buildSequence(topic);
  assert.equal(seq.length, 8);
  assert.equal(seq[0].kind, 'card');
  assert.equal(seq[1].kind, 'card');
  assert.equal(seq[2].kind, 'q');
  assert.equal(seq[3].kind, 'card');
  assert.equal(seq[4].kind, 'q');
  assert.equal(seq.filter(x => x.kind === 'q').length, 5, 'every question appears');
  assert.equal(seq.filter(x => x.kind === 'card').length, 3, 'every card appears');
});

test('the token decision enforces the rules', () => {
  const s = { passMark: 70, minActiveMinutes: 8, dailyTokenCap: 0, rewardMinutes: 40 };
  const good = E.tokenDecision(s, { completed: true, firstTryCorrect: 8, questions: 10, activeSeconds: 9 * 60, tokensToday: 0 });
  assert.ok(good.earned);
  assert.equal(good.accuracy, 80);

  const lowScore = E.tokenDecision(s, { completed: true, firstTryCorrect: 5, questions: 10, activeSeconds: 9 * 60, tokensToday: 0 });
  assert.ok(!lowScore.earned);
  assert.ok(lowScore.reasons[0].includes('50%'));

  const tooFast = E.tokenDecision(s, { completed: true, firstTryCorrect: 10, questions: 10, activeSeconds: 3 * 60, tokensToday: 0 });
  assert.ok(!tooFast.earned, 'racing through without engagement earns nothing');

  const capped = E.tokenDecision({ ...s, dailyTokenCap: 2 }, { completed: true, firstTryCorrect: 10, questions: 10, activeSeconds: 9 * 60, tokensToday: 2 });
  assert.ok(!capped.earned);

  const uncapped = E.tokenDecision({ ...s, dailyTokenCap: 2 }, { completed: true, firstTryCorrect: 10, questions: 10, activeSeconds: 9 * 60, tokensToday: 1 });
  assert.ok(uncapped.earned);
});

test('the wallet adds earned tokens and adjustments, subtracts spends', () => {
  const sessions = [{ tokenEarned: true }, { tokenEarned: true }, { tokenEarned: false }];
  const redemptions = [{ id: 'r1' }];
  const adjustments = [{ delta: 1 }, { delta: -1 }, { delta: 2 }];
  const w = E.walletTotals(sessions, redemptions, adjustments);
  assert.equal(w.earned, 2);
  assert.equal(w.spent, 1);
  assert.equal(w.adjusted, 2);
  assert.equal(w.balance, 3);
});

test('streaks count consecutive days, allowing today to be pending', () => {
  const day = n => new Date(Date.UTC(2026, 9, n, 15)).toISOString();
  const sessions = [13, 14].map(n => ({ status: 'completed', endedAt: day(n) }));
  assert.equal(E.streak(sessions, day(14)), 2);
  assert.equal(E.streak(sessions, day(15)), 2, 'yesterday-ending streak still shows today');
  assert.equal(E.streak(sessions, day(17)), 0);
  assert.equal(E.streak([], day(15)), 0);
});

test('minutes-by-day fills the full window', () => {
  const today = '2026-10-15T10:00:00Z';
  const sessions = [
    { endedAt: '2026-10-15T09:00:00Z', startedAt: '2026-10-15T08:40:00Z', activeSeconds: 600 },
    { endedAt: '2026-10-14T09:00:00Z', startedAt: '2026-10-14T08:40:00Z', activeSeconds: 1200 }
  ];
  const days = E.minutesByDay(sessions, today, 14);
  assert.equal(days.length, 14);
  assert.equal(days[13].day, '2026-10-15');
  assert.equal(days[13].minutes, 10);
  assert.equal(days[12].minutes, 20);
  assert.equal(days[0].minutes, 0);
});

test('CSV export escapes and orders sessions', () => {
  const csv = E.sessionsCsv([
    { startedAt: '2026-10-15T10:00:00Z', endedAt: '2026-10-15T10:20:00Z', subject: 'English', topic: 'Persuasion, station "A"', activeSeconds: 600, totalSeconds: 700, questions: 10, firstTryCorrect: 9, accuracy: 90, hintsUsed: 1, focusLosses: 0, tokenEarned: true, status: 'completed' },
    { startedAt: '2026-10-14T10:00:00Z', endedAt: '2026-10-14T10:20:00Z', subject: 'Maths', topic: 'Number', activeSeconds: 60, totalSeconds: 70, questions: 10, firstTryCorrect: 2, accuracy: 20, hintsUsed: 0, focusLosses: 5, tokenEarned: false, status: 'completed' }
  ]);
  const lines = csv.split('\n');
  assert.ok(lines[0].startsWith('date,start,end,subject,topic'));
  assert.ok(lines[1].includes('Maths'), 'rows sorted oldest first');
  assert.ok(lines[2].includes('"Persuasion, station ""A"""'), 'commas and quotes escaped');
  assert.ok(lines[2].includes('yes'));
});

test('accuracy and formatting helpers behave', () => {
  assert.equal(E.accuracy(7, 10), 70);
  assert.equal(E.accuracy(0, 0), 0);
  assert.equal(E.fmtClock(605), '10:05');
  assert.equal(E.fmtClock(0), '0:00');
  assert.equal(E.fmtMinutes(90), '2 min');
  assert.equal(E.fmtMinutes(60), '1 min');
  assert.ok(E.uid() !== E.uid());
});

test('store module keeps local state without a browser', () => {
  const S = require('../js/store.js');
  const st = S.blankState();
  assert.deepEqual(st.sessions, []);
  S.upsertById(st.sessions, { id: 'a', v: 1 });
  S.upsertById(st.sessions, { id: 'a', v: 2 });
  S.upsertById(st.sessions, { id: 'b', v: 1 });
  assert.equal(st.sessions.length, 2);
  assert.equal(st.sessions[0].v, 2);
});
