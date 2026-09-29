'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const D = require('../js/data.js');
const G = require('../js/generator.js');

const ANIMALS = D.ANIMALS;

test('animal data is complete and consistent', () => {
  const ids = new Set();
  for (const a of ANIMALS) {
    assert.ok(!ids.has(a.id), `duplicate id ${a.id}`);
    ids.add(a.id);
    for (const key of ['name', 'emoji', 'head', 'body', 'covering', 'food', 'sound']) {
      assert.ok(typeof a[key] === 'string' && a[key].length, `${a.id}.${key} missing`);
    }
    assert.ok(D.GROUPS[a.group], `${a.id}: unknown group ${a.group}`);
    assert.ok(D.HABITATS[a.habitat], `${a.id}: unknown habitat ${a.habitat}`);
    assert.ok(D.DIETS[a.diet], `${a.id}: unknown diet ${a.diet}`);
    for (const key of ['size', 'speed', 'fierce']) {
      assert.ok(Number.isInteger(a[key]) && a[key] >= 1 && a[key] <= 5, `${a.id}.${key} out of range`);
    }
    assert.ok(a.pre.length && a.suf.length, `${a.id} needs name fragments`);
    assert.ok(a.extras.length >= 3, `${a.id} needs at least 3 extras`);
    assert.equal(new Set(a.extras.map(([part]) => part)).size, a.extras.length, `${a.id} repeats an extra part`);
    assert.equal(a.powers.length, 2, `${a.id} needs two powers`);
    assert.ok(a.names.length >= 3, `${a.id} needs 3 names`);
    a.temper.forEach((t) => assert.ok(D.TEMPERAMENTS[t], `${a.id}: unknown temperament ${t}`));
  }
  for (const k of D.KNOWN_HYBRIDS) {
    for (const id of [k.a, k.b, k.head, k.body].filter(Boolean)) {
      assert.ok(ids.has(id), `known hybrid ${k.name} references unknown animal ${id}`);
    }
    assert.ok(['real', 'legendary'].includes(k.kind));
  }
});

test('real and legendary hybrids keep their names in either order', () => {
  const lion = G.getAnimal('lion');
  const tiger = G.getAnimal('tiger');
  const eagle = G.getAnimal('eagle');
  assert.equal(G.hybridName(lion, tiger).name, 'Liger');
  assert.equal(G.hybridName(tiger, lion).kind, 'real');
  assert.equal(G.hybridName(eagle, lion).name, 'Griffin');
  assert.equal(G.hybridName(lion, eagle).kind, 'legendary');
});

test('legendary creatures follow their myths', () => {
  const griffin = G.createHybrid({ a: 'lion', b: 'eagle', seed: 99 });
  assert.equal(griffin.anatomy.head, 'eagle');
  assert.equal(griffin.anatomy.body, 'lion');
  assert.ok(griffin.anatomy.extras.some((e) => /wings/.test(e)), 'a griffin has wings');

  const unicorn = G.createHybrid({ a: 'narwhal', b: 'horse', seed: 5 });
  assert.equal(unicorn.name, 'Unicorn');
  assert.ok(unicorn.anatomy.extras.some((e) => /tusk/.test(e)), 'a unicorn has a horn');
  assert.match(unicorn.prompt, /white/);

  const cockatrice = G.createHybrid({ a: 'chicken', b: 'python', seed: 3 });
  assert.ok(cockatrice.anatomy.extras.some((e) => /serpent tail/.test(e)), 'a cockatrice keeps its serpent tail');
});

test('every pair gets a tidy, symmetric name', () => {
  for (let i = 0; i < ANIMALS.length; i++) {
    for (let j = i + 1; j < ANIMALS.length; j++) {
      const ab = G.hybridName(ANIMALS[i], ANIMALS[j]);
      const ba = G.hybridName(ANIMALS[j], ANIMALS[i]);
      assert.equal(ab.name, ba.name);
      if (ab.kind !== 'new') continue;
      assert.match(ab.name, /^[A-Z][a-z]+$/, `odd name: ${ab.name}`);
      assert.ok(ab.name.length >= 4 && ab.name.length <= 14, `odd length: ${ab.name}`);
      assert.doesNotMatch(ab.name.toLowerCase(), /(.)\1\1/, `triple letter: ${ab.name}`);
    }
  }
});

test('every pair and seed yields a complete creature', () => {
  for (const a of ANIMALS) {
    for (const b of ANIMALS) {
      if (a === b) continue;
      for (const seed of [1, 404, 90210]) {
        const r = G.createHybrid({ a: a.id, b: b.id, seed });
        assert.ok(r, `${a.id} + ${b.id}`);
        assert.equal(r.petNames.length, 3);
        assert.equal(new Set(r.petNames.map((n) => n.name)).size, 3, 'pet names must be unique');
        assert.ok(r.anatomy.extras.length >= 1 && r.anatomy.extras.length <= 3);
        assert.equal(r.traits.powers.length, 2);
        assert.ok(r.prompt.includes(a.name.toLowerCase().split(' ').pop()));
        assert.ok(r.prompt.length < 1000, 'prompt should stay URL-friendly');
        assert.doesNotMatch(r.description + r.prompt + JSON.stringify(r.petNames), /undefined|NaN|null/);
      }
    }
  }
});

test('createHybrid is deterministic and rejects bad input', () => {
  const opts = { a: 'octopus', b: 'giraffe', seed: 7 };
  assert.equal(JSON.stringify(G.createHybrid(opts)), JSON.stringify(G.createHybrid(opts)));
  assert.equal(G.createHybrid({ a: 'lion', b: 'lion', seed: 1 }), null);
  assert.equal(G.createHybrid({ a: 'lion', b: 'dragon', seed: 1 }), null);
  assert.equal(G.createHybrid({ a: 'lion', b: 'tiger', seed: 0 }), null);
  for (let i = 0; i < 200; i++) assert.notEqual(G.pickRandomAnimal('lion').id, 'lion');
  assert.ok(G.isValidSeed(G.newSeed()));
});
