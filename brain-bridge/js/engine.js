/*
 * Brain Bridge — the adaptive engine.
 *
 * Pure functions (no DOM) that:
 *   - keep a mastery score (0..100) for every skill and update it after each answer
 *   - compose a 40-minute session from blocks, weighted towards weaker subjects
 *   - choose the next skill, level and question inside a block
 *   - grade typed and multiple-choice answers
 *   - analyse a piece of creative writing or an interview answer and produce feedback
 *   - decide tokens and badges when a session finishes
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./data.js'), require('./generators.js'), require('./lessons.js'));
  } else {
    root.BBEngine = factory(root.BBData, root.BBGen, root.BBLessons);
  }
})(typeof self !== 'undefined' ? self : this, function (D, G, L) {
  'use strict';

  const SESSION_MINUTES = 40;
  const START_SCORE = 50;
  const SKILLS_BY_SUBJECT = {};
  D.SKILLS.forEach((s) => { (SKILLS_BY_SUBJECT[s.subject] = SKILLS_BY_SUBJECT[s.subject] || []).push(s.id); });

  /* --------------------------- lessons & hints ---------------------- */

  const lessonFor = (skillId) => (L && L.LESSONS && L.LESSONS[skillId]) || null;
  const hintFor = (qn) => qn.hint || ((lessonFor(qn.skill) || {}).r || '');

  // Sessions teach first, then test: the first ~22 minutes are the learn
  // phase (mini-lessons before unfamiliar skills), the rest is the
  // challenge phase (testing and reinforcing what has been practised).
  const LEARN_PHASE_SECONDS = 22 * 60;
  const sessionPhase = (activeSeconds) => (activeSeconds < LEARN_PHASE_SECONDS ? 'learn' : 'challenge');

  /* ------------------------------ mastery --------------------------- */

  function skillState(progress, id) {
    if (!progress.mastery[id]) progress.mastery[id] = { score: START_SCORE, attempts: 0, correct: 0, streak: 0, recent: [], lastSeen: null };
    return progress.mastery[id];
  }

  const levelFor = (score) => (score < 40 ? 1 : score < 70 ? 2 : 3);
  const difficultyOf = (level) => level * 30 - 10; // 20, 50, 80 on the same scale as scores
  const expected = (score, level) => 1 / (1 + Math.pow(10, (difficultyOf(level) - score) / 30));

  // result: 'correct' | 'wrong' | 'partial'
  function recordAnswer(progress, skillId, result, level, now) {
    const st = skillState(progress, skillId);
    const p = expected(st.score, level);
    const K = st.attempts < 6 ? 18 : 11;
    const actual = result === 'correct' ? 1 : result === 'partial' ? 0.6 : 0;
    const before = st.score;
    st.score = Math.max(0, Math.min(100, st.score + K * (actual - p) * (result === 'wrong' && level > levelFor(before) ? 0.5 : 1)));
    st.attempts += 1;
    if (result === 'correct') { st.correct += 1; st.streak += 1; } else if (result === 'wrong') st.streak = 0;
    if (st.attempts >= 3) st.low = Math.min(st.low == null ? st.score : st.low, st.score);
    st.recent = (st.recent || []).concat([result === 'correct' ? 1 : result === 'partial' ? 0.5 : 0]).slice(-8);
    st.lastSeen = now || Date.now();
    return { before, after: st.score };
  }

  function subjectScore(progress, subject) {
    const ids = SKILLS_BY_SUBJECT[subject] || [];
    const attempted = ids.map((id) => progress.mastery[id]).filter((m) => m && m.attempts > 0);
    if (!attempted.length) return { score: START_SCORE, attempts: 0, attemptedSkills: 0 };
    return { score: attempted.reduce((a, m) => a + m.score, 0) / attempted.length, attempts: attempted.reduce((a, m) => a + m.attempts, 0), attemptedSkills: attempted.length };
  }

  function overview(progress) {
    const out = {};
    Object.keys(D.SUBJECTS).forEach((s) => { out[s] = subjectScore(progress, s); });
    return out;
  }

  /* ------------------------------ sessions -------------------------- */

  const TEMPLATES = {
    qeh: [
      { id: 'warmup', type: 'quiz', subject: 'maths', skills: ['m.arith'], label: 'Warm-up: quick-fire arithmetic', minutes: 2, format: 'mc', fixedLevel: 1 },
      { id: 'english', type: 'quiz', subject: 'english', skills: ['e.punct', 'e.grammar', 'e.spelling'], label: 'English: spelling, punctuation & grammar', minutes: 6, format: 'mc' },
      { id: 'comprehension', type: 'passage', subject: 'english', label: 'Comprehension', minutes: 7, format: 'mc' },
      { id: 'maths', type: 'quiz', subject: 'maths', label: 'Maths', minutes: 8, format: 'mc' },
      { id: 'nvr', type: 'quiz', subject: 'nvr', label: 'Non-verbal reasoning', minutes: 4, format: 'mc' },
      { id: 'vr', type: 'quiz', subject: 'vr', label: 'Verbal reasoning', minutes: 4, format: 'mc' },
      { id: 'ps', type: 'quiz', subject: 'ps', label: 'Problem solving', minutes: 6, format: 'mc' },
      { id: 'interview', type: 'interview', subject: 'interview', label: 'Interview practice', minutes: 3, format: 'typed' },
      { id: 'wrap', type: 'wrap', label: 'Wrap-up', minutes: 0 }
    ],
    bgs: [
      { id: 'warmup', type: 'quiz', subject: 'maths', skills: ['m.arith'], label: 'Warm-up: quick-fire arithmetic', minutes: 2, format: 'typed', fixedLevel: 1 },
      { id: 'maths', type: 'quiz', subject: 'maths', label: 'Maths: written answers', minutes: 8, format: 'typed' },
      { id: 'comprehension', type: 'passage', subject: 'english', label: 'Comprehension: written answers', minutes: 8, format: 'typed' },
      { id: 'ps', type: 'quiz', subject: 'ps', label: 'Problem solving', minutes: 7, format: 'typed' },
      { id: 'writing', type: 'writing', subject: 'writing', label: 'Creative writing sprint', minutes: 12, format: 'typed' },
      { id: 'interview', type: 'interview', subject: 'interview', label: 'Interview practice', minutes: 3, format: 'typed' },
      { id: 'wrap', type: 'wrap', label: 'Wrap-up', minutes: 0 }
    ]
  };

  function pickStyle(profile, sessionIndex) {
    const schools = profile.schools && profile.schools.length ? profile.schools : ['bgs', 'qeh'];
    if (schools.length === 1) return schools[0];
    return sessionIndex % 2 === 0 ? 'qeh' : 'bgs';
  }

  // Build the block plan for a session, nudging time towards the weakest subject.
  function composeSession(progress, profile, sessionIndex, style) {
    style = style || pickStyle(profile, sessionIndex);
    const blocks = TEMPLATES[style].map((b) => Object.assign({}, b));
    const scores = overview(progress);
    const adjustable = blocks.filter((b) => b.type === 'quiz' && b.id !== 'warmup' || b.type === 'passage');
    if (adjustable.length > 1) {
      const bySubject = adjustable.slice().sort((a, b) => scores[a.subject].score - scores[b.subject].score);
      const weakest = bySubject[0], strongest = bySubject[bySubject.length - 1];
      if (weakest !== strongest && scores[strongest.subject].attempts > 0 && scores[strongest.subject].score - scores[weakest.subject].score > 8) {
        weakest.minutes += 2; strongest.minutes = Math.max(3, strongest.minutes - 2); weakest.boosted = true;
      }
    }
    const total = blocks.reduce((a, b) => a + b.minutes, 0);
    if (total !== SESSION_MINUTES) blocks[blocks.length - 2].minutes += SESSION_MINUTES - total;
    return { style, blocks, index: sessionIndex, school: D.SCHOOLS[style] };
  }

  /* --------------------------- choosing questions ------------------- */

  function chooseSkill(progress, skillIds, rng, lastSkill, phase) {
    const now = Date.now();
    const weights = skillIds.map((id) => {
      const st = progress.mastery[id];
      const score = st ? st.score : START_SCORE;
      const days = st && st.lastSeen ? Math.min(14, (now - st.lastSeen) / 86400000) : 7;
      let w = (100 - score) * 0.8 + 12 + days * 2;
      if (!st || st.attempts === 0) {
        // Learn phase explores new skills; the challenge phase mostly
        // reinforces skills that have already been taught or practised.
        if (phase === 'challenge') w *= 0.35; else w += 10;
      }
      if (id === lastSkill && skillIds.length > 1) w *= 0.3;
      return w;
    });
    let r = rng.next() * weights.reduce((a, b) => a + b, 0);
    for (let i = 0; i < skillIds.length; i++) { r -= weights[i]; if (r <= 0) return skillIds[i]; }
    return skillIds[skillIds.length - 1];
  }

  function chooseLevel(progress, skillId, rng) {
    const st = progress.mastery[skillId];
    const base = levelFor(st ? st.score : START_SCORE);
    const recent = st ? st.recent || [] : [];
    if (recent.length >= 2 && recent.slice(-2).every((r) => r === 0) && base > 1) return { level: base - 1, mode: 'confidence' };
    if (st && st.streak >= 3 && base < 3 && rng.chance(0.4)) return { level: base + 1, mode: 'stretch' };
    return { level: base, mode: 'normal' };
  }

  function nextQuizQuestion(progress, block, rng, seen, lastSkill, phase) {
    const pool = block.skills || SKILLS_BY_SUBJECT[block.subject];
    const skillId = chooseSkill(progress, pool, rng, lastSkill, phase);
    const pick = block.fixedLevel ? { level: block.fixedLevel, mode: 'normal' } : chooseLevel(progress, skillId, rng);
    let qn = G.generate(skillId, pick.level, rng, seen);
    if (block.format === 'mc') qn = G.toMC(qn, rng);
    qn.mode = pick.mode;
    return qn;
  }

  // Pick a passage the student has seen least (and least recently), then its questions.
  function choosePassage(progress, rng, level) {
    const usage = progress.passages || {};
    const scored = D.PASSAGES.map((p) => { const u = usage[p.id] || { count: 0, last: 0 }; return { p, key: u.count * 1e13 + u.last + (Math.abs(p.level - level) * 1e12) }; });
    scored.sort((a, b) => a.key - b.key);
    const top = scored.slice(0, 2).map((s) => s.p);
    return rng.pick(top);
  }

  function passageQuestions(passage, style, count) {
    const qs = passage.questions.map((item) => G.fromPassage(passage, item, style));
    return count ? qs.slice(0, count) : qs;
  }

  function chooseInterviewQuestion(progress, rng, schools) {
    const done = progress.interview || [];
    const counts = {}; done.forEach((d) => { counts[d.qid] = (counts[d.qid] || 0) + 1; });
    const pool = D.INTERVIEW_QUESTIONS.slice().sort((a, b) => (counts[a.id] || 0) - (counts[b.id] || 0));
    const least = pool.filter((qq) => (counts[qq.id] || 0) === (counts[pool[0].id] || 0));
    return rng.pick(least);
  }

  function chooseWritingPrompt(progress, rng) {
    const done = new Set((progress.writing || []).map((w) => w.promptId));
    const fresh = D.WRITING_PROMPTS.filter((p) => !done.has(p.id));
    return rng.pick(fresh.length ? fresh : D.WRITING_PROMPTS);
  }

  /* ------------------------------ grading --------------------------- */

  function normalise(s) {
    return String(s == null ? '' : s).toLowerCase().replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[^\w\s/.:,'"%£°()-]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  const stripFillers = (s) => normalise(s).replace(/^(the|a|an|it is|it was|he|she|they|because)\s+/, '').replace(/[.!?,'"()]/g, '').replace(/\s+/g, ' ').trim();

  // Units the student might type after (or glued onto) a number: "26p",
  // "45 degrees", "28cm2", "95 mins". Longest first so "cm" wins over "m".
  const UNIT_SUFFIXES = 'pence|pounds?|p|minutes?|mins?|min|seconds?|secs?|sec|hours?|hrs?|hr|h|days?|weeks?|degrees?|deg|km\\/h|kmh|kph|m\\/s|mph|cm[23]?|mm|km|ml|cl|litres?|liters?|l|kg|grams?|g|m[23]?|tiles?|coaches?|squares?|%|°';

  function parseNumber(s, unit) {
    if (typeof s === 'number') return s;
    let t = normalise(s).replace(/,/g, '').replace(/£/g, ' ');
    t = t.replace(/\b(minus|negative)\s+/g, '-');
    // Strip the question's own unit wherever it appears (attached or not).
    if (unit && unit !== '£') {
      const esc = String(unit).toLowerCase().replace(/[.*+?^${}()|[\]\\/]/g, '\\$&').replace(/²/g, '[²2]').replace(/³/g, '[³3]');
      // Only strip the unit as a whole token after a digit or a space, so a
      // short unit like "p" never eats letters inside other words.
      t = t.replace(new RegExp('(^|[\\s\\d])' + esc + '(?![a-z0-9])', 'gi'), '$1 ');
    }
    // Strip common unit words/suffixes directly after a number.
    t = t.replace(new RegExp('(\\d)\\s*(' + UNIT_SUFFIXES + ')(?![a-z])', 'gi'), '$1 ');
    t = t.replace(/[%°²³]/g, ' ').replace(/\s+/g, ' ').trim().replace(/[.]\s*$/, '');
    const mixed = t.match(/^(-?\d+)\s+(\d+)\s*\/\s*(\d+)$/);
    if (mixed) return +mixed[1] + (+mixed[2] / +mixed[3]) * (mixed[1].startsWith('-') ? -1 : 1);
    const fr = t.match(/^(-?\d+)\s*\/\s*(\d+)$/);
    if (fr && +fr[2] !== 0) return +fr[1] / +fr[2];
    const num = t.match(/^-?\d+(\.\d+)?$/);
    if (num) return +t;
    const words = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20 };
    const w = t.match(/^(-?)([a-z]+)$/);
    if (w && words[w[2]] != null) return (w[1] === '-' ? -1 : 1) * words[w[2]];
    // A single number wrapped in words ("day 8", "about 150", "8 coaches").
    const lone = t.match(/^[a-z\s]*(-?\d+(?:\.\d+)?)[a-z\s.]*$/);
    if (lone) return +lone[1];
    return NaN;
  }

  // "16:30", "16.30", "1630" and "16 30" all mean the same clock time.
  function timeDigits(x) {
    const m = String(x == null ? '' : x).trim().match(/^(\d{1,2})[:. ]([0-5]\d)$|^(\d{2})([0-5]\d)$/);
    if (!m) return null;
    const h = m[1] != null ? m[1] : m[3];
    const mm = m[2] != null ? m[2] : m[4];
    return (h.length < 2 ? '0' : '') + h + mm;
  }

  function isSimplest(s) {
    const m = String(s).trim().match(/^(-?\d+)\s+(\d+)\/(\d+)$|^(-?\d+)\/(\d+)$/);
    if (!m) return true;
    const n = m[2] != null ? +m[2] : +m[4], d = m[3] != null ? +m[3] : +m[5];
    const g = (a, b) => (b ? g(b, a % b) : Math.abs(a));
    return g(n, d) === 1;
  }

  // Returns { result: 'correct'|'wrong'|'partial'|'self', note }
  function grade(qn, response) {
    if (qn.format === 'mc') return { result: response === qn.answer ? 'correct' : 'wrong' };
    const raw = String(response == null ? '' : response).trim();
    if (!raw) return { result: 'wrong', note: 'No answer given.' };
    if (qn.numeric) {
      const want = typeof qn.answer === 'number' ? qn.answer : parseNumber(qn.answer, qn.unit);
      const got = parseNumber(raw, qn.unit);
      if (Number.isNaN(got)) {
        if (qn.accept && qn.accept.some((a) => normalise(a) === normalise(raw))) return { result: 'correct' };
        return { result: 'wrong', note: 'I could not read that as a number.' };
      }
      const close = (a, b) => Math.abs(a - b) < 0.011;
      if (close(got, want)) return { result: 'correct' };
      // Money: accept the same value given in the other unit, when the
      // student wrote the unit (350p for £3.50; £0.26 for 26p).
      const saysPence = /\d\s*(p\b|pence)/i.test(raw);
      const saysPounds = /£|pounds?\b/i.test(raw);
      if (qn.unit === '£' && saysPence && !saysPounds && close(got / 100, want)) return { result: 'correct' };
      if (qn.unit === 'p' && saysPounds && close(got * 100, want)) return { result: 'correct' };
      return { result: 'wrong' };
    }
    if (qn.fraction) {
      const want = parseNumber(qn.answer), got = parseNumber(raw);
      if (!Number.isNaN(got) && Math.abs(got - want) < 1e-6) {
        if (qn.requireSimplest && !isSimplest(raw) && normalise(raw) !== normalise(qn.answer)) return { result: 'partial', note: `Right value! But it needs to be in its simplest form: ${qn.answer}.` };
        return { result: 'correct' };
      }
      return { result: 'wrong' };
    }
    const acc = (qn.accept || []).concat(qn.answer != null ? [qn.answer] : []).map(normalise).filter(Boolean);
    const n = normalise(raw), s = stripFillers(raw);
    if (acc.length && (acc.includes(n) || acc.map(stripFillers).includes(s) || acc.some((a) => a.length > 2 && (n === a || n.replace(/[.!?]$/, '') === a)))) return { result: 'correct' };
    // Clock times: 16.30, 1630 and 16 30 all count as 16:30.
    const rawTime = timeDigits(n.replace(/[.!?]$/, ''));
    if (rawTime && acc.some((a) => timeDigits(a) === rawTime)) return { result: 'correct' };
    if (qn.keywords && qn.keywords.length) {
      const hit = qn.keywords.filter((group) => group.some((k) => n.includes(normalise(k)))).length;
      const need = qn.need || 1;
      if (hit >= need) return { result: 'correct' };
      if (hit > 0) return { result: 'partial', note: 'You have part of the answer. Compare with the model answer.' };
      return { result: 'self', note: 'Compare your answer with the model answer and mark it honestly.' };
    }
    if (qn.long) return { result: 'self' };
    // Last chance: letter-only answers (codes) and single words
    if (acc.some((a) => a.replace(/\s/g, '') === n.replace(/\s/g, ''))) return { result: 'correct' };
    return { result: 'wrong' };
  }

  /* ------------------------- writing analysis ----------------------- */

  const STOP = new Set('the a an and but or so of to in on at for with was were is are be been had has have he she it they we i you his her its their my our your this that these those as by from then than there here when where which who what not no do did does into out up down over very just like said'.split(' '));
  const SPEECH_VERBS = ['whispered', 'muttered', 'shouted', 'yelled', 'replied', 'gasped', 'murmured', 'snapped', 'hissed', 'cried', 'laughed', 'sighed', 'exclaimed', 'demanded', 'begged', 'stammered', 'growled', 'announced', 'pleaded', 'insisted'];
  const SENSES = ['smell', 'smelt', 'scent', 'aroma', 'stench', 'taste', 'tasted', 'bitter', 'sweet', 'sour', 'rough', 'smooth', 'cold', 'icy', 'warm', 'soft', 'sticky', 'heard', 'echo', 'echoed', 'roar', 'whisper', 'creak', 'rustle', 'hum', 'silence', 'glimpse', 'glow', 'gleam', 'shimmer', 'shadow', 'flicker', 'crimson', 'golden', 'silver', 'emerald', 'amber'];
  const CONNECTIVES = ['however', 'although', 'meanwhile', 'suddenly', 'eventually', 'later', 'afterwards', 'despite', 'whereas', 'unless', 'until', 'because', 'therefore', 'moreover', 'finally', 'nevertheless', 'instead', 'while', 'before', 'after', 'as soon as', 'without warning', 'moments later'];
  const MISSPELLINGS = { alot: 'a lot', definately: 'definitely', recieve: 'receive', seperate: 'separate', untill: 'until', wich: 'which', becuase: 'because', becouse: 'because', freind: 'friend', thier: 'their', beleive: 'believe', wierd: 'weird', occured: 'occurred', accross: 'across', allready: 'already', tommorow: 'tomorrow', suprise: 'surprise', begining: 'beginning', writting: 'writing', realy: 'really', finaly: 'finally', sudenly: 'suddenly', quite: null, grabed: 'grabbed', stoped: 'stopped', runing: 'running', whent: 'went', wen: 'when', dont: "don't", didnt: "didn't", couldnt: "couldn't", im: "I'm", ive: "I've", cant: "can't", wasnt: "wasn't" };
  const WOW = new Set(D.VOCAB.map((v) => v.w).concat(['glistening', 'towering', 'ancient', 'eerie', 'silhouette', 'shimmering', 'trembling', 'thunderous', 'desolate', 'frantic', 'cautiously', 'hesitantly', 'anxiously', 'majestic', 'mysterious', 'suspicious', 'relentless', 'brittle', 'jagged', 'crooked', 'delicate', 'ferocious', 'glimmer', 'lurking', 'ominous', 'reluctantly', 'swiftly', 'twisted', 'vast', 'gnarled', 'luminous', 'bitterly', 'hollow', 'echoing']));

  function splitSentences(text) {
    return text.replace(/\n+/g, ' \n ').split(/(?<=[.!?]["”')]?)\s+(?=[A-Z0-9"“(\n])|\n/).map((s) => s.trim()).filter((s) => s.length > 1);
  }

  function analyseWriting(text, prompt) {
    text = String(text || '');
    const words = text.trim().split(/\s+/).filter(Boolean);
    const wc = words.length;
    const lowerWords = words.map((w) => w.toLowerCase().replace(/[^a-z']/g, '')).filter(Boolean);
    const sentences = splitSentences(text);
    const lens = sentences.map((s) => s.split(/\s+/).length);
    const avg = lens.length ? lens.reduce((a, b) => a + b, 0) / lens.length : 0;
    const sd = lens.length ? Math.sqrt(lens.reduce((a, l) => a + (l - avg) ** 2, 0) / lens.length) : 0;
    const paragraphs = text.split(/\n\s*\n|\n/).map((p) => p.trim()).filter(Boolean).length;
    const openers = sentences.map((s) => s.split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, ''));
    const openerCounts = {}; openers.forEach((o) => { openerCounts[o] = (openerCounts[o] || 0) + 1; });
    const topOpener = Object.entries(openerCounts).sort((a, b) => b[1] - a[1])[0];
    const dialogue = (text.match(/["“”]/g) || []).length;
    const punct = { q: /\?/.test(text), ex: /!/.test(text), semi: /;/.test(text), colon: /:/.test(text), dash: /—|--| - /.test(text), ellipsis: /\.\.\.|…/.test(text), comma: /,/.test(text) };
    const punctCount = Object.values(punct).filter(Boolean).length;
    const thenCount = lowerWords.filter((w) => w === 'then').length;
    const saidCount = lowerWords.filter((w) => w === 'said').length;
    const speechVerbs = SPEECH_VERBS.filter((v) => lowerWords.includes(v));
    const senses = SENSES.filter((v) => lowerWords.includes(v));
    const connectives = CONNECTIVES.filter((c) => text.toLowerCase().includes(c));
    const wow = [...new Set(lowerWords.filter((w) => WOW.has(w)))];
    const similes = (text.match(/\b(like (a|an|the|some|two|three|\w+s|\w+ing)\b|as if|as though|as \w+ as\b)/gi) || []).length;
    const lowerStarts = sentences.filter((s) => /^[a-z]/.test(s)).length;
    const lonelyI = (text.match(/(^|\s)i(\s|'|$)/g) || []).length;
    const misspelt = [...new Set(lowerWords.filter((w) => MISSPELLINGS[w]))].map((w) => `${w} → ${MISSPELLINGS[w]}`);
    const freq = {}; lowerWords.forEach((w) => { if (!STOP.has(w) && w.length > 3) freq[w] = (freq[w] || 0) + 1; });
    const repeated = Object.entries(freq).filter(([, c]) => c >= 4).map(([w, c]) => `${w} (${c} times)`);
    const endsProperly = /[.!?]["”')]?\s*$/.test(text.trim());
    const hook = sentences.length ? /^["“]|\?$|^(suddenly|bang|crash|silence|nobody|never|it was)/i.test(sentences[0]) || lens[0] <= 6 : false;
    const shortImpact = lens.filter((l) => l <= 4).length;
    const longest = Math.max(0, ...lens);

    const praise = [], targets = [];
    if (wc >= 250) praise.push(`A strong length: ${wc} words. That is what examiners expect to see.`);
    else if (wc >= 150) praise.push(`A solid ${wc} words. Keep building towards 250+ in a 45-minute paper.`);
    if (similes >= 1) praise.push('You used a simile or comparison. Imagery like this earns marks.');
    if (senses.length >= 3) praise.push(`Sensory detail (${senses.slice(0, 3).join(', ')}) puts the reader right there.`);
    if (wow.length >= 3) praise.push(`Ambitious vocabulary: ${wow.slice(0, 4).join(', ')}.`);
    else if (wow.length) praise.push(`Nice word choice: ${wow.join(', ')}.`);
    if (dialogue >= 2) praise.push('You used dialogue, which brings characters to life.');
    if (speechVerbs.length) praise.push(`Lovely speech verbs instead of “said”: ${speechVerbs.slice(0, 3).join(', ')}.`);
    if (sd >= 4 && lens.length >= 5) praise.push('Great variety in sentence length: that gives your writing rhythm.');
    if (shortImpact >= 1 && longest >= 15) praise.push('You mixed a punchy short sentence with longer ones. Excellent for tension.');
    if (hook) praise.push('Your opening grabs attention straight away.');
    if (connectives.length >= 3) praise.push(`Good linking words (${connectives.slice(0, 3).join(', ')}) keep the writing flowing.`);
    if (paragraphs >= 3) praise.push('Clear paragraphs help the examiner follow your structure.');
    if (punctCount >= 4) praise.push('A wide range of punctuation. Very impressive.');

    if (misspelt.length) targets.push('Spelling to check: ' + misspelt.slice(0, 4).join(', ') + '.');
    if (lowerStarts) targets.push(`${lowerStarts} sentence${lowerStarts > 1 ? 's' : ''} start${lowerStarts > 1 ? '' : 's'} without a capital letter.`);
    if (lonelyI) targets.push('Remember: the word I is always a capital letter.');
    if (wc < 120) targets.push('Aim for more. Add a paragraph that slows down the most exciting moment and describes it in detail.');
    if (paragraphs < 3 && wc > 120) targets.push('Split your writing into paragraphs: new time, place, person or idea = new paragraph.');
    if (!endsProperly && wc > 20) targets.push('Finish with a proper final sentence and a full stop. Do not stop mid-flow.');
    if (thenCount >= 3) targets.push('\u201cThen\u201d appears a lot. Use time connectives: moments later, as soon as, without warning.');
    if (sd < 3 && lens.length >= 5) targets.push('Vary your sentence lengths. Try one very short sentence for impact. Like this.');
    if (topOpener && topOpener[1] >= 3 && sentences.length >= 5) targets.push(`${topOpener[1]} sentences start with \u201c${topOpener[0]}\u201d. Try starting with an -ing word, an adverb or a preposition instead.`);
    if (saidCount >= 3 && !speechVerbs.length) targets.push('Swap some \u201csaid\u201d for whispered, muttered, snapped, pleaded.');
    if (senses.length < 2) targets.push('Add the senses: what could the character smell, hear or feel?');
    if (similes === 0) targets.push('Add one simile or metaphor (the moon was a silver coin; fear crawled like ice down her back).');
    if (dialogue === 0 && prompt && prompt.type === 'Story') targets.push('A line or two of dialogue would bring your characters to life.');
    if (repeated.length) targets.push('Repeated words: ' + repeated.slice(0, 3).join(', ') + '. Find a synonym or cut one.');
    if (!punct.comma && wc > 60) targets.push('No commas at all? Use them after fronted adverbials and in lists.');

    const clamp = (x) => Math.max(1, Math.min(5, Math.round(x)));
    const scores = {
      imagination: clamp(2 + (similes > 0) + (wow.length >= 2) + (dialogue >= 2 ? 1 : 0) + (hook ? 0.5 : 0) - (wc < 100 ? 1 : 0)),
      form: clamp(2.5 + (paragraphs >= 3 ? 1 : 0) + (endsProperly ? 0.5 : 0) + (wc >= 150 ? 1 : 0)),
      organisation: clamp(2 + (paragraphs >= 3 ? 1 : 0) + (connectives.length >= 2 ? 1 : 0) + (endsProperly ? 0.5 : 0) + (wc >= 200 ? 0.5 : 0)),
      sentences: clamp(2 + (sd >= 4 ? 1 : 0) + (punctCount >= 3 ? 1 : 0) + (topOpener && topOpener[1] >= 3 ? -1 : 0.5) + (shortImpact && longest >= 15 ? 0.5 : 0)),
      vocab: clamp(2 + Math.min(2, wow.length / 2) + (senses.length >= 3 ? 1 : 0) + (speechVerbs.length ? 0.5 : 0)),
      spag: clamp(5 - misspelt.length - lowerStarts * 0.5 - (lonelyI ? 1 : 0))
    };
    return { metrics: { words: wc, sentences: sentences.length, paragraphs, avgSentence: +avg.toFixed(1), variety: +sd.toFixed(1), dialogue, wow: wow.length, senses: senses.length, punctuation: punctCount, similes }, praise: praise.slice(0, 5), targets: targets.slice(0, 4), scores };
  }

  /* ------------------------ interview analysis ---------------------- */

  function analyseInterview(text, question) {
    text = String(text || '');
    const lower = text.toLowerCase();
    const words = text.trim().split(/\s+/).filter(Boolean); const wc = words.length;
    const sentences = splitSentences(text).length;
    const hasBecause = /\b(because|since|so that|which means|the reason|that is why|as it)\b/.test(lower);
    const hasExample = /\b(for example|for instance|once|one time|last (week|year|term|summer)|when i|recently|at school|in year|my (friend|teacher|brother|sister|mum|dad|coach)|we (went|did|made|played))\b/.test(lower);
    const fillers = (lower.match(/\b(like|stuff|things|kind of|sort of|basically|literally|um|erm)\b/g) || []).length;
    const dontKnow = /\b(don'?t know|dunno|not sure)\b/.test(lower);
    const firstPerson = /\b(i|my|me|we)\b/.test(lower);
    const ingredients = (question && question.ingredients ? question.ingredients : []).filter((k) => lower.includes(k));
    const schoolMention = /\b(bgs|bristol grammar|qeh|queen elizabeth|your school|this school|clifton|failand|great hall|theatre|motto|founded)\b/.test(lower);
    const question_back = /\?/.test(text);
    const praise = [], targets = [];
    if (wc >= 40 && wc <= 160) praise.push('Good length: long enough to be interesting, short enough to keep them listening.');
    if (hasExample) praise.push('You gave a real example. That is exactly what interviewers remember.');
    if (hasBecause) praise.push('You explained your reasons. Interviewers love a “because”.');
    if (ingredients.length >= 2) praise.push('You covered the key ingredients of a strong answer.');
    if (sentences >= 3) praise.push('Several clear sentences: easy to follow when said aloud.');
    if (question && question.skill === 'iv.why' && schoolMention) praise.push('You mentioned something specific about the school. Great research.');
    if (question && question.id === 'iv55' && question_back) praise.push('You asked a question back. Perfect.');
    if (wc < 25) targets.push('Too short. Say it, Show an example, Share why it matters: aim for three or four sentences.');
    if (question && question.skill === 'iv.why' && !schoolMention) targets.push('Mention one specific thing about the school: something you saw, a club, the motto.');
    if (question && question.id === 'iv55' && !question_back) targets.push('This one needs a question! Ask about clubs, trips or what Year 7s enjoy most.');
    if (wc > 180) targets.push('A little long for speaking aloud. Pick your best example and cut the rest.');
    if (!hasExample) targets.push('Add a real example: a time, a place, a name. “For example, last term...”');
    if (!hasBecause) targets.push('Explain why. Add a “because” sentence.');
    if (fillers >= 2) targets.push('Watch filler words (like, stuff, things). Swap them for precise words.');
    if (dontKnow) targets.push('It is fine to think first, but avoid “I don’t know”. Try “That is a good question. I think...”');
    if (!firstPerson) targets.push('Make it personal: use “I” and talk about your own experience.');
    const score = Math.max(1, Math.min(5, Math.round(1.5 + (wc >= 30 ? 1 : 0) + (hasExample ? 1 : 0) + (hasBecause ? 1 : 0) + (ingredients.length >= 2 ? 0.5 : 0) + (sentences >= 3 ? 0.5 : 0) - (fillers >= 2 ? 0.5 : 0) - (dontKnow ? 0.5 : 0))));
    return { words: wc, praise: praise.slice(0, 3), targets: targets.slice(0, 3), score };
  }

  /* --------------------------- session results ---------------------- */

  function weekKey(d) {
    const date = new Date(d); date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7)); // Thursday of this ISO week
    const week1 = new Date(date.getFullYear(), 0, 4);
    const w = 1 + Math.round(((date - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
    return `${date.getFullYear()}-W${w < 10 ? '0' : ''}${w}`;
  }

  function tokensThisWeek(progress, now) {
    const key = weekKey(now || Date.now());
    return (progress.tokens.history || []).filter((h) => h.type === 'earned' && weekKey(h.at) === key).length;
  }

  // Hints are always allowed, but solving mostly without them earns extra
  // game minutes on top of the token.
  const HINT_BONUS_MINUTES = 5;
  function hintBonusEarned(hints) {
    return !!(hints && hints.total >= 8 && hints.used * 3 <= hints.total);
  }

  // Decide whether a finished session earns a token, and how many minutes
  // of games it is worth (40, plus 5 if hints were mostly not used).
  function tokenDecision(progress, profile, activeSeconds, now, hints) {
    const hintBonus = hintBonusEarned(hints);
    const needed = SESSION_MINUTES * 60 - 30;
    if (activeSeconds < needed) return { token: false, hintBonus: false, reason: `Sessions need the full ${SESSION_MINUTES} minutes to earn a token.` };
    const limit = profile.weeklyTokenLimit == null ? 1 : profile.weeklyTokenLimit;
    if (limit > 0 && tokensThisWeek(progress, now) >= limit) return { token: false, bonus: true, hintBonus, reason: `You have already earned this week’s token, so this one is a bonus star.` };
    return { token: true, hintBonus, minutes: SESSION_MINUTES + (hintBonus ? HINT_BONUS_MINUTES : 0) };
  }

  // Tokens still to spend, and the game minutes they are worth (a token is
  // 40 minutes, plus any hint-free bonus minutes it was earned with).
  function availableTokens(progress) {
    const count = Math.max(0, (progress.tokens.earned || 0) - (progress.tokens.spent || 0));
    const gained = (progress.tokens.history || []).filter((h) => h.type === 'earned' || h.type === 'granted');
    const unspent = gained.slice(Math.min(progress.tokens.spent || 0, gained.length));
    const extra = unspent.reduce((a, h) => a + Math.max(0, (h.minutes || SESSION_MINUTES) - SESSION_MINUTES), 0);
    return { count, minutes: count * SESSION_MINUTES + extra, next: unspent[0] ? (unspent[0].minutes || SESSION_MINUTES) : SESSION_MINUTES };
  }

  function summarise(session) {
    const hints = session.hints || { used: 0, total: 0 };
    const bySubject = {};
    let correct = 0, total = 0, best = 0, streak = 0;
    (session.answers || []).forEach((a) => {
      const s = bySubject[a.subject] = bySubject[a.subject] || { correct: 0, total: 0 };
      s.total += 1; total += 1;
      if (a.result === 'correct') { s.correct += 1; correct += 1; streak += 1; best = Math.max(best, streak); } else if (a.result === 'wrong') streak = 0;
      else { s.correct += 0.5; correct += 0.5; }
    });
    const stretchWins = (session.answers || []).filter((a) => a.mode === 'stretch' && a.result === 'correct').length;
    return { correct, total, accuracy: total ? correct / total : 0, bestStreak: best, bySubject, stretchWins, hints };
  }

  // Build the permanent record of one session attempt (finished or
  // abandoned). Everything a parent needs to verify engagement: when it ran,
  // how long, what was answered, hints, lessons, writing and interview work.
  function buildSessionRecord(c, decision, completed, now) {
    now = now || Date.now();
    const summary = summarise(c);
    const counts = { correct: 0, partial: 0, wrong: 0, skipped: 0 };
    (c.answers || []).forEach((a) => {
      if (a.result === 'correct') counts.correct += 1;
      else if (a.result === 'partial') counts.partial += 1;
      else { counts.wrong += 1; if (a.skipped) counts.skipped += 1; }
    });
    const artifacts = c.artifacts || [];
    return {
      id: 's' + now,
      startedAt: c.startedAt,
      finishedAt: now,
      completed: !!completed,
      style: c.plan ? c.plan.style : '',
      minutes: Math.round((c.activeSeconds || 0) / 60),
      activeSeconds: c.activeSeconds || 0,
      blocksDone: Math.min(c.blockIndex || 0, c.plan ? c.plan.blocks.length : 0),
      blocksTotal: c.plan ? c.plan.blocks.length : 0,
      summary,
      counts,
      lessons: (c.taught || []).length,
      writing: artifacts.filter((a) => a.type === 'writing'),
      interview: artifacts.filter((a) => a.type === 'interview'),
      token: !!(decision && decision.token),
      tokenMinutes: decision && decision.token ? decision.minutes : 0,
      bonus: !!(decision && decision.bonus),
      hintBonus: !!(decision && decision.hintBonus),
      answers: (c.answers || []).length,
      detail: (c.answers || []).slice()
    };
  }

  const sum = (arr, f) => (arr || []).reduce((a, x) => a + (f(x) || 0), 0);

  // Lifetime engagement figures across sessions, free practice, writing and
  // interview work, plus a recent per-week breakdown.
  function engagementStats(progress, weeksBack) {
    const ss = progress.sessions || [];
    const completed = ss.filter((x) => x.completed !== false);
    const sessions = {
      total: ss.length,
      completed: completed.length,
      abandoned: ss.length - completed.length,
      minutes: sum(ss, (x) => x.minutes),
      questions: sum(ss, (x) => x.answers),
      correct: sum(ss, (x) => (x.counts ? x.counts.correct : Math.floor((x.summary || {}).correct || 0))),
      hints: sum(ss, (x) => ((x.summary || {}).hints || {}).used),
      lessons: sum(ss, (x) => x.lessons)
    };
    const pl = progress.practiceLog || [];
    const practice = { days: pl.length, questions: sum(pl, (x) => x.questions), correct: sum(pl, (x) => x.correct), minutes: Math.round(sum(pl, (x) => x.seconds) / 60) };
    const writing = { pieces: (progress.writing || []).length, words: sum(progress.writing || [], (w) => (w.metrics || {}).words) };
    const iv = progress.interview || [];
    const interview = { answers: iv.length, avgScore: iv.length ? +(sum(iv, (x) => x.score) / iv.length).toFixed(1) : 0 };
    const byWeek = {};
    const wk = (k) => (byWeek[k] = byWeek[k] || { sessions: 0, sessionMinutes: 0, practiceMinutes: 0, questions: 0 });
    ss.forEach((x) => { const w = wk(weekKey(x.finishedAt || x.startedAt)); w.sessions += 1; w.sessionMinutes += x.minutes || 0; w.questions += x.answers || 0; });
    pl.forEach((x) => { const w = wk(weekKey(new Date(x.day + 'T12:00:00'))); w.practiceMinutes += Math.round((x.seconds || 0) / 60); w.questions += x.questions || 0; });
    const weeks = Object.keys(byWeek).sort().slice(-(weeksBack || 6)).map((k) => Object.assign({ week: k }, byWeek[k]));
    return { sessions, practice, writing, interview, weeks };
  }

  // The session log as a spreadsheet-friendly CSV, one row per attempt.
  function sessionLogCsv(progress) {
    const cell = (v) => { v = v == null ? '' : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    const hhmm = (t) => { const d = new Date(t); return (d.getHours() < 10 ? '0' : '') + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes(); };
    const head = ['date', 'start', 'end', 'style', 'completed', 'active_minutes', 'blocks_done', 'questions', 'correct', 'partial', 'wrong', 'skipped', 'accuracy_pct', 'best_streak', 'hints_used', 'lessons_viewed', 'stretch_wins', 'writing_words', 'interview_answers', 'subjects', 'token', 'token_minutes'];
    const rows = (progress.sessions || []).map((x) => {
      const sm = x.summary || {}; const c = x.counts || {};
      const subj = Object.entries(sm.bySubject || {}).map(([k, v]) => k + ' ' + Math.round((v.correct / v.total) * 100) + '%').join(' | ');
      return [new Date(x.startedAt).toISOString().slice(0, 10), hhmm(x.startedAt), hhmm(x.finishedAt || x.startedAt), (x.style || '').toUpperCase(), x.completed === false ? 'no' : 'yes', x.minutes, x.blocksTotal ? `${x.blocksDone}/${x.blocksTotal}` : '', x.answers, c.correct != null ? c.correct : '', c.partial != null ? c.partial : '', c.wrong != null ? c.wrong : '', c.skipped != null ? c.skipped : '', Math.round((sm.accuracy || 0) * 100), sm.bestStreak != null ? sm.bestStreak : '', sm.hints ? sm.hints.used : '', x.lessons != null ? x.lessons : '', sm.stretchWins != null ? sm.stretchWins : '', sum(x.writing || [], (w) => w.words), (x.interview || []).length, subj, x.token ? 'yes' : x.bonus ? 'bonus star' : 'no', x.tokenMinutes || ''].map(cell).join(',');
    });
    return head.join(',') + '\n' + rows.join('\n') + (rows.length ? '\n' : '');
  }

  function checkBadges(progress, session, summary) {
    const have = new Set(progress.badges.map((b) => b.id));
    const earned = [];
    const award = (id) => { if (!have.has(id)) { earned.push(id); have.add(id); } };
    const sessions = progress.sessions.filter((x) => x.completed !== false).length;
    if (sessions >= 1) award('first-session');
    if (sessions >= 5) award('five-sessions');
    if (sessions >= 10) award('ten-sessions');
    if (summary && summary.bestStreak >= 3) award('streak-3');
    if (summary && summary.bestStreak >= 8) award('streak-8');
    if (summary && summary.stretchWins > 0) award('stretch');
    const subjCorrect = (sub) => progress.sessions.reduce((n, s) => n + (s.summary && s.summary.bySubject[sub] ? Math.floor(s.summary.bySubject[sub].correct) : 0), 0);
    if (subjCorrect('maths') >= 50) award('maths-50');
    if (subjCorrect('vr') >= 50) award('vr-50');
    if (subjCorrect('nvr') >= 30) award('nvr-30');
    if ((progress.writing || []).some((w) => w.metrics && w.metrics.words >= 300)) award('writer-300');
    if ((progress.interview || []).length >= 10) award('interview-10');
    const ov = overview(progress);
    if (Object.values(ov).every((o) => o.attempts > 0 && o.score >= 60)) award('all-rounder');
    if (Object.values(progress.mastery).some((m) => m.attempts >= 6 && m.score >= 60 && m.low && m.low < 40)) award('comeback');
    const weeks = new Set(progress.sessions.filter((x) => x.completed !== false).map((s) => weekKey(s.finishedAt || s.startedAt)));
    if (weeks.size >= 4) { const sorted = [...weeks].sort(); let run = 1, bestRun = 1; for (let i = 1; i < sorted.length; i++) { run = consecutiveWeeks(sorted[i - 1], sorted[i]) ? run + 1 : 1; bestRun = Math.max(bestRun, run); } if (bestRun >= 4) award('weekly-4'); }
    if (session && (session.answers || []).filter((a) => a.format === 'mc' && a.result === 'correct' && a.seconds <= 45).length >= 10) award('speedster');
    earned.forEach((id) => progress.badges.push({ id, at: Date.now() }));
    return earned.map((id) => D.BADGES.find((b) => b.id === id));
  }

  function consecutiveWeeks(a, b) {
    const [ya, wa] = a.split('-W').map(Number), [yb, wb] = b.split('-W').map(Number);
    return (ya === yb && wb === wa + 1) || (yb === ya + 1 && wb === 1 && wa >= 52);
  }

  // Suggest what to focus on next, from the weakest attempted skills.
  function focusSuggestions(progress, n) {
    return Object.entries(progress.mastery).filter(([, m]) => m.attempts >= 2).sort((a, b) => a[1].score - b[1].score).slice(0, n || 3).map(([id, m]) => ({ id, label: (D.SKILLS.find((s) => s.id === id) || {}).label, score: Math.round(m.score) }));
  }

  function weeksUntil(dateStr, now) {
    const diff = new Date(dateStr) - (now || Date.now());
    return Math.max(0, Math.ceil(diff / (7 * 86400000)));
  }

  return {
    SESSION_MINUTES, HINT_BONUS_MINUTES, START_SCORE, SKILLS_BY_SUBJECT, TEMPLATES,
    lessonFor, hintFor, sessionPhase, hintBonusEarned, availableTokens,
    skillState, levelFor, expected, recordAnswer, subjectScore, overview,
    pickStyle, composeSession, chooseSkill, chooseLevel, nextQuizQuestion, choosePassage, passageQuestions, chooseInterviewQuestion, chooseWritingPrompt,
    normalise, parseNumber, grade, isSimplest,
    analyseWriting, analyseInterview,
    weekKey, tokensThisWeek, tokenDecision, summarise, checkBadges, focusSuggestions, weeksUntil,
    buildSessionRecord, engagementStats, sessionLogCsv
  };
});
