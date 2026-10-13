'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const D = require('../js/data.js');

const skillIds = new Set(D.SKILLS.map((s) => s.id));

test('schools describe both exams and interviews', () => {
  for (const id of ['bgs', 'qeh']) {
    const s = D.SCHOOLS[id];
    assert.ok(s.papers.length >= 4, `${id} papers`);
    assert.ok(s.interview.topics.length >= 3 && s.interview.tips.length >= 2, `${id} interview`);
    assert.ok(s.facts.length >= 4 && s.links.length >= 2, `${id} facts/links`);
    assert.match(s.examDate, /^2027-01-\d\d$/);
  }
  assert.equal(D.SCHOOLS.qeh.papers.reduce((a, p) => a + p.minutes, 0), 95, 'QEH test is 1h35');
});

test('skills are unique and belong to known subjects', () => {
  assert.equal(skillIds.size, D.SKILLS.length);
  for (const s of D.SKILLS) assert.ok(D.SUBJECTS[s.subject], `${s.id} subject`);
});

test('every passage question works in both exam styles', () => {
  const ids = new Set();
  for (const p of D.PASSAGES) {
    assert.ok(p.text.length >= 3 && p.questions.length >= 8, `${p.id} needs text and 8+ questions`);
    for (const q of p.questions) {
      assert.ok(!ids.has(q.id), `duplicate question id ${q.id}`); ids.add(q.id);
      assert.ok(skillIds.has(q.skill), `${q.id} skill ${q.skill}`);
      assert.ok([1, 2, 3].includes(q.level), `${q.id} level`);
      assert.equal(q.options.length, 4, `${q.id} needs four options`);
      assert.equal(new Set(q.options).size, 4, `${q.id} options must differ`);
      assert.ok(q.answer >= 0 && q.answer < 4, `${q.id} answer index`);
      assert.ok(q.typed && q.typed.model, `${q.id} needs a model answer`);
      assert.ok(q.typed.accept || (q.typed.keywords && q.typed.keywords.length), `${q.id} needs accept list or keywords`);
      if (q.typed.keywords) for (const g of q.typed.keywords) assert.ok(Array.isArray(g) && g.length, `${q.id} keyword groups`);
      assert.ok(q.explain && q.explain.length > 10, `${q.id} explanation`);
    }
  }
});

test('SPaG bank items are well formed', () => {
  const ids = new Set();
  for (const s of D.SPAG) {
    assert.ok(!ids.has(s.id), `dup ${s.id}`); ids.add(s.id);
    assert.ok(['e.punct', 'e.grammar', 'e.spelling'].includes(s.skill), s.id);
    assert.ok(s.options.length >= 2 && new Set(s.options).size === s.options.length, `${s.id} options`);
    assert.ok(s.answer >= 0 && s.answer < s.options.length, `${s.id} answer`);
    assert.ok(s.explain, `${s.id} explain`);
  }
  assert.ok(D.SPAG.filter((s) => s.skill === 'e.punct').length >= 10);
  assert.ok(D.SPAG.filter((s) => s.skill === 'e.grammar').length >= 10);
  assert.ok(D.SPAG.filter((s) => s.skill === 'e.spelling').length >= 10);
});

test('vocabulary is graded with synonyms, antonyms and example sentences', () => {
  const words = new Set();
  for (const v of D.VOCAB) {
    assert.ok(!words.has(v.w), `dup word ${v.w}`); words.add(v.w);
    assert.ok([1, 2, 3].includes(v.l), v.w);
    assert.ok(v.s.length >= 3 && v.d && v.a, `${v.w} needs synonyms, definition, antonym`);
    assert.ok(!v.s.includes(v.w) && v.a !== v.w, `${v.w} synonyms must not include itself`);
    assert.ok(v.eg && v.eg.includes('___'), `${v.w} example sentence needs a gap`);
  }
  for (const l of [1, 2, 3]) assert.ok(D.VOCAB.filter((v) => v.l === l).length >= 30, `level ${l} vocab`);
});

test('hidden words really are hidden across word boundaries', () => {
  for (const h of D.HIDDEN_WORDS) {
    const flat = h.s.toLowerCase().replace(/[^a-z]/g, '');
    assert.ok(flat.includes(h.a), `${h.a} not in "${h.s}"`);
    const words = h.s.toLowerCase().replace(/[^a-z ]/g, '').split(/\s+/);
    assert.ok(!words.some((w) => w.includes(h.a)), `${h.a} must span two words in "${h.s}"`);
    assert.equal(h.a.length, 4);
  }
});

test('odd-one-out, analogy, compound and missing-word banks are consistent', () => {
  for (const o of D.ODD_ONE_OUT) { assert.equal(o.w.length, 5); assert.ok(o.odd >= 0 && o.odd < 5); assert.ok(o.why); assert.equal(new Set(o.w).size, 5); }
  for (const a of D.ANALOGIES) { assert.equal(a.options.length, 4); assert.equal(new Set(a.options).size, 4); }
  for (const c of D.COMPOUNDS) assert.equal(c.ends.length, 3);
  for (const m of D.MISSING_WORDS) {
    assert.equal(m.a.length, 3, m.full);
    assert.ok(m.s.includes('___'), m.full);
    const cap = m.s.match(/[A-Z_]{4,}/)[0];
    assert.equal(cap.replace('___', m.a), m.full, `${m.full} from ${cap}`);
  }
});

test('puzzles have answers, explanations and valid skills', () => {
  const ids = new Set();
  for (const z of D.PUZZLES) {
    assert.ok(!ids.has(z.id)); ids.add(z.id);
    assert.ok(skillIds.has(z.skill), z.id);
    if (z.options) { assert.ok(z.answer >= 0 && z.answer < z.options.length, z.id); } else assert.equal(typeof z.answer, 'number', z.id);
    assert.ok(z.explain, z.id);
  }
  for (const skill of ['ps.logic', 'ps.number', 'ps.spatial']) for (const level of [1, 2, 3]) assert.ok(D.PUZZLES.some((z) => z.skill === skill && z.level === level), `${skill} L${level}`);
});

test('interview bank covers every category with frameworks', () => {
  for (const q of D.INTERVIEW_QUESTIONS) {
    assert.ok(skillIds.has(q.skill), q.id);
    assert.ok(D.INTERVIEW_FRAMEWORKS[q.fw], `${q.id} framework ${q.fw}`);
    assert.ok(q.tip && q.ingredients.length >= 3, q.id);
  }
  for (const cat of ['iv.you', 'iv.school', 'iv.reading', 'iv.character', 'iv.thinking', 'iv.why']) assert.ok(D.INTERVIEW_QUESTIONS.filter((q) => q.skill === cat).length >= 6, cat);
  for (const fw of Object.values(D.INTERVIEW_FRAMEWORKS)) assert.ok(fw.steps.length >= 3 && fw.example);
});

test('writing prompts and rubric', () => {
  for (const p of D.WRITING_PROMPTS) { assert.ok(skillIds.has(p.skill)); assert.ok(p.plan.length >= 3 && p.prompt && p.title); }
  assert.ok(D.WRITING_PROMPTS.filter((p) => p.type === 'Story').length >= 6);
  assert.equal(D.WRITING_RUBRIC.length, 6);
  assert.ok(D.BADGES.length >= 10 && D.PRAISE.length >= 8 && D.ENCOURAGE.length >= 4);
});
