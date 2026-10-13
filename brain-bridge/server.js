#!/usr/bin/env node
/*
 * Brain Bridge — tiny static file server with no dependencies.
 *
 *   npm start            serve the app on http://localhost:8081
 *   PORT=3000 npm start  pick another port
 *
 * The app is plain static files, so any web server (or GitHub Pages) works too.
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PUBLIC_DIRS = new Set(['assets', 'css', 'js']);
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json; charset=utf-8', '.ico': 'image/x-icon' };

function createServer() {
  return http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    let file = decodeURIComponent(url.pathname);
    if (file === '/' || file === '') file = '/index.html';
    const parts = file.split('/').filter(Boolean);
    const ok = (parts.length === 1 && parts[0] === 'index.html') || (parts.length === 2 && PUBLIC_DIRS.has(parts[0]) && !parts[1].includes('..'));
    if (!ok) { res.writeHead(404); res.end('Not found'); return; }
    const abs = path.join(ROOT, ...parts);
    fs.readFile(abs, (err, data) => {
      if (err) { res.writeHead(404); res.end('Not found'); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(abs)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
      res.end(data);
    });
  });
}

if (require.main === module) {
  const port = +process.env.PORT || 8081;
  createServer().listen(port, () => console.log(`Brain Bridge: http://localhost:${port}`));
}

module.exports = { createServer };
