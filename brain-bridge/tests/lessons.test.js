'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const D = require('../js/data.js');
const L = require('../js/lessons.js');
const G = require('../js/generators.js');
const E = require('../js/engine.js');

test('every quiz skill has a complete mini-lesson', () => {
  const need = D.SKILLS.filter((s) => !['writing', 'interview'].includes(s.gen));
  for (const s of need) {
    const l = L.LESSONS[s.id];
    assert.ok(l, `missing lesson for ${s.id}`);
    assert.ok(l.t && l.e && l.ex && l.r, `${s.id} lesson needs title, emoji, example, remember`);
    assert.ok(Array.isArray(l.steps) && l.steps.length >= 2 && l.steps.length <= 4, `${s.id} lesson steps`);
    assert.ok(l.r.length >= 20 && l.r.length <= 160, `${s.id} remember line should be a usable hint`);
  }
  assert.equal(E.lessonFor('m.arith'), L.LESSONS['m.arith']);
  assert.equal(E.lessonFor('w.story'), null, 'writing tasks teach through the studio, not lesson cards');
});

test('every generated question has a hint (its own, or the lesson remember line)', () => {
  const rng = G.makeRng(404);
  const skills = D.SKILLS.filter((s) => !['passage', 'writing', 'interview'].includes(s.gen));
  for (const s of skills) for (const level of [1, 2, 3]) for (let i = 0; i < 10; i++) {
    const q = G.generate(s.id, level, rng, new Set());
    assert.ok(E.hintFor(q).length > 10, `${s.id} question lacks a hint`);
  }
  for (const p of D.PASSAGES) for (const item of p.questions) {
    assert.ok(E.hintFor(G.fromPassage(p, item, 'mc')).length > 10, `${item.id} lacks a hint`);
  }
});

test('sessions teach first then challenge', () => {
  assert.equal(E.sessionPhase(0), 'learn');
  assert.equal(E.sessionPhase(21 * 60), 'learn');
  assert.equal(E.sessionPhase(22 * 60), 'challenge');
  // In the challenge phase, untried skills are picked far less often.
  const S = require('../js/store.js');
  const st = S.defaultState(); const rng = G.makeRng(3);
  for (let i = 0; i < 6; i++) E.recordAnswer(st, 'm.arith', 'correct', 2);
  const count = (phase) => { let n = 0; for (let i = 0; i < 300; i++) if (E.chooseSkill(st, ['m.arith', 'm.ratio'], rng, null, phase) === 'm.ratio') n++; return n; };
  const learn = count('learn'), challenge = count('challenge');
  assert.ok(challenge < learn * 0.75, `challenge should prefer practised skills (learn ${learn}, challenge ${challenge})`);
});

test('hint-free sessions earn a 45-minute token; hint-heavy ones stay at 40', () => {
  const S = require('../js/store.js');
  const st = S.defaultState();
  const yes = E.tokenDecision(st, st.profile, 2400, Date.now(), { used: 3, total: 12 });
  assert.equal(yes.token, true); assert.equal(yes.hintBonus, true); assert.equal(yes.minutes, 45);
  const no = E.tokenDecision(st, st.profile, 2400, Date.now(), { used: 5, total: 12 });
  assert.equal(no.hintBonus, false); assert.equal(no.minutes, 40);
  const few = E.tokenDecision(st, st.profile, 2400, Date.now(), { used: 0, total: 5 });
  assert.equal(few.hintBonus, false, 'too few questions to judge');
  assert.equal(E.tokenDecision(st, st.profile, 2400, Date.now()).minutes, 40, 'no hint data defaults to 40');
  assert.equal(E.hintBonusEarned({ used: 4, total: 12 }), true, 'exactly a third still counts');
  assert.equal(E.hintBonusEarned({ used: 5, total: 12 }), false);
});

test('availableTokens sums bonus minutes FIFO', () => {
  const S = require('../js/store.js');
  const st = S.defaultState();
  st.tokens.earned = 3; st.tokens.spent = 0;
  st.tokens.history = [
    { type: 'earned', minutes: 45 }, { type: 'earned', minutes: 40 }, { type: 'granted', minutes: 40 }
  ];
  assert.deepEqual(E.availableTokens(st), { count: 3, minutes: 125, next: 45 });
  st.tokens.spent = 1; st.tokens.history.push({ type: 'spent', minutes: 45 });
  assert.deepEqual(E.availableTokens(st), { count: 2, minutes: 80, next: 40 });
  // Old backups without minutes on entries still count 40 each.
  const legacy = S.defaultState(); legacy.tokens.earned = 2; legacy.tokens.history = [{ type: 'earned' }, { type: 'earned' }];
  assert.deepEqual(E.availableTokens(legacy), { count: 2, minutes: 80, next: 40 });
});

test('summaries carry hint statistics', () => {
  const sum = E.summarise({ answers: [{ subject: 'maths', result: 'correct' }], hints: { used: 2, total: 9 } });
  assert.deepEqual(sum.hints, { used: 2, total: 9 });
  assert.deepEqual(E.summarise({ answers: [] }).hints, { used: 0, total: 0 });
});
