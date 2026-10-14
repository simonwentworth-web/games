'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const D = require('../js/data.js');
const G = require('../js/generators.js');
const E = require('../js/engine.js');
const S = require('../js/store.js');

test('mastery rises with correct answers and falls with wrong ones, and sets the level', () => {
  const st = S.defaultState();
  for (let i = 0; i < 12; i++) E.recordAnswer(st, 'm.arith', 'correct', 2);
  assert.ok(st.mastery['m.arith'].score > 70, 'should reach level 3 territory');
  assert.equal(E.levelFor(st.mastery['m.arith'].score), 3);
  for (let i = 0; i < 12; i++) E.recordAnswer(st, 'vr.codes', 'wrong', 2);
  assert.ok(st.mastery['vr.codes'].score < 40);
  assert.equal(E.levelFor(st.mastery['vr.codes'].score), 1);
  assert.equal(st.mastery['m.arith'].streak, 12);
  assert.equal(st.mastery['vr.codes'].streak, 0);
  const before = st.mastery['m.arith'].score;
  E.recordAnswer(st, 'm.arith', 'wrong', 3);
  assert.ok(st.mastery['m.arith'].score < before, 'a wrong stretch answer costs a little');
});

test('a wrong answer on a question above your level costs less than one at your level', () => {
  const a = S.defaultState(), b = S.defaultState();
  E.recordAnswer(a, 'm.arith', 'wrong', 3);
  E.recordAnswer(b, 'm.arith', 'wrong', 2);
  assert.ok(a.mastery['m.arith'].score > b.mastery['m.arith'].score);
});

test('sessions always add up to 40 minutes and alternate style for two schools', () => {
  const st = S.defaultState();
  for (let i = 0; i < 4; i++) {
    const plan = E.composeSession(st, st.profile, i);
    assert.equal(plan.blocks.reduce((a, b) => a + b.minutes, 0), 40);
    assert.equal(plan.style, i % 2 === 0 ? 'qeh' : 'bgs');
    assert.equal(plan.blocks[plan.blocks.length - 1].type, 'wrap');
  }
  assert.equal(E.composeSession(st, { schools: ['bgs'] }, 0).style, 'bgs');
  assert.equal(E.composeSession(st, { schools: ['qeh'] }, 1).style, 'qeh');
  assert.ok(E.composeSession(st, st.profile, 1).blocks.some((b) => b.type === 'writing'), 'BGS weeks include a writing sprint');
  assert.ok(E.composeSession(st, st.profile, 0).blocks.some((b) => b.subject === 'nvr'), 'QEH weeks include non-verbal reasoning');
});

test('the weakest subject gets extra minutes', () => {
  const st = S.defaultState();
  for (let i = 0; i < 20; i++) { E.recordAnswer(st, 'm.arith', 'correct', 2); E.recordAnswer(st, 'nvr.seq', 'wrong', 2); }
  const plan = E.composeSession(st, st.profile, 0);
  const nvr = plan.blocks.find((b) => b.subject === 'nvr'), maths = plan.blocks.find((b) => b.id === 'maths');
  assert.equal(nvr.minutes, 6); assert.equal(maths.minutes, 6); assert.ok(nvr.boosted);
  assert.equal(plan.blocks.reduce((a, b) => a + b.minutes, 0), 40);
});

test('skill choice favours weak and unseen skills; level choice stretches on a streak and eases after misses', () => {
  const st = S.defaultState(); const rng = G.makeRng(1);
  for (let i = 0; i < 15; i++) { E.recordAnswer(st, 'm.arith', 'correct', 3); E.recordAnswer(st, 'm.fractions', 'wrong', 1); }
  const picks = {}; for (let i = 0; i < 400; i++) { const id = E.chooseSkill(st, ['m.arith', 'm.fractions'], rng); picks[id] = (picks[id] || 0) + 1; }
  assert.ok(picks['m.fractions'] > picks['m.arith'] * 2, JSON.stringify(picks));
  let stretched = 0; for (let i = 0; i < 100; i++) { const c = E.chooseLevel(st, 'm.arith', rng); if (c.mode === 'stretch') stretched++; else assert.equal(c.level, 3); }
  assert.equal(stretched, 0, 'cannot stretch beyond level 3');
  const mid = S.defaultState(); for (let i = 0; i < 4; i++) E.recordAnswer(mid, 'm.ratio', 'correct', 1);
  let st2 = 0; for (let i = 0; i < 100; i++) if (E.chooseLevel(mid, 'm.ratio', rng).mode === 'stretch') st2++;
  assert.ok(st2 > 15 && st2 < 70, 'stretch sometimes on a streak');
  const low = S.defaultState(); for (let i = 0; i < 6; i++) E.recordAnswer(low, 'm.ratio', 'correct', 2); for (let i = 0; i < 2; i++) E.recordAnswer(low, 'm.ratio', 'wrong', 2);
  assert.equal(E.chooseLevel(low, 'm.ratio', rng).mode, 'confidence');
});

test('nextQuizQuestion honours the block format', () => {
  const st = S.defaultState(); const rng = G.makeRng(4);
  const mc = E.nextQuizQuestion(st, { subject: 'maths', format: 'mc' }, rng, new Set());
  assert.equal(mc.format, 'mc');
  const typed = E.nextQuizQuestion(st, { subject: 'maths', skills: ['m.arith'], format: 'typed', fixedLevel: 1 }, rng, new Set());
  assert.equal(typed.skill, 'm.arith'); assert.equal(typed.level, 1);
});

test('grading handles numbers, money, units, fractions, text and keywords', () => {
  const num = { format: 'typed', numeric: true, answer: 16.2, unit: '£' };
  assert.equal(E.grade(num, '£16.20').result, 'correct');
  assert.equal(E.grade(num, '16.2').result, 'correct');
  assert.equal(E.grade(num, '16').result, 'wrong');
  assert.equal(E.grade({ format: 'typed', numeric: true, answer: 95, unit: 'minutes' }, '95 minutes').result, 'correct');
  assert.equal(E.grade({ format: 'typed', numeric: true, answer: 1440 }, '1,440').result, 'correct');
  assert.equal(E.grade({ format: 'typed', numeric: true, answer: -28 }, 'minus 28').result, 'correct');
  assert.equal(E.grade({ format: 'typed', numeric: true, answer: 14 }, 'fourteen').result, 'correct');
  assert.equal(E.grade({ format: 'typed', numeric: true, answer: 26, unit: 'p' }, '26p').result, 'correct', 'attached pence unit');
  assert.equal(E.grade({ format: 'typed', numeric: true, answer: 26, unit: 'p' }, '26 pence').result, 'correct');
  assert.equal(E.grade({ format: 'typed', numeric: true, answer: 26, unit: 'p' }, '£0.26').result, 'correct', 'pounds for a pence answer');
  assert.equal(E.grade({ format: 'typed', numeric: true, answer: 3.5, unit: '£' }, '350p').result, 'correct', 'pence for a pounds answer');
  assert.equal(E.grade({ format: 'typed', numeric: true, answer: 3.5, unit: '£' }, '350').result, 'wrong', 'no unit means no conversion');
  assert.equal(E.grade({ format: 'typed', numeric: true, answer: 45, unit: '°' }, '45 degrees').result, 'correct');
  assert.equal(E.grade({ format: 'typed', numeric: true, answer: 28, unit: 'cm²' }, '28cm2').result, 'correct');
  assert.equal(E.grade({ format: 'typed', numeric: true, answer: 95, unit: 'minutes' }, '95min').result, 'correct');
  assert.equal(E.grade({ format: 'typed', numeric: true, answer: 8 }, 'day 8').result, 'correct', 'number wrapped in words');
  assert.equal(E.grade({ format: 'typed', numeric: true, answer: 0.75 }, '3/4').result, 'correct');
  const fr = { format: 'typed', fraction: true, requireSimplest: true, answer: '3/4' };
  assert.equal(E.grade(fr, '3/4').result, 'correct');
  assert.equal(E.grade(fr, '6/8').result, 'partial');
  assert.equal(E.grade(fr, '2/3').result, 'wrong');
  assert.equal(E.grade({ format: 'typed', fraction: true, answer: '1 2/3' }, '5/3').result, 'correct');
  assert.equal(E.grade({ format: 'typed', accept: ['village'] }, 'The village.').result, 'correct');
  assert.equal(E.grade({ format: 'typed', accept: ['16:30'] }, '16.30').result, 'correct', 'dot for colon in times');
  assert.equal(E.grade({ format: 'typed', accept: ['16:30'] }, '1630').result, 'correct');
  assert.equal(E.grade({ format: 'typed', accept: ['16:30'] }, '4:30').result, 'wrong', '12-hour answer to a 24-hour question');
  assert.equal(E.grade({ format: 'typed', accept: ['09:05'] }, '9:05').result, 'correct');
  assert.equal(E.grade({ format: 'typed', accept: ['EM'] }, 'em').result, 'correct');
  const kw = { format: 'typed', keywords: [['simile'], ['gentle', 'careful']], need: 2, model: 'x' };
  assert.equal(E.grade(kw, 'It is a simile showing she is careful').result, 'correct');
  assert.equal(E.grade(kw, 'It is a simile').result, 'partial');
  assert.equal(E.grade(kw, 'I am not sure').result, 'self');
  assert.equal(E.grade({ format: 'mc', answer: 2 }, 2).result, 'correct');
  assert.equal(E.grade({ format: 'typed', numeric: true, answer: 5 }, '').result, 'wrong');
});

test('writing analysis praises good features and targets weak ones', () => {
  const good = 'The door had not been there yesterday. I was sure of it.\n\n“Who put that there?” whispered Maya, her hands trembling like leaves in a storm. The hallway smelt of dust and old rain, and somewhere a clock ticked. Cautiously, she reached for the handle. Cold. Then she pushed.\n\nMoments later, the door creaked open and a strange, luminous light spilled across the floor. Although she wanted to run, her feet refused. Eventually, she stepped through.';
  const a = E.analyseWriting(good, D.WRITING_PROMPTS[0]);
  assert.ok(a.metrics.words > 60 && a.metrics.paragraphs >= 3);
  assert.ok(a.praise.some((p) => /dialogue/.test(p)));
  assert.ok(a.praise.some((p) => /simile|comparison/.test(p)));
  assert.ok(a.scores.spag >= 4);
  const weak = 'then i went to the shop then i got some sweets then i went home and then i ate them and then i went to bed and alot of fun it was definately';
  const b = E.analyseWriting(weak, D.WRITING_PROMPTS[0]);
  const c = E.analyseWriting('Then I went to the shop. Then I got some sweets. Then I went home. Then I ate them. Then I went to bed.', D.WRITING_PROMPTS[0]);
  assert.ok(c.targets.some((t) => /Then/.test(t)), c.targets.join(' | '));
  assert.ok(c.targets.some((t) => /sentences start with/.test(t)), 'repeated sentence openers');
  assert.ok(b.targets.some((t) => /Spelling/.test(t)));
  assert.ok(b.targets.some((t) => /capital letter/.test(t)));
  assert.ok(b.scores.spag <= 3 && b.scores.vocab <= 2);
});

test('interview analysis rewards examples and reasons', () => {
  const q = D.INTERVIEW_QUESTIONS.find((x) => x.id === 'iv10');
  const strong = E.analyseInterview('My favourite subject is science because I love finding things out. For example, last term we grew crystals and mine grew into a spike as long as my finger. It made me want to be a scientist.', q);
  assert.ok(strong.score >= 4 && strong.targets.length === 0, JSON.stringify(strong));
  const weak = E.analyseInterview('Maths I guess. Dunno.', q);
  assert.ok(weak.score <= 2 && weak.targets.length >= 2);
  const why = E.analyseInterview('Because it looks nice.', D.INTERVIEW_QUESTIONS.find((x) => x.id === 'iv50'));
  assert.ok(why.targets.some((t) => /specific thing about the school/.test(t)));
});

test('tokens need the full 40 minutes and respect the weekly limit', () => {
  const st = S.defaultState();
  assert.equal(E.tokenDecision(st, st.profile, 2369, Date.now()).token, false);
  assert.equal(E.tokenDecision(st, st.profile, 2400, Date.now()).token, true);
  assert.equal(E.tokenDecision(st, st.profile, 2370, Date.now()).token, true, '30 second grace');
  st.tokens.history.push({ type: 'earned', at: Date.now() });
  const second = E.tokenDecision(st, st.profile, 2400, Date.now());
  assert.equal(second.token, false); assert.equal(second.bonus, true);
  assert.equal(E.tokenDecision(st, { weeklyTokenLimit: 0 }, 2400, Date.now()).token, true, 'unlimited');
  assert.equal(E.tokensThisWeek(st, Date.now()), 1);
});

test('week keys follow ISO weeks', () => {
  assert.equal(E.weekKey(new Date(2026, 9, 13)), '2026-W42');
  assert.equal(E.weekKey(new Date(2026, 9, 18)), '2026-W42', 'Sunday belongs to the same week');
  assert.equal(E.weekKey(new Date(2026, 9, 19)), '2026-W43');
  assert.equal(E.weekKey(new Date(2027, 0, 1)), '2026-W53');
});

test('summaries and badges', () => {
  const st = S.defaultState();
  const session = { answers: [] };
  for (let i = 0; i < 9; i++) session.answers.push({ subject: 'maths', result: 'correct', format: 'mc', seconds: 20, mode: i === 0 ? 'stretch' : 'normal' });
  session.answers.push({ subject: 'vr', result: 'wrong', format: 'mc', seconds: 20 });
  session.answers.push({ subject: 'vr', result: 'correct', format: 'mc', seconds: 20 });
  const sum = E.summarise(session);
  assert.equal(sum.total, 11); assert.equal(sum.bestStreak, 9); assert.equal(sum.stretchWins, 1);
  st.sessions.push({ startedAt: Date.now(), finishedAt: Date.now(), summary: sum });
  const earned = E.checkBadges(st, session, sum).map((b) => b.id);
  assert.ok(earned.includes('first-session') && earned.includes('streak-8') && earned.includes('streak-3') && earned.includes('stretch') && earned.includes('speedster'), earned.join(','));
  assert.equal(E.checkBadges(st, session, sum).length, 0, 'badges are not awarded twice');
});

test('store round-trips and migrates old data', () => {
  const st = S.defaultState(); st.xp = 42; st.profile.name = 'Sam';
  const json = S.exportJson(st);
  const back = S.importJson(json);
  assert.equal(back.xp, 42); assert.equal(back.profile.name, 'Sam'); assert.ok(Array.isArray(back.sessions));
  const old = S.migrate({ profile: { name: 'Old' } });
  assert.equal(old.profile.weeklyTokenLimit, 1); assert.deepEqual(old.tokens, { earned: 0, spent: 0, history: [] });
  assert.throws(() => S.importJson('{"nope":1}'));
});

test('a full simulated session plan can be answered end to end', () => {
  const st = S.defaultState(); const rng = G.makeRng(31);
  const plan = E.composeSession(st, st.profile, 0);
  let answered = 0;
  for (const b of plan.blocks) {
    if (b.type === 'quiz') for (let i = 0; i < 5; i++) { const q = E.nextQuizQuestion(st, b, rng, new Set()); const r = E.grade(q, q.format === 'mc' ? q.answer : String(q.answer)); assert.equal(r.result, 'correct', q.prompt); E.recordAnswer(st, q.skill, 'correct', q.level); answered++; }
    if (b.type === 'passage') { const p = E.choosePassage(st, rng, 2); for (const q of E.passageQuestions(p, b.format)) { assert.equal(E.grade(q, q.answer).result, 'correct'); answered++; } }
  }
  assert.ok(answered > 30);
  assert.ok(Object.keys(st.mastery).length > 5);
});
