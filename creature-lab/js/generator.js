/*
 * Creature Lab — hybrid logic.
 *
 * Deterministic for a given (animalA, animalB, seed), so a shared link always
 * rebuilds the same creature, names and image prompt.
 * Runs in the browser (window.CLGenerator) and in Node (require).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./data.js'));
  } else {
    root.CLGenerator = factory(root.CLData);
  }
})(typeof self !== 'undefined' ? self : this, function (DATA) {
  'use strict';

  const MAX_SEED = 2147483647;

  // ---------- seeded randomness ----------

  function hashString(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function mulberry32(a) {
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // A separate stream per concern, so tweaking one never reshuffles the others.
  function rngFor(seed, salt) {
    return mulberry32(hashString(seed + '|' + salt));
  }

  function pick(rng, list) {
    return list[Math.floor(rng() * list.length)];
  }

  function shuffle(rng, list) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    return out;
  }

  function newSeed() {
    const c = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
    if (c && c.getRandomValues) {
      const buf = new Uint32Array(1);
      c.getRandomValues(buf);
      return (buf[0] % (MAX_SEED - 1)) + 1;
    }
    return Math.floor(Math.random() * (MAX_SEED - 1)) + 1;
  }

  function isValidSeed(seed) {
    return Number.isInteger(seed) && seed >= 1 && seed <= MAX_SEED;
  }

  // ---------- lookups ----------

  const byId = new Map(DATA.ANIMALS.map((a) => [a.id, a]));

  function getAnimal(id) {
    return byId.get(id) || null;
  }

  function pickRandomAnimal(excludeId, rng) {
    return pick(rng || Math.random, DATA.ANIMALS.filter((a) => a.id !== excludeId));
  }

  // ---------- small text helpers ----------

  function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function article(word) {
    if (/^(uni|eu|one)/i.test(word)) return 'a';
    return /^[aeiou]/i.test(word) ? 'an' : 'a';
  }

  // "Komodo Dragon" -> "Komodo dragon", "Humpback Whale" -> "humpback whale"
  function lower(name) {
    return name
      .split(' ')
      .map((w) => (w === 'Komodo' ? w : w.toLowerCase()))
      .join(' ');
  }

  function listJoin(items) {
    if (items.length <= 1) return items.join('');
    return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
  }

  function clamp(n, lo, hi) {
    return Math.min(hi, Math.max(lo, n));
  }

  // ---------- hybrid names ----------

  function pairKey(a, b) {
    return [a, b].sort().join('+');
  }

  const knownIndex = {};
  DATA.KNOWN_HYBRIDS.forEach((k) => {
    knownIndex[pairKey(k.a, k.b)] = k;
  });

  const isVowel = (ch) => /[aeiouy]/i.test(ch);

  // Glue a prefix and suffix together, smoothing the seam ("Pand" + "anda" -> "Panda...").
  function joinParts(pre, suf) {
    let tail = suf.toLowerCase();
    if (isVowel(pre.slice(-1))) {
      while (tail.length > 2 && isVowel(tail[0])) tail = tail.slice(1);
    }
    return (pre + tail).replace(/(.)\1\1+/gi, '$1$1');
  }

  // Lower is better: favour short, pronounceable words.
  function scoreName(word) {
    const w = word.toLowerCase();
    let score = 0;
    if (w.length < 5) score += (5 - w.length) * 1.5;
    if (w.length > 10) score += (w.length - 10) * 1.2;
    (w.match(/[^aeiouy]{3,}/g) || []).forEach((cluster) => {
      if (!/^(sch|chr|str|ght|tch|nch|rst|rch|ngl|ndl|ckl|phr|thr|ntl)$/.test(cluster)) score += 3 * (cluster.length - 2);
    });
    score += (w.match(/[aeiou]{3,}/g) || []).length * 3;
    if (/(aa|ii|uu|yy|ae|ao|oa|iu|ui)/.test(w)) score += 2;
    if (/[^aeiouy]{2}$/.test(w) && !/(ll|ss|nd|rd|rt|st|ck|ng|nk|rk|rm|rn|sk|lf|ch|sh|th|x|wl)$/.test(w)) score += 1.5;
    return score;
  }

  function hybridName(a, b) {
    const known = knownIndex[pairKey(a.id, b.id)];
    if (known) return { name: known.name, kind: known.kind, known };

    const parentNames = [a.name, b.name].map((n) => n.toLowerCase());
    let best = null;
    [[a, b], [b, a]].forEach(([first, second]) => {
      first.pre.forEach((pre, i) => {
        second.suf.forEach((suf, j) => {
          const word = capitalize(joinParts(pre, suf).toLowerCase());
          if (parentNames.includes(word.toLowerCase())) return;
          const trimmed = pre.length + suf.length - word.length;
          const score = scoreName(word) + (i + j) * 0.6 + trimmed;
          if (!best || score < best.score || (score === best.score && word < best.word)) {
            best = { word, score };
          }
        });
      });
    });
    return { name: best.word, kind: 'new', known: null };
  }

  // ---------- anatomy & traits ----------

  function meter(rng, x, y) {
    return clamp((x + y) / 2 + (rng() - 0.5) * 0.8, 1, 5);
  }

  function blendDiet(x, y) {
    if (x === y) return x;
    if ([x, y].includes('insectivore') && [x, y].includes('carnivore')) return 'carnivore';
    return 'omnivore';
  }

  function buildAnatomy(seed, a, b, known) {
    const rng = rngFor(seed, 'anatomy');
    let head;
    let body;
    if (known && known.head) {
      head = getAnimal(known.head);
      body = getAnimal(known.body);
    } else if (rng() < 0.5) {
      head = a;
      body = b;
    } else {
      head = b;
      body = a;
    }

    // Both signature features always appear; the non-head parent's goes first so it
    // wins any clash (a Cockatrice keeps its serpent tail).
    const other = head === a ? b : a;
    const used = new Set();
    const extras = [];
    const add = ([part, phrase]) => {
      if (used.has(part) || extras.length >= 3) return;
      used.add(part);
      extras.push(phrase);
    };
    add(other.extras[0]);
    add(head.extras[0]);
    if (!known || known.kind !== 'legendary') {
      shuffle(rng, a.extras.slice(1).concat(b.extras.slice(1))).forEach(add);
    }

    let covering;
    if (known && known.covering) covering = known.covering;
    else if (head === body || head.covering === body.covering) covering = body.covering;
    else covering = `${body.covering} that turns into ${head.covering} around the head`;

    return { head, body, sameBody: head === body, extras, covering };
  }

  function blendTraits(a, b, seed) {
    const rng = rngFor(seed, 'traits');
    const size = meter(rng, a.size, b.size);
    const speed = meter(rng, a.speed, b.speed);
    const fierce = meter(rng, a.fierce, b.fierce);
    const sizeIndex = Math.round(size) - 1;
    const fierceIndex = Math.round(fierce) - 1;

    const habitats = a.habitat === b.habitat ? [a.habitat] : [a.habitat, b.habitat];
    const powersRng = rngFor(seed, 'powers');
    const temperRng = rngFor(seed, 'temper');
    const firstTemper = pick(temperRng, a.temper);
    const otherTempers = b.temper.filter((t) => t !== firstTemper);
    const secondTemper = pick(temperRng, otherTempers.length ? otherTempers : b.temper);

    return {
      size,
      sizeIndex,
      sizeLabel: DATA.SIZES.labels[sizeIndex],
      sizeWord: DATA.SIZES.words[sizeIndex],
      sizePhrase: DATA.SIZES.phrases[sizeIndex],
      speed,
      speedLabel: DATA.SPEED_LABELS[Math.round(speed) - 1],
      fierce,
      fierceLabel: DATA.FIERCE_LABELS[fierceIndex],
      fierceWord: DATA.FIERCE_WORDS[fierceIndex],
      habitats,
      habitatLabel: habitats.map((h) => DATA.HABITATS[h].label).join(' + '),
      diet: DATA.DIETS[blendDiet(a.diet, b.diet)],
      snack: a.food === b.food ? `Lots and lots of ${a.food}` : `${capitalize(a.food)} with a side of ${b.food}`,
      sound: `${a.sound}-${b.sound.toLowerCase()}!`,
      powers: [pick(powersRng, a.powers), pick(powersRng, b.powers)],
      temperaments: [firstTemper, secondTemper].map((key) => ({ key, adj: DATA.TEMPERAMENTS[key].adj }))
    };
  }

  // ---------- pet name ideas ----------

  function suggestNames(a, b, traits, hybrid, seed) {
    const rng = rngFor(seed, 'names');
    const taken = new Set([hybrid.name, a.name, b.name].map((n) => n.toLowerCase()));

    const fromPool = (pool) => shuffle(rng, pool || []).find((n) => !taken.has(n.toLowerCase())) || null;
    const iconic = (animal) => () => {
      const name = fromPool(animal.names);
      return name && { name, why: `A nod to its ${lower(animal.name)} side` };
    };

    const ideas = {
      iconicA: iconic(a),
      iconicB: iconic(b),
      habitat() {
        for (const h of shuffle(rng, traits.habitats)) {
          const name = fromPool(DATA.HABITATS[h].names);
          if (name) return { name, why: DATA.HABITATS[h].why };
        }
        return null;
      },
      size() {
        const name = fromPool(DATA.SIZES.names[traits.sizeIndex]);
        return name && { name, why: DATA.SIZES.why[traits.sizeIndex] };
      },
      personality() {
        for (const t of shuffle(rng, traits.temperaments)) {
          const name = fromPool(DATA.TEMPERAMENTS[t.key].names);
          if (name) return { name, why: `Perfect for ${article(t.adj)} ${t.adj} personality` };
        }
        return null;
      }
    };

    const results = [];
    for (const key of shuffle(rng, Object.keys(ideas))) {
      if (results.length === 3) break;
      const idea = ideas[key]();
      if (!idea) continue;
      taken.add(idea.name.toLowerCase());
      results.push(idea);
    }
    return results;
  }

  // ---------- description & image prompt ----------

  function describe(anatomy, traits) {
    const lead = `${traits.sizeWord}, ${traits.fierceWord}`;
    const shape = anatomy.sameBody
      ? `It looks like ${article(anatomy.head.name)} ${lower(anatomy.head.name)}`
      : `It has ${anatomy.head.head}, joined to ${anatomy.body.body}`;
    return (
      `${capitalize(article(lead))} ${lead} creature. ${shape}. ` +
      `It's covered in ${anatomy.covering}, and has ${listJoin(anatomy.extras)}.`
    );
  }

  function buildImagePrompt(a, b, hybrid, anatomy, traits) {
    let intro = 'Photorealistic wildlife photograph of a single hybrid creature';
    if (hybrid.kind === 'legendary') intro += `, the legendary ${hybrid.name}`;
    if (hybrid.kind === 'real') intro += `, ${article(hybrid.name)} ${hybrid.name} (a real-life hybrid)`;
    const shape = anatomy.sameBody
      ? `It has the head and body of ${article(anatomy.head.name)} ${lower(anatomy.head.name)}.`
      : `It has ${anatomy.head.head}, seamlessly joined to ${anatomy.body.body}.`;
    return [
      `${intro}: part ${lower(a.name)} and part ${lower(b.name)}.`,
      shape,
      `It is covered in ${anatomy.covering}.`,
      `It also has ${listJoin(anatomy.extras)}.`,
      `It is ${traits.sizePhrase}.`,
      `The creature is ${DATA.HABITATS[anatomy.body.habitat].scene}.`,
      'Natural light, sharp focus, highly detailed textures, award-winning wildlife photography, telephoto lens, shallow depth of field.',
      'Exactly one creature, believable anatomy, no people, no text, no watermark.'
    ].join(' ');
  }

  // ---------- main entry point ----------

  function createHybrid(options) {
    const seed = Number(options.seed);
    if (!isValidSeed(seed)) return null;
    const a = getAnimal(options.a);
    const b = getAnimal(options.b);
    if (!a || !b || a.id === b.id) return null;

    const hybrid = hybridName(a, b);
    const anatomy = buildAnatomy(seed, a, b, hybrid.known);
    const traits = blendTraits(a, b, seed);
    return {
      seed,
      parents: [a, b],
      name: hybrid.name,
      kind: hybrid.kind,
      anatomy: { head: anatomy.head.id, body: anatomy.body.id, extras: anatomy.extras, covering: anatomy.covering },
      traits,
      description: describe(anatomy, traits),
      petNames: suggestNames(a, b, traits, hybrid, seed),
      prompt: buildImagePrompt(a, b, hybrid, anatomy, traits)
    };
  }

  return {
    MAX_SEED,
    newSeed,
    isValidSeed,
    animals: () => DATA.ANIMALS,
    getAnimal,
    pickRandomAnimal,
    hybridName,
    createHybrid,
    // exposed for tests
    _internals: { joinParts, scoreName, pairKey }
  };
});
