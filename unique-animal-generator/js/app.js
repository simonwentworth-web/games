/*
 * Unique Animal Generator — page behaviour.
 *
 * The whole result lives in the URL (?s=dog&a=…&b=…&seed=…&name=…), so any
 * result can be reloaded, bookmarked or shared and it rebuilds identically.
 */
(function () {
  'use strict';

  const G = window.UAGGenerator;
  const D = window.UAGData;

  const CONFIG = {
    // Free, key-less image generation used when the app is hosted as static files.
    pollinationsUrl: 'https://image.pollinations.ai/prompt/',
    imageSize: 1024,
    imageTimeoutMs: 90000,
    // Served by server.js when it is configured with an image API key.
    configEndpoint: 'api/config',
    imageEndpoint: 'api/image',
    maxNameLength: 24
  };

  const $ = (id) => document.getElementById(id);
  const el = {
    builder: $('builder'),
    result: $('result'),
    form: $('builder-form'),
    generateBtn: $('generate-btn'),
    parentA: $('parent-a'),
    parentB: $('parent-b'),
    infoA: $('parent-a-info'),
    infoB: $('parent-b-info'),
    builderTitle: $('builder-title'),
    breedName: $('breed-name'),
    badge: $('breed-badge'),
    parentAName: $('parent-a-name'),
    parentBName: $('parent-b-name'),
    description: $('breed-description'),
    traits: $('traits'),
    frame: $('photo-frame'),
    image: $('result-image'),
    loadingText: $('loading-text'),
    retry: $('retry-image'),
    caption: $('photo-caption-text'),
    nameOptions: $('name-options'),
    customName: $('custom-name'),
    sharePetName: $('share-pet-name'),
    sharePreview: $('share-preview'),
    shareButtons: $('share-buttons'),
    sharedBanner: $('shared-banner'),
    sharedText: $('shared-text'),
    mixing: $('mixing'),
    mixingA: $('mixing-a'),
    mixingB: $('mixing-b'),
    toast: $('toast'),
    brandLink: $('brand-link')
  };

  const DEFAULT_TITLE = document.title;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const state = {
    provider: 'pollinations',
    serverVisitors: false, // true when server.js keeps the visitor count
    result: null,
    petName: '',
    suggestedName: '', // last suggestion picked, restored if a custom name is cleared
    imageUrl: '',
    imageToken: 0,
    photo: null, // CORS-clean <img> we can paint onto the share card
    card: null, // { name, file } pre-rendered so native sharing stays instant
    selection: { species: 'dog', a: 'random', b: 'random' }
  };

  // ---------- helpers ----------

  function cleanName(value) {
    return String(value || '')
      .replace(/[\u0000-\u001f<>]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, CONFIG.maxNameLength);
  }

  function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function slug(s) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'my-unique-animal';
  }

  let toastTimer = 0;
  function toast(message) {
    el.toast.textContent = message;
    el.toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.toast.classList.remove('is-visible'), 2800);
  }

  function make(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  // ---------- URL state ----------

  function readParams() {
    const q = new URLSearchParams(window.location.search);
    return {
      s: q.get('s'),
      a: q.get('a'),
      b: q.get('b'),
      seed: Number(q.get('seed')),
      name: cleanName(q.get('name')),
      ref: q.get('ref') || ''
    };
  }

  function queryFor(p) {
    const q = new URLSearchParams({ s: p.s, a: p.a, b: p.b, seed: String(p.seed) });
    if (p.name) q.set('name', p.name);
    if (p.ref) q.set('ref', p.ref);
    return '?' + q.toString();
  }

  function paramsForResult(extra) {
    const r = state.result;
    return Object.assign({ s: r.species, a: r.parents[0].id, b: r.parents[1].id, seed: r.seed }, extra);
  }

  function go(params, opts) {
    history.pushState(null, '', queryFor(params));
    route(opts);
  }

  function goHome() {
    history.pushState(null, '', window.location.pathname);
    route({ focus: true });
  }

  function route(opts) {
    opts = opts || {};
    const p = readParams();
    const result = p.s ? G.createCross({ species: p.s, a: p.a, b: p.b, seed: p.seed }) : null;
    if (result) {
      showResult(result, p, opts);
      return;
    }
    if (p.s) {
      history.replaceState(null, '', window.location.pathname);
      toast("Hmm, that link didn't work. Let's make a new mix!");
    }
    showBuilder(opts);
  }

  // ---------- builder ----------

  function speciesValue() {
    return el.form.elements.species.value;
  }

  function fillSelect(select, species, value) {
    select.replaceChildren(new Option('🎲 Random', 'random'));
    G.breedsFor(species)
      .slice()
      .sort((x, y) => x.name.localeCompare(y.name))
      .forEach((b) => select.add(new Option(b.name, b.id)));
    select.value = G.getBreed(species, value) ? value : 'random';
  }

  function renderParentInfo(select, info) {
    const species = speciesValue();
    const breed = G.getBreed(species, select.value);
    info.replaceChildren();
    if (!breed) {
      info.append(make('span', 'chip chip-mystery', 'A surprise breed!'));
      return;
    }
    info.append(
      make('span', 'chip', breed.origin),
      make('span', 'chip', D.SPECIES[species].sizeLabels[breed.size - 1]),
      make('span', 'chip', capitalize(D.TEMPERAMENTS[breed.temper[0]].adj))
    );
  }

  function setupBuilder(selection) {
    el.form.elements.species.value = selection.species;
    fillSelect(el.parentA, selection.species, selection.a);
    fillSelect(el.parentB, selection.species, selection.b);
    renderParentInfo(el.parentA, el.infoA);
    renderParentInfo(el.parentB, el.infoB);
  }

  function showBuilder(opts) {
    stopImage();
    el.result.hidden = true;
    el.builder.hidden = false;
    document.title = DEFAULT_TITLE;
    setupBuilder(state.selection);
    window.scrollTo(0, 0);
    if (opts && opts.focus) el.builderTitle.focus({ preventScroll: true });
  }

  function playMixing(species, a, b) {
    if (reduceMotion) return Promise.resolve();
    el.mixingA.textContent = G.getBreed(species, a).name;
    el.mixingB.textContent = G.getBreed(species, b).name;
    el.mixing.hidden = false;
    return new Promise((resolve) => {
      setTimeout(() => {
        el.mixing.hidden = true;
        resolve();
      }, 1500);
    });
  }

  async function onGenerate(event) {
    event.preventDefault();
    const species = speciesValue();
    let a = el.parentA.value;
    let b = el.parentB.value;
    if (a !== 'random' && a === b) {
      toast("That's a purebred! Pick two different breeds to mix.");
      el.parentB.focus();
      return;
    }
    state.selection = { species, a, b };
    if (a === 'random') a = G.pickRandomBreed(species, b === 'random' ? null : b).id;
    if (b === 'random') b = G.pickRandomBreed(species, a).id;

    el.generateBtn.disabled = true;
    await playMixing(species, a, b);
    el.generateBtn.disabled = false;
    go({ s: species, a, b, seed: G.newSeed() }, { celebrate: true, focus: true });
  }

  // ---------- result ----------

  function showResult(result, p, opts) {
    const [a, b] = result.parents;
    state.result = result;
    if (state.selection.species !== result.species) {
      state.selection = { species: result.species, a: 'random', b: 'random' };
    }

    el.builder.hidden = true;
    el.result.hidden = false;
    el.breedName.textContent = result.breedName;
    el.parentAName.textContent = a.name;
    el.parentBName.textContent = b.name;
    el.badge.textContent = result.known ? '✓ A real-world designer mix' : '✨ Brand-new breed: you named it first!';
    el.badge.classList.toggle('is-new', !result.known);
    el.description.textContent = result.description;
    renderTraits(result);

    const initialName = p.name || result.petNames[0].name;
    renderNames(result.petNames, initialName);
    setPetName(initialName, { updateUrl: false });

    el.sharedBanner.hidden = p.ref !== 'share';
    el.sharedText.textContent = `Say hi to ${initialName} the ${result.breedName}! Someone shared this one-of-a-kind ${D.SPECIES[result.species].noun} with you.`;

    loadImage(result);
    window.scrollTo(0, 0);
    if (opts.focus) el.breedName.focus({ preventScroll: true });
    if (opts.celebrate) confetti();
  }

  function pawMeter(value) {
    const dd = make('dd', 'paws');
    const filled = Math.round(value);
    dd.setAttribute('role', 'img');
    dd.setAttribute('aria-label', `${filled} out of 5`);
    for (let i = 1; i <= 5; i++) {
      dd.insertAdjacentHTML('beforeend', `<svg class="${i <= filled ? 'on' : ''}" aria-hidden="true"><use href="#i-paw"/></svg>`);
    }
    return dd;
  }

  function renderTraits(result) {
    const t = result.traits;
    const [a, b] = result.parents;
    const meterRow = (label, value, text) => {
      const row = make('div', 'trait');
      row.append(make('dt', null, label), pawMeter(value), make('dd', 'trait-value', text));
      return row;
    };
    const textRow = (label, text) => {
      const row = make('div', 'trait');
      row.append(make('dt', null, label), make('dd', 'trait-text', text));
      return row;
    };
    el.traits.replaceChildren(
      meterRow('Size', t.size, t.sizeLabel),
      meterRow('Energy', t.energy, t.energyLabel),
      meterRow('Floof', t.floof, t.floofLabel),
      textRow('Coat', `${t.coat.short} · ${t.color.label}`),
      textRow('Roots', a.origin === b.origin ? a.origin : `${a.origin} × ${b.origin}`)
    );
  }

  function renderNames(names, selected) {
    el.nameOptions.replaceChildren();
    names.forEach((n) => {
      const btn = make('button', 'name-option');
      btn.type = 'button';
      btn.setAttribute('role', 'radio');
      btn.dataset.name = n.name;
      const text = make('span', 'name-text');
      text.append(make('span', 'name-value', n.name), make('span', 'name-why', n.why));
      btn.append(make('span', 'name-check'), text);
      btn.firstChild.setAttribute('aria-hidden', 'true');
      btn.addEventListener('click', () => {
        el.customName.value = '';
        state.suggestedName = n.name;
        setPetName(n.name);
      });
      el.nameOptions.append(btn);
    });
    const isSuggestion = names.some((n) => n.name === selected);
    el.customName.value = isSuggestion ? '' : selected;
    state.suggestedName = isSuggestion ? selected : names[0].name;
  }

  function syncNameOptions() {
    const custom = cleanName(el.customName.value);
    el.nameOptions.querySelectorAll('.name-option').forEach((btn) => {
      btn.setAttribute('aria-checked', String(!custom && btn.dataset.name === state.petName));
    });
    el.customName.classList.toggle('is-active', Boolean(custom));
  }

  function setPetName(name, opts) {
    const r = state.result;
    state.petName = name;
    syncNameOptions();
    el.sharePetName.textContent = name;
    el.sharePreview.textContent = `“${shareMessage()}”`;
    el.caption.textContent = `${name} the ${r.breedName}`;
    document.title = `${name} the ${r.breedName} · Unique Animal Generator`;
    updateShareLinks();
    if (!opts || opts.updateUrl !== false) {
      history.replaceState(null, '', queryFor(paramsForResult({ name })));
    }
    scheduleCard();
  }

  function onCustomName() {
    setPetName(cleanName(el.customName.value) || state.suggestedName);
  }

  // ---------- AI portrait ----------

  function imageUrlFor(r) {
    if (state.provider === 'server') {
      const q = new URLSearchParams({ s: r.species, a: r.parents[0].id, b: r.parents[1].id, seed: String(r.seed) });
      return `${CONFIG.imageEndpoint}?${q}`;
    }
    const q = new URLSearchParams({
      width: String(CONFIG.imageSize),
      height: String(CONFIG.imageSize),
      seed: String(r.seed),
      model: 'flux',
      nologo: 'true',
      private: 'true',
      referrer: 'unique-animal-generator'
    });
    return CONFIG.pollinationsUrl + encodeURIComponent(r.prompt) + '?' + q;
  }

  let loadingTimer = 0;
  function startLoadingMessages(species) {
    const messages = D.SPECIES[species].loading;
    let i = 0;
    el.loadingText.textContent = messages[0];
    clearInterval(loadingTimer);
    loadingTimer = setInterval(() => {
      i = (i + 1) % messages.length;
      el.loadingText.textContent = messages[i];
    }, 2400);
  }

  function stopImage() {
    state.imageToken++;
    clearInterval(loadingTimer);
  }

  function loadImage(r) {
    const token = ++state.imageToken;
    const url = imageUrlFor(r);
    const [a, b] = r.parents;
    state.imageUrl = '';
    state.photo = null;
    state.card = null;
    el.frame.dataset.state = 'loading';
    el.image.removeAttribute('src');
    el.image.alt = `AI-generated portrait of a ${r.breedName}, a ${a.name} and ${b.name} cross-breed`;
    startLoadingMessages(r.species);

    // Ask for a CORS-clean copy first (needed to paint the share card); if the
    // host refuses CORS, fall back to a plain load so the portrait still shows.
    const attempt = (cors) => {
      const img = new Image();
      if (cors) img.crossOrigin = 'anonymous';
      const timer = setTimeout(() => finish(false, true), CONFIG.imageTimeoutMs);
      const finish = (ok, timedOut) => {
        clearTimeout(timer);
        img.onload = img.onerror = null;
        if (token !== state.imageToken) return;
        if (!ok && cors && !timedOut) return attempt(false);
        clearInterval(loadingTimer);
        if (!ok) {
          el.frame.dataset.state = 'error';
          return;
        }
        if (cors) el.image.crossOrigin = 'anonymous';
        else el.image.removeAttribute('crossorigin');
        el.image.src = url;
        el.frame.dataset.state = 'ready';
        state.imageUrl = url;
        state.photo = cors ? img : null;
        updateShareLinks();
        scheduleCard();
      };
      img.onload = () => finish(true);
      img.onerror = () => finish(false);
      img.src = url;
    };
    attempt(true);
  }

  // ---------- sharing ----------

  function shareMessage() {
    const r = state.result;
    const [a, b] = r.parents;
    return `Meet ${state.petName}, my one-of-a-kind ${r.breedName} (${a.name} × ${b.name})! 🐾 Make your own with the Unique Animal Generator.`;
  }

  function shareUrl() {
    const url = new URL(window.location.href);
    url.search = queryFor(paramsForResult({ name: state.petName, ref: 'share' }));
    url.hash = '';
    return url.href;
  }

  function absoluteImageUrl() {
    if (!state.imageUrl) return '';
    const url = new URL(state.imageUrl, window.location.href);
    return /^https?:$/.test(url.protocol) ? url.href : '';
  }

  function updateShareLinks() {
    const r = state.result;
    if (!r) return;
    const e = encodeURIComponent;
    const url = shareUrl();
    const text = shareMessage();
    const title = `Meet ${state.petName} the ${r.breedName}!`;
    const media = absoluteImageUrl();
    const links = {
      whatsapp: `https://wa.me/?text=${e(text + ' ' + url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${e(url)}`,
      x: `https://twitter.com/intent/tweet?text=${e(text)}&url=${e(url)}`,
      reddit: `https://www.reddit.com/submit?url=${e(url)}&title=${e(title)}`,
      pinterest: `https://www.pinterest.com/pin/create/button/?url=${e(url)}&description=${e(text)}` + (media ? `&media=${e(media)}` : ''),
      telegram: `https://t.me/share/url?url=${e(url)}&text=${e(text)}`,
      sms: `sms:?&body=${e(text + ' ' + url)}`,
      email: `mailto:?subject=${e(title)}&body=${e(text + '\n\n' + url)}`
    };
    el.shareButtons.querySelectorAll('a[data-share]').forEach((link) => {
      link.href = links[link.dataset.share];
    });
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      const area = make('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.append(area);
      area.select();
      let ok = false;
      try {
        ok = document.execCommand('copy');
      } catch (_) {
        ok = false;
      }
      area.remove();
      return ok;
    }
  }

  async function copyLink() {
    const ok = await copyText(shareUrl());
    toast(ok ? 'Link copied! Paste it anywhere.' : "Couldn't copy automatically. Copy the address bar instead.");
  }

  async function nativeShare() {
    const r = state.result;
    const data = { title: `Meet ${state.petName} the ${r.breedName}!`, text: shareMessage(), url: shareUrl() };
    const card = state.card && state.card.name === state.petName ? state.card : null;
    if (card && navigator.canShare && navigator.canShare({ files: [card.file] })) data.files = [card.file];
    try {
      await navigator.share(data);
    } catch (err) {
      if (err && err.name !== 'AbortError') toast('Sharing didn’t work here. Try “Copy link” instead.');
    }
  }

  async function saveCard() {
    let card = state.card && state.card.name === state.petName ? state.card : null;
    if (!card && state.photo) card = await buildCard();
    if (card) {
      const link = make('a');
      link.href = URL.createObjectURL(card.file);
      link.download = card.file.name;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(link.href), 10000);
      toast('Share card saved!');
    } else if (state.imageUrl) {
      window.open(state.imageUrl, '_blank', 'noopener');
      toast('Opened the portrait in a new tab. Save it from there.');
    } else {
      toast('Hang on, the portrait is still being created…');
    }
  }

  // ---------- share card (1080×1350 PNG) ----------

  let cardTimer = 0;
  function scheduleCard() {
    clearTimeout(cardTimer);
    if (!state.photo) return;
    cardTimer = setTimeout(() => {
      buildCard().catch(() => {});
    }, 350);
  }

  let logoImage = null;
  function loadLogo() {
    if (logoImage) return logoImage;
    logoImage = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = 'assets/logo.svg';
    });
    return logoImage;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function fitFont(ctx, text, weight, size, family, maxWidth) {
    let px = size;
    do {
      ctx.font = `${weight} ${px}px ${family}`;
      px -= 2;
    } while (ctx.measureText(text).width > maxWidth && px > 20);
  }

  async function buildCard() {
    const r = state.result;
    const photo = state.photo;
    const name = state.petName;
    if (!r || !photo) return null;
    if (document.fonts && document.fonts.load) {
      await Promise.all([document.fonts.load('700 80px Fredoka'), document.fonts.load('800 32px Nunito')]).catch(() => {});
    }
    const logo = await loadLogo();
    const W = 1080;
    const H = 1350;
    const ink = '#2b1452';
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#ff4f9a');
    bg.addColorStop(0.55, '#ff8a3d');
    bg.addColorStop(1, '#ffd23f');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    for (let i = 0; i < 26; i++) {
      ctx.beginPath();
      ctx.arc((i * 263) % W, (i * 419) % H, 10 + (i % 5) * 7, 0, Math.PI * 2);
      ctx.fill();
    }

    if (logo) ctx.drawImage(logo, 44, 18, 132, 132);
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    ctx.font = '700 58px Fredoka, sans-serif';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 10;
    ctx.strokeStyle = ink;
    ctx.fillStyle = '#fff';
    ctx.strokeText('Unique Animal Generator', 192, 104);
    ctx.fillText('Unique Animal Generator', 192, 104);

    ctx.fillStyle = ink;
    roundRect(ctx, 76, 186, 944, 1128, 44);
    ctx.fill();
    ctx.fillStyle = '#fff';
    roundRect(ctx, 60, 170, 944, 1128, 44);
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.stroke();

    const px = 104;
    const py = 214;
    const size = 856;
    ctx.save();
    roundRect(ctx, px, py, size, size, 28);
    ctx.clip();
    const scale = Math.max(size / photo.naturalWidth, size / photo.naturalHeight);
    const dw = photo.naturalWidth * scale;
    const dh = photo.naturalHeight * scale;
    ctx.drawImage(photo, px + (size - dw) / 2, py + (size - dh) / 2, dw, dh);
    ctx.restore();
    ctx.lineWidth = 6;
    roundRect(ctx, px, py, size, size, 28);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = ink;
    const headline = `Meet ${name}!`;
    fitFont(ctx, headline, 700, 84, 'Fredoka, sans-serif', 860);
    ctx.fillText(headline, 532, 1156);
    const breedLine = `the ${r.breedName}`;
    fitFont(ctx, breedLine, 700, 54, 'Fredoka, sans-serif', 860);
    ctx.fillStyle = '#e0337f';
    ctx.fillText(breedLine, 532, 1220);
    const parents = `${r.parents[0].name} × ${r.parents[1].name}`;
    fitFont(ctx, parents, 800, 32, 'Nunito, sans-serif', 860);
    ctx.fillStyle = '#5b4a7d';
    ctx.fillText(parents, 532, 1266);

    const blob = await new Promise((resolve) => {
      try {
        canvas.toBlob(resolve, 'image/png');
      } catch (_) {
        resolve(null); // tainted canvas
      }
    });
    if (!blob) return null;
    const card = { name, file: new File([blob], `${slug(name)}-the-${slug(r.breedName)}.png`, { type: 'image/png' }) };
    if (state.result === r && state.petName === name) state.card = card;
    return card;
  }

  // ---------- confetti ----------

  function confetti() {
    if (reduceMotion) return;
    const colors = ['#ff4f9a', '#ffd23f', '#19c3a6', '#7b5cff', '#ff8a3d', '#5ec8ff'];
    for (let i = 0; i < 70; i++) {
      const piece = make('span', 'confetti');
      piece.style.left = Math.random() * 100 + 'vw';
      piece.style.width = 8 + Math.random() * 8 + 'px';
      piece.style.background = colors[i % colors.length];
      piece.style.setProperty('--drift', Math.random() * 240 - 120 + 'px');
      piece.style.setProperty('--spin', Math.random() * 1080 - 540 + 'deg');
      piece.style.animationDuration = 2.2 + Math.random() * 1.8 + 's';
      piece.style.animationDelay = Math.random() * 0.4 + 's';
      piece.addEventListener('animationend', () => piece.remove());
      document.body.append(piece);
    }
  }

  // ---------- setup ----------

  async function detectProvider() {
    if (window.location.protocol === 'file:') return;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(CONFIG.configEndpoint, { signal: controller.signal, cache: 'no-store' });
      clearTimeout(timer);
      if (!res.ok) return;
      const cfg = await res.json();
      if (cfg && cfg.imageProvider === 'server') state.provider = 'server';
      if (cfg && cfg.visitorCounter === 'server') state.serverVisitors = true;
    } catch (_) {
      // Static hosting: keep the default provider.
    }
  }

  function bindEvents() {
    el.form.addEventListener('submit', onGenerate);
    el.form.addEventListener('change', (event) => {
      if (event.target.name === 'species') {
        setupBuilder({ species: speciesValue(), a: 'random', b: 'random' });
      } else if (event.target === el.parentA) {
        renderParentInfo(el.parentA, el.infoA);
      } else if (event.target === el.parentB) {
        renderParentInfo(el.parentB, el.infoB);
      }
    });

    el.customName.addEventListener('input', onCustomName);
    el.retry.addEventListener('click', () => state.result && loadImage(state.result));

    document.addEventListener('click', (event) => {
      const action = event.target.closest('[data-action]');
      if (!action) return;
      if (action.dataset.action === 'new') goHome();
      if (action.dataset.action === 'remix' && state.result) {
        go(paramsForResult({ seed: G.newSeed() }), { celebrate: true, focus: true });
      }
    });

    el.shareButtons.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-share]');
      if (!button) return;
      const kind = button.dataset.share;
      if (kind === 'native') nativeShare();
      if (kind === 'copy') copyLink();
      if (kind === 'download') saveCard();
    });

    el.brandLink.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey) return;
      event.preventDefault();
      goHome();
    });

    window.addEventListener('popstate', () => route({ focus: true }));
  }

  async function init() {
    el.shareButtons.querySelector('[data-share="native"]').hidden = typeof navigator.share !== 'function';
    el.shareButtons.querySelector('[data-share="sms"]').hidden = !window.matchMedia('(pointer: coarse)').matches;
    setupBuilder(state.selection);
    bindEvents();
    await detectProvider();
    route();
    if (window.VisitorCounter) {
      window.VisitorCounter.start(document.getElementById('visitor-counter'), { useServer: state.serverVisitors });
    }
  }

  init();
})();
