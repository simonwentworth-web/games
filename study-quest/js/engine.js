'use strict';
/*
 * Study Quest engine: pure, testable logic. No DOM, no storage.
 * Loaded in the browser as window.SQEngine and in node tests via require().
 */
(function (root, factory) {
  const mod = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  else root.SQEngine = mod;
})(typeof self !== 'undefined' ? self : this, function () {

  const DEFAULT_SETTINGS = {
    passMark: 70,          // % first-try accuracy needed to earn the token
    minActiveMinutes: 8,   // minimum engaged minutes for a session to count
    dailyTokenCap: 0,      // 0 = unlimited tokens per day
    rewardMinutes: 40,     // gaming minutes one token buys
    pin: ''                // parent corner PIN ('' = no PIN)
  };

  function settingsWithDefaults(s) {
    return Object.assign({}, DEFAULT_SETTINGS, s || {});
  }

  // --- small utilities -----------------------------------------------------

  function shuffle(arr, rand) {
    const r = rand || Math.random;
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Shuffle an MCQ's options, returning the new option order and where the
  // right answer ended up.
  function shuffledMcq(q, rand) {
    const order = shuffle(q.options.map((_, i) => i), rand);
    return {
      options: order.map(i => q.options[i]),
      answer: order.indexOf(q.answer)
    };
  }

  // --- session sequence ----------------------------------------------------

  // Interleave learn cards with questions: card, card, then alternate
  // question/card until the cards run out, then the remaining questions.
  // Teaching first, testing woven through — every session is learn + quiz.
  function buildSequence(topic) {
    const seq = [];
    const cards = topic.cards || [];
    const questions = topic.questions || [];
    let q = 0;
    for (let c = 0; c < cards.length; c++) {
      seq.push({ kind: 'card', card: cards[c], cardIndex: c });
      if (c >= 1 && q < questions.length) {
        seq.push({ kind: 'q', q: questions[q], qIndex: q });
        q++;
      }
    }
    while (q < questions.length) {
      seq.push({ kind: 'q', q: questions[q], qIndex: q });
      q++;
    }
    return seq;
  }

  // --- answer checking -----------------------------------------------------

  function stripAccents(s) {
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  function normalizeText(s) {
    return stripAccents(String(s))
      .toLowerCase()
      .replace(/[¿¡?!.,;:"']/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Pull a number out of a typed answer: handles "£3.50", "35%", "-7",
  // "0.35", "3/4", "45°", "12 cm" and plain digits.
  function parseNumber(s) {
    const t = String(s).replace(/[£$€,]/g, '').replace(/\s+/g, ' ').trim();
    const frac = t.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
    if (frac) {
      const den = parseFloat(frac[2]);
      if (den !== 0) return parseFloat(frac[1]) / den;
    }
    const m = t.match(/-?\d+(?:\.\d+)?/);
    return m ? parseFloat(m[0]) : NaN;
  }

  // Typed answers: each entry in q.accept is either plain text (forgiving,
  // accent- and case-insensitive match) or '#<number>' for numeric matching.
  function checkTyped(q, given) {
    const g = String(given || '');
    if (!g.trim()) return false;
    return (q.accept || []).some(acc => {
      if (typeof acc === 'string' && acc.charAt(0) === '#') {
        const want = parseFloat(acc.slice(1));
        const got = parseNumber(g);
        return !isNaN(got) && Math.abs(got - want) < 1e-9;
      }
      return normalizeText(acc) === normalizeText(g);
    });
  }

  function checkAnswer(q, given) {
    if (q.type === 'input') return checkTyped(q, given);
    return given === q.answer; // mcq: index into the (possibly shuffled) options
  }

  // --- scoring and the token decision -------------------------------------

  function accuracy(firstTryCorrect, total) {
    if (!total) return 0;
    return Math.round((firstTryCorrect / total) * 100);
  }

  function isSameDay(aIso, bIso) {
    return String(aIso).slice(0, 10) === String(bIso).slice(0, 10);
  }

  function tokensEarnedOnDay(sessions, dayIso) {
    return sessions.filter(s => s.tokenEarned && isSameDay(s.endedAt || s.startedAt, dayIso)).length;
  }

  /*
   * The token rule, in one place. A completed session earns a token when:
   *  - every item in the session was answered (completed),
   *  - first-try accuracy is at least the pass mark,
   *  - at least minActiveMinutes of genuinely active time was spent,
   *  - the daily cap (if set) has not been reached.
   * Returns { earned, reasons } with human-readable reasons when not earned.
   */
  function tokenDecision(settings, m) {
    const s = settingsWithDefaults(settings);
    const reasons = [];
    if (!m.completed) reasons.push('The session was not finished.');
    const acc = accuracy(m.firstTryCorrect, m.questions);
    if (acc < s.passMark) {
      reasons.push('Score was ' + acc + '% — it needs ' + s.passMark + '% or more. Have another go later!');
    }
    const activeMin = (m.activeSeconds || 0) / 60;
    if (activeMin < s.minActiveMinutes) {
      reasons.push('Active time was ' + Math.floor(activeMin) + ' min — a session needs at least ' + s.minActiveMinutes + ' focused minutes.');
    }
    if (s.dailyTokenCap > 0 && (m.tokensToday || 0) >= s.dailyTokenCap) {
      reasons.push('Today’s token limit (' + s.dailyTokenCap + ') is already reached. The session still counts!');
    }
    return { earned: reasons.length === 0, reasons: reasons, accuracy: acc };
  }

  // --- wallet --------------------------------------------------------------

  function walletTotals(sessions, redemptions, adjustments) {
    const earned = sessions.filter(s => s.tokenEarned).length;
    const spent = (redemptions || []).length;
    const adjusted = (adjustments || []).reduce((t, a) => t + (Number(a.delta) || 0), 0);
    return { earned, spent, adjusted, balance: earned + adjusted - spent };
  }

  // --- stats for the records page ------------------------------------------

  function dayKey(iso) { return String(iso).slice(0, 10); }

  function streak(sessions, todayIso) {
    const days = new Set(sessions.filter(s => s.status === 'completed').map(s => dayKey(s.endedAt || s.startedAt)));
    let count = 0;
    let d = new Date(dayKey(todayIso) + 'T12:00:00Z');
    // A streak may start yesterday (today's session not done yet).
    if (!days.has(d.toISOString().slice(0, 10))) d = new Date(d.getTime() - 86400000);
    while (days.has(d.toISOString().slice(0, 10))) {
      count++;
      d = new Date(d.getTime() - 86400000);
    }
    return count;
  }

  function minutesByDay(sessions, todayIso, nDays) {
    const out = [];
    const today = new Date(dayKey(todayIso) + 'T12:00:00Z');
    for (let i = nDays - 1; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 86400000);
      const key = d.toISOString().slice(0, 10);
      const mins = sessions
        .filter(s => dayKey(s.endedAt || s.startedAt) === key)
        .reduce((t, s) => t + (s.activeSeconds || 0) / 60, 0);
      out.push({ day: key, minutes: Math.round(mins) });
    }
    return out;
  }

  function accuracyBySubject(sessions) {
    const by = {};
    sessions.filter(s => s.status === 'completed').forEach(s => {
      const k = s.subjectId;
      if (!by[k]) by[k] = { subjectId: k, subject: s.subject, questions: 0, correct: 0, sessions: 0 };
      by[k].questions += s.questions || 0;
      by[k].correct += s.firstTryCorrect || 0;
      by[k].sessions += 1;
    });
    return Object.values(by).map(r => Object.assign(r, {
      accuracy: r.questions ? Math.round((r.correct / r.questions) * 100) : 0
    }));
  }

  function summary(sessions) {
    const done = sessions.filter(s => s.status === 'completed');
    const activeSec = done.reduce((t, s) => t + (s.activeSeconds || 0), 0);
    const qs = done.reduce((t, s) => t + (s.questions || 0), 0);
    const right = done.reduce((t, s) => t + (s.firstTryCorrect || 0), 0);
    return {
      sessions: done.length,
      activeMinutes: Math.round(activeSec / 60),
      questions: qs,
      accuracy: qs ? Math.round((right / qs) * 100) : 0
    };
  }

  // --- formatting -----------------------------------------------------------

  function fmtClock(totalSeconds) {
    const s = Math.max(0, Math.round(totalSeconds));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m + ':' + String(r).padStart(2, '0');
  }

  function fmtMinutes(seconds) {
    const m = Math.round(seconds / 60);
    return m === 1 ? '1 min' : m + ' min';
  }

  function fmtDate(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return '';
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  function fmtTime(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return '';
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  // --- CSV export ----------------------------------------------------------

  function csvEscape(v) {
    const s = String(v == null ? '' : v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  function sessionsCsv(sessions) {
    const header = ['date', 'start', 'end', 'subject', 'topic', 'active_minutes', 'total_minutes',
      'questions', 'correct_first_try', 'accuracy_pct', 'hints_used', 'focus_losses', 'token_earned', 'status'];
    const rows = sessions.slice().sort((a, b) => String(a.startedAt).localeCompare(String(b.startedAt))).map(s => [
      dayKey(s.startedAt), fmtTime(s.startedAt), fmtTime(s.endedAt), s.subject, s.topic,
      Math.round((s.activeSeconds || 0) / 60 * 10) / 10, Math.round((s.totalSeconds || 0) / 60 * 10) / 10,
      s.questions, s.firstTryCorrect, s.accuracy, s.hintsUsed || 0, s.focusLosses || 0,
      s.tokenEarned ? 'yes' : 'no', s.status
    ]);
    return [header].concat(rows).map(r => r.map(csvEscape).join(',')).join('\n');
  }

  function redemptionsCsv(redemptions) {
    const header = ['date', 'time', 'minutes', 'note'];
    const rows = (redemptions || []).slice().sort((a, b) => String(a.at).localeCompare(String(b.at)))
      .map(r => [dayKey(r.at), fmtTime(r.at), r.minutes, r.note || '']);
    return [header].concat(rows).map(r => r.map(csvEscape).join(',')).join('\n');
  }

  function uid() {
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  return {
    DEFAULT_SETTINGS, settingsWithDefaults,
    shuffle, shuffledMcq, buildSequence,
    normalizeText, parseNumber, checkTyped, checkAnswer,
    accuracy, tokenDecision, tokensEarnedOnDay, isSameDay,
    walletTotals, streak, minutesByDay, accuracyBySubject, summary,
    fmtClock, fmtMinutes, fmtDate, fmtTime,
    sessionsCsv, redemptionsCsv, uid
  };
});
