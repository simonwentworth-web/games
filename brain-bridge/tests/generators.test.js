'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const D = require('../js/data.js');
const G = require('../js/generators.js');
const E = require('../js/engine.js');

const PROCEDURAL = D.SKILLS.filter((s) => !['passage', 'writing', 'interview'].includes(s.gen));

function checkQuestion(q, where) {
  assert.ok(q.id && q.skill && [1, 2, 3].includes(q.level), `${where}: id/skill/level`);
  assert.ok(typeof q.prompt === 'string' && q.prompt.length > 3, `${where}: prompt`);
  assert.ok(q.explain, `${where}: explanation`);
  assert.ok(q.seconds > 0, `${where}: seconds`);
  if (q.format === 'mc') {
    assert.ok(Array.isArray(q.options) && q.options.length >= 2, `${where}: options`);
    assert.equal(new Set(q.options.map(String)).size, q.options.length, `${where}: options must be distinct ${JSON.stringify(q.options).slice(0, 200)}`);
    assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length, `${where}: answer index`);
  } else {
    assert.ok(q.answer != null, `${where}: typed answer`);
  }
}

test('seeded rng is repeatable', () => {
  const a = G.makeRng(1), b = G.makeRng(1);
  for (let i = 0; i < 50; i++) assert.equal(a.next(), b.next());
  const r = G.makeRng(2);
  for (let i = 0; i < 200; i++) { const n = r.int(3, 7); assert.ok(n >= 3 && n <= 7); }
  assert.deepEqual(G.makeRng(3).shuffle([1, 2, 3, 4]).sort(), [1, 2, 3, 4]);
});

test('every procedural skill generates valid questions at every level, in both formats', () => {
  const rng = G.makeRng(2026);
  let count = 0;
  for (const s of PROCEDURAL) {
    for (const level of [1, 2, 3]) {
      for (let i = 0; i < 40; i++) {
        const q = G.generate(s.id, level, rng, new Set());
        checkQuestion(q, `${s.id} L${level}`);
        assert.equal(q.skill, s.id);
        const mc = G.toMC(q, rng);
        if (!q.long) { assert.equal(mc.format, 'mc', `${s.id} L${level} should convert to multiple choice: ${q.prompt}`); checkQuestion(mc, `${s.id} L${level} mc`); }
        count++;
      }
    }
  }
  assert.ok(count >= PROCEDURAL.length * 120);
});

test('typed answers grade as correct against their own answer, and MC answers point at the right option', () => {
  const rng = G.makeRng(77);
  for (const s of PROCEDURAL) {
    for (const level of [1, 2, 3]) {
      for (let i = 0; i < 25; i++) {
        const q = G.generate(s.id, level, rng, new Set());
        if (q.format === 'mc') { assert.equal(E.grade(q, q.answer).result, 'correct'); assert.equal(E.grade(q, (q.answer + 1) % q.options.length).result, 'wrong'); }
        else {
          const r = E.grade(q, String(q.answer));
          assert.equal(r.result, 'correct', `${s.id} L${level}: "${q.prompt.replace(/<[^>]+>/g, '')}" answer ${q.answer} graded ${r.result} ${r.note || ''}`);
          const mc = G.toMC(q, rng);
          if (mc.format === 'mc') assert.equal(mc.options[mc.answer], G.displayAnswer(q), `${s.id}: MC correct option must show the answer`);
        }
      }
    }
  }
});

test('non-verbal figures render as SVG and the correct option differs from every distractor', () => {
  const rng = G.makeRng(5);
  for (const skill of ['nvr.seq', 'nvr.odd', 'nvr.matrix', 'nvr.rotate', 'nvr.codes']) {
    for (const level of [1, 2, 3]) for (let i = 0; i < 20; i++) {
      const q = G.generate(skill, level, rng, new Set());
      if (skill !== 'nvr.odd') assert.ok(q.visual && q.visual.includes('<svg'), `${skill} visual`);
      if (q.optionFigs) {
        const json = q.optionFigs.map((f) => JSON.stringify(f));
        assert.equal(new Set(json).size, json.length, `${skill} figures distinct`);
        q.options.forEach((o) => assert.ok(o.startsWith('<svg'), 'svg option'));
      }
    }
  }
});

test('bank-backed skills avoid seen items and respect levels', () => {
  const rng = G.makeRng(9);
  const pool = D.SPAG.filter((s) => s.skill === 'e.spelling' && s.level === 2);
  const seen = new Set(pool.slice(1).map((s) => s.id));
  for (let i = 0; i < 10; i++) assert.equal(G.generate('e.spelling', 2, rng, seen).id, pool[0].id);
  const z = G.generate('ps.logic', 3, rng, new Set());
  assert.equal(z.level, 3);
});

test('passage adapters produce MC and typed variants', () => {
  const p = D.PASSAGES[0];
  const mc = G.fromPassage(p, p.questions[0], 'mc'); const typed = G.fromPassage(p, p.questions[0], 'typed');
  assert.equal(mc.format, 'mc'); assert.equal(typed.format, 'typed');
  assert.equal(E.grade(mc, mc.answer).result, 'correct');
  assert.equal(E.grade(typed, '112').result, 'correct');
  assert.equal(E.grade(typed, 'one hundred and twelve').result, 'correct');
});

test('letter codes and sequences are internally consistent', () => {
  const rng = G.makeRng(11);
  for (let i = 0; i < 30; i++) {
    const q = G.generate('vr.codes', 1, rng, new Set());
    const m = q.prompt.replace(/<[^>]+>/g, '').match(/If (\w+) is written in code as (\w+), how is (\w+) written/);
    assert.ok(m, q.prompt);
    const shift = (m[2].charCodeAt(0) - m[1].charCodeAt(0));
    const expected = m[3].split('').map((ch) => String.fromCharCode(((ch.charCodeAt(0) - 65 + shift + 26) % 26) + 65)).join('');
    assert.equal(q.answer, expected);
  }
});
