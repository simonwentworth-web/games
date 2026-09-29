'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const D = require('../js/data.js');
const G = require('../js/generator.js');

const SPECIES = Object.keys(D.BREEDS);

test('breed data is complete and consistent', () => {
  for (const species of SPECIES) {
    const ids = new Set();
    for (const b of D.BREEDS[species]) {
      assert.ok(!ids.has(b.id), `duplicate id ${b.id}`);
      ids.add(b.id);
      assert.ok(b.name && b.origin, `${b.id} needs a name and origin`);
      assert.ok(D.ORIGIN_NAMES[b.origin], `${b.id}: no name pool for origin ${b.origin}`);
      for (const key of ['size', 'energy', 'floof']) {
        assert.ok(Number.isInteger(b[key]) && b[key] >= 1 && b[key] <= 5, `${b.id}.${key} out of range`);
      }
      assert.ok(b.pre.length && b.suf.length, `${b.id} needs name fragments`);
      b.colors.forEach((c) => assert.ok(D.COLORS[c], `${b.id}: unknown color ${c}`));
      b.temper.forEach((t) => assert.ok(D.TEMPERAMENTS[t], `${b.id}: unknown temperament ${t}`));
      b.tags.forEach((t) => assert.ok(D.LOOK_TAGS[t], `${b.id}: unknown tag ${t}`));
      assert.ok(b.look.length >= 4, `${b.id} needs at least 4 look details`);
      assert.equal(new Set(b.look.map(([part]) => part)).size, b.look.length, `${b.id} repeats a look part`);
    }
    for (const [a, b] of D.KNOWN_CROSSES[species]) {
      assert.ok(ids.has(a) && ids.has(b), `known cross references unknown breed ${a} or ${b}`);
    }
  }
  Object.values(D.COLORS).forEach((c) => assert.ok(D.COLOR_NAMES[c.pool], `no name pool for color pool ${c.pool}`));
});

test('known crosses use their real-world names in either order', () => {
  const lab = G.getBreed('dog', 'labrador-retriever');
  const poodle = G.getBreed('dog', 'poodle');
  assert.deepEqual(G.crossName('dog', lab, poodle), { name: 'Labradoodle', known: true });
  assert.deepEqual(G.crossName('dog', poodle, lab), { name: 'Labradoodle', known: true });
  const persian = G.getBreed('cat', 'persian');
  const siamese = G.getBreed('cat', 'siamese');
  assert.equal(G.crossName('cat', siamese, persian).name, 'Himalayan');
});

test('every possible pair gets a tidy, symmetric breed name', () => {
  for (const species of SPECIES) {
    const breeds = D.BREEDS[species];
    for (let i = 0; i < breeds.length; i++) {
      for (let j = i + 1; j < breeds.length; j++) {
        const ab = G.crossName(species, breeds[i], breeds[j]);
        const ba = G.crossName(species, breeds[j], breeds[i]);
        assert.equal(ab.name, ba.name);
        assert.match(ab.name, /^[A-Z]/);
        if (ab.known) continue; // real names like "Hug" (Husky x Pug) are kept as-is
        assert.ok(ab.name.length >= 4 && ab.name.length <= 16, `odd length: ${ab.name}`);
        assert.doesNotMatch(ab.name.toLowerCase(), /(.)\1\1/, `triple letter: ${ab.name}`);
      }
    }
  }
});

test('createCross is deterministic for the same seed', () => {
  const opts = { species: 'cat', a: 'maine-coon', b: 'sphynx', seed: 4242 };
  assert.deepEqual(JSON.stringify(G.createCross(opts)), JSON.stringify(G.createCross(opts)));
});

test('every pair and seed yields a full result', () => {
  for (const species of SPECIES) {
    const breeds = D.BREEDS[species];
    for (const a of breeds) {
      for (const b of breeds) {
        if (a === b) continue;
        for (const seed of [1, 77, 2024]) {
          const r = G.createCross({ species, a: a.id, b: b.id, seed });
          assert.ok(r, `${a.id} x ${b.id}`);
          assert.equal(r.petNames.length, 3);
          assert.equal(new Set(r.petNames.map((n) => n.name)).size, 3, 'pet names must be unique');
          r.petNames.forEach((n) => assert.ok(n.name && n.why));
          assert.ok(r.traits.features.a.length >= 1 && r.traits.features.b.length >= 1);
          assert.ok(r.prompt.includes(a.name) && r.prompt.includes(b.name));
          assert.ok(r.prompt.length < 1000, 'prompt should stay URL-friendly');
          assert.doesNotMatch(r.description + r.prompt, /undefined|NaN|null/);
        }
      }
    }
  }
});

test('invalid input is rejected', () => {
  assert.equal(G.createCross({ species: 'fish', a: 'x', b: 'y', seed: 1 }), null);
  assert.equal(G.createCross({ species: 'dog', a: 'poodle', b: 'poodle', seed: 1 }), null);
  assert.equal(G.createCross({ species: 'dog', a: 'poodle', b: 'not-a-breed', seed: 1 }), null);
  assert.equal(G.createCross({ species: 'dog', a: 'poodle', b: 'pug', seed: 0 }), null);
  assert.equal(G.createCross({ species: 'dog', a: 'poodle', b: 'pug', seed: 1.5 }), null);
});

test('random parents never repeat the excluded breed', () => {
  for (let i = 0; i < 200; i++) {
    assert.notEqual(G.pickRandomBreed('cat', 'persian').id, 'persian');
  }
  const seed = G.newSeed();
  assert.ok(G.isValidSeed(seed));
});
