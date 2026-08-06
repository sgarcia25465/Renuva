/* RenuvaPhotoKitchen — HD kitchen photo that begins as a black & white line drawing
   and wraps itself, piece by piece, into the real photograph. Canvas renderer.

   API: RenuvaPhotoKitchen.create(canvasEl) -> { setProgress(p), setFinish(name) }
*/
window.RenuvaPhotoKitchen = (function () {
  const LINES = '/assets/landing/kitchen-lines.png';
  const PHOTO = '/assets/landing/kitchen-photo.png';
  const CROP_X = 40;            // crop empty left margin
  const W = 1380, H = 896;      // canvas intrinsic size (full source resolution)

  const FINISHES = {
    'Light Oak':  'none',
    'Walnut':     'brightness(0.72) saturate(0.92) contrast(1.04)',
    'Honey Teak': 'saturate(1.35) sepia(0.12) brightness(0.99)'
  };

  // reveal pieces in source-image coordinates [x0, y0, x1, y1]; wrap order = array order
  const PIECES = [
    [64, 58, 190, 672],      // tall pantry, left door (stops at island's left edge)
    // tall pantry, right door — bottom follows the island slab's slanted top edge
    [190, 58, 362, 530, [[190, 527], [235, 522], [255, 517], [275, 512], [295, 507], [310, 503], [362, 503]]],
    [350, 66, 498, 318],     // upper door 1
    [498, 66, 638, 318],     // upper door 2
    [638, 66, 778, 318],     // upper door 3
    [778, 66, 908, 318],     // upper door 4
    [908, 66, 1054, 318],    // upper door 5
    [1054, 66, 1210, 318],   // upper door 6
    [318, 312, 1210, 520],   // backsplash + counter accessories
    [1200, 52, 1378, 300],   // right tall, top door
    [1200, 300, 1378, 512],  // oven stack
    [348, 466, 1400, 556],   // countertop run
    [192, 492, 1402, 558],   // island slab
    [192, 556, 432, 830],    // island front L
    [432, 556, 650, 830],    // island front M
    [650, 556, 764, 830],    // island front R
    [764, 556, 1248, 830],   // island back panel
    [1248, 492, 1402, 830],  // waterfall end
    [818, 550, 1018, 852],   // stool 1
    [1018, 550, 1248, 852],  // stool 2
    [400, 0, 460, 178],      // pendants…
    [561, 0, 621, 178],
    [697, 0, 757, 178],
    [837, 0, 897, 178],
    [980, 0, 1040, 178],
    [1125, 0, 1185, 178],
    [192, 808, 1402, 878]    // floor shadow fade
  ];

  function load(src) {
    return new Promise((res, rej) => {
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = rej;
      im.src = src;
    });
  }

  function create(canvas) {
    const ctx = canvas.getContext('2d');

    // Match the backing store to the canvas's on-screen device-pixel size so the
    // 1600px source art goes through a single near-1:1 resample instead of an
    // upscale-then-downscale round trip. Re-fit whenever the layout resizes.
    let fitScale = 0;
    function fit() {
      const cssW = canvas.clientWidth || canvas.getBoundingClientRect().width || W;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const scale = Math.max(cssW * dpr / W, 0.5);
      if (Math.abs(scale - fitScale) < 0.01) return false;
      fitScale = scale;
      canvas.width = Math.round(W * scale);
      canvas.height = Math.round(H * scale);
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      return true;
    }

    const n = PIECES.length;
    const L = Math.min(0.2, 2.2 / n);
    const starts = PIECES.map((r, i) => i * (1 - L) / (n - 1));

    let lines = null, photo = null;
    const locals = new Float64Array(n);
    let finish = 'none', dirty = true;

    function render() {
      if (!lines || !photo || !dirty) return;
      dirty = false;

      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(lines, -CROP_X, 0);

      if (finish !== 'none') ctx.filter = finish;
      const edges = [];
      for (let i = 0; i < n; i++) {
        const local = locals[i];
        if (local === 0) continue;
        const e = local * local * (3 - 2 * local);
        const r = PIECES[i];
        const w = (r[2] - r[0]) * e;
        if (w < 1) continue;
        const clip = r[4];
        if (clip) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(r[0] - CROP_X, r[1]);
          ctx.lineTo(r[2] - CROP_X, r[1]);
          for (let k = clip.length - 1; k >= 0; k--) ctx.lineTo(clip[k][0] - CROP_X, clip[k][1]);
          ctx.closePath();
          ctx.clip();
        }
        ctx.drawImage(photo, r[0], r[1], w, r[3] - r[1], r[0] - CROP_X, r[1], w, r[3] - r[1]);
        if (clip) ctx.restore();
        if (local < 0.999) edges.push([r[0] + w - CROP_X, r[1], r[3] - r[1], e]);
      }
      if (finish !== 'none') ctx.filter = 'none';

      // wipe-edge highlights
      for (const [ex, ey, eh, e] of edges) {
        const a = 0.9 * (1 - Math.abs(2 * e - 1) * 0.35);
        ctx.fillStyle = 'rgba(255,255,255,' + a.toFixed(2) + ')';
        ctx.fillRect(ex - 1.5, ey, 3, eh);
      }
    }

    fit();
    window.addEventListener('resize', function () {
      if (fit()) { dirty = true; render(); }
    });

    Promise.all([load(LINES), load(PHOTO)]).then(([li, ph]) => {
      lines = li; photo = ph;
      dirty = true;
      render();
    });

    return {
      setProgress: function (p) {
        p = Math.max(0, Math.min(1, p));
        for (let i = 0; i < n; i++) {
          let local = (p - starts[i]) / L;
          local = local < 0 ? 0 : (local > 1 ? 1 : local);
          if (Math.abs(local - locals[i]) > 0.0015 || (local !== locals[i] && (local === 0 || local === 1))) {
            locals[i] = local; dirty = true;
          }
        }
        render();
      },
      // direct per-piece control (0..1 each) — used for zone-based reveals
      setPieceLocals: function (arr) {
        for (let i = 0; i < n; i++) {
          const v = arr[i] < 0 ? 0 : (arr[i] > 1 ? 1 : arr[i]);
          if (Math.abs(v - locals[i]) > 0.0015 || (v !== locals[i] && (v === 0 || v === 1))) {
            locals[i] = v; dirty = true;
          }
        }
        render();
      },
      pieceCount: n,
      setFinish: function (name) {
        finish = FINISHES[name] || 'none';
        dirty = true;
        render();
      }
    };
  }

  return { create, FINISHES };
})();
