/*
 * Creature Lab — page behaviour.
 *
 * The whole result lives in the URL (?a=lion&b=eagle&seed=…&name=…), so any
 * creature can be reloaded, bookmarked or shared and it rebuilds identically.
 */
(function () {
  'use strict';

  const G = window.CLGenerator;
  const D = window.CLData;

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

  const LOADING_MESSAGES = [
    'Splicing DNA…',
    'Growing it in the tank…',
    'Calibrating the claws…',
    'Counting its teeth…',
    'Polishing the scales…',
    'Fluffing the feathers…',
    'Teaching it to pose…',
    'Stabilising the mutation…'
  ];

  const $ = (id) => document.getElementById(id);
  const el = {
    builder: $('builder'),
    result: $('result'),
    form: $('builder-form'),
    generateBtn: $('generate-btn'),
    surpriseBtn: $('surprise-btn'),
    experimentNo: $('experiment-no'),
    parentA: $('parent-a'),
    parentB: $('parent-b'),
    infoA: $('parent-a-info'),
    infoB: $('parent-b-info'),
    windowA: $('pod-a-window'),
    windowB: $('pod-b-window'),
    emojiA: $('pod-a-emoji'),
    emojiB: $('pod-b-emoji'),
    builderTitle: $('builder-title'),
    specimenNo: $('specimen-no'),
    name: $('creature-name'),
    badge: $('creature-badge'),
    parentAName: $('parent-a-name'),
    parentBName: $('parent-b-name'),
    description: $('creature-description'),
    stats: $('stats'),
    powers: $('powers'),
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
    mixingAEmoji: $('mixing-a-emoji'),
    mixingBEmoji: $('mixing-b-emoji'),
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
    selection: { a: 'random', b: 'random' }
  };

  // ---------- helpers ----------

  function cleanName(value) {
    return String(value || '')
      .replace(/[\u0000-\u001f<>]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, CONFIG.maxNameLength);
  }

  function slug(s) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'my-creature';
  }

  function specimenNumber(seed) {
    return '#' + String(seed % 100000).padStart(5, '0');
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
      a: q.get('a'),
      b: q.get('b'),
      seed: Number(q.get('seed')),
      name: cleanName(q.get('name')),
      ref: q.get('ref') || ''
    };
  }

  function queryFor(p) {
    const q = new URLSearchParams({ a: p.a, b: p.b, seed: String(p.seed) });
    if (p.name) q.set('name', p.name);
    if (p.ref) q.set('ref', p.ref);
    return '?' + q.toString();
  }

  function paramsForResult(extra) {
    const r = state.result;
    return Object.assign({ a: r.parents[0].id, b: r.parents[1].id, seed: r.seed }, extra);
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
    const result = p.a ? G.createHybrid({ a: p.a, b: p.b, seed: p.seed }) : null;
    if (result) {
      showResult(result, p, opts);
      return;
    }
    if (p.a) {
      history.replaceState(null, '', window.location.pathname);
      toast("Hmm, that specimen link didn't work. Let's start a new experiment!");
    }
    showBuilder(opts);
  }

  // ---------- builder ----------

  function fillSelect(select, value) {
    select.replaceChildren(new Option('🎲 Random', 'random'));
    Object.keys(D.GROUPS).forEach((group) => {
      const optgroup = document.createElement('optgroup');
      optgroup.label = D.GROUPS[group].label;
      G.animals()
        .filter((a) => a.group === group)
        .sort((x, y) => x.name.localeCompare(y.name))
        .forEach((a) => optgroup.append(new Option(`${a.emoji} ${a.name}`, a.id)));
      select.append(optgroup);
    });
    select.value = G.getAnimal(value) ? value : 'random';
  }

  function renderPod(select, info, windowEl, emojiEl, animate) {
    const animal = G.getAnimal(select.value);
    info.replaceChildren();
    emojiEl.textContent = animal ? animal.emoji : '?';
    if (animate && !reduceMotion) {
      windowEl.classList.remove('is-pop');
      void windowEl.offsetWidth; // restart the pop animation
      windowEl.classList.add('is-pop');
    }
    if (!animal) {
      info.append(make('span', 'chip chip-mystery', 'Mystery specimen'));
      return;
    }
    info.append(
      make('span', 'chip', D.HABITATS[animal.habitat].label),
      make('span', 'chip', D.SIZES.labels[animal.size - 1]),
      make('span', 'chip', D.DIETS[animal.diet])
    );
  }

  function renderPods(animate) {
    renderPod(el.parentA, el.infoA, el.windowA, el.emojiA, animate);
    renderPod(el.parentB, el.infoB, el.windowB, el.emojiB, animate);
  }

  function setupBuilder(selection) {
    fillSelect(el.parentA, selection.a);
    fillSelect(el.parentB, selection.b);
    renderPods(false);
    el.experimentNo.textContent = String(Math.floor(Math.random() * 900) + 100);
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

  function playSplice(a, b) {
    if (reduceMotion) return Promise.resolve();
    const x = G.getAnimal(a);
    const y = G.getAnimal(b);
    el.mixingA.textContent = x.name;
    el.mixingB.textContent = y.name;
    el.mixingAEmoji.textContent = x.emoji;
    el.mixingBEmoji.textContent = y.emoji;
    el.mixing.hidden = false;
    return new Promise((resolve) => {
      setTimeout(() => {
        el.mixing.hidden = true;
        resolve();
      }, 1600);
    });
  }

  async function startExperiment(a, b) {
    if (a !== 'random' && a === b) {
      toast("An animal can't be spliced with itself. Pick two different specimens!");
      el.parentB.focus();
      return;
    }
    state.selection = { a, b };
    if (a === 'random') a = G.pickRandomAnimal(b === 'random' ? null : b).id;
    if (b === 'random') b = G.pickRandomAnimal(a).id;

    el.generateBtn.disabled = true;
    el.surpriseBtn.disabled = true;
    await playSplice(a, b);
    el.generateBtn.disabled = false;
    el.surpriseBtn.disabled = false;
    go({ a, b, seed: G.newSeed() }, { celebrate: true, focus: true });
  }

  // ---------- result ----------

  function showResult(result, p, opts) {
    const [a, b] = result.parents;
    state.result = result;

    el.builder.hidden = true;
    el.result.hidden = false;
    el.specimenNo.textContent = specimenNumber(result.seed);
    el.name.textContent = result.name;
    el.parentAName.textContent = `${a.emoji} ${a.name}`;
    el.parentBName.textContent = `${b.emoji} ${b.name}`;
    const badges = {
      legendary: '🐉 Legendary creature unlocked!',
      real: '🧬 A real-life hybrid!',
      new: '✨ Brand-new species: you discovered it!'
    };
    el.badge.textContent = badges[result.kind];
    el.badge.className = `badge is-${result.kind}`;
    el.description.textContent = result.description;
    renderStats(result);

    const initialName = p.name || result.petNames[0].name;
    renderNames(result.petNames, initialName);
    setPetName(initialName, { updateUrl: false });

    el.sharedBanner.hidden = p.ref !== 'share';
    el.sharedText.textContent = `Meet ${initialName} the ${result.name}! Someone spliced this creature and shared it with you.`;

    loadImage(result);
    window.scrollTo(0, 0);
    if (opts.focus) el.name.focus({ preventScroll: true });
    if (opts.celebrate) sparks(result.kind === 'legendary' ? 110 : 70);
  }

  function cellMeter(value) {
    const dd = make('dd', 'cells');
    const filled = Math.round(value);
    dd.setAttribute('role', 'img');
    dd.setAttribute('aria-label', `${filled} out of 5`);
    for (let i = 1; i <= 5; i++) dd.append(make('span', i <= filled ? 'on' : ''));
    return dd;
  }

  function renderStats(result) {
    const t = result.traits;
    const meterRow = (label, value, text) => {
      const row = make('div', 'stat');
      row.append(make('dt', null, label), cellMeter(value), make('dd', 'stat-value', text));
      return row;
    };
    const textRow = (label, text) => {
      const row = make('div', 'stat');
      row.append(make('dt', null, label), make('dd', 'stat-text', text));
      return row;
    };
    el.stats.replaceChildren(
      meterRow('Size', t.size, t.sizeLabel),
      meterRow('Speed', t.speed, t.speedLabel),
      meterRow('Ferocity', t.fierce, t.fierceLabel),
      textRow('Habitat', t.habitatLabel),
      textRow('Diet', t.diet),
      textRow('Snack', t.snack),
      textRow('Says', t.sound)
    );
    el.powers.replaceChildren(
      ...t.powers.map((power) => {
        const li = make('li');
        li.insertAdjacentHTML('beforeend', '<svg aria-hidden="true"><use href="#i-bolt"/></svg>');
        li.append(make('span', null, power));
        return li;
      })
    );
  }

  function renderNames(names, selected) {
    el.nameOptions.replaceChildren();
    names.forEach((n) => {
      const btn = make('button', 'name-option');
      btn.type = 'button';
      btn.setAttribute('role', 'radio');
      btn.dataset.name = n.name;
      const check = make('span', 'name-check');
      check.setAttribute('aria-hidden', 'true');
      const text = make('span', 'name-text');
      text.append(make('span', 'name-value', n.name), make('span', 'name-why', n.why));
      btn.append(check, text);
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
    el.caption.textContent = `${name} the ${r.name}`;
    document.title = `${name} the ${r.name} · Creature Lab`;
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
      const q = new URLSearchParams({ a: r.parents[0].id, b: r.parents[1].id, seed: String(r.seed) });
      return `${CONFIG.imageEndpoint}?${q}`;
    }
    const q = new URLSearchParams({
      width: String(CONFIG.imageSize),
      height: String(CONFIG.imageSize),
      seed: String(r.seed),
      model: 'flux',
      nologo: 'true',
      private: 'true',
      referrer: 'creature-lab'
    });
    return CONFIG.pollinationsUrl + encodeURIComponent(r.prompt) + '?' + q;
  }

  let loadingTimer = 0;
  function startLoadingMessages() {
    let i = 0;
    el.loadingText.textContent = LOADING_MESSAGES[0];
    clearInterval(loadingTimer);
    loadingTimer = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length;
      el.loadingText.textContent = LOADING_MESSAGES[i];
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
    el.image.alt = `AI-generated portrait of a ${r.name}, a hybrid of a ${a.name.toLowerCase()} and a ${b.name.toLowerCase()}`;
    startLoadingMessages();

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
    return `Meet ${state.petName}, my brand-new ${r.name} (${a.name} + ${b.name})! 🧪 Splice your own at Creature Lab.`;
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
    const title = `Meet ${state.petName} the ${r.name}!`;
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
    const data = { title: `Meet ${state.petName} the ${r.name}!`, text: shareMessage(), url: shareUrl() };
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
      toast('Specimen card saved!');
    } else if (state.imageUrl) {
      window.open(state.imageUrl, '_blank', 'noopener');
      toast('Opened the portrait in a new tab. Save it from there.');
    } else {
      toast('Hang on, the portrait is still growing in the tank…');
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

  function fitFont(ctx, text, spec, size, maxWidth) {
    let px = size;
    do {
      ctx.font = spec.replace('{px}', px);
      px -= 2;
    } while (ctx.measureText(text).width > maxWidth && px > 18);
  }

  async function buildCard() {
    const r = state.result;
    const photo = state.photo;
    const name = state.petName;
    if (!r || !photo) return null;
    if (document.fonts && document.fonts.load) {
      await Promise.all([
        document.fonts.load('80px Bungee'),
        document.fonts.load('700 30px "Space Mono"'),
        document.fonts.load('700 32px Outfit')
      ]).catch(() => {});
    }
    const logo = await loadLogo();
    const W = 1080;
    const H = 1350;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // dark lab background with a grid and glows
    ctx.fillStyle = '#0a1420';
    ctx.fillRect(0, 0, W, H);
    const glow = (x, y, radius, color) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
      g.addColorStop(0, color);
      g.addColorStop(1, 'rgba(10,20,32,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    };
    glow(80, 60, 520, 'rgba(184,255,60,0.22)');
    glow(1040, 1300, 620, 'rgba(255,61,172,0.25)');
    ctx.strokeStyle = 'rgba(173,216,255,0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, H);
      ctx.stroke();
    }
    for (let y = 0; y <= H; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(W, y + 0.5);
      ctx.stroke();
    }

    // header
    if (logo) ctx.drawImage(logo, 54, 34, 118, 118);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.font = '64px Bungee, Impact, sans-serif';
    ctx.fillStyle = '#b8ff3c';
    ctx.shadowColor = 'rgba(184,255,60,0.6)';
    ctx.shadowBlur = 24;
    ctx.fillText('CREATURE', 196, 104);
    const labX = 196 + ctx.measureText('CREATURE ').width;
    ctx.shadowBlur = 0;
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#34e7e4';
    ctx.strokeText('LAB', labX, 104);
    ctx.font = '700 22px "Space Mono", monospace';
    ctx.fillStyle = '#93a9c2';
    ctx.fillText(`SPECIMEN ${specimenNumber(r.seed)}`, 200, 140);

    // containment tank with the portrait
    const px = 90;
    const py = 190;
    const size = 900;
    ctx.save();
    ctx.shadowColor = 'rgba(52,231,228,0.55)';
    ctx.shadowBlur = 40;
    ctx.fillStyle = '#0e1b2b';
    roundRect(ctx, px, py, size, size, 40);
    ctx.fill();
    ctx.restore();
    ctx.save();
    roundRect(ctx, px, py, size, size, 40);
    ctx.clip();
    const scale = Math.max(size / photo.naturalWidth, size / photo.naturalHeight);
    const dw = photo.naturalWidth * scale;
    const dh = photo.naturalHeight * scale;
    ctx.drawImage(photo, px + (size - dw) / 2, py + (size - dh) / 2, dw, dh);
    ctx.restore();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#34e7e4';
    roundRect(ctx, px, py, size, size, 40);
    ctx.stroke();
    ctx.strokeStyle = '#b8ff3c';
    ctx.lineWidth = 6;
    const c = 44;
    const inset = 22;
    [
      [px + inset, py + inset, 1, 1],
      [px + size - inset, py + inset, -1, 1],
      [px + inset, py + size - inset, 1, -1],
      [px + size - inset, py + size - inset, -1, -1]
    ].forEach(([x, y, sx, sy]) => {
      ctx.beginPath();
      ctx.moveTo(x, y + sy * c);
      ctx.lineTo(x, y);
      ctx.lineTo(x + sx * c, y);
      ctx.stroke();
    });

    // names
    ctx.textAlign = 'center';
    const headline = `Meet ${name}!`;
    fitFont(ctx, headline, '{px}px Bungee, Impact, sans-serif', 76, 900);
    ctx.fillStyle = '#e8f4ff';
    ctx.fillText(headline, W / 2, 1180);
    const breed = `the ${r.name}`;
    fitFont(ctx, breed, '{px}px Bungee, Impact, sans-serif', 50, 900);
    const grad = ctx.createLinearGradient(200, 0, 880, 0);
    grad.addColorStop(0, '#b8ff3c');
    grad.addColorStop(0.5, '#34e7e4');
    grad.addColorStop(1, '#ff3dac');
    ctx.fillStyle = grad;
    ctx.fillText(breed, W / 2, 1246);
    const parents = `${r.parents[0].name} + ${r.parents[1].name}`;
    fitFont(ctx, parents, '700 {px}px "Space Mono", monospace', 30, 900);
    ctx.fillStyle = '#93a9c2';
    ctx.fillText(parents.toUpperCase(), W / 2, 1300);

    const blob = await new Promise((resolve) => {
      try {
        canvas.toBlob(resolve, 'image/png');
      } catch (_) {
        resolve(null); // tainted canvas
      }
    });
    if (!blob) return null;
    const card = { name, file: new File([blob], `${slug(name)}-the-${slug(r.name)}.png`, { type: 'image/png' }) };
    if (state.result === r && state.petName === name) state.card = card;
    return card;
  }

  // ---------- celebration sparks ----------

  function sparks(count) {
    if (reduceMotion) return;
    const colors = ['#b8ff3c', '#34e7e4', '#ff3dac', '#ffa63d', '#9b7bff'];
    const cx = window.innerWidth / 2;
    const cy = Math.min(window.innerHeight * 0.3, 260);
    for (let i = 0; i < count; i++) {
      const s = make('span', 'spark');
      const angle = Math.random() * Math.PI * 2;
      const dist = 120 + Math.random() * Math.max(window.innerWidth, 600) * 0.45;
      s.style.left = cx + 'px';
      s.style.top = cy + 'px';
      s.style.background = colors[i % colors.length];
      s.style.boxShadow = `0 0 10px ${colors[i % colors.length]}`;
      s.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
      s.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
      s.style.animationDuration = 0.9 + Math.random() * 0.9 + 's';
      s.addEventListener('animationend', () => s.remove());
      document.body.append(s);
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
    el.form.addEventListener('submit', (event) => {
      event.preventDefault();
      startExperiment(el.parentA.value, el.parentB.value);
    });
    el.surpriseBtn.addEventListener('click', () => {
      el.parentA.value = 'random';
      el.parentB.value = 'random';
      renderPods(true);
      startExperiment('random', 'random');
    });
    el.parentA.addEventListener('change', () => renderPod(el.parentA, el.infoA, el.windowA, el.emojiA, true));
    el.parentB.addEventListener('change', () => renderPod(el.parentB, el.infoB, el.windowB, el.emojiB, true));

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
