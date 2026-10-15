'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const D = require('../js/data.js');
const E = require('../js/engine.js');
const S = require('../js/store.js');

function fakeCurrent() {
  return {
    startedAt: Date.now() - 40 * 60000,
    activeSeconds: 2400,
    blockIndex: 7,
    plan: { style: 'bgs', blocks: new Array(7).fill({}) },
    taught: ['m.arith', 'e.retrieve', 'vr.codes'],
    hints: { used: 2, total: 20 },
    artifacts: [
      { type: 'writing', promptId: 'w1', words: 210 },
      { type: 'interview', qid: 'iv1', score: 4, words: 55 }
    ],
    answers: [
      { skill: 'm.arith', subject: 'maths', result: 'correct', seconds: 20 },
      { skill: 'm.arith', subject: 'maths', result: 'wrong', seconds: 30, skipped: true },
      { skill: 'e.retrieve', subject: 'english', result: 'partial', seconds: 40 },
      { skill: 'vr.codes', subject: 'vr', result: 'correct', seconds: 25, mode: 'stretch' }
    ]
  };
}

test('buildSessionRecord captures the full engagement picture', () => {
  const c = fakeCurrent();
  const rec = E.buildSessionRecord(c, { token: true, minutes: 45, hintBonus: true }, true);
  assert.equal(rec.completed, true);
  assert.equal(rec.style, 'bgs');
  assert.equal(rec.minutes, 40);
  assert.equal(rec.blocksDone, 7);
  assert.equal(rec.blocksTotal, 7);
  assert.equal(rec.answers, 4);
  assert.deepEqual(rec.counts, { correct: 2, partial: 1, wrong: 1, skipped: 1 });
  assert.equal(rec.lessons, 3);
  assert.deepEqual(rec.writing, [{ type: 'writing', promptId: 'w1', words: 210 }]);
  assert.deepEqual(rec.interview, [{ type: 'interview', qid: 'iv1', score: 4, words: 55 }]);
  assert.equal(rec.token, true);
  assert.equal(rec.tokenMinutes, 45);
  assert.equal(rec.detail.length, 4, 'every individual answer is kept');
  assert.deepEqual(rec.summary.hints, { used: 2, total: 20 });

  const ab = E.buildSessionRecord(Object.assign(fakeCurrent(), { activeSeconds: 600, blockIndex: 2 }), { token: false }, false);
  assert.equal(ab.completed, false);
  assert.equal(ab.token, false);
  assert.equal(ab.tokenMinutes, 0);
  assert.equal(ab.minutes, 10);
});

test('engagementStats totals sessions, practice, writing and interview work', () => {
  const st = S.defaultState();
  const c = fakeCurrent();
  st.sessions.push(E.buildSessionRecord(c, { token: true, minutes: 40 }, true));
  st.sessions.push(E.buildSessionRecord(Object.assign(fakeCurrent(), { activeSeconds: 300 }), { token: false }, false));
  st.practiceLog.push({ day: '2026-10-14', seconds: 600, questions: 15, correct: 11 });
  st.practiceLog.push({ day: '2026-10-15', seconds: 300, questions: 8, correct: 5 });
  st.writing.push({ at: Date.now(), promptId: 'w1', metrics: { words: 210 } });
  st.writing.push({ at: Date.now(), promptId: 'w2', metrics: { words: 150 } });
  st.interview.push({ at: Date.now(), qid: 'iv1', score: 4 });
  st.interview.push({ at: Date.now(), qid: 'iv2', score: 2 });
  const g = E.engagementStats(st);
  assert.equal(g.sessions.total, 2);
  assert.equal(g.sessions.completed, 1);
  assert.equal(g.sessions.abandoned, 1);
  assert.equal(g.sessions.minutes, 45);
  assert.equal(g.sessions.questions, 8);
  assert.equal(g.sessions.correct, 4);
  assert.equal(g.sessions.hints, 4);
  assert.equal(g.sessions.lessons, 6);
  assert.deepEqual(g.practice, { days: 2, questions: 23, correct: 16, minutes: 15 });
  assert.deepEqual(g.writing, { pieces: 2, words: 360 });
  assert.equal(g.interview.answers, 2);
  assert.equal(g.interview.avgScore, 3);
  assert.ok(g.weeks.length >= 1);
  const latest = g.weeks[g.weeks.length - 1];
  assert.ok(latest.sessionMinutes >= 45 || g.weeks.some((w) => w.practiceMinutes > 0));
});

test('sessionLogCsv is a well-formed spreadsheet with one row per attempt', () => {
  const st = S.defaultState();
  st.sessions.push(E.buildSessionRecord(fakeCurrent(), { token: true, minutes: 45, hintBonus: true }, true));
  st.sessions.push(E.buildSessionRecord(fakeCurrent(), { token: false }, false));
  const csv = E.sessionLogCsv(st);
  const lines = csv.trim().split('\n');
  assert.equal(lines.length, 3, 'header plus two rows');
  const head = lines[0].split(',');
  for (const col of ['date', 'start', 'active_minutes', 'questions', 'correct', 'skipped', 'hints_used', 'lessons_viewed', 'writing_words', 'interview_answers', 'token', 'token_minutes']) {
    assert.ok(head.includes(col), 'missing column ' + col);
  }
  const row1 = lines[1].split(',');
  assert.equal(row1[head.indexOf('completed')], 'yes');
  assert.equal(row1[head.indexOf('writing_words')], '210');
  assert.equal(row1[head.indexOf('token_minutes')], '45');
  assert.equal(lines[2].split(',')[head.indexOf('completed')], 'no');
  // A subject cell with separators stays in one quoted field.
  assert.ok(/"[^"]*\|[^"]*"|maths \d+%/.test(lines[1]), 'subject breakdown present');
  assert.equal(E.sessionLogCsv(S.defaultState()).trim().split('\n').length, 1, 'empty log = header only');
});

test('abandoned sessions do not award session badges or count as the weekly session', () => {
  const st = S.defaultState();
  st.sessions.push(E.buildSessionRecord(Object.assign(fakeCurrent(), { activeSeconds: 300 }), { token: false }, false));
  const earned = E.checkBadges(st, null, null).map((b) => b.id);
  assert.ok(!earned.includes('first-session'), 'no badge for an abandoned attempt');
  st.sessions.push(E.buildSessionRecord(fakeCurrent(), { token: true, minutes: 40 }, true));
  assert.ok(E.checkBadges(st, null, null).map((b) => b.id).includes('first-session'));
});

test('store keeps a practice log and migrates old saves without one', () => {
  const st = S.defaultState();
  assert.deepEqual(st.practiceLog, []);
  const old = S.migrate({ profile: { name: 'Old' }, sessions: [{ startedAt: 1, finishedAt: 2, minutes: 40, summary: {}, token: true }] });
  assert.deepEqual(old.practiceLog, []);
  assert.equal(old.sessions.length, 1);
  const g = E.engagementStats(old);
  assert.equal(g.sessions.completed, 1, 'legacy sessions count as completed');
});
