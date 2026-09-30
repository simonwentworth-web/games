'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('../server.js');

const PNG = Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex');

async function withServer(options, fn) {
  const server = createServer(options);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    await fn(base);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('serves the app and reports the free image provider without a key', async () => {
  await withServer({ apiKey: '' }, async (base) => {
    const page = await fetch(`${base}/`);
    assert.equal(page.status, 200);
    assert.match(await page.text(), /Creature Lab/);
    assert.match((await fetch(`${base}/js/app.js`)).headers.get('content-type'), /javascript/);
    assert.deepEqual(await (await fetch(`${base}/api/config`)).json(), { imageProvider: 'pollinations', visitorCounter: 'server' });
    assert.equal((await fetch(`${base}/api/image?a=lion&b=tiger&seed=1`)).status, 404);
  });
});

test('never serves files outside the public folders', async () => {
  await withServer({ apiKey: '' }, async (base) => {
    for (const p of ['/server.js', '/package.json', '/tests/server.test.js', '/js/../server.js', '/%2e%2e/%2e%2e/etc/passwd', '/.git/config']) {
      assert.equal((await fetch(base + p)).status, 404, p);
    }
  });
});

test('generates, caches and validates portraits with an API key', async () => {
  const calls = [];
  const fakeFetch = async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body), auth: init.headers.Authorization });
    return new Response(JSON.stringify({ data: [{ b64_json: PNG.toString('base64') }] }), { status: 200 });
  };
  await withServer({ apiKey: 'test-key', baseUrl: 'https://images.example/v1/', fetch: fakeFetch }, async (base) => {
    assert.deepEqual(await (await fetch(`${base}/api/config`)).json(), { imageProvider: 'server', visitorCounter: 'server' });

    const url = `${base}/api/image?a=elephant&b=shark&seed=123`;
    const first = await fetch(url);
    assert.equal(first.status, 200);
    assert.equal(first.headers.get('content-type'), 'image/png');
    assert.deepEqual(Buffer.from(await first.arrayBuffer()), PNG);
    await fetch(url); // cached

    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, 'https://images.example/v1/images/generations');
    assert.equal(calls[0].auth, 'Bearer test-key');
    assert.match(calls[0].body.prompt, /elephant/);

    assert.equal((await fetch(`${base}/api/image?a=lion&b=lion&seed=1`)).status, 400);
    assert.equal((await fetch(`${base}/api/image?a=lion&b=tiger&seed=abc`)).status, 400);
  });
});

test('rate-limits new portraits and surfaces upstream failures', async () => {
  let fail = true;
  const fakeFetch = async () =>
    fail
      ? new Response('boom', { status: 500 })
      : new Response(JSON.stringify({ data: [{ b64_json: PNG.toString('base64') }] }), { status: 200 });
  await withServer({ apiKey: 'k', fetch: fakeFetch, rateLimit: 2 }, async (base) => {
    assert.equal((await fetch(`${base}/api/image?a=owl&b=bee&seed=1`)).status, 502);
    fail = false;
    assert.equal((await fetch(`${base}/api/image?a=owl&b=bee&seed=1`)).status, 200);
    assert.equal((await fetch(`${base}/api/image?a=owl&b=bee&seed=2`)).status, 429);
  });
});
