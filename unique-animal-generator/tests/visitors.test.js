'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { createServer } = require('../server.js');
const VC = require('../js/visitor-counter.js');

function tempFile() {
  return path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'visitors-')), 'visitors.json');
}

async function withServer(options, fn) {
  const server = createServer(Object.assign({ apiKey: '' }, options));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    await fn(base);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

const visit = (base, id) =>
  fetch(`${base}/api/visitors`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });

test('counter helpers', () => {
  assert.equal(VC.namespaceFor('simonwentworth-web.github.io'), 'simonwentworth-web-github-io');
  assert.equal(VC.namespaceFor('ab'), null);
  assert.ok(VC.namespaceFor('x'.repeat(100)).length <= 64);
  for (const host of ['localhost', '127.0.0.1', '192.168.1.20', '10.0.0.5', '172.20.1.1', '[::1]', 'my-mac.local', '']) {
    assert.ok(VC.isLocalHost(host), host);
  }
  for (const host of ['simonwentworth-web.github.io', 'example.com', '172.32.0.1']) {
    assert.ok(!VC.isLocalHost(host), host);
  }
  assert.ok(VC.isBot('Mozilla/5.0 (compatible; Googlebot/2.1)'));
  assert.ok(VC.isBot('Mozilla/5.0 HeadlessChrome/120.0'));
  assert.ok(VC.isBot('facebookexternalhit/1.1'));
  assert.ok(!VC.isBot('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1'));
  assert.equal(VC.padDigits(42), '0000042');
  assert.equal(VC.padDigits(123456789), '123456789');
});

test('counts each browser once and hands out visitor numbers', async () => {
  const file = tempFile();
  await withServer({ visitorFile: file }, async (base) => {
    assert.deepEqual(await (await fetch(`${base}/api/config`)).json(), { imageProvider: 'pollinations', visitorCounter: 'server' });
    assert.deepEqual(await (await fetch(`${base}/api/visitors`)).json(), { total: 0 });

    const alice = 'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa';
    const bob = 'bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb';
    assert.deepEqual(await (await visit(base, alice)).json(), { total: 1, number: 1, isNew: true });
    assert.deepEqual(await (await visit(base, alice)).json(), { total: 1, number: 1, isNew: false });
    assert.deepEqual(await (await visit(base, bob)).json(), { total: 2, number: 2, isNew: true });
    assert.deepEqual(await (await visit(base, alice)).json(), { total: 2, number: 1, isNew: false });
    assert.deepEqual(await (await fetch(`${base}/api/visitors`)).json(), { total: 2 });
  });

  // Counts survive a restart, and raw ids are never written to disk.
  const saved = fs.readFileSync(file, 'utf8');
  assert.ok(!saved.includes('aaaaaaaa-1111'));
  await withServer({ visitorFile: file }, async (base) => {
    assert.deepEqual(await (await fetch(`${base}/api/visitors`)).json(), { total: 2 });
    assert.equal((await (await visit(base, 'bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb')).json()).number, 2);
  });
});

test('rejects bad visitor requests and rate-limits floods of new visitors', async () => {
  await withServer({ visitorFile: tempFile(), visitorRateLimit: 3 }, async (base) => {
    assert.equal((await visit(base, 'short')).status, 400);
    assert.equal((await visit(base, '<script>alert(1)</script>xxxxxxxx')).status, 400);
    assert.equal((await fetch(`${base}/api/visitors`, { method: 'POST', body: 'not json' })).status, 400);
    assert.equal((await fetch(`${base}/api/visitors`, { method: 'POST', body: JSON.stringify({ id: 'x'.repeat(2000) }) })).status, 400);
    assert.equal((await fetch(`${base}/api/visitors`, { method: 'DELETE' })).status, 405);

    for (let i = 0; i < 3; i++) assert.equal((await visit(base, `visitor-${i}-xxxxxxxxxxxxxxxx`)).status, 200);
    assert.equal((await visit(base, 'visitor-9-xxxxxxxxxxxxxxxx')).status, 429);
    // A returning visitor is never blocked.
    assert.equal((await visit(base, 'visitor-0-xxxxxxxxxxxxxxxx')).status, 200);
    assert.deepEqual(await (await fetch(`${base}/api/visitors`)).json(), { total: 3 });
  });
});
