/*
 * Brain Bridge — procedural question generators.
 *
 * Every generator takes (level 1..3, rng) and returns a question:
 *   { id, skill, level, format: 'typed'|'mc', prompt, visual?, options?, answer,
 *     accept?, numeric?, unit?, distractors?, explain, hint?, seconds }
 * Typed questions carry `distractors` so toMC() can turn them into multiple
 * choice for QEH-style sessions. Non-verbal questions are always multiple choice
 * and their options are inline SVG strings.
 *
 * All randomness goes through the seeded rng so tests are repeatable.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./data.js'));
  } else {
    root.BBGen = factory(root.BBData);
  }
})(typeof self !== 'undefined' ? self : this, function (D) {
  'use strict';

  /* ---------------------------- random ------------------------------ */

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function makeRng(seed) {
    const next = mulberry32(seed == null ? Math.floor(Math.random() * 2 ** 31) : seed);
    const rng = {
      next,
      int: (min, max) => min + Math.floor(next() * (max - min + 1)),
      pick: (arr) => arr[Math.floor(next() * arr.length)],
      chance: (p) => next() < p,
      shuffle: (arr) => {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(next() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
      },
      sample: (arr, n) => rng.shuffle(arr).slice(0, n)
    };
    return rng;
  }

  /* ---------------------------- helpers ----------------------------- */

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  const lcm = (a, b) => (a * b) / gcd(a, b);
  const isPrime = (n) => {
    if (n < 2) return false;
    for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
    return true;
  };
  const fmt = (n) => (Number.isInteger(n) ? String(n) : String(+n.toFixed(2)));
  const money = (p) => (p % 100 === 0 ? '£' + p / 100 : '£' + (p / 100).toFixed(2));
  const pad2 = (n) => (n < 10 ? '0' : '') + n;
  const clock = (mins) => pad2(Math.floor(mins / 60) % 24) + ':' + pad2(mins % 60);
  const frac = (n, d) => {
    const g = gcd(n, d);
    return [n / g, d / g];
  };
  const fracVal = (s) => { const m = String(s).match(/^(\d+)\/(\d+)$/); return m ? +m[1] / +m[2] : +s; };
  const fracStr = (n, d) => {
    const [a, b] = frac(n, d);
    return b === 1 ? String(a) : a + '/' + b;
  };
  const ordinal = (n) => n + (['th', 'st', 'nd', 'rd'][(n % 100 >> 3 ^ 1 && n % 10) || 0] || 'th');
  let counter = 0;
  const uid = (p) => p + '-' + (++counter).toString(36) + '-' + Math.floor(Math.random() * 1e6).toString(36);

  function q(skill, level, body) {
    return Object.assign({ id: uid(skill), skill, level, format: 'typed', numeric: false, seconds: 45 }, body);
  }

  // Numeric distractors that are not equal to the answer.
  function nearby(answer, rng, extra) {
    const set = new Set();
    const cands = (extra || []).concat([answer + 1, answer - 1, answer + 10, answer - 10, answer * 2, Math.round(answer / 2), answer + 2, answer - 2, answer + 5, answer - 5]);
    for (const c of cands) {
      if (Number.isFinite(c) && c !== answer && (c >= 0 || answer < 0) && set.size < 6) set.add(+c.toFixed(2));
    }
    return rng.shuffle([...set]).slice(0, 3);
  }

  /* ---------------------------- MATHS ------------------------------- */

  function genArith(level, rng) {
    const kind = rng.pick(level === 1 ? ['add', 'sub', 'mul', 'div'] : level === 2 ? ['add', 'sub', 'mul', 'div', 'missing'] : ['mul2', 'div2', 'dec', 'neg', 'missing']);
    let a, b, ans, prompt, explain;
    switch (kind) {
      case 'add':
        a = rng.int(level === 1 ? 23 : 234, level === 1 ? 487 : 4876); b = rng.int(level === 1 ? 18 : 145, level === 1 ? 398 : 3789); ans = a + b;
        prompt = `${a} + ${b} = ?`; explain = `Add the units, then the tens, then the hundreds. ${a} + ${b} = ${ans}.`; break;
      case 'sub':
        a = rng.int(level === 1 ? 120 : 1200, level === 1 ? 900 : 9000); b = rng.int(level === 1 ? 17 : 170, a - 1); ans = a - b;
        prompt = `${a} − ${b} = ?`; explain = `Count up from ${b} to ${a}, or subtract column by column: ${ans}.`; break;
      case 'mul':
        if (level === 1) { a = rng.int(3, 12); b = rng.int(3, 12); } else { a = rng.int(13, 99); b = rng.int(3, 9); }
        ans = a * b; prompt = `${a} × ${b} = ?`;
        explain = level === 1 ? `Times tables: ${a} × ${b} = ${ans}.` : `Split it: ${Math.floor(a / 10) * 10} × ${b} = ${Math.floor(a / 10) * 10 * b} and ${a % 10} × ${b} = ${(a % 10) * b}. Add them: ${ans}.`; break;
      case 'div':
        if (level === 1) { b = rng.int(3, 12); ans = rng.int(3, 12); } else { b = rng.int(3, 9); ans = rng.int(14, 99); }
        a = b * ans; prompt = `${a} ÷ ${b} = ?`; explain = `${b} × ${ans} = ${a}, so ${a} ÷ ${b} = ${ans}.`; break;
      case 'missing':
        b = rng.int(3, 12); ans = rng.int(4, 15); a = b * ans;
        prompt = `? × ${b} = ${a}`; explain = `Work backwards: ${a} ÷ ${b} = ${ans}.`; break;
      case 'mul2':
        a = rng.int(12, 49); b = rng.int(12, 39); ans = a * b; prompt = `${a} × ${b} = ?`;
        explain = `Grid method: ${a} × ${Math.floor(b / 10) * 10} = ${a * Math.floor(b / 10) * 10}, ${a} × ${b % 10} = ${a * (b % 10)}. Total ${ans}.`; break;
      case 'div2':
        b = rng.int(11, 25); ans = rng.int(12, 48); a = b * ans; prompt = `${a} ÷ ${b} = ?`;
        explain = `${b} × ${ans} = ${a}. Try ${b} × 10 = ${b * 10} first, then build up.`; break;
      case 'dec': {
        a = rng.int(12, 98) / 10; b = rng.int(15, 99) / 10; const add = rng.chance(0.5);
        ans = add ? +(a + b).toFixed(1) : +(Math.max(a, b) - Math.min(a, b)).toFixed(1);
        prompt = add ? `${a} + ${b} = ?` : `${Math.max(a, b)} − ${Math.min(a, b)} = ?`;
        explain = `Line up the decimal points, then ${add ? 'add' : 'subtract'} as normal: ${ans}.`; break;
      }
      case 'neg': {
        a = rng.int(-12, 8); b = rng.int(2, 15); const add = rng.chance(0.5);
        ans = add ? a + b : a - b; prompt = `${a < 0 ? '(' + a + ')' : a} ${add ? '+' : '−'} ${b} = ?`;
        explain = `Use a number line. Start at ${a} and move ${b} ${add ? 'up' : 'down'}: ${ans}.`; break;
      }
    }
    return q('m.arith', level, { prompt, answer: ans, numeric: true, distractors: nearby(ans, rng), explain, seconds: level === 3 ? 60 : 35 });
  }

  function genBidmas(level, rng) {
    let prompt, ans, explain;
    if (level === 1) {
      const a = rng.int(2, 9), b = rng.int(2, 9), c = rng.int(2, 9);
      ans = a + b * c; prompt = `${a} + ${b} × ${c} = ?`;
      explain = `Multiply before you add: ${b} × ${c} = ${b * c}, then ${a} + ${b * c} = ${ans}. (A common slip is ${(a + b) * c}.)`;
      return q('m.bidmas', level, { prompt, answer: ans, numeric: true, distractors: nearby(ans, rng, [(a + b) * c]), explain, hint: 'BIDMAS: Brackets, Indices, Division and Multiplication, Addition and Subtraction.' });
    }
    if (level === 2) {
      const a = rng.int(2, 9), b = rng.int(2, 9), c = rng.int(2, 6), d = rng.int(1, 9);
      if (rng.chance(0.5)) { ans = (a + b) * c - d; prompt = `(${a} + ${b}) × ${c} − ${d} = ?`; explain = `Brackets first: ${a + b}. Then × ${c} = ${(a + b) * c}. Then − ${d} = ${ans}.`; }
      else { ans = a * a + b; prompt = `${a}² + ${b} = ?`; explain = `${a}² means ${a} × ${a} = ${a * a}. Add ${b}: ${ans}.`; }
      return q('m.bidmas', level, { prompt, answer: ans, numeric: true, distractors: nearby(ans, rng, [a * 2 + b, a + b * c - d]), explain });
    }
    const a = rng.int(5, 9), b = rng.int(2, 4), c = rng.int(2, 3), d = rng.int(2, 4);
    const inner = a - b; ans = (inner * inner) * d + c;
    prompt = `(${a} − ${b})² × ${d} + ${c} = ?`;
    explain = `Brackets: ${inner}. Indices: ${inner}² = ${inner * inner}. Multiply: × ${d} = ${inner * inner * d}. Add ${c}: ${ans}.`;
    return q('m.bidmas', level, { prompt, answer: ans, numeric: true, distractors: nearby(ans, rng, [inner * 2 * d + c, inner * inner * (d + c)]), explain, seconds: 60 });
  }

  function genFractions(level, rng) {
    const kind = rng.pick(level === 1 ? ['of', 'equiv', 'simplify'] : level === 2 ? ['add-related', 'mixed', 'compare', 'of2'] : ['add-diff', 'mult', 'of2', 'order']);
    switch (kind) {
      case 'of': { const d = rng.pick([2, 3, 4, 5, 10]); const ans = rng.int(3, 12); const amount = ans * d;
        return q('m.fractions', level, { prompt: `What is 1/${d} of ${amount}?`, answer: ans, numeric: true, distractors: nearby(ans, rng, [amount - d, amount * d]), explain: `Divide by the bottom number: ${amount} ÷ ${d} = ${ans}.` }); }
      case 'equiv': { const n = rng.int(1, 4), d = rng.int(n + 1, 6), k = rng.int(2, 5);
        return q('m.fractions', level, { prompt: `${n}/${d} = ?/${d * k}. What is the missing number?`, answer: n * k, numeric: true, distractors: nearby(n * k, rng, [n + k, d * k - n]), explain: `The bottom was multiplied by ${k}, so multiply the top by ${k} too: ${n * k}.` }); }
      case 'simplify': { const [n0, d0] = rng.pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5], [1, 6], [5, 6]]); const k = rng.int(2, 6);
        return q('m.fractions', level, { prompt: `Write ${n0 * k}/${d0 * k} in its simplest form.`, answer: `${n0}/${d0}`, fraction: true, requireSimplest: true, distractors: [`${n0 * k}/${d0 * k}`, `${n0}/${d0 + 1}`, `${n0 + 1}/${d0 * k}`], explain: `Divide top and bottom by ${k}: ${n0}/${d0}.`, hint: 'Find the biggest number that divides into both the top and the bottom.' }); }
      case 'add-related': { const d = rng.pick([4, 6, 8, 10, 12]); const small = d / 2; const n1 = rng.int(1, small - 1), n2 = rng.int(1, d - 1); const tot = n1 * 2 + n2; const ans = fracStr(tot, d);
        return q('m.fractions', level, { prompt: `${n1}/${small} + ${n2}/${d} = ? (give your answer in its simplest form)`, answer: ans, fraction: true, requireSimplest: true, distractors: [`${n1 + n2}/${small + d}`, `${n1 + n2}/${d}`, fracStr(tot + 1, d)].filter((x) => x !== ans), explain: `Change ${n1}/${small} into ${n1 * 2}/${d}. Then ${n1 * 2}/${d} + ${n2}/${d} = ${tot}/${d} = ${ans}.` }); }
      case 'mixed': { const w = rng.int(1, 4), d = rng.int(2, 6), n = rng.int(1, d - 1); const imp = w * d + n;
        return rng.chance(0.5)
          ? q('m.fractions', level, { prompt: `Write ${w} ${n}/${d} as an improper fraction.`, answer: `${imp}/${d}`, fraction: true, distractors: [`${w + n}/${d}`, `${imp}/${d + 1}`, `${w * n}/${d}`], explain: `${w} wholes = ${w * d}/${d}. Add ${n}/${d}: ${imp}/${d}.` })
          : q('m.fractions', level, { prompt: `Write ${imp}/${d} as a mixed number (for example 2 1/3).`, answer: `${w} ${n}/${d}`, fraction: true, distractors: [`${w + 1} ${n}/${d}`, `${w} ${n}/${d + 1}`, `${n} ${w}/${d}`], explain: `${d} goes into ${imp} ${w} times with ${n} left over: ${w} ${n}/${d}.` }); }
      case 'compare': { const pairs = [[['2/3', 2 / 3], ['3/5', 0.6]], [['3/4', 0.75], ['7/10', 0.7]], [['5/8', 0.625], ['2/3', 2 / 3]], [['4/5', 0.8], ['5/6', 5 / 6]], [['1/3', 1 / 3], ['3/8', 0.375]]]; const pr = rng.pick(pairs); const big = pr[0][1] > pr[1][1] ? pr[0][0] : pr[1][0];
        return q('m.fractions', level, { prompt: `Which is larger: ${pr[0][0]} or ${pr[1][0]}?`, answer: big, accept: [big], distractors: [pr[0][0] === big ? pr[1][0] : pr[0][0]], explain: `Change both to the same denominator or to decimals: ${pr[0][0]} ≈ ${pr[0][1].toFixed(2)}, ${pr[1][0]} ≈ ${pr[1][1].toFixed(2)}. ${big} is larger.`, format: 'mc' }); }
      case 'of2': { const d = rng.pick([3, 4, 5, 6, 8]); let n = rng.int(2, d - 1); while (gcd(n, d) !== 1) n = rng.int(2, d - 1); const unit = rng.int(4, 12); const amount = unit * d; const ans = unit * n;
        return q('m.fractions', level, { prompt: `What is ${n}/${d} of ${amount}?`, answer: ans, numeric: true, distractors: nearby(ans, rng, [unit, amount - unit]), explain: `Divide by ${d} to find one part (${unit}), then multiply by ${n}: ${ans}.` }); }
      case 'add-diff': { const [d1, d2] = rng.pick([[3, 4], [2, 5], [3, 5], [4, 6], [2, 7], [3, 8]]); const n1 = rng.int(1, d1 - 1), n2 = rng.int(1, d2 - 1); const L = lcm(d1, d2); const tot = n1 * (L / d1) + n2 * (L / d2); const ans = fracStr(tot, L);
        return q('m.fractions', level, { prompt: `${n1}/${d1} + ${n2}/${d2} = ? (simplest form; use a mixed number if it is more than 1)`, answer: ans, fraction: true, requireSimplest: true, distractors: [`${n1 + n2}/${d1 + d2}`, `${n1 + n2}/${L}`, fracStr(tot + 1, L)].filter((x) => x !== ans), explain: `Common denominator ${L}: ${n1 * (L / d1)}/${L} + ${n2 * (L / d2)}/${L} = ${tot}/${L} = ${ans}.`, seconds: 70 }); }
      case 'mult': { const d = rng.pick([3, 4, 5, 6, 8]); const n = rng.int(1, d - 1); const k = rng.int(2, 9); const ans = fracStr(n * k, d);
        return q('m.fractions', level, { prompt: `${n}/${d} × ${k} = ? (simplest form; mixed number if more than 1)`, answer: ans, fraction: true, requireSimplest: true, distractors: [`${n * k}/${d * k}`, `${n}/${d * k}`, fracStr(n * k + 1, d)].filter((x) => x !== ans), explain: `Multiply the top only: ${n * k}/${d} = ${ans}.` }); }
      default: { const set = rng.sample(['1/2', '3/4', '2/5', '7/10', '1/4', '3/5'], 3); const sorted = set.slice().sort((x, y) => fracVal(x) - fracVal(y));
        return q('m.fractions', level, { prompt: `Put these in order, smallest first: ${set.join(', ')}`, answer: sorted.join(', '), accept: [sorted.join(', '), sorted.join(' '), sorted.join(',')], distractors: [sorted.slice().reverse().join(', '), set.join(', ')].filter((x) => x !== sorted.join(', ')), explain: `Convert to decimals or twentieths: ${sorted.map((f) => f + ' = ' + fracVal(f).toFixed(2)).join(', ')}.`, format: 'mc', seconds: 60 }); }
    }
  }

  function genDecimals(level, rng) {
    const kind = rng.pick(level === 1 ? ['pct-easy', 'convert', 'order'] : level === 2 ? ['pct', 'x10', 'round', 'convert2'] : ['pct-change', 'find-pct', 'dec-mult', 'pct']);
    switch (kind) {
      case 'pct-easy': { const p = rng.pick([50, 25, 10, 20]); const base = rng.pick([40, 60, 80, 120, 200, 300, 500]); const ans = (base * p) / 100;
        return q('m.decimals', level, { prompt: `What is ${p}% of ${base}?`, answer: ans, numeric: true, distractors: nearby(ans, rng, [base - ans, ans * 2]), explain: `${p}% is ${p === 50 ? 'a half' : p === 25 ? 'a quarter' : p === 10 ? 'a tenth' : 'a fifth'}: ${base} ÷ ${100 / p} = ${ans}.` }); }
      case 'convert': { const items = [['0.5', '1/2', '50%'], ['0.25', '1/4', '25%'], ['0.75', '3/4', '75%'], ['0.1', '1/10', '10%'], ['0.2', '1/5', '20%'], ['0.4', '2/5', '40%']]; const it = rng.pick(items); const from = rng.int(0, 2); let to = rng.int(0, 2); if (to === from) to = (to + 1) % 3; const names = ['decimal', 'fraction', 'percentage'];
        return q('m.decimals', level, { prompt: `Write ${it[from]} as a ${names[to]}.`, answer: it[to], fraction: to === 1, accept: [it[to]], distractors: items.filter((x) => x !== it).map((x) => x[to]).slice(0, 3), explain: `${it[0]} = ${it[1]} = ${it[2]}.` }); }
      case 'order': { const set = rng.sample([0.5, 0.45, 0.405, 0.54, 0.4, 0.55, 0.505], 3); const sorted = set.slice().sort((a, b) => a - b);
        return q('m.decimals', level, { prompt: `Put these in order, smallest first: ${set.join(', ')}`, answer: sorted.join(', '), accept: [sorted.join(', '), sorted.join(' '), sorted.join(',')], distractors: [sorted.slice().reverse().join(', '), set.join(', ')].filter((x) => x !== sorted.join(', ')), explain: `Compare the tenths first, then the hundredths: ${sorted.join(' < ')}.`, format: 'mc' }); }
      case 'pct': { const p = rng.pick([15, 30, 35, 45, 60, 70, 5, 12.5]); const base = rng.pick([40, 80, 120, 160, 200, 240, 400]); const ans = +((base * p) / 100).toFixed(2);
        return q('m.decimals', level, { prompt: `What is ${p}% of ${base}?`, answer: ans, numeric: true, distractors: nearby(ans, rng, [base / 10, base - ans]), explain: `10% of ${base} is ${base / 10}, so 5% is ${base / 20}. Build up ${p}%: ${ans}.` }); }
      case 'x10': { const n = rng.int(12, 987) / 100; const k = rng.pick([10, 100]); const mul = rng.chance(0.5); const ans = +(mul ? n * k : n / k).toFixed(4);
        return q('m.decimals', level, { prompt: `${n} ${mul ? '×' : '÷'} ${k} = ?`, answer: ans, numeric: true, distractors: nearby(ans, rng, [+(mul ? n / k : n * k).toFixed(4), +(mul ? n * 10 : n / 10).toFixed(4)]), explain: `${mul ? 'Multiplying' : 'Dividing'} by ${k} moves every digit ${k === 10 ? 'one place' : 'two places'} ${mul ? 'left' : 'right'}: ${ans}.` }); }
      case 'round': { const n = rng.int(1000, 9999) / 100; const dp = rng.pick([0, 1]); const ans = +n.toFixed(dp);
        return q('m.decimals', level, { prompt: `Round ${n} to ${dp === 0 ? 'the nearest whole number' : 'one decimal place'}.`, answer: ans, numeric: true, distractors: nearby(ans, rng, [Math.floor(n), Math.ceil(n), +(n + 0.1).toFixed(dp)]), explain: `Look at the next digit: if it is 5 or more, round up. ${n} → ${ans}.` }); }
      case 'convert2': { const items = [['0.3', '3/10', '30%'], ['0.6', '3/5', '60%'], ['0.35', '7/20', '35%'], ['0.125', '1/8', '12.5%'], ['0.8', '4/5', '80%'], ['0.05', '1/20', '5%'], ['0.9', '9/10', '90%']]; const it = rng.pick(items); const from = rng.int(0, 2); let to = rng.int(0, 2); if (to === from) to = (to + 1) % 3; const names = ['decimal', 'fraction', 'percentage'];
        return q('m.decimals', level, { prompt: `Write ${it[from]} as a ${names[to]}.`, answer: it[to], fraction: to === 1, accept: [it[to]], distractors: items.filter((x) => x !== it).map((x) => x[to]).slice(0, 3), explain: `${it[0]} = ${it[1]} = ${it[2]}.` }); }
      case 'pct-change': { const base = rng.pick([40, 60, 80, 120, 150, 200, 250]); const p = rng.pick([10, 20, 25, 50, 5, 15]); const up = rng.chance(0.5); const ans = up ? base + (base * p) / 100 : base - (base * p) / 100;
        return q('m.decimals', level, { prompt: up ? `A coat costs £${base}. The price goes UP by ${p}%. What is the new price in pounds?` : `A coat costs £${base}. In a sale it is reduced by ${p}%. What is the sale price in pounds?`, answer: ans, numeric: true, unit: '£', distractors: nearby(ans, rng, [(base * p) / 100, up ? base - (base * p) / 100 : base + (base * p) / 100]), explain: `${p}% of ${base} is ${(base * p) / 100}. ${up ? 'Add' : 'Subtract'} it: £${ans}.`, seconds: 60 }); }
      case 'find-pct': { const d = rng.pick([20, 25, 40, 50, 80]); const n = rng.pick([1, 2, 3, 4].map((k) => (d * k) / 5).filter((x) => Number.isInteger(x) && x < d)); const ans = (n / d) * 100;
        return q('m.decimals', level, { prompt: `Sam scored ${n} out of ${d} in a test. What percentage is that?`, answer: ans, numeric: true, unit: '%', distractors: nearby(ans, rng, [n, d - n, 100 - ans]), explain: `${n}/${d} = ${n * (100 / d)}/100 = ${ans}%.` }); }
      default: { const a = rng.int(11, 89) / 10; const k = rng.int(3, 9); const ans = +(a * k).toFixed(1);
        return q('m.decimals', level, { prompt: `${a} × ${k} = ?`, answer: ans, numeric: true, distractors: nearby(ans, rng, [+(a * k * 10).toFixed(1), +(a * k / 10).toFixed(2)]), explain: `Do ${a * 10} × ${k} = ${a * 10 * k}, then divide by 10: ${ans}.` }); }
    }
  }

  function genRatio(level, rng) {
    if (level === 1) { const [r1, r2] = rng.pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4]]); const unit = rng.int(2, 9); const total = unit * (r1 + r2); const who = rng.chance(0.5);
      return q('m.ratio', level, { prompt: `Amy and Ben share £${total} in the ratio ${r1}:${r2}. How much does ${who ? 'Amy' : 'Ben'} get, in pounds?`, answer: who ? unit * r1 : unit * r2, numeric: true, unit: '£', distractors: nearby(who ? unit * r1 : unit * r2, rng, [unit, who ? unit * r2 : unit * r1]), explain: `${r1} + ${r2} = ${r1 + r2} parts. One part is £${total} ÷ ${r1 + r2} = £${unit}. ${who ? 'Amy' : 'Ben'} gets ${who ? r1 : r2} parts: £${who ? unit * r1 : unit * r2}.` }); }
    if (level === 2) {
      if (rng.chance(0.5)) { const eggs = rng.pick([2, 3, 4]); const people = rng.pick([4, 6]); const k = rng.pick([2, 3, 5]); const ans = eggs * k;
        return q('m.ratio', level, { prompt: `A recipe for ${people} people uses ${eggs} eggs. How many eggs are needed for ${people * k} people?`, answer: ans, numeric: true, distractors: nearby(ans, rng, [eggs + k, people * k]), explain: `${people * k} is ${k} times ${people}, so multiply the eggs by ${k}: ${ans}.` }); }
      const [r1, r2] = rng.pick([[2, 3], [3, 5], [2, 5], [3, 4], [4, 5]]); const unit = rng.int(2, 8); const first = unit * r1;
      return q('m.ratio', level, { prompt: `Red and blue counters are in the ratio ${r1}:${r2}. There are ${first} red counters. How many blue counters are there?`, answer: unit * r2, numeric: true, distractors: nearby(unit * r2, rng, [first + (r2 - r1), unit * (r1 + r2)]), explain: `${first} ÷ ${r1} = ${unit}, so one part is ${unit}. Blue = ${r2} × ${unit} = ${unit * r2}.` });
    }
    if (rng.chance(0.5)) { const [r1, r2, r3] = rng.pick([[1, 2, 3], [2, 3, 5], [1, 3, 4], [2, 2, 5]]); const unit = rng.int(2, 9); const total = unit * (r1 + r2 + r3);
      return q('m.ratio', level, { prompt: `£${total} is shared between three people in the ratio ${r1}:${r2}:${r3}. How much is the largest share, in pounds?`, answer: unit * r3, numeric: true, unit: '£', distractors: nearby(unit * r3, rng, [unit, unit * r2, unit * r1]), explain: `${r1 + r2 + r3} parts in total. One part = £${unit}. Largest share = ${r3} × ${unit} = £${unit * r3}.`, seconds: 60 }); }
    const n = rng.pick([3, 4, 5, 6]); const cost = n * rng.int(30, 120); const want = rng.pick([7, 8, 9, 10, 12].filter((x) => x !== n)); const ans = (cost / n) * want;
    return q('m.ratio', level, { prompt: `${n} identical notebooks cost ${money(cost)}. How much do ${want} notebooks cost? (Give your answer in pounds, e.g. 4.50)`, answer: ans / 100, numeric: true, unit: '£', distractors: nearby(ans / 100, rng, [cost / 100, (cost / n) / 100]), explain: `One notebook costs ${money(cost / n)}. ${want} × ${money(cost / n)} = ${money(ans)}.`, seconds: 60 });
  }

  function genNumber(level, rng) {
    const kind = rng.pick(level === 1 ? ['prime?', 'factors', 'multiple'] : level === 2 ? ['hcf', 'lcm', 'square', 'cube'] : ['primes-between', 'hcf2', 'sqrt', 'negorder']);
    switch (kind) {
      case 'prime?': { const n = rng.int(2, 40);
        return q('m.number', level, { prompt: `Is ${n} a prime number?`, format: 'mc', options: ['Yes', 'No'], answer: isPrime(n) ? 0 : 1, explain: isPrime(n) ? `${n} has only two factors: 1 and itself.` : `${n} can be divided by ${[2, 3, 5, 7].find((p) => n % p === 0 && p !== n) || 'another number'}, so it is not prime.`, seconds: 25 }); }
      case 'factors': { const n = rng.pick([12, 18, 20, 24, 28, 30, 36, 40]); const fs = []; for (let i = 1; i <= n; i++) if (n % i === 0) fs.push(i);
        return q('m.number', level, { prompt: `How many factors does ${n} have? (Count 1 and ${n} too.)`, answer: fs.length, numeric: true, distractors: nearby(fs.length, rng), explain: `Factors of ${n}: ${fs.join(', ')}. That is ${fs.length} factors.`, hint: 'Work in pairs: 1 and the number, 2 and half, and so on.' }); }
      case 'multiple': { const n = rng.int(6, 12); const k = rng.int(4, 9);
        return q('m.number', level, { prompt: `What is the ${ordinal(k)} multiple of ${n}?`, answer: n * k, numeric: true, distractors: nearby(n * k, rng, [n * (k + 1), n * (k - 1), n + k]), explain: `${n} × ${k} = ${n * k}.` }); }
      case 'hcf': { const g = rng.pick([4, 6, 8, 9, 12]); const a = g * rng.int(2, 5); let b = g * rng.int(2, 7); while (b === a) b = g * rng.int(2, 7); const ans = gcd(a, b);
        return q('m.number', level, { prompt: `What is the highest common factor (HCF) of ${a} and ${b}?`, answer: ans, numeric: true, distractors: nearby(ans, rng, [lcm(a, b), 2, Math.min(a, b)]), explain: `List the factors of each number; the biggest one they share is ${ans}.` }); }
      case 'lcm': { const a = rng.pick([4, 6, 8, 9, 10, 12]); let b = rng.pick([3, 5, 6, 8, 9, 15]); const ans = lcm(a, b);
        return q('m.number', level, { prompt: `What is the lowest common multiple (LCM) of ${a} and ${b}?`, answer: ans, numeric: true, distractors: nearby(ans, rng, [a * b, gcd(a, b), a + b]), explain: `Multiples of ${a}: ${a}, ${a * 2}, ${a * 3}... The first that is also a multiple of ${b} is ${ans}.` }); }
      case 'square': { const n = rng.int(4, 15);
        return q('m.number', level, { prompt: `What is ${n}² (${n} squared)?`, answer: n * n, numeric: true, distractors: nearby(n * n, rng, [n * 2, n * n + n]), explain: `${n} × ${n} = ${n * n}.`, seconds: 25 }); }
      case 'cube': { const n = rng.int(2, 6);
        return q('m.number', level, { prompt: `What is ${n}³ (${n} cubed)?`, answer: n ** 3, numeric: true, distractors: nearby(n ** 3, rng, [n * 3, n * n]), explain: `${n} × ${n} × ${n} = ${n ** 3}.`, seconds: 25 }); }
      case 'primes-between': { const lo = rng.pick([10, 20, 30, 40, 50]); const hi = lo + 20; const ps = []; for (let i = lo; i <= hi; i++) if (isPrime(i)) ps.push(i);
        return q('m.number', level, { prompt: `How many prime numbers are there between ${lo} and ${hi}?`, answer: ps.length, numeric: true, distractors: nearby(ps.length, rng), explain: `They are ${ps.join(', ')}: ${ps.length} primes.`, seconds: 70 }); }
      case 'hcf2': { const g = rng.pick([6, 7, 8, 9, 12, 15]); const a = g * rng.int(3, 7); let b = g * rng.int(3, 9); while (b === a) b = g * rng.int(3, 9); const ans = gcd(a, b);
        return q('m.number', level, { prompt: `Find the highest common factor of ${a} and ${b}.`, answer: ans, numeric: true, distractors: nearby(ans, rng, [Math.min(a, b), 3, ans * 2]), explain: `${a} = ${ans} × ${a / ans} and ${b} = ${ans} × ${b / ans}. The HCF is ${ans}.`, seconds: 60 }); }
      case 'sqrt': { const n = rng.int(5, 15);
        return q('m.number', level, { prompt: `What is the square root of ${n * n}?`, answer: n, numeric: true, distractors: nearby(n, rng, [n * n / 2, n + 1]), explain: `${n} × ${n} = ${n * n}, so the square root is ${n}.`, seconds: 25 }); }
      default: { const set = rng.sample([-7, -3, 0, 2, -1, 5, -12, 4], 4); const sorted = set.slice().sort((a, b) => a - b);
        return q('m.number', level, { prompt: `Put these in order, smallest first: ${set.join(', ')}`, answer: sorted.join(', '), accept: [sorted.join(', '), sorted.join(' '), sorted.join(',')], distractors: [sorted.slice().reverse().join(', '), set.join(', ')].filter((x) => x !== sorted.join(', ')), explain: `Negative numbers are smaller the further they are from zero: ${sorted.join(' < ')}.`, format: 'mc' }); }
    }
  }

  function genAlgebra(level, rng) {
    if (level === 1) {
      if (rng.chance(0.5)) { const inp = rng.int(2, 12), m = rng.int(2, 6), c = rng.int(1, 9); const ans = inp * m + c;
        return q('m.algebra', level, { prompt: `A function machine multiplies by ${m} and then adds ${c}. What comes out when ${inp} goes in?`, answer: ans, numeric: true, distractors: nearby(ans, rng, [(inp + c) * m, inp * m]), explain: `${inp} × ${m} = ${inp * m}, then + ${c} = ${ans}.` }); }
      const x = rng.int(3, 20), c = rng.int(2, 15);
      return q('m.algebra', level, { prompt: `If x + ${c} = ${x + c}, what is x?`, answer: x, numeric: true, distractors: nearby(x, rng, [x + c + c, x + c]), explain: `Take ${c} from both sides: x = ${x + c} − ${c} = ${x}.` });
    }
    if (level === 2) {
      if (rng.chance(0.5)) { const x = rng.int(2, 12), m = rng.int(2, 6), c = rng.int(1, 9); const r = m * x - c;
        return q('m.algebra', level, { prompt: `Solve: ${m}x − ${c} = ${r}`, answer: x, numeric: true, distractors: nearby(x, rng, [(r + c), r - c]), explain: `Add ${c} to both sides: ${m}x = ${r + c}. Divide by ${m}: x = ${x}.` }); }
      const p = rng.int(2, 9), a = rng.int(2, 5), b = rng.int(1, 9); const ans = a * p + b;
      return q('m.algebra', level, { prompt: `If p = ${p}, what is the value of ${a}p + ${b}?`, answer: ans, numeric: true, distractors: nearby(ans, rng, [a + p + b, a * (p + b)]), explain: `${a}p means ${a} × p = ${a * p}. Add ${b}: ${ans}.` });
    }
    const kind = rng.pick(['bracket', 'express', 'twonum']);
    if (kind === 'bracket') { const x = rng.int(2, 10), m = rng.int(2, 5), c = rng.int(1, 6); const r = m * (x + c);
      return q('m.algebra', level, { prompt: `Solve: ${m}(x + ${c}) = ${r}`, answer: x, numeric: true, distractors: nearby(x, rng, [r / m, r - c]), explain: `Divide both sides by ${m}: x + ${c} = ${r / m}. So x = ${x}.`, seconds: 60 }); }
    if (kind === 'express') { const n = rng.int(2, 5), c = rng.int(1, 9); const opts = [`${n}n + ${c}`, `${n}n − ${c}`, `${n}(n + ${c})`, `n + ${n + c}`];
      return q('m.algebra', level, { prompt: `Which expression means “${c} more than ${n} times a number n”?`, format: 'mc', options: opts, answer: 0, explain: `${n} times n is ${n}n; ${c} more means add ${c}: ${n}n + ${c}.` }); }
    const a = rng.int(5, 20), diff = rng.int(1, 6); const b = a + diff;
    return q('m.algebra', level, { prompt: `Two numbers add up to ${a + b} and differ by ${diff}. What is the larger number?`, answer: b, numeric: true, distractors: nearby(b, rng, [a, (a + b) / 2]), explain: `Take away the difference: ${a + b} − ${diff} = ${a * 2}, halve it to get the smaller number ${a}, then add ${diff}: ${b}.`, seconds: 60 });
  }

  function genSequences(level, rng) {
    if (level === 1) { const start = rng.int(1, 20), step = rng.pick([2, 3, 4, 5, 6, 7, 10, 11]); const terms = [0, 1, 2, 3].map((i) => start + i * step);
      return q('m.sequences', level, { prompt: `What is the next number? ${terms.join(', ')}, ...`, answer: start + 4 * step, numeric: true, distractors: nearby(start + 4 * step, rng, [start + 5 * step, start + 3 * step + 1]), explain: `The sequence goes up by ${step} each time: ${start + 4 * step}.` }); }
    if (level === 2) {
      if (rng.chance(0.5)) { const start = rng.int(2, 9), step = rng.int(3, 9), n = rng.pick([10, 12, 15, 20]); const terms = [0, 1, 2].map((i) => start + i * step);
        return q('m.sequences', level, { prompt: `A sequence starts ${terms.join(', ')}, ... What is the ${ordinal(n)} term?`, answer: start + (n - 1) * step, numeric: true, distractors: nearby(start + (n - 1) * step, rng, [start + n * step, step * n]), explain: `Each term adds ${step}. The ${ordinal(n)} term is ${start} + ${n - 1} × ${step} = ${start + (n - 1) * step}.`, seconds: 60 }); }
      const start = rng.int(20, 60), step = rng.pick([3, 4, 6, 7, 9]); const terms = [0, 1, 2, 3].map((i) => start - i * step);
      return q('m.sequences', level, { prompt: `What is the next number? ${terms.join(', ')}, ...`, answer: start - 4 * step, numeric: true, distractors: nearby(start - 4 * step, rng, [start - 5 * step]), explain: `The sequence goes down by ${step} each time: ${start - 4 * step}.` });
    }
    const kind = rng.pick(['nth', 'double', 'square', 'tri', 'fib']);
    if (kind === 'nth') { const a = rng.int(2, 6), b = rng.int(-3, 6); const terms = [1, 2, 3, 4].map((n) => a * n + b); const show = (x, y) => `${x}n ${y < 0 ? '− ' + -y : y === 0 ? '' : '+ ' + y}`.trim();
      return q('m.sequences', level, { prompt: `Which rule gives the nth term of ${terms.join(', ')}, ...?`, format: 'mc', options: [show(a, b), show(a, b + 1), show(a + 1, b), show(a, b - 1)], answer: 0, explain: `The terms go up by ${a}, so the rule starts ${a}n. Check n = 1: ${a} ${b >= 0 ? '+' : '−'} ${Math.abs(b)} = ${terms[0]}.`, seconds: 70 }); }
    if (kind === 'double') { const start = rng.pick([3, 5, 7, 2]); const terms = [0, 1, 2, 3].map((i) => start * 2 ** i);
      return q('m.sequences', level, { prompt: `What is the next number? ${terms.join(', ')}, ...`, answer: start * 16, numeric: true, distractors: nearby(start * 16, rng, [start * 8 + start * 4]), explain: `Each term doubles: ${start * 8} × 2 = ${start * 16}.` }); }
    if (kind === 'square') { const from = rng.int(1, 4); const terms = [0, 1, 2, 3].map((i) => (from + i) ** 2);
      return q('m.sequences', level, { prompt: `What is the next number? ${terms.join(', ')}, ...`, answer: (from + 4) ** 2, numeric: true, distractors: nearby((from + 4) ** 2, rng, [terms[3] + (terms[3] - terms[2])]), explain: `These are square numbers: ${from}², ${from + 1}²... Next is ${from + 4}² = ${(from + 4) ** 2}.` }); }
    if (kind === 'tri') { const terms = [1, 3, 6, 10, 15];
      return q('m.sequences', level, { prompt: `What is the next number? ${terms.join(', ')}, ...`, answer: 21, numeric: true, distractors: nearby(21, rng, [20, 18]), explain: `Triangular numbers: the gaps grow by one each time (+2, +3, +4, +5), so add 6: 21.` }); }
    const a = rng.int(1, 4), b = rng.int(a, 6); const terms = [a, b]; for (let i = 0; i < 4; i++) terms.push(terms[terms.length - 1] + terms[terms.length - 2]);
    const ans = terms[5] + terms[4];
    return q('m.sequences', level, { prompt: `What is the next number? ${terms.join(', ')}, ...`, answer: ans, numeric: true, distractors: nearby(ans, rng, [terms[5] * 2]), explain: `Each term is the sum of the two before it: ${terms[4]} + ${terms[5]} = ${ans}.` });
  }

  function genMeasure(level, rng) {
    const conv = [
      { from: 'cm', to: 'm', k: 100, l: 1 }, { from: 'm', to: 'cm', k: 1 / 100, l: 1 }, { from: 'mm', to: 'cm', k: 10, l: 1 }, { from: 'g', to: 'kg', k: 1000, l: 1 }, { from: 'ml', to: 'litres', k: 1000, l: 1 },
      { from: 'km', to: 'm', k: 1 / 1000, l: 2 }, { from: 'kg', to: 'g', k: 1 / 1000, l: 2 }, { from: 'm', to: 'mm', k: 1 / 1000, l: 2 }, { from: 'litres', to: 'ml', k: 1 / 1000, l: 2 }
    ].filter((c) => c.l <= level);
    if (level < 3 || rng.chance(0.4)) { const c = rng.pick(conv); let val;
      if (c.k >= 1) val = rng.int(1, 9) * c.k + (level > 1 ? rng.pick([0, c.k / 2, c.k / 4]) : 0); else val = level === 1 ? rng.int(1, 9) : rng.int(10, 95) / 10;
      const ans = +(val * c.k).toFixed(4);
      return q('m.measure', level, { prompt: `Convert ${fmt(val)} ${c.from} into ${c.to}.`, answer: ans, numeric: true, unit: c.to, distractors: nearby(ans, rng, [+(val / c.k).toFixed(4), ans * 10, ans / 10]), explain: `There are ${c.k >= 1 ? c.k + ' ' + c.from + ' in 1 ' + c.to : 1 / c.k + ' ' + c.to + ' in 1 ' + c.from}. ${fmt(val)} ${c.from} = ${fmt(ans)} ${c.to}.` }); }
    if (rng.chance(0.5)) { const miles = rng.pick([5, 10, 15, 20, 25, 50]); const ans = miles * 1.6;
      return q('m.measure', level, { prompt: `5 miles is about 8 km. Roughly how many km is ${miles} miles?`, answer: ans, numeric: true, unit: 'km', distractors: nearby(ans, rng, [miles / 1.6, miles + 3]), explain: `${miles} ÷ 5 = ${miles / 5}, and ${miles / 5} × 8 = ${ans} km.` }); }
    const speed = rng.pick([30, 40, 50, 60, 80]); const hrs = rng.pick([0.5, 1.5, 2, 2.5, 3]); const dist = speed * hrs;
    return rng.chance(0.5)
      ? q('m.measure', level, { prompt: `A car travels at ${speed} km per hour for ${hrs} hours. How far does it go, in km?`, answer: dist, numeric: true, unit: 'km', distractors: nearby(dist, rng, [speed + hrs, speed * (hrs + 1)]), explain: `Distance = speed × time = ${speed} × ${hrs} = ${dist} km.`, seconds: 60 })
      : q('m.measure', level, { prompt: `A train travels ${dist} km in ${hrs} hours. What is its average speed in km per hour?`, answer: speed, numeric: true, unit: 'km/h', distractors: nearby(speed, rng, [dist * hrs, dist - hrs]), explain: `Speed = distance ÷ time = ${dist} ÷ ${hrs} = ${speed} km/h.`, seconds: 60 });
  }

  function genTime(level, rng) {
    if (level === 1) {
      if (rng.chance(0.5)) { const start = rng.int(7, 11) * 60 + rng.pick([0, 15, 30, 45]); const dur = rng.int(1, 3) * 60 + rng.pick([0, 15, 30, 45]) + 15; const end = start + dur;
        return q('m.time', level, { prompt: `A film starts at ${clock(start)} and finishes at ${clock(end)}. How long is it, in minutes?`, answer: dur, numeric: true, unit: 'minutes', distractors: nearby(dur, rng, [dur - 60, dur + 60, dur - 15]), explain: `From ${clock(start)} to ${clock(end)} is ${Math.floor(dur / 60)} hours ${dur % 60} minutes = ${dur} minutes.` }); }
      const h = rng.int(1, 11), m = rng.pick([0, 5, 10, 20, 30, 40, 45, 50]); const pm = rng.chance(0.6); const ans = clock((pm ? h + 12 : h) * 60 + m);
      return q('m.time', level, { prompt: `Write ${h}:${pad2(m)} ${pm ? 'pm' : 'am'} as a 24-hour clock time.`, answer: ans, accept: [ans, ans.replace(':', '.'), ans.replace(':', '')], distractors: [clock(h * 60 + m), clock((h + 12) * 60 + m), clock((h + 10) * 60 + m), clock((h + 1) * 60 + m), `${h}:${pad2(m)}`].filter((x, i, arr) => x !== ans && arr.indexOf(x) === i), explain: pm ? `Afternoon times: add 12 to the hour. ${h} + 12 = ${h + 12}, so ${ans}.` : `Morning times stay the same, written with two digits: ${ans}.`, seconds: 30 });
    }
    if (level === 2) {
      if (rng.chance(0.5)) { const start = rng.int(8, 20) * 60 + rng.pick([5, 10, 20, 25, 35, 40, 50, 55]); const dur = rng.int(25, 110); const end = start + dur;
        return q('m.time', level, { prompt: `A journey starts at ${clock(start)} and takes ${dur} minutes. What time does it end? (24-hour clock, e.g. 14:05)`, answer: clock(end), accept: [clock(end), clock(end).replace(':', '.')], distractors: [clock(end + 10), clock(end - 60), clock(end + 60)], explain: `${clock(start)} + ${Math.floor(dur / 60) ? Math.floor(dur / 60) + ' hour ' : ''}${dur % 60} minutes = ${clock(end)}. Jump to the next hour first, then add the rest.`, seconds: 50 }); }
      const secs = rng.pick([90, 150, 200, 240, 330, 420]);
      return q('m.time', level, { prompt: `How many minutes and seconds is ${secs} seconds? (write like 3:20)`, answer: `${Math.floor(secs / 60)}:${pad2(secs % 60)}`, accept: [`${Math.floor(secs / 60)}:${pad2(secs % 60)}`, `${Math.floor(secs / 60)} ${secs % 60}`, `${Math.floor(secs / 60)}:${secs % 60}`, `${Math.floor(secs / 60)} minutes ${secs % 60} seconds`, `${Math.floor(secs / 60)} min ${secs % 60} s`], distractors: [`${Math.floor(secs / 100)}:${pad2(secs % 100)}`, `${Math.floor(secs / 60) + 1}:${pad2(secs % 60)}`, `${Math.floor(secs / 60)}:${pad2((secs + 10) % 60)}`], explain: `${secs} ÷ 60 = ${Math.floor(secs / 60)} remainder ${secs % 60}: ${Math.floor(secs / 60)}:${pad2(secs % 60)}.` });
    }
    if (rng.chance(0.5)) { const d1 = rng.int(3, 20); const months = ['March', 'April', 'May', 'June']; const i = rng.int(0, 2); const d2 = rng.int(2, 25); const len = [31, 30, 31, 30]; const ans = len[i] - d1 + d2;
      return q('m.time', level, { prompt: `How many days are there from ${d1} ${months[i]} to ${d2} ${months[i + 1]}?`, answer: ans, numeric: true, unit: 'days', distractors: nearby(ans, rng, [ans + 1, ans - 1, 30 - d1 + d2]), explain: `${months[i]} has ${len[i]} days: ${len[i]} − ${d1} = ${len[i] - d1} days left in ${months[i]}, plus ${d2} in ${months[i + 1]} = ${ans}.`, seconds: 70 }); }
    const start = rng.int(6, 14) * 60 + rng.pick([0, 15, 30, 45]); const diff = rng.pick([1, 2, 3, 5, 8, 9]); const ahead = rng.chance(0.5);
    return q('m.time', level, { prompt: `It is ${clock(start)} in Bristol. In a city ${diff} hours ${ahead ? 'ahead' : 'behind'}, what time is it? (24-hour clock)`, answer: clock(start + (ahead ? diff : -diff) * 60 + 1440), accept: [clock(start + (ahead ? diff : -diff) * 60 + 1440)], distractors: [clock(start + (ahead ? -diff : diff) * 60 + 1440), clock(start + (ahead ? diff + 1 : -diff - 1) * 60 + 1440), clock(start)], explain: `${ahead ? 'Add' : 'Subtract'} ${diff} hours: ${clock(start + (ahead ? diff : -diff) * 60 + 1440)}.` });
  }

  function genMoney(level, rng) {
    if (level === 1) { const items = rng.int(2, 4); const prices = Array.from({ length: items }, () => rng.int(1, 8) * 25 + rng.pick([0, 5, 10, 20])); const total = prices.reduce((a, b) => a + b, 0); const pay = total > 1000 ? 2000 : 1000;
      return rng.chance(0.5)
        ? q('m.money', level, { prompt: `Jo buys ${items} things costing ${prices.map(money).join(', ')}. How much does she spend altogether? (in pounds, e.g. 4.75)`, answer: total / 100, numeric: true, unit: '£', distractors: nearby(total / 100, rng, [(total - 100) / 100, (total + 50) / 100]), explain: `${prices.map(money).join(' + ')} = ${money(total)}.` })
        : q('m.money', level, { prompt: `A snack costs ${money(total)}. You pay with a ${money(pay)} note. How much change do you get? (in pounds)`, answer: (pay - total) / 100, numeric: true, unit: '£', distractors: nearby((pay - total) / 100, rng, [total / 100, (pay - total + 100) / 100]), explain: `${money(pay)} − ${money(total)} = ${money(pay - total)}. Count up from ${money(total)} to the next pound, then to ${money(pay)}.` }); }
    if (level === 2) { const single = rng.int(40, 120); const packN = rng.pick([3, 4, 5, 6]); const packP = single * packN - rng.int(20, 90);
      return q('m.money', level, { prompt: `One pen costs ${money(single)}. A pack of ${packN} pens costs ${money(packP)}. How much do you save by buying the pack instead of ${packN} single pens, in pence?`, answer: single * packN - packP, numeric: true, unit: 'p', distractors: nearby(single * packN - packP, rng, [packP, single * packN]), explain: `${packN} single pens cost ${money(single * packN)}. ${money(single * packN)} − ${money(packP)} = ${single * packN - packP}p.`, seconds: 60 }); }
    const price = rng.pick([2000, 3600, 4500, 6000, 8000, 12000]); const pct = rng.pick([10, 20, 25, 30, 50, 15]); const ans = price - (price * pct) / 100;
    return q('m.money', level, { prompt: `A bike costs ${money(price)}. In the sale there is ${pct}% off. What is the sale price, in pounds?`, answer: ans / 100, numeric: true, unit: '£', distractors: nearby(ans / 100, rng, [(price * pct) / 10000, (price + (price * pct) / 100) / 100]), explain: `${pct}% of ${money(price)} is ${money((price * pct) / 100)}. Take it off: ${money(ans)}.`, seconds: 60 });
  }

  function genAngles(level, rng) {
    if (level === 1) { const a = rng.int(20, 150); const line = rng.chance(0.6); const ans = line ? 180 - a : 360 - a - rng.int(90, 150);
      if (line) return q('m.angles', level, { prompt: `Two angles sit together on a straight line. One is ${a}°. What is the other?`, answer: ans, numeric: true, unit: '°', distractors: nearby(ans, rng, [360 - a, 90 - (a % 90)]), explain: `Angles on a straight line add up to 180°: 180 − ${a} = ${ans}.` });
      const b = 360 - a - ans;
      return q('m.angles', level, { prompt: `Three angles meet at a point. Two of them are ${a}° and ${b}°. What is the third?`, answer: ans, numeric: true, unit: '°', distractors: nearby(ans, rng, [180 - a, 180 - b]), explain: `Angles around a point add up to 360°: 360 − ${a} − ${b} = ${ans}.` }); }
    if (level === 2) { const a = rng.int(25, 100), b = rng.int(25, 170 - a); const ans = 180 - a - b;
      return q('m.angles', level, { prompt: `A triangle has angles of ${a}° and ${b}°. What is the third angle?`, answer: ans, numeric: true, unit: '°', distractors: nearby(ans, rng, [360 - a - b, 90 - Math.min(a, b)]), explain: `Angles in a triangle add up to 180°: 180 − ${a} − ${b} = ${ans}.` }); }
    const kind = rng.pick(['iso', 'quad', 'poly']);
    if (kind === 'iso') { const top = rng.pick([20, 30, 40, 50, 70, 80, 100, 120]); const ans = (180 - top) / 2;
      return q('m.angles', level, { prompt: `An isosceles triangle has an angle of ${top}° between its two equal sides. What is each of the other two angles?`, answer: ans, numeric: true, unit: '°', distractors: nearby(ans, rng, [180 - top, top]), explain: `The other two angles are equal: (180 − ${top}) ÷ 2 = ${ans}°.` }); }
    if (kind === 'quad') { const a = rng.int(60, 120), b = rng.int(60, 120), c = rng.int(50, 100); const ans = 360 - a - b - c;
      return q('m.angles', level, { prompt: `A quadrilateral has angles of ${a}°, ${b}° and ${c}°. What is the fourth angle?`, answer: ans, numeric: true, unit: '°', distractors: nearby(ans, rng, [180 - c, ans + 180]), explain: `Angles in a quadrilateral add up to 360°: 360 − ${a} − ${b} − ${c} = ${ans}.`, seconds: 60 }); }
    const sides = rng.pick([5, 6, 8, 9, 10, 12]); const names = { 5: 'pentagon', 6: 'hexagon', 8: 'octagon', 9: 'nonagon', 10: 'decagon', 12: 'dodecagon' }; const ans = 360 / sides;
    return q('m.angles', level, { prompt: `What is the exterior angle of a regular ${names[sides]} (${sides} sides)?`, answer: ans, numeric: true, unit: '°', distractors: nearby(ans, rng, [180 - ans, 180 - 360 / sides + 10]), explain: `Exterior angles always add up to 360°: 360 ÷ ${sides} = ${ans}°. (The interior angle is 180 − ${ans} = ${180 - ans}°.)`, seconds: 60 });
  }

  function genArea(level, rng) {
    if (level === 1) { const w = rng.int(3, 12), h = rng.int(2, 9); const per = rng.chance(0.5);
      return q('m.area', level, { prompt: `A rectangle is ${w} cm long and ${h} cm wide. What is its ${per ? 'perimeter' : 'area'}?`, answer: per ? 2 * (w + h) : w * h, numeric: true, unit: per ? 'cm' : 'cm²', distractors: nearby(per ? 2 * (w + h) : w * h, rng, [per ? w * h : 2 * (w + h), w + h]), explain: per ? `Perimeter = 2 × (${w} + ${h}) = ${2 * (w + h)} cm.` : `Area = ${w} × ${h} = ${w * h} cm².` }); }
    if (level === 2) {
      if (rng.chance(0.5)) { const b = rng.pick([4, 6, 8, 10, 12]), h = rng.int(3, 9); const ans = (b * h) / 2;
        return q('m.area', level, { prompt: `A triangle has a base of ${b} cm and a height of ${h} cm. What is its area?`, answer: ans, numeric: true, unit: 'cm²', distractors: nearby(ans, rng, [b * h, b + h]), explain: `Area of a triangle = half of base × height = ½ × ${b} × ${h} = ${ans} cm².` }); }
      const W = rng.int(8, 14), H = rng.int(6, 10), w = rng.int(2, W - 3), h = rng.int(2, H - 3); const ans = W * H - w * h;
      return q('m.area', level, { prompt: `An L-shape is made by cutting a ${w} cm by ${h} cm rectangle out of the corner of a ${W} cm by ${H} cm rectangle. What is the area of the L-shape?`, visual: lShapeSvg(W, H, w, h), answer: ans, numeric: true, unit: 'cm²', distractors: nearby(ans, rng, [W * H, W * H + w * h]), explain: `Big rectangle ${W} × ${H} = ${W * H}. Cut-out ${w} × ${h} = ${w * h}. ${W * H} − ${w * h} = ${ans} cm².`, seconds: 70 });
    }
    const kind = rng.pick(['volume', 'missing', 'para']);
    if (kind === 'volume') { const a = rng.int(2, 8), b = rng.int(2, 8), c = rng.int(2, 8);
      return q('m.area', level, { prompt: `A cuboid measures ${a} cm by ${b} cm by ${c} cm. What is its volume?`, answer: a * b * c, numeric: true, unit: 'cm³', distractors: nearby(a * b * c, rng, [a + b + c, 2 * (a * b + b * c + a * c)]), explain: `Volume = length × width × height = ${a} × ${b} × ${c} = ${a * b * c} cm³.` }); }
    if (kind === 'missing') { const w = rng.int(3, 12), h = rng.int(3, 12);
      return q('m.area', level, { prompt: `A rectangle has an area of ${w * h} cm² and a width of ${h} cm. What is its length?`, answer: w, numeric: true, unit: 'cm', distractors: nearby(w, rng, [w * h - h, (w * h) / 2]), explain: `Length = area ÷ width = ${w * h} ÷ ${h} = ${w} cm.` }); }
    const b = rng.int(5, 12), h = rng.int(3, 9);
    return q('m.area', level, { prompt: `A parallelogram has a base of ${b} cm and a perpendicular height of ${h} cm. What is its area?`, answer: b * h, numeric: true, unit: 'cm²', distractors: nearby(b * h, rng, [(b * h) / 2, 2 * (b + h)]), explain: `Area of a parallelogram = base × height = ${b} × ${h} = ${b * h} cm² (no halving: that is for triangles).` });
  }

  function lShapeSvg(W, H, w, h) {
    const s = 180 / Math.max(W, H); const pts = [[0, 0], [W, 0], [W, H - h], [W - w, H - h], [W - w, H], [0, H]].map(([x, y]) => `${10 + x * s},${10 + y * s}`).join(' ');
    return `<svg viewBox="0 0 ${20 + W * s + 40} ${20 + H * s + 20}" class="figure" role="img" aria-label="L shape"><polygon points="${pts}" fill="#dbe9ff" stroke="#1f4e9a" stroke-width="2"/><text x="${10 + (W * s) / 2}" y="${H * s + 26}" font-size="12" text-anchor="middle">${W} cm</text><text x="${18 + W * s}" y="${10 + ((H - h) * s) / 2}" font-size="12">${H - h} cm</text><text x="${W * s - 2 - (w * s) / 2}" y="${(H - h) * s + 4}" font-size="11" text-anchor="middle" fill="#1f4e9a">${w} cm</text><text x="${-2}" y="${10 + (H * s) / 2}" font-size="12" transform="rotate(-90 4 ${10 + (H * s) / 2})" text-anchor="middle">${H} cm</text></svg>`;
  }

  function genShapes(level, rng) {
    if (level === 1) {
      const kind = rng.pick(['sides', 'sym', 'coord']);
      if (kind === 'sides') { const shapes = [['pentagon', 5], ['hexagon', 6], ['octagon', 8], ['heptagon', 7], ['decagon', 10], ['quadrilateral', 4]]; const s = rng.pick(shapes);
        return q('m.shapes', level, { prompt: `How many sides does a ${s[0]} have?`, answer: s[1], numeric: true, distractors: nearby(s[1], rng), explain: `A ${s[0]} has ${s[1]} sides.`, seconds: 20 }); }
      if (kind === 'sym') { const shapes = [['square', 4], ['rectangle (not a square)', 2], ['equilateral triangle', 3], ['regular hexagon', 6], ['isosceles triangle', 1], ['circle', 'infinitely many'], ['parallelogram', 0], ['regular pentagon', 5]]; const s = rng.pick(shapes); const opts = rng.shuffle([...new Set([String(s[1]), '0', '1', '2', '4', '6', 'infinitely many'])].filter((x) => x !== String(s[1])).slice(0, 3).concat([String(s[1])]));
        return q('m.shapes', level, { prompt: `How many lines of symmetry does a ${s[0]} have?`, format: 'mc', options: opts, answer: opts.indexOf(String(s[1])), explain: `A ${s[0]} has ${s[1]} line${s[1] === 1 ? '' : 's'} of symmetry.`, seconds: 25 }); }
      const x = rng.int(1, 8), y = rng.int(1, 8);
      return q('m.shapes', level, { prompt: `What are the coordinates of point P?`, visual: gridSvg([[x, y, 'P']]), answer: `(${x}, ${y})`, accept: [`(${x}, ${y})`, `${x},${y}`, `(${x},${y})`, `${x}, ${y}`, `${x} ${y}`], distractors: [`(${y}, ${x})`, `(${x + 1}, ${y})`, `(${x}, ${y - 1})`, `(${x - 1}, ${y})`, `(${x}, ${y + 1})`].filter((s, i, arr) => s !== `(${x}, ${y})` && arr.indexOf(s) === i), explain: `Along the corridor, then up the stairs: x = ${x}, y = ${y}, so (${x}, ${y}).` });
    }
    if (level === 2) {
      const x = rng.int(1, 6), y = rng.int(1, 6); const dx = rng.int(-3, 3), dy = rng.int(-3, 3) || 1;
      if (rng.chance(0.5)) return q('m.shapes', level, { prompt: `Point A is at (${x}, ${y}). It is translated ${Math.abs(dx)} ${dx >= 0 ? 'right' : 'left'} and ${Math.abs(dy)} ${dy >= 0 ? 'up' : 'down'}. Where does it end up?`, answer: `(${x + dx}, ${y + dy})`, accept: [`(${x + dx}, ${y + dy})`, `${x + dx},${y + dy}`, `(${x + dx},${y + dy})`, `${x + dx}, ${y + dy}`], distractors: [`(${x - dx}, ${y - dy})`, `(${x + dy}, ${y + dx})`, `(${x + dx}, ${y - dy})`, `(${x + dx + 1}, ${y + dy})`, `(${x}, ${y})`].filter((s, i, arr) => s !== `(${x + dx}, ${y + dy})` && arr.indexOf(s) === i), explain: `Add to x for right, subtract for left; add to y for up: (${x} ${dx >= 0 ? '+' : '−'} ${Math.abs(dx)}, ${y} ${dy >= 0 ? '+' : '−'} ${Math.abs(dy)}) = (${x + dx}, ${y + dy}).` });
      return q('m.shapes', level, { prompt: `Point B is at (${x}, ${y}). What are the coordinates of its reflection in the x-axis?`, answer: `(${x}, ${-y})`, accept: [`(${x}, ${-y})`, `${x},${-y}`, `(${x},${-y})`, `${x}, ${-y}`], distractors: [`(${-x}, ${y})`, `(${-x}, ${-y})`, `(${y}, ${x})`], explain: `Reflecting in the x-axis flips the y-coordinate: (${x}, ${-y}).` });
    }
    const kind = rng.pick(['props', 'vertex', '3d']);
    if (kind === 'props') { const items = [['four equal sides and no right angles', 'rhombus', ['square', 'rectangle', 'kite']], ['exactly one pair of parallel sides', 'trapezium', ['parallelogram', 'rhombus', 'rectangle']], ['two pairs of equal adjacent sides', 'kite', ['rhombus', 'trapezium', 'parallelogram']], ['opposite sides equal and parallel, four right angles, sides not all equal', 'rectangle', ['square', 'rhombus', 'kite']]]; const it = rng.pick(items); const opts = rng.shuffle([it[1], ...it[2]]);
      return q('m.shapes', level, { prompt: `Which quadrilateral has ${it[0]}?`, format: 'mc', options: opts, answer: opts.indexOf(it[1]), explain: `That describes a ${it[1]}.` }); }
    if (kind === 'vertex') { const x1 = rng.int(1, 4), y1 = rng.int(1, 4), w = rng.int(2, 5), h = rng.int(2, 5);
      return q('m.shapes', level, { prompt: `Three corners of a rectangle are at (${x1}, ${y1}), (${x1 + w}, ${y1}) and (${x1 + w}, ${y1 + h}). Where is the fourth corner?`, answer: `(${x1}, ${y1 + h})`, accept: [`(${x1}, ${y1 + h})`, `${x1},${y1 + h}`, `(${x1},${y1 + h})`, `${x1}, ${y1 + h}`], distractors: [`(${x1 + w}, ${y1 + h})`, `(${x1 + h}, ${y1})`, `(${y1 + h}, ${x1})`, `(${x1}, ${y1})`, `(${x1 - 1}, ${y1 + h})`, `(${x1}, ${y1 + h + 1})`].filter((s, i, arr) => s !== `(${x1}, ${y1 + h})` && arr.indexOf(s) === i), explain: `The missing corner sits above (${x1}, ${y1}) at the same height as (${x1 + w}, ${y1 + h}): (${x1}, ${y1 + h}).`, seconds: 60 }); }
    const solids = [['cube', 6, 12, 8], ['cuboid', 6, 12, 8], ['triangular prism', 5, 9, 6], ['square-based pyramid', 5, 8, 5], ['tetrahedron', 4, 6, 4], ['hexagonal prism', 8, 18, 12]]; const s = rng.pick(solids); const which = rng.int(0, 2); const names = ['faces', 'edges', 'vertices'];
    return q('m.shapes', level, { prompt: `How many ${names[which]} does a ${s[0]} have?`, answer: s[which + 1], numeric: true, distractors: nearby(s[which + 1], rng, [s[((which + 1) % 3) + 1], s[((which + 2) % 3) + 1]]), explain: `A ${s[0]} has ${s[1]} faces, ${s[2]} edges and ${s[3]} vertices.` });
  }

  function gridSvg(points) {
    const n = 9, c = 22, o = 24; let s = `<svg viewBox="0 0 ${o + n * c + 10} ${o + n * c + 10}" class="figure" role="img" aria-label="coordinate grid">`;
    for (let i = 0; i <= n; i++) { s += `<line x1="${o + i * c}" y1="${o}" x2="${o + i * c}" y2="${o + n * c}" stroke="#cbd5e1"/><line x1="${o}" y1="${o + i * c}" x2="${o + n * c}" y2="${o + i * c}" stroke="#cbd5e1"/>`; s += `<text x="${o + i * c}" y="${o + n * c + 12}" font-size="9" text-anchor="middle">${i}</text><text x="${o - 10}" y="${o + (n - i) * c + 3}" font-size="9" text-anchor="middle">${i}</text>`; }
    s += `<line x1="${o}" y1="${o + n * c}" x2="${o + n * c}" y2="${o + n * c}" stroke="#334155" stroke-width="2"/><line x1="${o}" y1="${o}" x2="${o}" y2="${o + n * c}" stroke="#334155" stroke-width="2"/>`;
    for (const [x, y, label] of points) s += `<circle cx="${o + x * c}" cy="${o + (n - y) * c}" r="4" fill="#eb5757"/><text x="${o + x * c + 6}" y="${o + (n - y) * c - 5}" font-size="12" font-weight="bold" fill="#eb5757">${label}</text>`;
    return s + '</svg>';
  }

  function genStats(level, rng) {
    if (level === 1) { const kind = rng.pick(['mean', 'mode', 'range']); const nums = Array.from({ length: 4 }, () => rng.int(1, 12)); if (kind === 'mean') { const base = rng.int(2, 9); const set = [base, base + 2, base + 4, base + 6]; const shown = rng.shuffle(set);
        return q('m.stats', level, { prompt: `What is the mean of ${shown.join(', ')}?`, answer: base + 3, numeric: true, distractors: nearby(base + 3, rng, [set.reduce((a, b) => a + b), 6]), explain: `Add them (${set.reduce((a, b) => a + b)}) and divide by 4: ${base + 3}.` }); }
      if (kind === 'mode') { const m = rng.int(1, 9); const set = rng.shuffle([m, m, m + 1, m + 3, m - 1 || 10]);
        return q('m.stats', level, { prompt: `What is the mode of ${set.join(', ')}?`, answer: m, numeric: true, distractors: nearby(m, rng), explain: `The mode is the most common value: ${m} appears twice.` }); }
      const sorted = nums.slice().sort((a, b) => a - b);
      return q('m.stats', level, { prompt: `What is the range of ${nums.join(', ')}?`, answer: sorted[3] - sorted[0], numeric: true, distractors: nearby(sorted[3] - sorted[0], rng, [sorted[3], sorted[0]]), explain: `Range = biggest − smallest = ${sorted[3]} − ${sorted[0]} = ${sorted[3] - sorted[0]}.` }); }
    if (level === 2) {
      if (rng.chance(0.5)) { const nums = rng.shuffle(Array.from({ length: 5 }, () => rng.int(1, 20))); const sorted = nums.slice().sort((a, b) => a - b);
        return q('m.stats', level, { prompt: `What is the median of ${nums.join(', ')}?`, answer: sorted[2], numeric: true, distractors: nearby(sorted[2], rng, [nums[2], Math.round(nums.reduce((a, b) => a + b) / 5)]), explain: `Put them in order: ${sorted.join(', ')}. The middle value is ${sorted[2]}.` }); }
      const names = ['Ava', 'Ben', 'Cal', 'Dee', 'Eli']; const vals = names.map(() => rng.int(1, 9)); const i = rng.int(0, 4); let j = rng.int(0, 4); if (j === i) j = (j + 1) % 5; const kind = rng.pick(['diff', 'total', 'most']);
      const visual = barChartSvg('Books read in March', names, vals);
      if (kind === 'diff') return q('m.stats', level, { prompt: `The bar chart shows how many books each child read. How many more books did ${names[i]} read than ${names[j]}?`, visual, answer: Math.abs(vals[i] - vals[j]), numeric: true, distractors: nearby(Math.abs(vals[i] - vals[j]), rng, [vals[i] + vals[j]]), explain: `${names[i]} read ${vals[i]} and ${names[j]} read ${vals[j]}: a difference of ${Math.abs(vals[i] - vals[j])}.` });
      if (kind === 'total') return q('m.stats', level, { prompt: `The bar chart shows how many books each child read. How many books did they read in total?`, visual, answer: vals.reduce((a, b) => a + b), numeric: true, distractors: nearby(vals.reduce((a, b) => a + b), rng), explain: `${vals.join(' + ')} = ${vals.reduce((a, b) => a + b)}.` });
      const max = Math.max(...vals); const who = names.filter((_, k) => vals[k] === max);
      return q('m.stats', level, { prompt: `The bar chart shows how many books each child read. Who read the most?`, visual, format: 'mc', options: names.slice(0, 4).includes(who[0]) ? names.slice(0, 4) : [who[0], ...names.filter((n) => n !== who[0]).slice(0, 3)], answer: (names.slice(0, 4).includes(who[0]) ? names.slice(0, 4) : [who[0], ...names.filter((n) => n !== who[0]).slice(0, 3)]).indexOf(who[0]), explain: `The tallest bar belongs to ${who[0]} (${max} books).`, seconds: 30 });
    }
    if (rng.chance(0.5)) { const mean = rng.int(5, 12); const four = Array.from({ length: 4 }, () => rng.int(2, 15)); const fifth = mean * 5 - four.reduce((a, b) => a + b); if (fifth < 0 || fifth > 40) return genStats(level, rng);
      return q('m.stats', level, { prompt: `The mean of five numbers is ${mean}. Four of them are ${four.join(', ')}. What is the fifth number?`, answer: fifth, numeric: true, distractors: nearby(fifth, rng, [mean, mean * 5]), explain: `Five numbers with mean ${mean} add up to ${mean * 5}. The four given add to ${four.reduce((a, b) => a + b)}, so the fifth is ${fifth}.`, seconds: 70 }); }
    const r = rng.int(1, 5), b = rng.int(1, 5), g = rng.int(1, 4); const tot = r + b + g; const colour = rng.pick([['red', r], ['blue', b], ['green', g]]);
    return q('m.stats', level, { prompt: `A bag has ${r} red, ${b} blue and ${g} green marbles. One is picked at random. What is the probability it is ${colour[0]}? (as a fraction in simplest form)`, answer: fracStr(colour[1], tot), fraction: true, requireSimplest: true, distractors: [`${colour[1]}/${tot - colour[1]}`, fracStr(tot - colour[1], tot), `1/${colour[1]}`].filter((x) => x !== fracStr(colour[1], tot)), explain: `${colour[1]} ${colour[0]} out of ${tot} marbles: ${colour[1]}/${tot} = ${fracStr(colour[1], tot)}.`, seconds: 60 });
  }

  function barChartSvg(title, labels, values) {
    const max = Math.max(...values, 1); const bw = 34, gap = 14, h = 120, left = 30, bottom = 150;
    let s = `<svg viewBox="0 0 ${left + labels.length * (bw + gap) + 10} 175" class="figure chart" role="img" aria-label="${esc(title)}"><text x="${left}" y="14" font-size="12" font-weight="bold">${esc(title)}</text>`;
    for (let v = 0; v <= max; v += max > 6 ? 2 : 1) { const y = bottom - (v / max) * h; s += `<line x1="${left}" y1="${y}" x2="${left + labels.length * (bw + gap)}" y2="${y}" stroke="#e2e8f0"/><text x="${left - 6}" y="${y + 4}" font-size="10" text-anchor="end">${v}</text>`; }
    labels.forEach((lab, i) => { const x = left + i * (bw + gap) + gap / 2; const bh = (values[i] / max) * h; s += `<rect x="${x}" y="${bottom - bh}" width="${bw}" height="${bh}" fill="#2f80ed" rx="3"/><text x="${x + bw / 2}" y="${bottom + 14}" font-size="11" text-anchor="middle">${esc(lab)}</text>`; });
    return s + `<line x1="${left}" y1="${bottom}" x2="${left + labels.length * (bw + gap)}" y2="${bottom}" stroke="#334155"/></svg>`;
  }

  function genWord(level, rng) {
    const names = ['Maya', 'Noah', 'Zara', 'Leo', 'Priya', 'Finn'];
    const n = rng.pick(names);
    if (level === 1) { const kind = rng.pick(['a', 'b', 'c']);
      if (kind === 'a') { const boxes = rng.int(3, 9), per = rng.int(4, 12);
        return q('m.word', level, { prompt: `${n} has ${boxes} boxes with ${per} apples in each. How many apples altogether?`, answer: boxes * per, numeric: true, distractors: nearby(boxes * per, rng, [boxes + per]), explain: `${boxes} × ${per} = ${boxes * per}.` }); }
      if (kind === 'b') { const total = rng.int(40, 120), gave = rng.int(10, total - 10);
        return q('m.word', level, { prompt: `${n} had ${total} stickers and gave away ${gave}. How many are left?`, answer: total - gave, numeric: true, distractors: nearby(total - gave, rng, [total + gave]), explain: `${total} − ${gave} = ${total - gave}.` }); }
      const kids = rng.pick([3, 4, 5, 6]), each = rng.int(3, 12);
      return q('m.word', level, { prompt: `${kids * each} sweets are shared equally between ${kids} children. How many does each child get?`, answer: each, numeric: true, distractors: nearby(each, rng, [kids * each - kids]), explain: `${kids * each} ÷ ${kids} = ${each}.` }); }
    if (level === 2) { const kind = rng.pick(['change', 'remain', 'trip']);
      if (kind === 'change') { const items = rng.int(2, 5), price = rng.int(60, 240); const total = items * price; const pay = total < 1000 ? 1000 : 2000;
        return q('m.word', level, { prompt: `${n} buys ${items} comics at ${money(price)} each and pays with a ${money(pay)} note. How much change does ${n} get? (in pounds)`, answer: (pay - total) / 100, numeric: true, unit: '£', distractors: nearby((pay - total) / 100, rng, [total / 100, (pay - price) / 100]), explain: `${items} × ${money(price)} = ${money(total)}. ${money(pay)} − ${money(total)} = ${money(pay - total)}.`, seconds: 60 }); }
      if (kind === 'remain') { const pages = rng.pick([120, 150, 180, 200, 240]); const days = rng.int(3, 6), per = rng.int(10, 25);
        return q('m.word', level, { prompt: `A book has ${pages} pages. ${n} reads ${per} pages a day for ${days} days. How many pages are left?`, answer: pages - days * per, numeric: true, distractors: nearby(pages - days * per, rng, [days * per, pages - per]), explain: `${days} × ${per} = ${days * per} pages read. ${pages} − ${days * per} = ${pages - days * per}.`, seconds: 60 }); }
      const kids = rng.int(50, 130), seats = rng.pick([30, 40, 45, 50]);
      return q('m.word', level, { prompt: `${kids} children are going on a trip. Each coach holds ${seats} children. How many coaches are needed?`, answer: Math.ceil(kids / seats), numeric: true, distractors: nearby(Math.ceil(kids / seats), rng, [Math.floor(kids / seats)]), explain: `${kids} ÷ ${seats} = ${(kids / seats).toFixed(1)}... You cannot have part of a coach, so round UP: ${Math.ceil(kids / seats)}.` }); }
    const kind = rng.pick(['ages', 'journey', 'tiles']);
    if (kind === 'ages') { const child = rng.int(6, 12), diff = rng.pick([24, 27, 30, 32]); const yrs = rng.int(3, 8);
      return q('m.word', level, { prompt: `${n} is ${child}. ${n}’s mum is ${diff} years older. In ${yrs} years, what will their ages add up to?`, answer: child + child + diff + 2 * yrs, numeric: true, distractors: nearby(child + child + diff + 2 * yrs, rng, [child + child + diff + yrs, child + diff + yrs]), explain: `Now: ${child} + ${child + diff} = ${2 * child + diff}. Both get ${yrs} years older, so add ${2 * yrs}: ${2 * child + diff + 2 * yrs}.`, seconds: 70 }); }
    if (kind === 'journey') { const leg1 = rng.int(20, 60), leg2 = rng.int(15, 50), stop = rng.int(10, 30); const start = rng.int(7, 11) * 60 + rng.pick([0, 15, 30, 45]); const end = start + leg1 + stop + leg2;
      return q('m.word', level, { prompt: `${n} leaves home at ${clock(start)}, drives for ${leg1} minutes, stops for ${stop} minutes, then drives for ${leg2} more minutes. What time does ${n} arrive? (24-hour clock)`, answer: clock(end), accept: [clock(end), clock(end).replace(':', '.')], distractors: [clock(end - stop), clock(end + 10), clock(end - 60)], explain: `${leg1} + ${stop} + ${leg2} = ${leg1 + stop + leg2} minutes after ${clock(start)}, which is ${clock(end)}.`, seconds: 70 }); }
    const w = rng.int(2, 5), h = rng.int(2, 4); const tile = rng.pick([10, 20, 25, 50]); const ans = (w * 100 / tile) * (h * 100 / tile);
    return q('m.word', level, { prompt: `A floor measures ${w} m by ${h} m. Square tiles have sides of ${tile} cm. How many tiles are needed to cover the floor?`, answer: ans, numeric: true, distractors: nearby(ans, rng, [w * h, (w * 100 / tile) + (h * 100 / tile)]), explain: `${w} m = ${w * 100} cm, which fits ${w * 100 / tile} tiles; ${h} m fits ${h * 100 / tile}. ${w * 100 / tile} × ${h * 100 / tile} = ${ans} tiles.`, seconds: 80 });
  }

  /* ------------------------ VERBAL REASONING ------------------------ */

  const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const vocabAt = (level) => D.VOCAB.filter((v) => v.l === level);
  const otherWords = (level, exclude, rng, n) => rng.sample(D.VOCAB.filter((v) => Math.abs(v.l - level) <= 1 && !exclude.includes(v.w)), n);

  function genSynonym(level, rng) {
    const v = rng.pick(vocabAt(level)); const correct = rng.pick(v.s);
    const distract = otherWords(level, [v.w], rng, 3).map((o) => rng.pick(o.s));
    return q('vr.synonym', level, { prompt: `Which word is closest in meaning to <b>${v.w}</b>?`, answer: correct, accept: v.s.concat([v.d]), word: v.w, distractors: [v.a].concat(distract).slice(0, 3), explain: `${v.w} means ${v.d}. Closest: ${correct}.`, seconds: 25 });
  }

  function genAntonym(level, rng) {
    const v = rng.pick(vocabAt(level).filter((x) => x.a));
    const distract = [rng.pick(v.s)].concat(otherWords(level, [v.w], rng, 2).map((o) => rng.pick(o.s)));
    return q('vr.antonym', level, { prompt: `Which word is most OPPOSITE in meaning to <b>${v.w}</b>?`, answer: v.a, accept: [v.a], word: v.w, distractors: distract, explain: `${v.w} means ${v.d}, so the opposite is ${v.a}. (Watch out: ${v.s[0]} means the same, not the opposite.)`, seconds: 25 });
  }

  function genCloze(level, rng) {
    const v = rng.pick(vocabAt(level).filter((x) => x.eg));
    const distract = otherWords(level, [v.w], rng, 3).map((o) => o.w);
    return q('vr.cloze', level, { prompt: `Choose the word that best completes the sentence:<br><i>${esc(v.eg.replace(/___/g, '______'))}</i>`, answer: v.w, accept: [v.w], distractors: distract, explain: `${v.w} means ${v.d}, which fits the sentence.`, format: 'mc', seconds: 30 });
  }

  function genOddWord(level, rng) {
    const pool = D.ODD_ONE_OUT.filter((o) => o.l <= level && o.l >= level - 1); const it = rng.pick(pool.length ? pool : D.ODD_ONE_OUT);
    const opts = it.w.slice();
    return q('vr.odd', level, { prompt: 'Which word is the odd one out?', format: 'mc', options: opts, answer: it.odd, explain: it.why, seconds: 25 });
  }

  function genAnalogy(level, rng) {
    const pool = D.ANALOGIES.filter((a) => a.l === level); const it = rng.pick(pool.length ? pool : D.ANALOGIES);
    const opts = rng.shuffle(it.options);
    return q('vr.analogy', level, { prompt: `<b>${it.a}</b> is to <b>${it.b}</b> as <b>${it.c}</b> is to ...?`, format: 'mc', options: opts, answer: opts.indexOf(it.options[0]), explain: `Think about how ${it.a} relates to ${it.b}; ${it.c} relates to ${it.options[0]} in the same way.`, seconds: 25 });
  }

  function genLetterSeq(level, rng) {
    const L = (i) => ALPHA[((i % 26) + 26) % 26];
    if (level === 1) { const start = rng.int(0, 10), step = rng.int(1, 3); const terms = [0, 1, 2, 3].map((i) => L(start + i * step)); const ans = L(start + 4 * step);
      return q('vr.letters', level, { prompt: `What letter comes next? ${terms.join(', ')}, ...`, answer: ans, accept: [ans], distractors: [L(start + 4 * step + 1), L(start + 4 * step - 1), L(start + 5 * step)], explain: `Each letter jumps ${step} place${step > 1 ? 's' : ''} forward in the alphabet: ${ans}.`, hint: 'Write out the alphabet and count the jumps.', seconds: 30 }); }
    if (level === 2) { const s1 = rng.int(0, 6), s2 = rng.int(14, 20), st1 = rng.int(1, 3), st2 = rng.int(1, 3); const terms = [0, 1, 2, 3].map((i) => L(s1 + i * st1) + L(s2 - i * st2)); const ans = L(s1 + 4 * st1) + L(s2 - 4 * st2);
      return q('vr.letters', level, { prompt: `What pair comes next? ${terms.join(', ')}, ...`, answer: ans, accept: [ans], distractors: [L(s1 + 4 * st1) + L(s2 - 3 * st2), L(s1 + 5 * st1) + L(s2 - 4 * st2), L(s1 + 4 * st1 + 1) + L(s2 - 4 * st2 - 1)], explain: `The first letters go forward ${st1} each time; the second letters go back ${st2}: ${ans}.`, seconds: 45 }); }
    const start = rng.int(0, 4); const steps = [1, 2, 3, 4]; let pos = start; const terms = [L(pos)]; for (const st of steps) { pos += st; terms.push(L(pos)); } const ans = L(pos + 5);
    return q('vr.letters', level, { prompt: `What letter comes next? ${terms.join(', ')}, ...`, answer: ans, accept: [ans], distractors: [L(pos + 4), L(pos + 6), L(pos + 1)], explain: `The jumps grow each time: +1, +2, +3, +4, so the next jump is +5: ${ans}.`, seconds: 50 });
  }

  const CODE_WORDS = ['CAT', 'DOG', 'SUN', 'HAT', 'PEN', 'BUS', 'CUP', 'MAP', 'FOX', 'LEG', 'BED', 'JAM', 'LAMP', 'FISH', 'BOOK', 'DESK', 'MILK', 'TREE', 'GOLD', 'SHIP', 'ROAD', 'KING', 'STAR', 'MOON'];

  function genLetterCode(level, rng) {
    const shift = (w, k) => w.split('').map((ch) => ALPHA[(ALPHA.indexOf(ch) + k + 52) % 26]).join('');
    const alt = (w, k) => w.split('').map((ch, i) => ALPHA[(ALPHA.indexOf(ch) + (i % 2 ? -k : k) + 52) % 26]).join('');
    const w1 = rng.pick(CODE_WORDS.filter((w) => w.length === (level === 1 ? 3 : 4))); let w2 = rng.pick(CODE_WORDS.filter((w) => w.length === w1.length && w !== w1));
    if (level < 3) { const k = level === 1 ? rng.pick([1, 2, -1]) : rng.pick([3, 4, 5, -2, -3]); const ans = shift(w2, k);
      return q('vr.codes', level, { prompt: `If <b>${w1}</b> is written in code as <b>${shift(w1, k)}</b>, how is <b>${w2}</b> written in the same code?`, answer: ans, accept: [ans], distractors: [shift(w2, k + 1), shift(w2, -k), shift(w2, k - 1)], explain: `Each letter moves ${Math.abs(k)} place${Math.abs(k) > 1 ? 's' : ''} ${k > 0 ? 'forward' : 'back'} in the alphabet. ${w2} becomes ${ans}.`, hint: 'Compare each letter of the word with its code letter and count the gap.', seconds: 50 }); }
    if (rng.chance(0.5)) { const k = rng.pick([1, 2, 3]); const ans = alt(w2, k);
      return q('vr.codes', level, { prompt: `If <b>${w1}</b> is written in code as <b>${alt(w1, k)}</b>, how is <b>${w2}</b> written in the same code?`, answer: ans, accept: [ans], distractors: [shift(w2, k), alt(w2, k + 1), shift(w2, -k)], explain: `The letters move +${k}, −${k}, +${k}, −${k} in turn. ${w2} becomes ${ans}.`, seconds: 60 }); }
    const k = rng.pick([2, 3, 4]); const code = shift(w2, k);
    return q('vr.codes', level, { prompt: `If <b>${w1}</b> is written in code as <b>${shift(w1, k)}</b>, which word is written as <b>${code}</b>?`, answer: w2, accept: [w2], distractors: [shift(code, k), shift(code, -k - 1), shift(code, -k + 1)], explain: `The code moves each letter ${k} forward, so move each letter of ${code} ${k} back: ${w2}.`, seconds: 60 });
  }

  function genAnagram(level, rng) {
    const v = rng.pick(vocabAt(level).filter((x) => x.w.length <= 9 && !x.w.includes('-'))); let scr = v.w; let tries = 0;
    while (scr === v.w && tries++ < 10) scr = rng.shuffle(v.w.split('')).join('');
    const distract = otherWords(level, [v.w], rng, 6).map((o) => o.w).filter((w) => Math.abs(w.length - v.w.length) <= 1).slice(0, 3);
    return q('vr.anagram', level, { prompt: `Unscramble the letters <b>${scr.toUpperCase()}</b> to make a word meaning <i>${v.d}</i>.`, answer: v.w, accept: [v.w], distractors: distract.length === 3 ? distract : otherWords(level, [v.w], rng, 3).map((o) => o.w), explain: `The word is ${v.w}: ${v.d}.`, hint: 'Look for common endings like -ous, -ful, -ing, -ent.', seconds: 45 });
  }

  const FOUR_LETTER = ['bake', 'cold', 'dust', 'echo', 'fern', 'gift', 'hunt', 'inch', 'jolt', 'kite', 'lime', 'mend', 'nook', 'opal', 'palm', 'quiz', 'rust', 'silk', 'tusk', 'vest', 'wolf', 'yarn', 'zinc', 'bolt', 'crab', 'dive', 'flag', 'grin', 'harp', 'jump'];

  function genHidden(level, rng) {
    const it = rng.pick(D.HIDDEN_WORDS); const flat = it.s.toLowerCase().replace(/[^a-z]/g, '');
    const distract = rng.shuffle(FOUR_LETTER.filter((w) => !flat.includes(w) && w !== it.a)).slice(0, 3);
    return q('vr.hidden', level, { prompt: `A four-letter word is hidden across the end of one word and the start of the next. Find it:<br><i>${esc(it.s)}</i>`, answer: it.a, accept: [it.a], distractors: distract, explain: `${it.a.toUpperCase()} is hidden in “${hiddenHighlight(it.s, it.a)}”.`, hint: 'Look at the last letters of each word joined to the first letters of the next.', seconds: level === 1 ? 50 : 40 });
  }

  function hiddenHighlight(sentence, word) {
    const lower = sentence.toLowerCase(); const chars = lower.split(''); let flat = '', map = [];
    chars.forEach((c, i) => { if (/[a-z]/.test(c)) { flat += c; map.push(i); } });
    const at = flat.indexOf(word); if (at < 0) return sentence;
    const start = map[at], end = map[at + word.length - 1];
    return sentence.slice(0, start) + sentence.slice(start, end + 1).toUpperCase() + sentence.slice(end + 1);
  }

  function genCompound(level, rng) {
    const it = rng.pick(D.COMPOUNDS); const distract = rng.sample(D.COMPOUNDS.filter((c) => c.w !== it.w), 3).map((c) => c.w);
    return q('vr.compound', level, { prompt: `Which word can go in front of all three to make new words?<br><b>___${it.ends[0]}, ___${it.ends[1]}, ___${it.ends[2]}</b>`, answer: it.w, accept: [it.w], distractors: distract, explain: `${it.w}: ${it.ends.map((e) => it.w + e).join(', ')}.`, seconds: 30 });
  }

  function genNumSeq(level, rng) {
    if (level === 1) { const a = rng.int(1, 30), d = rng.pick([2, 3, 4, 5, 6, 7, 8, 9, 11, 12, -2, -3, -5]); const terms = [0, 1, 2, 3].map((i) => a + i * d); const ans = a + 4 * d;
      return q('vr.numseq', level, { prompt: `What number comes next? ${terms.join(', ')}, ...`, answer: ans, numeric: true, distractors: nearby(ans, rng, [a + 5 * d]), explain: `The numbers go ${d > 0 ? 'up' : 'down'} by ${Math.abs(d)} each time: ${ans}.`, seconds: 30 }); }
    if (level === 2) { const kind = rng.pick(['mul-add', 'alt', 'grow']);
      if (kind === 'mul-add') { const a = rng.int(1, 5), m = rng.pick([2, 3]), c = rng.int(-2, 3); const terms = [a]; for (let i = 0; i < 3; i++) terms.push(terms[terms.length - 1] * m + c); const ans = terms[3] * m + c;
        return q('vr.numseq', level, { prompt: `What number comes next? ${terms.join(', ')}, ...`, answer: ans, numeric: true, distractors: nearby(ans, rng, [terms[3] * m, terms[3] + (terms[3] - terms[2])]), explain: `Each term is multiplied by ${m}${c ? (c > 0 ? ' then ' + c + ' is added' : ' then ' + -c + ' is subtracted') : ''}: ${ans}.`, seconds: 50 }); }
      if (kind === 'alt') { const a = rng.int(2, 20), d1 = rng.int(2, 6), d2 = rng.int(1, 4); const terms = [a]; for (let i = 0; i < 4; i++) terms.push(terms[terms.length - 1] + (i % 2 === 0 ? d1 : -d2)); const ans = terms[4] + d1;
        return q('vr.numseq', level, { prompt: `What number comes next? ${terms.join(', ')}, ...`, answer: ans, numeric: true, distractors: nearby(ans, rng, [terms[4] - d2, terms[4] + d1 + 1]), explain: `The pattern alternates: +${d1}, −${d2}, +${d1}, −${d2}, so next is +${d1}: ${ans}.`, seconds: 50 }); }
      const a = rng.int(1, 10), d0 = rng.int(1, 4); const terms = [a]; let d = d0; for (let i = 0; i < 4; i++) { terms.push(terms[terms.length - 1] + d); d += 1; } const ans = terms[4] + d;
      return q('vr.numseq', level, { prompt: `What number comes next? ${terms.join(', ')}, ...`, answer: ans, numeric: true, distractors: nearby(ans, rng, [terms[4] + d - 1, terms[4] + d + 1]), explain: `The gaps grow by one each time (+${d0}, +${d0 + 1}, +${d0 + 2}...), so add ${d}: ${ans}.`, seconds: 50 }); }
    const kind = rng.pick(['square+', 'two-seq', 'fib', 'cube']);
    if (kind === 'square+') { const c = rng.int(-3, 4); const terms = [1, 2, 3, 4].map((n) => n * n + c); const ans = 25 + c;
      return q('vr.numseq', level, { prompt: `What number comes next? ${terms.join(', ')}, ...`, answer: ans, numeric: true, distractors: nearby(ans, rng, [terms[3] + (terms[3] - terms[2]), 16 + c + 10]), explain: `These are the square numbers ${c ? (c > 0 ? 'plus ' + c : 'minus ' + -c) : ''}: 1, 4, 9, 16, 25 ${c ? '→ ' + terms.join(', ') + ', ' + ans : ''}.`, seconds: 60 }); }
    if (kind === 'two-seq') { const a = rng.int(1, 9), d1 = rng.int(2, 5), b = rng.int(20, 40), d2 = rng.int(1, 4); const terms = []; for (let i = 0; i < 3; i++) { terms.push(a + i * d1); terms.push(b - i * d2); } const ans = a + 3 * d1;
      return q('vr.numseq', level, { prompt: `What number comes next? ${terms.join(', ')}, ...`, answer: ans, numeric: true, distractors: nearby(ans, rng, [b - 3 * d2, terms[5] + d1]), explain: `Two sequences are mixed together: ${a}, ${a + d1}, ${a + 2 * d1}... (+${d1}) and ${b}, ${b - d2}, ${b - 2 * d2}... (−${d2}). Next in the first one: ${ans}.`, seconds: 70 }); }
    if (kind === 'fib') { const a = rng.int(1, 5), b = rng.int(a + 1, 9); const terms = [a, b]; for (let i = 0; i < 3; i++) terms.push(terms[terms.length - 1] + terms[terms.length - 2]); const ans = terms[4] + terms[3];
      return q('vr.numseq', level, { prompt: `What number comes next? ${terms.join(', ')}, ...`, answer: ans, numeric: true, distractors: nearby(ans, rng, [terms[4] * 2, terms[4] + (terms[4] - terms[3])]), explain: `Add the two previous numbers: ${terms[3]} + ${terms[4]} = ${ans}.`, seconds: 50 }); }
    return q('vr.numseq', level, { prompt: `What number comes next? 1, 8, 27, 64, ...`, answer: 125, numeric: true, distractors: nearby(125, rng, [101, 100]), explain: `These are cube numbers: 1³, 2³, 3³, 4³, so 5³ = 125.`, seconds: 50 });
  }

  const THREE_LETTER = ['CAT', 'DOG', 'RUN', 'SIT', 'PEN', 'HAT', 'ARM', 'LEG', 'BOX', 'CUP', 'SUN', 'MAP', 'TOP', 'BAG', 'BED', 'JAM', 'OWL', 'ICE', 'EGG', 'NUT'];

  function genMissing(level, rng) {
    const it = rng.pick(D.MISSING_WORDS); const distract = rng.shuffle(THREE_LETTER.filter((w) => w !== it.a)).slice(0, 3);
    return q('vr.missing', level, { prompt: `A three-letter word is missing from the word in capitals. Which three letters complete it?<br><i>${esc(it.s)}</i>`, answer: it.a, accept: [it.a], distractors: distract, explain: `${it.a} completes ${it.full}.`, seconds: 40 });
  }

  /* ------------------------- PROBLEM SOLVING ------------------------ */

  const STOPS = [['Clifton', 'Hotwells', 'Harbourside', 'Temple Meads'], ['Redland', 'Cotham', 'Broadmead', 'Old Market'], ['Bedminster', 'Southville', 'Centre', 'Stokes Croft']];

  function genTimetable(level, rng) {
    const stops = rng.pick(STOPS); const gaps = [rng.int(6, 14), rng.int(5, 12), rng.int(8, 15)]; const first = rng.int(7, 9) * 60 + rng.pick([0, 5, 10, 15, 20]); const every = rng.pick([15, 20, 25, 30]);
    const buses = [0, 1, 2, 3].map((b) => { let t = first + b * every; return stops.map((_, i) => { if (i) t += gaps[i - 1] + (b === 2 && level > 1 ? 3 : 0); return t; }); });
    let table = '<table class="data-table timetable"><tr><th></th>' + buses.map((_, b) => `<th>Bus ${b + 1}</th>`).join('') + '</tr>';
    stops.forEach((s, i) => { table += `<tr><th>${s}</th>${buses.map((bus) => `<td>${clock(bus[i])}</td>`).join('')}</tr>`; });
    table += '</table>';
    if (level === 1) { const b = rng.int(0, 3); const i = rng.int(0, 1); const j = rng.int(i + 1, 3); const ans = buses[b][j] - buses[b][i];
      return q('ps.timetable', level, { prompt: `Use the bus timetable. How many minutes does Bus ${b + 1} take to get from ${stops[i]} to ${stops[j]}?`, visual: table, answer: ans, numeric: true, unit: 'minutes', distractors: nearby(ans, rng, [ans + 5, ans - 5]), explain: `Bus ${b + 1} leaves ${stops[i]} at ${clock(buses[b][i])} and reaches ${stops[j]} at ${clock(buses[b][j])}: ${ans} minutes.`, seconds: 60 }); }
    if (level === 2) { const arriveBy = buses[2][3] - rng.int(0, 4); const need = buses.findIndex((bus) => bus[3] > arriveBy); const best = need === -1 ? 3 : need - 1; const ans = `Bus ${best + 1}`;
      return q('ps.timetable', level, { prompt: `Use the timetable. You must arrive at ${stops[3]} by ${clock(arriveBy)}. Which is the LATEST bus you can catch from ${stops[0]}?`, visual: table, format: 'mc', options: buses.map((_, b) => `Bus ${b + 1}`), answer: best, explain: `Bus ${best + 1} arrives at ${clock(buses[best][3])}, which is in time. Bus ${best + 2} would arrive at ${buses[best + 1] ? clock(buses[best + 1][3]) : '...'}: too late.`, seconds: 70 }); }
    const arrive = buses[1][0] + rng.int(1, every - 1); const nextBus = buses.findIndex((bus) => bus[0] >= arrive); const wait = buses[nextBus][0] - arrive;
    return q('ps.timetable', level, { prompt: `Use the timetable. You get to the ${stops[0]} stop at ${clock(arrive)}. How many minutes do you wait for the next bus, and what time will it get you to ${stops[2]}? Give the wait in minutes.`, visual: table, answer: wait, numeric: true, unit: 'minutes', distractors: nearby(wait, rng, [every - wait, wait + every]), explain: `The next bus (Bus ${nextBus + 1}) leaves at ${clock(buses[nextBus][0])}: a wait of ${wait} minutes. It reaches ${stops[2]} at ${clock(buses[nextBus][2])}.`, seconds: 80 });
  }

  function genChart(level, rng) {
    const kind = level === 1 ? 'picto' : level === 2 ? 'table' : 'twoway';
    if (kind === 'picto') { const per = rng.pick([2, 5, 10]); const items = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']; const counts = items.map(() => rng.int(1, 5)); const i = rng.int(0, 4);
      let html = `<table class="data-table"><caption>Ice creams sold (each 🍦 = ${per})</caption>` + items.map((d, k) => `<tr><th>${d}</th><td>${'🍦'.repeat(counts[k])}</td></tr>`).join('') + '</table>';
      const which = rng.chance(0.5); const ans = which ? counts[i] * per : counts.reduce((a, b) => a + b) * per;
      return q('ps.chart', level, { prompt: which ? `Use the pictogram. How many ice creams were sold on ${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][i]}?` : 'Use the pictogram. How many ice creams were sold in the whole week?', visual: html, answer: ans, numeric: true, distractors: nearby(ans, rng, [which ? counts[i] : counts.reduce((a, b) => a + b), ans + per]), explain: which ? `${counts[i]} symbols × ${per} = ${ans}.` : `${counts.reduce((a, b) => a + b)} symbols × ${per} = ${ans}.`, hint: 'Check the key: each symbol stands for more than one.', seconds: 45 }); }
    if (kind === 'table') { const names = ['Ash', 'Bea', 'Cem', 'Dot']; const tests = ['Test 1', 'Test 2', 'Test 3']; const scores = names.map(() => tests.map(() => rng.int(4, 20))); const i = rng.int(0, 3);
      let html = `<table class="data-table"><caption>Spelling test scores (out of 20)</caption><tr><th></th>${tests.map((t) => `<th>${t}</th>`).join('')}</tr>` + names.map((n, k) => `<tr><th>${n}</th>${scores[k].map((s) => `<td>${s}</td>`).join('')}</tr>`).join('') + '</table>';
      const ask = rng.pick(['total', 'best', 'mean']);
      if (ask === 'total') return q('ps.chart', level, { prompt: `Use the table. What is ${names[i]}’s total score across the three tests?`, visual: html, answer: scores[i].reduce((a, b) => a + b), numeric: true, distractors: nearby(scores[i].reduce((a, b) => a + b), rng), explain: `${scores[i].join(' + ')} = ${scores[i].reduce((a, b) => a + b)}.`, seconds: 50 });
      if (ask === 'best') { const t = rng.int(0, 2); const col = scores.map((s) => s[t]); const max = Math.max(...col); const who = names[col.indexOf(max)];
        return q('ps.chart', level, { prompt: `Use the table. Who scored highest in ${tests[t]}?`, visual: html, format: 'mc', options: names, answer: names.indexOf(who), explain: `Look down the ${tests[t]} column: ${who} scored ${max}.`, seconds: 35 }); }
      const total = scores[i].reduce((a, b) => a + b); const mean = +(total / 3).toFixed(1);
      return q('ps.chart', level, { prompt: `Use the table. What is ${names[i]}’s mean score? (to one decimal place if needed)`, visual: html, answer: mean, numeric: true, distractors: nearby(mean, rng, [total, Math.max(...scores[i])]), explain: `${scores[i].join(' + ')} = ${total}; ${total} ÷ 3 = ${mean}.`, seconds: 60 }); }
    const b1 = rng.int(5, 20), b2 = rng.int(5, 20), g1 = rng.int(5, 20), g2 = rng.int(5, 20);
    const html = `<table class="data-table"><caption>Year 6 pupils: how they travel to school</caption><tr><th></th><th>Walk</th><th>Car</th><th>Total</th></tr><tr><th>Boys</th><td>${b1}</td><td>?</td><td>${b1 + b2}</td></tr><tr><th>Girls</th><td>?</td><td>${g2}</td><td>${g1 + g2}</td></tr><tr><th>Total</th><td>?</td><td>?</td><td>${b1 + b2 + g1 + g2}</td></tr></table>`;
    const ask = rng.pick(['boyscar', 'girlswalk', 'walktotal']);
    const ans = ask === 'boyscar' ? b2 : ask === 'girlswalk' ? g1 : b1 + g1;
    return q('ps.chart', level, { prompt: `Use the two-way table. ${ask === 'boyscar' ? 'How many boys come by car?' : ask === 'girlswalk' ? 'How many girls walk?' : 'How many pupils walk altogether?'}`, visual: html, answer: ans, numeric: true, distractors: nearby(ans, rng, [b1 + b2, g1 + g2]), explain: ask === 'boyscar' ? `Boys total ${b1 + b2} minus ${b1} who walk = ${b2}.` : ask === 'girlswalk' ? `Girls total ${g1 + g2} minus ${g2} by car = ${g1}.` : `Boys who walk (${b1}) + girls who walk (${g1 + g2} − ${g2} = ${g1}) = ${b1 + g1}.`, seconds: 70 });
  }

  function fromPuzzle(it) {
    const base = { id: it.id, skill: it.skill, level: it.level, prompt: it.q, explain: it.explain, seconds: 75, bank: true };
    if (it.options) return Object.assign(base, { format: 'mc', options: it.options.slice(), answer: it.answer });
    return Object.assign(base, { format: 'typed', numeric: true, answer: it.answer, unit: it.unit, distractors: [] });
  }

  /* ----------------------- NON-VERBAL REASONING --------------------- */

  const SHAPES = ['triangle', 'square', 'pentagon', 'hexagon', 'circle', 'star', 'diamond'];
  const FILLS = ['white', 'grey', 'black', 'hatch', 'dots'];
  let patternCounter = 0;

  function polyPoints(shape, r, cx, cy, offsetDeg) {
    const n = { triangle: 3, square: 4, pentagon: 5, hexagon: 6, diamond: 4 }[shape];
    const pts = [];
    if (shape === 'star') {
      for (let i = 0; i < 10; i++) { const a = (-90 + i * 36) * Math.PI / 180; const rr = i % 2 ? r * 0.45 : r; pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]); }
    } else {
      const off = shape === 'square' ? 45 : shape === 'diamond' ? 0 : -90;
      for (let i = 0; i < n; i++) { const a = (off + (offsetDeg || 0) + i * 360 / n) * Math.PI / 180; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    }
    return pts.map(([x, y]) => x.toFixed(1) + ',' + y.toFixed(1)).join(' ');
  }

  function shapeEl(shape, r, cx, cy, fillAttr, extra) {
    extra = extra || '';
    if (shape === 'circle') return `<circle cx="${cx}" cy="${cy}" r="${r}" ${fillAttr} ${extra}/>`;
    if (shape === 'arrow') { const s = r / 36; const pts = [[-30, -10], [8, -10], [8, -24], [34, 0], [8, 24], [8, 10], [-30, 10]].map(([x, y]) => (cx + x * s).toFixed(1) + ',' + (cy + y * s).toFixed(1)).join(' '); return `<polygon points="${pts}" ${fillAttr} ${extra}/>`; }
    if (shape === 'ell') { const s = r / 36; const pts = [[-24, -30], [-4, -30], [-4, 10], [26, 10], [26, 30], [-24, 30]].map(([x, y]) => (cx + x * s).toFixed(1) + ',' + (cy + y * s).toFixed(1)).join(' '); return `<polygon points="${pts}" ${fillAttr} ${extra}/>`; }
    if (shape === 'flag') { const s = r / 36; const pts = [[-20, -32], [-12, -32], [-12, -14], [28, -4], [-12, 6], [-12, 32], [-20, 32]].map(([x, y]) => (cx + x * s).toFixed(1) + ',' + (cy + y * s).toFixed(1)).join(' '); return `<polygon points="${pts}" ${fillAttr} ${extra}/>`; }
    return `<polygon points="${polyPoints(shape, r, cx, cy)}" ${fillAttr} ${extra}/>`;
  }

  function fillAttr(fill, pid) {
    const stroke = 'stroke="#1e293b" stroke-width="2.5" stroke-linejoin="round"';
    const map = { white: '#ffffff', grey: '#9ca3af', black: '#1e293b', hatch: `url(#h${pid})`, dots: `url(#d${pid})` };
    return `fill="${map[fill] || '#fff'}" ${stroke}`;
  }

  // fig: { shape, fill, size, rot, inner: {shape, fill}|null, dash, mirror, mark }
  function figSvg(fig, label) {
    const pid = ++patternCounter;
    const r = 36 * (fig.size || 1);
    const defs = `<defs><pattern id="h${pid}" patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)"><rect width="7" height="7" fill="#fff"/><line x1="0" y1="0" x2="0" y2="7" stroke="#1e293b" stroke-width="2"/></pattern><pattern id="d${pid}" patternUnits="userSpaceOnUse" width="8" height="8"><rect width="8" height="8" fill="#fff"/><circle cx="4" cy="4" r="1.8" fill="#1e293b"/></pattern></defs>`;
    let t = fig.rot ? `rotate(${fig.rot} 50 50)` : '';
    if (fig.mirror) t = `translate(100 0) scale(-1 1) ` + t;
    const dash = fig.dash ? 'stroke-dasharray="6 4"' : '';
    let body = shapeEl(fig.shape, r, 50, 50, fillAttr(fig.fill, pid), dash);
    if (fig.inner) body += shapeEl(fig.inner.shape, r * 0.38, 50, 50, fillAttr(fig.inner.fill, pid));
    if (fig.mark) body += `<circle cx="${50 + r * 0.55}" cy="${50 - r * 0.55}" r="5" fill="#eb5757" stroke="#1e293b" stroke-width="1.5"/>`;
    return `<svg viewBox="0 0 100 100" class="nvr" role="img" aria-label="${esc(label || describeFig(fig))}">${defs}<g transform="${t}">${body}</g></svg>`;
  }

  function describeFig(f) {
    return `${f.size && f.size < 1 ? 'small ' : ''}${f.fill} ${f.shape}${f.rot ? ' rotated ' + f.rot + ' degrees' : ''}${f.inner ? ' containing a ' + f.inner.fill + ' ' + f.inner.shape : ''}${f.dash ? ' with a dashed outline' : ''}`;
  }

  const sameFig = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const cloneFig = (f) => JSON.parse(JSON.stringify(f));

  function randomFig(rng, opts) {
    opts = opts || {};
    return { shape: rng.pick(opts.shapes || SHAPES), fill: rng.pick(opts.fills || FILLS), size: opts.size || 1, rot: 0, inner: opts.inner ? { shape: rng.pick(['circle', 'square', 'triangle']), fill: rng.pick(['white', 'black']) } : null, dash: false };
  }

  // Change one attribute of a figure to make a distractor.
  function mutate(fig, rng, avoidAttr) {
    const attrs = ['shape', 'fill', 'rot', 'size', 'inner'].filter((a) => a !== avoidAttr);
    const f = cloneFig(fig); const a = rng.pick(attrs);
    if (a === 'shape') f.shape = rng.pick(SHAPES.filter((s) => s !== f.shape));
    else if (a === 'fill') f.fill = rng.pick(FILLS.filter((s) => s !== f.fill));
    else if (a === 'rot') f.rot = ((f.rot || 0) + rng.pick([45, 90, 180])) % 360;
    else if (a === 'size') f.size = f.size && f.size < 1 ? 1 : 0.6;
    else f.inner = f.inner ? (rng.chance(0.5) ? null : { shape: rng.pick(['circle', 'square', 'triangle'].filter((s) => s !== f.inner.shape)), fill: f.inner.fill }) : { shape: 'circle', fill: 'black' };
    if (['circle'].includes(f.shape) && a === 'rot') return mutate(fig, rng, avoidAttr); // rotation invisible on a circle
    return f;
  }

  function distinctDistractors(answer, rng, n, avoidAttr, extraAvoid) {
    const out = []; let guard = 0;
    while (out.length < n && guard++ < 60) {
      const m = mutate(answer, rng, avoidAttr);
      if (!sameFig(m, answer) && !out.some((o) => sameFig(o, m)) && !(extraAvoid || []).some((o) => sameFig(o, m))) out.push(m);
    }
    return out;
  }

  function mcFromFigs(skill, level, prompt, visual, correct, distractors, rng, explain, seconds) {
    const all = rng.shuffle([correct].concat(distractors));
    return q(skill, level, { prompt, visual, format: 'mc', options: all.map((f) => figSvg(f)), optionFigs: all, answer: all.findIndex((f) => sameFig(f, correct)), explain, seconds: seconds || 40 });
  }

  function genNvrSeq(level, rng) {
    const rules = rng.sample(['shape', 'fill', 'rot', 'size', 'inner'], level);
    const shapeCycle = rng.chance(0.5) ? ['triangle', 'square', 'pentagon', 'hexagon'] : rng.shuffle(SHAPES).slice(0, 3);
    const fillCycle = rng.chance(0.5) ? ['white', 'black'] : rng.sample(FILLS, 3);
    const innerCycle = ['circle', 'square', 'triangle'];
    const rotStep = rng.pick([45, 90]);
    const base = randomFig(rng, { shapes: rules.includes('rot') ? SHAPES.filter((s) => s !== 'circle') : SHAPES, inner: rules.includes('inner') });
    const figs = [];
    for (let i = 0; i < 5; i++) {
      const f = cloneFig(base);
      if (rules.includes('shape')) f.shape = shapeCycle[i % shapeCycle.length];
      if (rules.includes('fill')) f.fill = fillCycle[i % fillCycle.length];
      if (rules.includes('rot')) f.rot = (i * rotStep) % 360;
      if (rules.includes('size')) f.size = i % 2 ? 0.6 : 1;
      if (rules.includes('inner')) f.inner = { shape: innerCycle[i % 3], fill: f.inner ? f.inner.fill : 'black' };
      figs.push(f);
    }
    const shown = figs.slice(0, 4); const answer = figs[4];
    const visual = `<div class="fig-row">${shown.map((f) => figSvg(f)).join('')}<div class="fig-q">?</div></div>`;
    const words = { shape: 'the shape changes in a pattern', fill: 'the shading changes in a pattern', rot: `the figure turns ${rotStep}° each time`, size: 'the size alternates', inner: 'the inner shape cycles' };
    return mcFromFigs('nvr.seq', level, 'Which figure comes next in the sequence?', visual, answer, distinctDistractors(answer, rng, 3, null, shown), rng, `Look at each feature separately: ${rules.map((r) => words[r]).join('; ')}.`, 35 + level * 10);
  }

  function genNvrOdd(level, rng, attempt) {
    const prop = rng.pick(level === 1 ? ['shape', 'fill'] : level === 2 ? ['inner', 'size', 'dash', 'fill'] : ['match', 'parity', 'opposite']);
    const figs = []; let odd;
    if (prop === 'shape' || prop === 'fill') {
      const shared = randomFig(rng); for (let i = 0; i < 4; i++) { const f = randomFig(rng); if (prop === 'shape') f.shape = shared.shape; else f.fill = shared.fill; if (prop === 'shape' && f.shape !== 'circle') f.rot = rng.pick([0, 0, 45, 90]); figs.push(f); }
      odd = randomFig(rng); if (prop === 'shape') odd.shape = rng.pick(SHAPES.filter((s) => s !== shared.shape)); else odd.fill = rng.pick(FILLS.filter((s) => s !== shared.fill));
      figs.push(odd);
      return finishOdd(level, figs, rng, prop === 'shape' ? `Four figures are ${shared.shape}s; the odd one is a ${odd.shape}.` : `Four figures are ${shared.fill}; the odd one is ${odd.fill}.`, attempt);
    }
    if (prop === 'inner' || prop === 'size' || prop === 'dash') {
      const innerShape = rng.pick(['circle', 'square', 'triangle']);
      for (let i = 0; i < 4; i++) { const f = randomFig(rng, { inner: true }); if (prop === 'inner') f.inner.shape = innerShape; if (prop === 'size') f.size = 0.6; if (prop === 'dash') f.dash = true; figs.push(f); }
      odd = randomFig(rng, { inner: true }); if (prop === 'inner') odd.inner.shape = rng.pick(['circle', 'square', 'triangle'].filter((s) => s !== innerShape)); if (prop === 'size') odd.size = 1; if (prop === 'dash') odd.dash = false;
      figs.push(odd);
      return finishOdd(level, figs, rng, prop === 'inner' ? `Four figures contain a ${innerShape}; the odd one contains a ${odd.inner.shape}.` : prop === 'size' ? 'Four figures are small; the odd one is large.' : 'Four figures have dashed outlines; the odd one is solid.', attempt);
    }
    if (prop === 'match') {
      for (let i = 0; i < 4; i++) { const f = randomFig(rng, { shapes: ['triangle', 'square', 'circle'], inner: true }); f.inner.shape = f.shape; figs.push(f); }
      odd = randomFig(rng, { shapes: ['triangle', 'square', 'circle'], inner: true }); odd.inner.shape = rng.pick(['triangle', 'square', 'circle'].filter((s) => s !== odd.shape)); figs.push(odd);
      return finishOdd(level, figs, rng, 'In four figures the inner shape matches the outer shape. The odd one has a different shape inside.', attempt);
    }
    if (prop === 'parity') {
      const even = ['square', 'hexagon', 'diamond'], oddS = ['triangle', 'pentagon']; const useEven = rng.chance(0.5);
      for (let i = 0; i < 4; i++) { const f = randomFig(rng, { shapes: useEven ? even : oddS }); figs.push(f); }
      odd = randomFig(rng, { shapes: useEven ? oddS : even }); figs.push(odd);
      return finishOdd(level, figs, rng, `Four figures have an ${useEven ? 'even' : 'odd'} number of sides; the odd one has an ${useEven ? 'odd' : 'even'} number.`, attempt);
    }
    for (let i = 0; i < 4; i++) { const f = randomFig(rng, { fills: ['white', 'black'], inner: true }); f.inner.fill = f.fill === 'white' ? 'black' : 'white'; figs.push(f); }
    odd = randomFig(rng, { fills: ['white', 'black'], inner: true }); odd.inner.fill = odd.fill; figs.push(odd);
    return finishOdd(level, figs, rng, 'In four figures the inner and outer shading are opposite. The odd one has the same shading inside and out.', attempt);
  }

  function finishOdd(level, figs, rng, explain, attempt) {
    const keys = figs.map((f) => JSON.stringify(f));
    if (new Set(keys).size !== figs.length && (attempt || 0) < 25) return genNvrOdd(level, rng, (attempt || 0) + 1);
    const odd = figs[4]; const all = rng.shuffle(figs);
    return q('nvr.odd', level, { prompt: 'Which figure is the odd one out?', format: 'mc', options: all.map((f) => figSvg(f)), optionFigs: all, answer: all.findIndex((f) => sameFig(f, odd)), explain, seconds: 35 + level * 5 });
  }

  function genNvrMatrix(level, rng) {
    const n = level === 1 ? 2 : 3;
    const shapes = rng.sample(SHAPES.filter((s) => level < 3 || s !== 'circle'), n); const fills = rng.sample(FILLS, n);
    const inner = level === 3 && rng.chance(0.5); const innerCycle = rng.shuffle(['circle', 'square', 'triangle']);
    const grid = [];
    for (let r = 0; r < n; r++) { grid.push([]); for (let c = 0; c < n; c++) { const f = { shape: shapes[r], fill: fills[c], size: 1, rot: level === 3 && !inner ? c * 45 : 0, inner: inner ? { shape: innerCycle[c], fill: 'black' } : null, dash: false }; grid[r].push(f); } }
    const answer = grid[n - 1][n - 1];
    let visual = `<div class="fig-grid cols-${n}">`;
    grid.forEach((row, r) => row.forEach((f, c) => { visual += r === n - 1 && c === n - 1 ? '<div class="fig-q">?</div>' : figSvg(f); }));
    visual += '</div>';
    const explain = `Each row has the same shape and each column has the same shading${level === 3 ? (inner ? ' and the same inner shape' : ', and the figures turn 45° further in each column') : ''}. The missing figure is a ${describeFig(answer)}.`;
    return mcFromFigs('nvr.matrix', level, 'Which figure completes the grid?', visual, answer, distinctDistractors(answer, rng, 3, null, grid.flat()), rng, explain, 40 + level * 10);
  }

  function genNvrRotate(level, rng) {
    const base = { shape: rng.pick(['arrow', 'ell', 'flag']), fill: rng.pick(['white', 'grey', 'hatch']), size: 1, rot: rng.pick([0, 30, 60]), inner: null, dash: false, mark: true };
    if (level < 3) {
      const turn = rng.pick(level === 1 ? [90, 180] : [90, 180, 270, 45, 135]);
      const correct = cloneFig(base); correct.rot = (base.rot + turn) % 360;
      const mirror = cloneFig(base); mirror.mirror = true;
      const mirror2 = cloneFig(base); mirror2.mirror = true; mirror2.rot = (base.rot + turn) % 360;
      const other = cloneFig(base); other.rot = (base.rot + turn + rng.pick([90, 180])) % 360; other.mark = false;
      return mcFromFigs('nvr.rotate', level, `Which option shows the figure after it has been ROTATED (turned)?`, `<div class="fig-row">${figSvg(base, 'the original figure')}</div>`, correct, [mirror, mirror2, other], rng, `Rotating keeps the figure the same way round. Mirror images (flipped) are not rotations, even if they look similar. The red dot helps you track the turn.`, 45);
    }
    const correct = cloneFig(base); correct.mirror = true;
    const rot1 = cloneFig(base); rot1.rot = (base.rot + 90) % 360;
    const rot2 = cloneFig(base); rot2.rot = (base.rot + 180) % 360;
    const mirrorRot = cloneFig(base); mirrorRot.mirror = true; mirrorRot.rot = (base.rot + 180) % 360;
    return mcFromFigs('nvr.rotate', level, 'Which option shows the figure REFLECTED in a vertical mirror line (flipped left to right)?', `<div class="fig-row">${figSvg(base, 'the original figure')}<div class="mirror-line" aria-hidden="true"></div></div>`, correct, [rot1, rot2, mirrorRot], rng, 'A reflection flips the figure like looking in a mirror: left becomes right, but up stays up. Rotations keep it the same way round.', 50);
  }

  function genNvrCode(level, rng) {
    const shapes = rng.sample(SHAPES.filter((s) => s !== 'circle' || level === 1), 3); const fills = rng.sample(['white', 'black', 'hatch', 'dots', 'grey'], 3);
    const L1 = rng.shuffle(['A', 'B', 'C']), L2 = rng.shuffle(['X', 'Y', 'Z']), L3 = rng.shuffle(['P', 'Q']);
    const sizes = [1, 0.6];
    const codeOf = (f) => L1[shapes.indexOf(f.shape)] + L2[fills.indexOf(f.fill)] + (level >= 2 ? L3[sizes.indexOf(f.size)] : '');
    const examples = []; const used = new Set();
    const need = level === 1 ? 3 : 4; let guard = 0;
    while (examples.length < need && guard++ < 50) { const f = { shape: rng.pick(shapes), fill: rng.pick(fills), size: level >= 2 ? rng.pick(sizes) : 1, rot: 0, inner: null, dash: false }; const key = JSON.stringify(f); if (used.has(key)) continue; used.add(key); examples.push(f); }
    // Ensure every letter value appears at least once in the examples so the code is deducible.
    const seenShape = new Set(examples.map((f) => f.shape)), seenFill = new Set(examples.map((f) => f.fill));
    shapes.forEach((s, i) => { if (!seenShape.has(s)) { examples[i % examples.length].shape = s; } });
    fills.forEach((s, i) => { if (!seenFill.has(s)) { examples[(i + 1) % examples.length].fill = s; } });
    let target; guard = 0;
    do { target = { shape: rng.pick(shapes), fill: rng.pick(fills), size: level >= 2 ? rng.pick(sizes) : 1, rot: 0, inner: null, dash: false }; } while (examples.some((e) => sameFig(e, target)) && guard++ < 30);
    const answer = codeOf(target);
    const swaps = new Set(); const wrong = () => { const f = cloneFig(target); if (rng.chance(0.5)) f.shape = rng.pick(shapes.filter((s) => s !== f.shape)); else f.fill = rng.pick(fills.filter((s) => s !== f.fill)); if (level >= 2 && rng.chance(0.4)) f.size = f.size === 1 ? 0.6 : 1; return codeOf(f); };
    guard = 0; while (swaps.size < 3 && guard++ < 50) { const w = wrong(); if (w !== answer) swaps.add(w); }
    const opts = rng.shuffle([answer, ...swaps]);
    const visual = `<div class="fig-row codes">${examples.map((f) => `<div class="coded">${figSvg(f)}<span class="code">${codeOf(f)}</span></div>`).join('')}<div class="coded target">${figSvg(target)}<span class="code">?</span></div></div>`;
    return q('nvr.codes', level, { prompt: 'Each figure has a code. Work out what each letter stands for, then choose the code for the last figure.', visual, format: 'mc', options: opts, answer: opts.indexOf(answer), explain: `The first letter is the shape (${shapes.map((s, i) => L1[i] + ' = ' + s).join(', ')}), the second is the shading (${fills.map((s, i) => L2[i] + ' = ' + s).join(', ')})${level >= 2 ? ', the third is the size (' + L3[0] + ' = large, ' + L3[1] + ' = small)' : ''}. So the answer is ${answer}.`, seconds: 50 + level * 10 });
  }

  /* --------------------------- SPaG bank ---------------------------- */

  function fromSpag(it) {
    return { id: it.id, skill: it.skill, level: it.level, format: 'mc', prompt: it.q, options: it.options.slice(), answer: it.answer, explain: it.explain, seconds: 35, bank: true };
  }

  function fromPassage(passage, item, style) {
    const base = { id: item.id, skill: item.skill, level: item.level, prompt: item.q, explain: item.explain, passageId: passage.id, bank: true };
    if (style === 'mc' || !item.typed) return Object.assign(base, { format: 'mc', options: item.options.slice(), answer: item.answer, seconds: 45 });
    const t = item.typed;
    return Object.assign(base, { format: 'typed', inputType: 'text', long: !t.accept, answer: t.accept ? t.accept[0] : null, accept: t.accept || [], keywords: t.keywords || [], need: t.need || 1, model: t.model, seconds: t.accept ? 45 : 75 });
  }

  /* --------------------- multiple-choice conversion ----------------- */

  function displayAnswer(qn) {
    if (qn.unit && qn.numeric) return qn.unit === '£' ? '£' + fmt(qn.answer) : fmt(qn.answer) + (qn.unit === '%' || qn.unit === '°' || qn.unit === 'p' ? qn.unit : ' ' + qn.unit);
    return String(qn.answer);
  }

  function toMC(qn, rng) {
    if (qn.format === 'mc' && qn.options) return qn;
    rng = rng || makeRng();
    let ds = (qn.distractors || []).slice();
    if (ds.length < 3 && qn.numeric) ds = ds.concat(nearby(qn.answer, rng).filter((d) => !ds.includes(d)));
    if (ds.length < 3 && qn.fraction) {
      const m = String(qn.answer).match(/(\d+)\/(\d+)/); if (m) ds = ds.concat([`${+m[1] + 1}/${m[2]}`, `${m[1]}/${+m[2] + 1}`, `${m[2]}/${m[1]}`]);
    }
    if (ds.length < 3 && !(qn.format === 'mc')) return qn; // cannot build a fair multiple choice; keep typed
    if (!ds.length) return qn;
    const shown = (d) => (qn.numeric && typeof d === 'number' ? displayAnswer(Object.assign({}, qn, { answer: d })) : String(d));
    const correct = displayAnswer(qn);
    const opts = [correct].concat([...new Set(ds.map(shown))].filter((d) => d !== correct).slice(0, 3));
    const shuffled = rng.shuffle(opts);
    return Object.assign({}, qn, { format: 'mc', options: shuffled, answer: shuffled.indexOf(correct), typedAnswer: qn.answer, seconds: Math.max(25, Math.round((qn.seconds || 45) * 0.8)) });
  }

  /* ---------------------------- dispatcher -------------------------- */

  const GENERATORS = {
    arith: genArith, bidmas: genBidmas, fractions: genFractions, decimals: genDecimals, ratio: genRatio, number: genNumber, algebra: genAlgebra, sequences: genSequences, measure: genMeasure, time: genTime, money: genMoney, angles: genAngles, area: genArea, shapes: genShapes, stats: genStats, word: genWord,
    synonym: genSynonym, antonym: genAntonym, cloze: genCloze, oddword: genOddWord, analogy: genAnalogy, letterseq: genLetterSeq, lettercode: genLetterCode, anagram: genAnagram, hidden: genHidden, compound: genCompound, numseq: genNumSeq, missing: genMissing,
    nvrseq: genNvrSeq, nvrodd: genNvrOdd, nvrmatrix: genNvrMatrix, nvrrotate: genNvrRotate, nvrcode: genNvrCode,
    timetable: genTimetable, chart: genChart
  };

  const SKILL_BY_ID = {};
  D.SKILLS.forEach((s) => { SKILL_BY_ID[s.id] = s; });

  // Generate a question for a skill. `seen` is a Set of bank item ids to avoid.
  function generate(skillId, level, rng, seen) {
    rng = rng || makeRng(); level = Math.min(3, Math.max(1, level || 1));
    const skill = SKILL_BY_ID[skillId]; if (!skill) throw new Error('Unknown skill ' + skillId);
    const unseen = (items) => { const fresh = items.filter((i) => !seen || !seen.has(i.id)); return fresh.length ? fresh : items; };
    if (skill.gen === 'spag') { const pool = D.SPAG.filter((s) => s.skill === skillId); const lv = pool.filter((s) => s.level === level); return fromSpag(rng.pick(unseen(lv.length ? lv : pool))); }
    if (skill.gen === 'puzzle') { const pool = D.PUZZLES.filter((p) => p.skill === skillId); const lv = pool.filter((p) => p.level === level); return fromPuzzle(rng.pick(unseen(lv.length ? lv : pool))); }
    const fn = GENERATORS[skill.gen]; if (!fn) throw new Error('No generator for ' + skillId);
    const out = fn(level, rng);
    return out.format === 'mc' && !out.options ? toMC(out, rng) : out;
  }

  return {
    makeRng, generate, toMC, fromPassage, fromSpag, fromPuzzle, figSvg, barChartSvg, displayAnswer,
    GENERATORS, SKILL_BY_ID,
    _internals: { nearby, fracStr, clock, money, polyPoints, mutate, randomFig, hiddenHighlight, describeFig }
  };
});
