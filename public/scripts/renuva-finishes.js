/* RenuvaFinishes — coverflow-style 3D card gallery of 3M DI-NOC finishes.
   Scroll spins a CONTINUOUS (wrapping) coverflow: one card centered, the rest
   fanning to the LEFT and RIGHT across the full width. Click a card to flatten
   it dead-center over an opaque backdrop, with a detail panel. */
(function () {
  const IMG_DIR = '/assets/finishes/';

  const FINISHES = [
    { code: 'FW-1021', series: 'Fine Wood', img: '3M-DI-NOC-Fine-Wood-FW-1021.webp?v=1771263190',
      desc: 'High-definition wood reproduction with refined, realistic grain detail.',
      price: 'From $3.62 / sq ft', ship: 'Quick-Ship' },
    { code: 'WG-943', series: 'Wood Grain', img: '3M-DI-NOC-Wood-WG-943.jpg?v=1780874816',
      desc: 'Classic warm woodgrain — the workhorse series for cabinetry and millwork.',
      price: 'From $3.05 / sq ft', ship: 'Quick-Ship' },
    { code: 'ME-1435', series: 'Metallic Hairline', img: '3M-DI-NOC-Metal-ME-1435_e6b4cf10-ced8-420d-bf81-de022fdac5e9.jpg?v=1780874068',
      desc: 'Brushed hairline metal with a directional sheen for doors and trim.',
      price: 'From $3.78 / sq ft', ship: 'Quick-Ship' },
    { code: 'PW-2314MT', series: 'Premium Wood Matte', img: '3M-DI-NOC-Premium-Wood-PW-2314MT.webp?v=1771263537',
      desc: "3M's most realistic wood, in a fingerprint-resistant ultra-matte.",
      price: 'From $5.34 / sq ft', ship: 'Quick-Ship' },
    { code: 'FA-1526AR', series: 'Ceramic · Abrasion Resistant', img: '3M-DI-NOC-Abrasion-Resistant-FA-1526AR_669ed352-a8c0-49a8-990f-e609d6760395.jpg?v=1771976700',
      desc: 'Terracotta ceramic look with a hardened wear layer for high-traffic surfaces.',
      price: 'From $4.40 / sq ft', ship: '2–4 weeks' },
    { code: 'WG-1142', series: 'Wood Grain', img: '3M-DI-NOC-Wood-WG-1142.jpg?v=1780874783',
      desc: 'Mid-tone oak grain with a calm, even cathedral pattern.',
      price: 'From $3.05 / sq ft', ship: 'Quick-Ship' },
    { code: 'PS-3989MT', series: 'Solid Color Matte', img: '3M-DI-NOC-Solid-Color-PS-3989MT.webp?v=1771263582',
      desc: 'A clean single color in ultra-low-gloss matte for seamless panels.',
      price: 'From $3.57 / sq ft', ship: 'Quick-Ship' },
    { code: 'WG-865', series: 'Wood Grain', img: '3M-DI-NOC-Wood-WG-865.jpg?v=1780874816',
      desc: 'Deep walnut tone that reads rich and architectural at scale.',
      price: 'From $3.05 / sq ft', ship: 'Quick-Ship' },
    { code: 'WG-1704', series: 'Wood Grain', img: '3M-DI-NOC-Wood-WG-1704.jpg?v=1780874783',
      desc: 'Pale Scandinavian grain that keeps small spaces bright.',
      price: 'From $3.05 / sq ft', ship: 'Quick-Ship' },
    { code: 'WG-1841', series: 'Wood Grain', img: '3M-DI-NOC-Wood-WG-1841.jpg?v=1780874783',
      desc: 'Smoked ash grain with soft contrast for statement islands.',
      price: 'From $3.05 / sq ft', ship: 'Quick-Ship' }
  ];

  const N = FINISHES.length;
  const section = document.getElementById('finishes');
  const stage = document.getElementById('finStage');
  const cardsEl = document.getElementById('finCards');
  const detail = document.getElementById('finDetail');
  const closeBtn = document.getElementById('finClose');
  const hint = document.getElementById('finHint');
  const head = document.querySelector('.fin-head');
  const backdrop = document.getElementById('finBackdrop');
  if (!section || !stage) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* scroll runway: longer section, ~60vh per card */
  section.style.height = (100 + N * 60) + 'vh';

  /* build cards */
  const cards = FINISHES.map(function (f, i) {
    const el = document.createElement('div');
    el.className = 'fcard';
    el.innerHTML = '<img src="' + IMG_DIR + f.code + '.jpg" alt="3M DI-NOC ' + f.code + '" draggable="false" />' +
      '<span class="fcard-label">' + f.code + '</span>';
    el.addEventListener('click', function () { onCardClick(i); });
    el.addEventListener('mouseenter', function () { hov[i].t = 1; });
    el.addEventListener('mouseleave', function () { hov[i].t = 0; });
    cardsEl.appendChild(el);
    return el;
  });

  let cur = 0, target = 0, forced = null;
  let open = -1;
  window.__fin = {
    force: function (v) { if (open >= 0) return; forced = v; cur = v; target = v; setTransforms(); },
    openCard: function (i) { onCardClick(i); },
    close: function () { closeCard(); }
  };

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  function scrollProgress() {
    const r = section.getBoundingClientRect();
    const total = section.offsetHeight - window.innerHeight;
    return total > 0 ? clamp(-r.top / total, 0, 1) : 0;
  }

  /* nearest wrapped distance of card i from cur, in [-N/2, N/2] */
  function wrapDelta(i) {
    let s = (i - cur) % N;
    if (s > N / 2) s -= N;
    if (s < -N / 2) s += N;
    return s;
  }

  /* diagonal stack (unveil-style, gentle slope): the active card sits center,
     upcoming cards climb away up-right along a diagonal, passed cards slide
     down-left toward the viewer and fade. Wrapping keeps both sides populated. */
  const hov = FINISHES.map(function () { return { v: 0, t: 0 }; });

  function setTransforms() {
    const W = window.innerWidth, H = window.innerHeight;
    const spreadX = Math.min(W * 0.46, 780);
    const spreadY = Math.min(H * 0.30, 290);   // gentle diagonal, not steep
    for (let i = 0; i < N; i++) {
      const s = wrapDelta(i);
      const a = Math.abs(s);
      hov[i].v += (hov[i].t - hov[i].v) * 0.18;
      const h = open < 0 ? hov[i].v : 0;
      let x, y, z, o = 1;
      const f = Math.tanh(s * 0.34);
      x = f * W * 0.74;
      const ch = cards[0].offsetHeight || 1;
      const riseCap = Math.max(H / 2 - ch / 2 - 28, 40);  // whole card stays inside the stage
      y = -Math.sign(f) * Math.min(Math.abs(f) * H * 0.50, riseCap);
      z = -s * 70;
      if (s >= 0) {
        if (a > 2.6) o = clamp((4.4 - a) / 1.8, 0, 1);    // blend far cards into the background
      } else {
        o = clamp(1 - (a - 0.7) / 1.5, 0, 1);
      }
      z += 90 * h;
      const scale = 1 + 0.045 * h;
      cards[i].style.transform =
        'translate(-50%, -50%) translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,' + z.toFixed(1) + 'px)' +
        ' rotateY(-30deg) rotateX(7deg) rotateZ(-4.5deg) scale(' + scale.toFixed(3) + ')';
      cards[i].style.opacity = o.toFixed(3);
      cards[i].style.zIndex = String(2000 - Math.round(s * 30));
      cards[i].style.visibility = o <= 0.002 ? 'hidden' : 'visible';
    }
  }

  function frame() {
    if (open < 0) {
      const p = scrollProgress();
      target = forced !== null ? forced : p * (N - 1);
      cur = reduced ? target : cur + (target - cur) * 0.09;
      if (Math.abs(target - cur) < 0.0005) cur = target;
      setTransforms();
      /* fade the stack out over the last stretch so the section melts into the next */
      const fade = clamp((0.965 - p) / 0.055, 0, 1);
      cardsEl.style.opacity = fade.toFixed(3);
      cardsEl.style.pointerEvents = fade < 0.15 ? 'none' : '';
      if (hint) hint.style.opacity = fade.toFixed(3);
    }
    requestAnimationFrame(frame);
  }

  function focusTransform() {
    const H = window.innerHeight, W = window.innerWidth;
    const card = cards[0];
    const baseH = card.offsetHeight || 1;
    const desiredH = W > 1100 ? Math.min(H * 0.84, W * 0.55 * 1.25) : H * 0.62;
    const k = Math.max(desiredH / baseH, W > 1100 ? 1.05 : 0.05);  // enlarge on desktop; fit on small screens
    const ox = W > 1100 ? -W * 0.15 : 0;
    const oy = W > 1100 ? 0 : -H * 0.12;
    return 'translate(-50%, -50%) translate3d(' + ox.toFixed(1) + 'px,' + oy.toFixed(1) + 'px,0)' +
      ' rotateY(0deg) scale(' + k.toFixed(3) + ')';
  }

  function onCardClick(i) {
    if (open === i) { closeCard(); return; }
    if (open >= 0) return;
    open = i;
    const f = FINISHES[i];
    detail.innerHTML =
      '<p class="fd-series">3M DI-NOC · ' + f.series + '</p>' +
      '<h3>' + f.code + '</h3>' +
      '<p class="fd-desc">' + f.desc + '</p>' +
      '<dl class="fd-specs">' +
      '<div><dt>Roll width</dt><dd>48 in</dd></div>' +
      '<div><dt>Adhesive</dt><dd>3M™ Comply™, air-release</dd></div>' +
      '<div><dt>Rated</dt><dd>12-yr interior vertical</dd></div>' +
      '<div><dt>Availability</dt><dd>' + f.ship + '</dd></div>' +
      '<div><dt>Price</dt><dd>' + f.price + '</dd></div>' +
      '</dl>';
    stage.classList.add('open');
    if (backdrop) { backdrop.style.opacity = '0.97'; backdrop.style.pointerEvents = 'auto'; }
    if (head) head.style.opacity = '0';
    if (hint) hint.style.opacity = '0';
    cards.forEach(function (c, j) {
      if (j === i) {
        c.classList.add('focus');
        c.style.transform = focusTransform();
        c.style.opacity = '1';
        c.style.visibility = 'visible';
        c.style.zIndex = '2600';
      } else {
        c.classList.add('dim');
        c.style.opacity = '0';        // fully hidden — no see-through
      }
    });
  }

  function closeCard() {
    if (open < 0) return;
    const i = open;
    open = -1;
    stage.classList.remove('open');
    stage.classList.add('closing');
    if (backdrop) { backdrop.style.opacity = '0'; backdrop.style.pointerEvents = 'none'; }
    if (head) head.style.opacity = '';
    cards.forEach(function (c) { c.classList.remove('dim'); c.style.opacity = ''; });
    setTransforms();
    setTimeout(function () {
      cards[i].classList.remove('focus');
      stage.classList.remove('closing');
      if (hint) hint.style.opacity = '';
    }, 760);
  }

  closeBtn.addEventListener('click', closeCard);
  if (backdrop) backdrop.addEventListener('click', closeCard);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeCard(); });
  window.addEventListener('resize', function () { if (open >= 0) cards[open].style.transform = focusTransform(); else setTransforms(); });

  setTransforms();
  requestAnimationFrame(frame);
})();
