/* RenuvaFinishes — coverflow-style 3D card gallery of Renuva finishes.
   Horizontal scroll (trackpad sideways / shift+wheel / touch drag) spins a
   CONTINUOUS (wrapping) coverflow: one card centered, the rest fanning to the
   LEFT and RIGHT. Vertical scroll passes through to the page. Click a card to
   flatten it dead-center over an opaque backdrop, with a detail panel. */
(function () {
  const IMG_DIR = '/assets/finishes/renuva/';

  /* ordered as a tonal cycle — whites → creams → warm woods → darks → greys →
     back to white — so neighbouring cards always sit next to a kindred colour */
  const FINISHES = [
    { code: 'HG1630', name: 'Pure White Gloss', series: 'High Gloss Solid',
      desc: 'A crisp pure white tone with a deep, reflective high-gloss finish. Designed to elevate modern kitchens, wardrobe fronts, and feature panels.',
      url: 'https://surfacesupply.com/products/renuva-architectural-film-high-gloss-solid-hg1630' },
    { code: 'RW1418', name: 'Bright White Painted Wood', series: 'Painted Wood',
      desc: 'A bright white tone with dense, fine straight-grain texture. Designed to elevate kitchens, cabinet fronts, and doors in crisp modern spaces.',
      url: 'https://surfacesupply.com/products/renuva-architectural-film-painted-wood-lw1418' },
    { code: 'ST1107', name: 'Carrara White Marble', series: 'Marble',
      desc: 'A clean white tone with sparse, confident grey veining in the classic Carrara manner. Designed to elevate feature walls, columns, and furniture in bright, classic spaces.',
      url: 'https://surfacesupply.com/products/renuva-architectural-film-marble-st1107' },
    { code: 'PW1512', name: 'Cream Ash', series: 'Premium Wood',
      desc: 'A pale cream ash tone with a subtle, even figure and a light Scandinavian feel. Designed to refresh doors, cabinetry, and furniture in airy, minimal interiors.',
      url: 'https://surfacesupply.com/products/renuva-architectural-film-premium-wood-pw1512' },
    { code: 'ME1213', name: 'Brushed Champagne Metal', series: 'Metal',
      desc: 'A warm champagne-silver tone with fine hairline brushing running the length of the film. Designed to elevate doors, panels, appliance surrounds, and trim in modern interiors.',
      url: 'https://surfacesupply.com/products/renuva-architectural-film-metal-me1213' },
    { code: 'PW1516', name: 'Honey Oak', series: 'Premium Wood',
      desc: 'A warm golden oak tone with an even, natural grain. Designed to elevate doors, millwork, and furniture in warm residential spaces.',
      url: 'https://surfacesupply.com/products/renuva-architectural-film-premium-wood-pw1516' },
    { code: 'PW1522', name: 'Rosewood Mahogany', series: 'Premium Wood',
      desc: 'A deep reddish mahogany tone with straight, elegant grain. Designed to elevate executive furniture, doors, and panels in formal interiors.',
      url: 'https://surfacesupply.com/products/renuva-architectural-film-premium-wood-pw1522' },
    { code: 'MT1711', name: 'Charcoal Matte', series: 'Matte Solid',
      desc: 'A deep charcoal tone with a finely textured matte surface. Designed to anchor cabinets, doors, and feature panels in bold modern interiors.',
      url: 'https://surfacesupply.com/products/renuva-architectural-film-matte-solid-mt1711' },
    { code: 'MTS1308', name: 'Slate Grey Soft Matte', series: 'Soft Matte',
      desc: 'An even mid-grey tone with a velvety soft-touch surface that diffuses light. Designed to bring a premium super-matte look to cabinet fronts, doors, and built-ins.',
      url: 'https://surfacesupply.com/products/renuva-architectural-film-soft-matte-mts1308' },
    { code: 'FP1842', name: 'Grey Linen Weave', series: 'Fabric',
      desc: 'A mid-grey tone with linen-weave texture and natural vertical slub. Designed to complement wall panels, wardrobe fronts, and hospitality interiors.',
      url: 'https://surfacesupply.com/products/renuva-architectural-film-fabric-fp1842' }
  ];

  /* open on the warm woods: Honey Oak centered, Champagne/Cream Ash to one
     side, Rosewood to the other */
  const HOME = 5;

  const N = FINISHES.length;
  const section = document.getElementById('finishes');
  const stage = document.getElementById('finStage');
  const cardsEl = document.getElementById('finCards');
  const detail = document.getElementById('finDetail');
  const closeBtn = document.getElementById('finClose');
  const head = document.querySelector('.fin-head');
  const backdrop = document.getElementById('finBackdrop');
  if (!section || !stage) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* build cards */
  const cards = FINISHES.map(function (f, i) {
    const el = document.createElement('div');
    el.className = 'fcard';
    el.innerHTML = '<img src="' + IMG_DIR + f.code + '-xl.jpg" alt="Renuva ' + f.name + ' — ' + f.code + '" draggable="false" />' +
      '<span class="fcard-label">' + f.code + '</span>';
    el.addEventListener('click', function () { onCardClick(i); });
    el.addEventListener('mouseenter', function () { hov[i].t = 1; });
    el.addEventListener('mouseleave', function () { hov[i].t = 0; });
    cardsEl.appendChild(el);
    return el;
  });

  let cur = HOME, target = HOME;
  let open = -1;
  let lastInput = -1e9, dragId = null, lastX = 0;
  let startX = 0, startY = 0, dragAxis = null, vel = 0, lastT = 0;
  window.__fin = {
    force: function (v) { if (open >= 0) return; cur = v; target = v; setTransforms(); },
    openCard: function (i) { onCardClick(i); },
    close: function () { closeCard(); }
  };

  /* ---- input: horizontal only; vertical scroll falls through to the page ---- */
  stage.addEventListener('wheel', function (e) {
    if (open >= 0) return;
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; /* vertical → let the page scroll */
    e.preventDefault();
    target += e.deltaX / 300;
    lastInput = performance.now();
  }, { passive: false });

  /* touch drag: touch-action pan-y on .fin-cards keeps vertical swipes scrolling
     the page. A direction lock decides the gesture's axis on the first few px of
     travel — biased toward horizontal so diagonal swipes go to the deck — and
     once committed we preventDefault native scrolling so the browser can never
     steal the gesture mid-drag (the old "stuck" feel was pointercancel firing
     when the page scroll took over). */
  let swiped = false;
  stage.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'touch' || open >= 0) return;
    dragId = e.pointerId;
    lastX = startX = e.clientX; startY = e.clientY;
    dragAxis = null; vel = 0; lastT = e.timeStamp; swiped = false;
    /* catch the deck mid-glide: touching stops any momentum under the finger */
    target = cur;
    lastInput = performance.now();
  });
  stage.addEventListener('pointermove', function (e) {
    if (e.pointerId !== dragId) return;
    if (dragAxis === null) {
      const dx = Math.abs(e.clientX - startX), dy = Math.abs(e.clientY - startY);
      if (dx + dy < 4) return;
      dragAxis = dx >= dy * 0.9 ? 'x' : 'y';
      if (dragAxis === 'x') { try { stage.setPointerCapture(dragId); } catch (_) {} }
      lastX = e.clientX;
    }
    if (dragAxis !== 'x') return;
    if (Math.abs(e.clientX - startX) > 10) swiped = true;
    const per = window.innerWidth < 760 ? 150 : 220; /* px of finger travel per card */
    const d = (lastX - e.clientX) / per;
    target += d;
    const dt = Math.max(e.timeStamp - lastT, 1);
    vel = vel * 0.75 + (d / dt) * 1000 * 0.25; /* cards per second, smoothed */
    lastX = e.clientX; lastT = e.timeStamp;
    lastInput = performance.now();
  });
  /* once locked horizontal, keep the browser from starting a page scroll */
  stage.addEventListener('touchmove', function (e) {
    if (dragAxis === 'x') e.preventDefault();
  }, { passive: false });
  ['pointerup', 'pointercancel'].forEach(function (t) {
    stage.addEventListener(t, function (e) {
      if (e.pointerId !== dragId) return;
      dragId = null;
      if (dragAxis === 'x') {
        /* flick momentum on release — and on cancel, so an interrupted gesture
           glides out instead of dead-stopping */
        target += Math.max(-2.5, Math.min(2.5, vel * 0.22));
        lastInput = performance.now();
      }
      dragAxis = null;
    });
  });
  /* a real swipe must not open the card under the released finger */
  stage.addEventListener('click', function (e) {
    if (swiped) { swiped = false; e.stopPropagation(); e.preventDefault(); }
  }, true);

  /* nearest wrapped distance of card i from cur, in [-N/2, N/2] */
  function wrapDelta(i) {
    let s = (i - cur) % N;
    if (s > N / 2) s -= N;
    if (s < -N / 2) s += N;
    return s;
  }

  /* uniform diagonal conveyor: every card takes the same-sized step up-right /
     down-left from the center, at full size and full color the whole way —
     cards simply travel off the screen corners. Wrapping keeps both sides fed. */
  const hov = FINISHES.map(function () { return { v: 0, t: 0 }; });

  function setTransforms() {
    const W = window.innerWidth, H = window.innerHeight;
    const mobile = W < 760;
    /* phones: a touch more horizontal travel, a touch less vertical, and the
       whole conveyor sits slightly lower so cards never reach the heading */
    const stepX = W * (mobile ? 0.26 : 0.20);
    const stepY = H * (mobile ? 0.125 : 0.145);
    const cy = mobile ? H * 0.06 : 0;
    for (let i = 0; i < N; i++) {
      const s = wrapDelta(i);
      hov[i].v += (hov[i].t - hov[i].v) * 0.18;
      const h = open < 0 ? hov[i].v : 0;
      const x = s * stepX;
      const y = -s * stepY + cy;
      const z = 90 * h;
      const scale = 1 + 0.045 * h;
      cards[i].style.transform =
        'translate(-50%, -50%) translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,' + z.toFixed(1) + 'px)' +
        ' rotateY(-30deg) rotateX(7deg) rotateZ(-4.5deg) scale(' + scale.toFixed(3) + ')';
      cards[i].style.opacity = '';
      cards[i].style.zIndex = String(2000 - Math.round(Math.abs(s) * 30));
      cards[i].style.visibility = 'visible';
    }
  }

  function frame(t) {
    if (open < 0) {
      const mobile = window.innerWidth < 760;
      /* settle onto the nearest card once input goes quiet */
      if (dragId === null && t - lastInput > (mobile ? 180 : 260)) {
        target += (Math.round(target) - target) * (mobile ? 0.14 : 0.10);
      }
      /* track the finger tightly while dragging; glide smoothly once released */
      const follow = dragId !== null ? 0.35 : (mobile ? 0.16 : 0.12);
      cur = reduced ? target : cur + (target - cur) * follow;
      if (Math.abs(target - cur) < 0.0005) cur = target;
      setTransforms();
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
      '<p class="fd-series">Renuva™ · ' + f.series + '</p>' +
      '<h3>' + f.name + '</h3>' +
      '<p class="fd-desc">' + f.desc + '</p>' +
      '<dl class="fd-specs">' +
      '<div><dt>Code</dt><dd>' + f.code + '</dd></div>' +
      '<div><dt>Series</dt><dd>' + f.series + '</dd></div>' +
      '</dl>' +
      '<a class="fd-link" href="' + f.url + '" target="_blank" rel="noopener">View at Surface Supply</a>';
    stage.classList.add('open');
    if (backdrop) { backdrop.style.opacity = '0.97'; backdrop.style.pointerEvents = 'auto'; }
    if (head) head.style.opacity = '0';
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
    }, 760);
  }

  closeBtn.addEventListener('click', closeCard);
  if (backdrop) backdrop.addEventListener('click', closeCard);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeCard(); });
  window.addEventListener('resize', function () { if (open >= 0) cards[open].style.transform = focusTransform(); else setTransforms(); });

  setTransforms();
  requestAnimationFrame(frame);
})();
