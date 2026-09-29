/*
 * Unique Animal Generator — cross-breed logic.
 *
 * Everything here is deterministic for a given (species, parentA, parentB, seed),
 * so a shared link always rebuilds the same breed, names and image prompt.
 * Runs in the browser (window.UAGGenerator) and in Node (require).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./data.js'));
  } else {
    root.UAGGenerator = factory(root.UAGData);
  }
})(typeof self !== 'undefined' ? self : this, function (DATA) {
  'use strict';

  const MAX_SEED = 2147483647;
  const COLOR_BOUND_PARTS = ['markings', 'mask', 'forehead'];
  const SIZE_BOUND_PARTS = ['body'];
  const COAT_TAGS = ['curly', 'fluffy', 'silky', 'plush', 'sleek', 'wiry', 'hairless'];

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

  function isSpecies(species) {
    return Object.prototype.hasOwnProperty.call(DATA.BREEDS, species);
  }

  function breedsFor(species) {
    return isSpecies(species) ? DATA.BREEDS[species] : [];
  }

  function getBreed(species, id) {
    return breedsFor(species).find((b) => b.id === id) || null;
  }

  function pickRandomBreed(species, excludeId, rng) {
    const pool = breedsFor(species).filter((b) => b.id !== excludeId);
    return pick(rng || Math.random, pool);
  }

  // ---------- small text helpers ----------

  function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function article(word) {
    return /^[aeiou]/i.test(word) ? 'an' : 'a';
  }

  function listJoin(items) {
    if (items.length <= 1) return items.join('');
    return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
  }

  function clamp(n, lo, hi) {
    return Math.min(hi, Math.max(lo, n));
  }

  function inPlace(origin) {
    return origin === 'USA' ? 'the USA' : origin;
  }

  // ---------- cross-breed names ----------

  function pairKey(a, b) {
    return [a, b].sort().join('+');
  }

  const knownIndex = {};
  Object.keys(DATA.KNOWN_CROSSES).forEach((species) => {
    knownIndex[species] = {};
    DATA.KNOWN_CROSSES[species].forEach(([a, b, name]) => {
      knownIndex[species][pairKey(a, b)] = name;
    });
  });

  const isVowel = (ch) => /[aeiouy]/i.test(ch);

  // Glue a prefix and suffix together, smoothing the seam ("Bassa" + "eagle" -> "Bassagle").
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
      if (!/^(sch|chr|str|ght|tch|nch|rst|rch|ngl|ndl|ckl)$/.test(cluster)) score += 3 * (cluster.length - 2);
    });
    score += (w.match(/[aeiou]{3,}/g) || []).length * 3;
    if (/(aa|ii|uu|yy|ae|ao|oa|iu|ui)/.test(w)) score += 2;
    if (/[^aeiouy]{2}$/.test(w) && !/(ll|ss|nd|rd|rt|st|ck|ng|nk|rk|rm|rn|sk|lf|ch|sh|th|x)$/.test(w)) score += 1.5;
    return score;
  }

  function crossName(species, a, b) {
    const known = knownIndex[species] && knownIndex[species][pairKey(a.id, b.id)];
    if (known) return { name: known, known: true };

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
    return { name: best.word, known: false };
  }

  // ---------- trait blending ----------

  function meter(rng, a, b) {
    const jitter = (rng() - 0.5) * 0.8;
    return clamp((a + b) / 2 + jitter, 1, 5);
  }

  function pickColor(rng, a, b) {
    // Colours both parents share get double weight.
    const weighted = [];
    a.colors.forEach((c) => weighted.push({ key: c, from: b.colors.includes(c) ? 'both' : 'a' }));
    b.colors.forEach((c) => weighted.push({ key: c, from: a.colors.includes(c) ? 'both' : 'b' }));
    const choice = pick(rng, weighted);
    return { key: choice.key, from: choice.from, ...DATA.COLORS[choice.key] };
  }

  function blendCoat(a, b, floof) {
    const aHairless = a.tags.includes('hairless');
    const bHairless = b.tags.includes('hairless');
    if (aHairless && bHairless) {
      return { hairless: true, tag: 'hairless', short: 'Hairless', phrase: 'hairless, with soft, warm, slightly wrinkled skin', noun: (c) => `hairless, ${c}-toned skin` };
    }
    if (aHairless || bHairless) {
      return { hairless: true, tag: 'hairless', short: 'Peach fuzz', phrase: 'very short, fine and velvety, like peach fuzz', noun: (c) => `a velvety, peach-fuzz ${c} coat` };
    }
    const tags = a.tags.concat(b.tags);
    const length = floof >= 4 ? 'long' : floof >= 3 ? 'medium-length' : floof >= 2 ? 'short' : 'very short';
    let texture;
    let tag = null;
    if (tags.includes('curly')) {
      texture = a.tags.includes('curly') && b.tags.includes('curly') ? 'curly' : 'wavy';
      tag = 'curly';
    } else if (tags.includes('wiry')) {
      texture = 'scruffy and wiry';
      tag = 'wiry';
    } else if (tags.includes('silky') && floof >= 3) {
      texture = 'silky';
      tag = 'silky';
    } else if (floof >= 3.5) {
      texture = 'fluffy';
      tag = 'fluffy';
    } else if (floof <= 2) {
      texture = 'sleek';
      tag = 'sleek';
    } else {
      texture = 'soft';
      tag = tags.includes('plush') ? 'plush' : null;
    }
    return {
      hairless: false,
      tag,
      short: capitalize(texture.split(' ')[0]),
      phrase: length + ' and ' + texture,
      noun: (c) => `${article(length)} ${length}, ${texture} ${c} coat`
    };
  }

  // Two look details per parent, never two for the same body part, and never one
  // that contradicts the blended colour or size.
  function pickFeatures(rng, a, b, color, size) {
    const used = new Set();
    const choose = (parent, owner) => {
      const chosen = [];
      shuffle(rng, parent.look).forEach(([part, phrase]) => {
        if (chosen.length >= 2 || used.has(part)) return;
        if (COLOR_BOUND_PARTS.includes(part) && color.from !== owner && color.from !== 'both') return;
        if (SIZE_BOUND_PARTS.includes(part) && Math.abs(parent.size - size) > 1) return;
        chosen.push(phrase);
        used.add(part);
      });
      return chosen;
    };
    const fa = choose(a, 'a');
    const fb = choose(b, 'b');
    return { a: fa, b: fb };
  }

  function pickTemperaments(rng, a, b) {
    const first = pick(rng, a.temper);
    const rest = b.temper.filter((t) => t !== first);
    const second = pick(rng, rest.length ? rest : b.temper);
    return [first, second].map((key) => ({ key, adj: DATA.TEMPERAMENTS[key].adj }));
  }

  function blendTraits(species, a, b, seed) {
    const sp = DATA.SPECIES[species];
    const rng = rngFor(seed, 'traits');
    const size = meter(rng, a.size, b.size);
    const energy = meter(rng, a.energy, b.energy);
    const oneHairless = a.tags.includes('hairless') || b.tags.includes('hairless');
    const floof = oneHairless ? 1 : meter(rng, a.floof, b.floof);
    const sizeIndex = Math.round(size) - 1;
    const energyIndex = Math.round(energy) - 1;
    const color = pickColor(rngFor(seed, 'color'), a, b);
    const coat = blendCoat(a, b, floof);
    return {
      size,
      sizeIndex,
      sizeLabel: sp.sizeLabels[sizeIndex],
      sizeWord: sp.sizeWords[sizeIndex],
      sizePhrase: sp.sizePhrases[sizeIndex],
      energy,
      energyLabel: sp.energyLabels[energyIndex],
      energyWord: sp.energyWords[energyIndex],
      floof,
      floofLabel: coat.hairless ? coat.short : DATA.FLOOF_LABELS[Math.round(floof) - 1],
      coat,
      color,
      features: pickFeatures(rngFor(seed, 'features'), a, b, color, size),
      temperaments: pickTemperaments(rngFor(seed, 'temper'), a, b),
      scene: pick(rngFor(seed, 'scene'), sp.scenes)
    };
  }

  // ---------- pet name ideas ----------

  function suggestNames(species, a, b, traits, breedName, seed) {
    const rng = rngFor(seed, 'names');
    const sp = DATA.SPECIES[species];
    const taken = new Set([breedName.toLowerCase(), a.name.toLowerCase(), b.name.toLowerCase()]);

    const fromPool = (pool) => {
      const options = shuffle(rng, pool || []).filter((n) => !taken.has(n.toLowerCase()));
      return options[0] || null;
    };

    const ideas = {
      origin() {
        for (const parent of shuffle(rng, [a, b])) {
          const name = fromPool(DATA.ORIGIN_NAMES[parent.origin]);
          if (name) return { name, why: `A nod to the ${parent.name}'s roots in ${inPlace(parent.origin)}` };
        }
        return null;
      },
      color() {
        const name = fromPool(DATA.COLOR_NAMES[traits.color.pool]);
        return name && { name, why: `Inspired by that ${traits.color.label.toLowerCase()} coat` };
      },
      size() {
        const name = fromPool(DATA.SIZE_NAMES[species][traits.sizeIndex]);
        return name && { name, why: sp.sizeWhy[traits.sizeIndex] };
      },
      personality() {
        for (const t of shuffle(rng, traits.temperaments)) {
          const name = fromPool(DATA.TEMPERAMENTS[t.key].names);
          if (name) return { name, why: `Perfect for ${article(t.adj)} ${t.adj} personality` };
        }
        return null;
      },
      look() {
        // Coat ideas follow the blended coat; other quirks (wrinkles, big ears...) come from either parent.
        const tags = a.tags.concat(b.tags).filter((t) => !COAT_TAGS.includes(t) && t !== 'spotted');
        if (traits.coat.tag) tags.push(traits.coat.tag);
        if (traits.color.pool === 'spotted') tags.push('spotted');
        return pickTag(shuffle(rng, Array.from(new Set(tags))));
      }
    };

    function pickTag(tags) {
      for (const tag of tags) {
        const name = fromPool(DATA.LOOK_TAGS[tag].names);
        if (name) return { name, why: DATA.LOOK_TAGS[tag].why };
      }
      return null;
    }

    const results = [];
    for (const key of shuffle(rng, Object.keys(ideas))) {
      if (results.length === 3) break;
      const idea = ideas[key]();
      if (!idea) continue;
      taken.add(idea.name.toLowerCase());
      results.push({ ...idea, source: key });
    }
    return results;
  }

  // ---------- description & image prompt ----------

  function describe(species, a, b, traits) {
    const sp = DATA.SPECIES[species];
    const lead = `${traits.sizeWord}, ${traits.energyWord} ${sp.baby}`;
    const featA = traits.features.a[0];
    const featB = traits.features.b[0];
    const temper = traits.temperaments.map((t) => t.adj);
    const coat = traits.coat.noun(traits.color.label.toLowerCase());
    return (
      `${capitalize(article(lead))} ${lead} with ${featA} from the ${a.name} and ${featB} from the ${b.name}. ` +
      `Expect ${coat} and ${article(temper[0])} ${temper[0]}, ${temper[1]} personality.`
    );
  }

  function buildImagePrompt(species, a, b, breed, traits) {
    const noun = DATA.SPECIES[species].noun;
    const knownAs = breed.known ? `, known as a ${breed.name}` : '';
    return [
      `Photorealistic photograph of one ${traits.sizePhrase} adult ${noun}: a mixed breed${knownAs}, half ${a.name} and half ${b.name}.`,
      `It has ${listJoin(traits.features.a)} like a ${a.name}, plus ${listJoin(traits.features.b)} like a ${b.name}.`,
      `Its coat is ${traits.coat.phrase}, colored ${traits.color.phrase}.`,
      `Full body in frame, ${traits.scene}.`,
      `Natural soft daylight, sharp focus on the eyes, highly detailed ${traits.coat.hairless ? 'skin texture' : 'fur'}, professional pet photography, 50mm lens, shallow depth of field.`,
      'Exactly one animal, no people, no text, no watermark.'
    ].join(' ');
  }

  // ---------- main entry point ----------

  function createCross(options) {
    const species = options.species;
    const seed = Number(options.seed);
    if (!isSpecies(species) || !isValidSeed(seed)) return null;
    const a = getBreed(species, options.a);
    const b = getBreed(species, options.b);
    if (!a || !b || a.id === b.id) return null;

    const breed = crossName(species, a, b);
    const traits = blendTraits(species, a, b, seed);
    return {
      species,
      seed,
      parents: [a, b],
      breedName: breed.name,
      known: breed.known,
      traits,
      description: describe(species, a, b, traits),
      petNames: suggestNames(species, a, b, traits, breed.name, seed),
      prompt: buildImagePrompt(species, a, b, breed, traits)
    };
  }

  return {
    MAX_SEED,
    newSeed,
    isValidSeed,
    isSpecies,
    breedsFor,
    getBreed,
    pickRandomBreed,
    crossName,
    createCross,
    // exposed for tests
    _internals: { joinParts, scoreName, hashString, pairKey }
  };
});
