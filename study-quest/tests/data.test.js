'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');

const SUBJECTS = [
  require('../js/curriculum/maths.js'),
  require('../js/curriculum/science.js'),
  require('../js/curriculum/english.js'),
  require('../js/curriculum/spanish.js'),
  require('../js/curriculum/societies.js'),
  require('../js/curriculum/computing.js')
];

test('six subjects, each well-formed', () => {
  assert.equal(SUBJECTS.length, 6);
  const ids = new Set();
  SUBJECTS.forEach(s => {
    assert.ok(s.id && s.name && s.short && s.tagline && s.emoji, s.id + ' has headline fields');
    assert.ok(!ids.has(s.id), 'subject id unique: ' + s.id);
    ids.add(s.id);
    assert.ok(Array.isArray(s.topics) && s.topics.length >= 3, s.id + ' has at least 3 topics');
  });
});

test('every topic teaches before it tests, with sources', () => {
  const topicIds = new Set();
  SUBJECTS.forEach(s => s.topics.forEach(t => {
    assert.ok(t.id && t.name && t.strand && t.intro, t.id + ' metadata');
    assert.ok(!topicIds.has(t.id), 'topic id unique: ' + t.id);
    topicIds.add(t.id);
    assert.ok(t.cards.length >= 3, t.id + ' has at least 3 learn cards (' + t.cards.length + ')');
    t.cards.forEach(c => assert.ok(c.title && c.body, t.id + ' card complete'));
    assert.ok(t.questions.length >= 8, t.id + ' has at least 8 questions (' + t.questions.length + ')');
    assert.ok(Array.isArray(t.links) && t.links.length >= 2, t.id + ' cites at least 2 sources');
    t.links.forEach(l => {
      assert.ok(/^https:\/\//.test(l.url), t.id + ' link is https: ' + l.url);
      assert.ok(l.label, t.id + ' link labelled');
    });
  }));
  assert.ok(topicIds.size >= 25, 'broad curriculum coverage: ' + topicIds.size + ' topics');
});

test('every question is answerable and explained', () => {
  const qIds = new Set();
  let total = 0;
  SUBJECTS.forEach(s => s.topics.forEach(t => t.questions.forEach(q => {
    total++;
    assert.ok(q.id && q.q, 'question has id and text (' + t.id + ')');
    assert.ok(!qIds.has(q.id), 'question id unique: ' + q.id);
    qIds.add(q.id);
    assert.ok(q.explain && q.explain.length > 10, q.id + ' has a real explanation');
    assert.ok(q.hint && q.hint.length > 3, q.id + ' has a hint');
    if (q.type === 'mcq') {
      assert.equal(q.options.length, 4, q.id + ' has 4 options');
      assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4, q.id + ' answer index valid');
      assert.equal(new Set(q.options.map(o => o.toLowerCase())).size, 4, q.id + ' options distinct');
    } else if (q.type === 'input') {
      assert.ok(Array.isArray(q.accept) && q.accept.length >= 1, q.id + ' has accepted answers');
      q.accept.forEach(a => assert.ok(String(a).length > 0, q.id + ' accept entries non-empty'));
    } else {
      assert.fail(q.id + ' has unknown type ' + q.type);
    }
  })));
  assert.ok(total >= 250, 'question bank is deep: ' + total + ' questions');
});

test('the MYP2 curriculum themes are all covered', () => {
  const names = SUBJECTS.flatMap(s => s.topics.map(t => (t.name + ' ' + t.strand + ' ' + t.intro).toLowerCase()));
  const blob = names.join(' | ');
  ['fraction', 'algebra', 'graph', 'geometry', 'probability',
    'ecology', 'sound', 'health', 'periodic', 'space', 'electricity',
    'shakespeare', 'persua', 'dystopia', 'ruby in the smoke', 'creative',
    'river', 'slave trade', 'sustainab',
    'online safety', 'wellbeing', 'website'
  ].forEach(theme => assert.ok(blob.includes(theme), 'curriculum theme covered: ' + theme));
  const spanish = SUBJECTS.find(s => s.id === 'spanish');
  assert.ok(spanish.topics.length >= 5, 'Spanish covers its five themes');
});
