/*
 * Old-fashioned visitor counter.
 *
 * Counts unique visitors, one per browser: a browser is counted the first time it
 * opens the page and remembers its visitor number (in localStorage) after that.
 * Crawlers and link-preview bots are never counted.
 *
 * Where the count lives:
 *   - served by server.js     -> the server keeps it (GET/POST api/visitors)
 *   - static hosting          -> the free Abacus counter service, in a counter named
 *     (e.g. GitHub Pages)        after the site's hostname and this page's key
 *   - localhost / file://     -> nothing is counted, so previews never skew the numbers
 *
 * Markup: <div class="visitor-counter" data-counter-key="my-page"> … </div>
 * Start it with VisitorCounter.start(element, { useServer: true|false }).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.VisitorCounter = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const ABACUS_URL = 'https://abacus.jasoncameron.dev';
  const MIN_DIGITS = 7;
  const TIMEOUT_MS = 8000;
  const BOT_PATTERN = /bot|crawl|spider|slurp|headless|lighthouse|facebookexternalhit|embedly|preview|whatsapp|telegram|discord|slack/i;

  // "simonwentworth-web.github.io" -> "simonwentworth-web-github-io" (Abacus allows 3–64 of [A-Za-z0-9_-.]).
  function namespaceFor(hostname) {
    const ns = String(hostname || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 64);
    return ns.length >= 3 ? ns : null;
  }

  function isLocalHost(hostname) {
    const h = String(hostname || '').replace(/^\[|\]$/g, '');
    return (
      !h ||
      h === 'localhost' ||
      h === '::1' ||
      h.endsWith('.local') ||
      /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|0\.0\.0\.0)/.test(h)
    );
  }

  function isBot(userAgent) {
    return BOT_PATTERN.test(String(userAgent || ''));
  }

  function padDigits(n, min) {
    return String(Math.max(0, Math.floor(n))).padStart(min || MIN_DIGITS, '0');
  }

  function openStorage() {
    try {
      const s = window.localStorage;
      s.setItem('vc:test', '1');
      s.removeItem('vc:test');
      return s;
    } catch (_) {
      return null; // storage blocked: we can still show the count, just not add to it
    }
  }

  function randomId() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  }

  async function fetchJson(url, init) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, Object.assign({ signal: controller.signal, cache: 'no-store' }, init));
      if (res.status === 404) return null;
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  }

  function toCount(value) {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) throw new Error('Unexpected counter value');
    return Math.floor(n);
  }

  // ---------- providers ----------

  async function countWithAbacus(key, store, canCount) {
    const ns = namespaceFor(window.location.hostname);
    const numberKey = `vc:${key}:number`;
    const saved = store && store.getItem(numberKey);
    if (canCount && store && !saved) {
      const data = await fetchJson(`${ABACUS_URL}/hit/${ns}/${key}`);
      const total = toCount(data && data.value);
      store.setItem(numberKey, String(total));
      return { total, number: total, isNew: true };
    }
    const data = await fetchJson(`${ABACUS_URL}/get/${ns}/${key}`);
    return { total: data ? toCount(data.value) : 0, number: saved ? Number(saved) : null, isNew: false };
  }

  async function countWithServer(key, store, canCount) {
    if (!canCount || !store) {
      const data = await fetchJson('api/visitors');
      return { total: toCount(data && data.total), number: null, isNew: false };
    }
    let id = store.getItem('vc:id');
    if (!id) {
      id = randomId();
      store.setItem('vc:id', id);
    }
    const data = await fetchJson('api/visitors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    return { total: toCount(data && data.total), number: data && data.number ? toCount(data.number) : null, isNew: Boolean(data && data.isNew) };
  }

  // ---------- rendering ----------

  function renderDigits(el, text) {
    const box = el.querySelector('.vc-digits');
    if (box.children.length !== text.length) {
      box.replaceChildren(...Array.from(text, () => document.createElement('span')));
    }
    Array.from(text).forEach((ch, i) => {
      box.children[i].textContent = ch;
    });
  }

  function setNote(el, text, spoken) {
    el.querySelector('.vc-note').textContent = text;
    if (spoken) el.querySelector('.vc-sr').textContent = spoken;
  }

  function rollTo(el, total) {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const width = Math.max(MIN_DIGITS, String(total).length);
    if (reduce || total === 0) {
      renderDigits(el, padDigits(total, width));
      return;
    }
    const start = performance.now();
    const duration = 1100;
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      renderDigits(el, padDigits(Math.round(total * eased), width));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function show(el, result) {
    el.dataset.state = 'ready';
    rollTo(el, result.total);
    const total = result.total.toLocaleString();
    const label = result.total === 1 ? 'unique visitor' : 'unique visitors';
    el.querySelector('.vc-sr').textContent = `${total} ${label} so far.`;
    if (result.isNew && result.number) {
      setNote(el, `You are visitor #${result.number.toLocaleString()}! Welcome!`);
    } else if (result.number) {
      setNote(el, `Welcome back, visitor #${result.number.toLocaleString()}!`);
    } else {
      setNote(el, 'Thanks for stopping by!');
    }
  }

  function start(el, options) {
    if (!el || el.dataset.state === 'ready') return;
    const key = el.dataset.counterKey;
    const useServer = Boolean(options && options.useServer);
    const onlineHost = window.location.protocol !== 'file:' && !isLocalHost(window.location.hostname);

    if (!useServer && !(onlineHost && namespaceFor(window.location.hostname))) {
      el.dataset.state = 'offline';
      renderDigits(el, '-'.repeat(MIN_DIGITS));
      setNote(el, 'The counter starts once the site is online.', 'Visitor counter: not counting in this local preview.');
      return;
    }

    el.dataset.state = 'loading';
    const store = openStorage();
    const canCount = !isBot(navigator.userAgent);
    const provider = useServer ? countWithServer : countWithAbacus;
    provider(key, store, canCount)
      .then((result) => show(el, result))
      .catch(() => {
        el.dataset.state = 'error';
        renderDigits(el, '?'.repeat(MIN_DIGITS));
        setNote(el, 'The counter is taking a nap. Try again later!', 'Visitor counter: unavailable right now.');
      });
  }

  return { start, namespaceFor, isLocalHost, isBot, padDigits, ABACUS_URL };
});
