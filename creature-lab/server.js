#!/usr/bin/env node
/*
 * Creature Lab — optional local server (no dependencies).
 *
 *   npm start                          serve the app on http://localhost:8080
 *   OPENAI_API_KEY=sk-... npm start    also generate portraits with the OpenAI Images API
 *
 * It also keeps the page's unique-visitor count in data/visitors.json (see visitors.js).
 *
 * Without a key the page falls back to the free Pollinations image service, exactly
 * as it does on static hosting. With a key, the browser asks this server for
 * /api/image?a=&b=&seed=; the prompt is always built here from the animal list,
 * so the endpoint can't be used to generate arbitrary images.
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const G = require('./js/generator.js');
const { createVisitorStore } = require('./visitors.js');

const ROOT = __dirname;
const PUBLIC_DIRS = new Set(['assets', 'css', 'js']);
const PUBLIC_FILES = new Set(['index.html']);
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8'
};

function sniffImageType(buf) {
  if (buf[0] === 0xff && buf[1] === 0xd8) return 'image/jpeg';
  if (buf.slice(0, 4).toString('hex') === '89504e47') return 'image/png';
  if (buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP') return 'image/webp';
  return 'application/octet-stream';
}

function createServer(options) {
  const opts = Object.assign(
    {
      apiKey: process.env.OPENAI_API_KEY || '',
      baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
      model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1',
      quality: process.env.OPENAI_IMAGE_QUALITY || 'medium',
      cacheSize: 200,
      rateLimit: 10, // new images per client per minute
      visitorFile: process.env.VISITOR_FILE || path.join(ROOT, 'data', 'visitors.json'),
      visitorRateLimit: 30, // new visitors per client per minute
      fetch: globalThis.fetch
    },
    options
  );
  const baseUrl = opts.baseUrl.replace(/\/+$/, '');
  const cache = new Map(); // key -> Promise<{ body, type }>
  const hits = new Map(); // ip -> timestamps of recent generations
  const visitorHits = new Map(); // ip -> timestamps of recently counted visitors
  const visitors = createVisitorStore(opts.visitorFile);

  function send(res, status, body, headers) {
    res.writeHead(status, Object.assign({ 'X-Content-Type-Options': 'nosniff' }, headers));
    res.end(body);
  }

  function sendJson(res, status, data) {
    send(res, status, JSON.stringify(data), { 'Content-Type': MIME['.json'], 'Cache-Control': 'no-store' });
  }

  function allowRequest(ip, log = hits, limit = opts.rateLimit) {
    const now = Date.now();
    const recent = (log.get(ip) || []).filter((t) => now - t < 60000);
    if (recent.length >= limit) return false;
    recent.push(now);
    log.set(ip, recent);
    return true;
  }

  function readJson(req, limit) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      let size = 0;
      req.on('data', (chunk) => {
        size += chunk.length;
        if (size <= limit) chunks.push(chunk);
        else if (size > limit * 64) req.destroy(); // hang up on floods, answer the rest politely
      });
      req.on('end', () => {
        if (size > limit) return reject(new Error('Body too large'));
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
        } catch (err) {
          reject(err);
        }
      });
      req.on('error', reject);
    });
  }

  // GET: the unique-visitor total. POST { id }: count this browser (once) and
  // return its visitor number.
  async function handleVisitors(req, res) {
    if (req.method !== 'POST') return sendJson(res, 200, { total: visitors.total() });
    let body;
    try {
      body = await readJson(req, 1024);
    } catch (_) {
      return sendJson(res, 400, { error: 'Expected a small JSON body.' });
    }
    const id = body && body.id;
    if (!visitors.isValidId(id)) return sendJson(res, 400, { error: 'Invalid visitor id.' });
    if (!visitors.has(id) && !allowRequest(req.socket.remoteAddress || 'unknown', visitorHits, opts.visitorRateLimit)) {
      return sendJson(res, 429, { error: 'Too many new visitors from here, try again in a minute.' });
    }
    sendJson(res, 200, visitors.visit(id));
  }

  async function generateImage(prompt) {
    const body = { model: opts.model, prompt, n: 1, size: '1024x1024' };
    if (/^dall-e/i.test(opts.model)) {
      body.response_format = 'b64_json';
    } else {
      body.quality = opts.quality;
      body.output_format = 'jpeg';
    }
    const res = await opts.fetch(`${baseUrl}/images/generations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${opts.apiKey}` },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const detail = (await res.text()).slice(0, 300);
      throw new Error(`Image API responded ${res.status}: ${detail}`);
    }
    const json = await res.json();
    const b64 = json && json.data && json.data[0] && json.data[0].b64_json;
    if (!b64) throw new Error('Image API returned no image data');
    const buf = Buffer.from(b64, 'base64');
    return { body: buf, type: sniffImageType(buf) };
  }

  function remember(key, promise) {
    cache.set(key, promise);
    promise.catch(() => cache.delete(key));
    while (cache.size > opts.cacheSize) cache.delete(cache.keys().next().value);
  }

  async function handleImage(req, res, url) {
    if (!opts.apiKey) return sendJson(res, 404, { error: 'No image API key configured on this server.' });
    const q = url.searchParams;
    const result = G.createHybrid({ a: q.get('a'), b: q.get('b'), seed: Number(q.get('seed')) });
    if (!result) return sendJson(res, 400, { error: 'Unknown animals or seed.' });

    const key = [result.parents[0].id, result.parents[1].id, result.seed].join(':');
    let job = cache.get(key);
    if (!job) {
      if (!allowRequest(req.socket.remoteAddress || 'unknown')) {
        return sendJson(res, 429, { error: 'Too many new portraits, try again in a minute.' });
      }
      job = generateImage(result.prompt);
      remember(key, job);
    }
    try {
      const image = await job;
      send(res, 200, image.body, { 'Content-Type': image.type, 'Cache-Control': 'public, max-age=86400' });
    } catch (err) {
      console.error('[image]', err.message);
      sendJson(res, 502, { error: 'The image service failed. Please try again.' });
    }
  }

  function serveStatic(res, pathname) {
    let rel = decodeURIComponent(pathname).replace(/^\/+/, '');
    if (rel === '') rel = 'index.html';
    const parts = rel.split('/');
    const allowed = parts.length === 1 ? PUBLIC_FILES.has(rel) : PUBLIC_DIRS.has(parts[0]);
    const file = path.join(ROOT, rel);
    if (!allowed || parts.some((p) => p === '..' || p.startsWith('.')) || !file.startsWith(ROOT + path.sep)) {
      return send(res, 404, 'Not found', { 'Content-Type': 'text/plain; charset=utf-8' });
    }
    fs.readFile(file, (err, data) => {
      if (err) return send(res, 404, 'Not found', { 'Content-Type': 'text/plain; charset=utf-8' });
      const ext = path.extname(file).toLowerCase();
      send(res, 200, data, {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
      });
    });
  }

  const server = http.createServer((req, res) => {
    let url;
    try {
      url = new URL(req.url, 'http://localhost');
    } catch (_) {
      return send(res, 400, 'Bad request');
    }
    if (url.pathname === '/api/visitors' && ['GET', 'HEAD', 'POST'].includes(req.method)) {
      return handleVisitors(req, res).catch((err) => {
        console.error('[visitors]', err);
        sendJson(res, 500, { error: 'Unexpected error.' });
      });
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return send(res, 405, 'Method not allowed', { Allow: 'GET, HEAD' });
    }
    if (url.pathname === '/api/config') {
      return sendJson(res, 200, { imageProvider: opts.apiKey ? 'server' : 'pollinations', visitorCounter: 'server' });
    }
    if (url.pathname === '/api/image') {
      return handleImage(req, res, url).catch((err) => {
        console.error('[image]', err);
        sendJson(res, 500, { error: 'Unexpected error.' });
      });
    }
    try {
      serveStatic(res, url.pathname);
    } catch (_) {
      send(res, 400, 'Bad request');
    }
  });
  server.on('close', () => visitors.flush());
  server.flushVisitors = () => visitors.flush();
  return server;
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 8080;
  const server = createServer();
  server.listen(port, () => {
    const mode = process.env.OPENAI_API_KEY ? `OpenAI Images (${process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1'})` : 'Pollinations (free, no key)';
    console.log(`Creature Lab running at http://localhost:${port}`);
    console.log(`Portraits: ${mode}`);
  });
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
      server.flushVisitors();
      process.exit(0);
    });
  }
}

module.exports = { createServer };
