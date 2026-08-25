/* Renuva finish media — the imagery behind a finish.

   Every finish has a kitchen preview: one of our project kitchens re-rendered
   with that exact finish on the cabinets, generated from the finish's own
   corrected swatch. So the photo a customer sees under a finish is always
   that finish, never a lookalike.

   Consumed by the finishes page, the home-page finish library, the swatch book
   and the gallery, so a finish looks the same everywhere. */
(function () {
	'use strict';

	var APPLIED = '/assets/applied/';

	var NAMES = {
		PW1512: 'Cream Ash', PW1514: 'Sand Oak', PW1516: 'Honey Oak',
		PW1518: 'Golden Rift Oak', PW1520: 'Amber Oak', PW1522: 'Rosewood Mahogany',
		RW1412: 'Warm White Painted Wood', RW1414: 'Cream Painted Wood',
		RW1416: 'Dove Grey Painted Wood', RW1418: 'Bright White Painted Wood',
		FP1840: 'White Linen Weave', FP1842: 'Grey Linen Weave',
		MTS1308: 'Slate Grey Soft Matte',
		HG1630: 'Pure White Gloss', HG1632: 'Ivory Gloss', HG1634: 'Greige Gloss',
		MT1701: 'Pure White Matte', MT1703: 'Soft White Matte', MT1705: 'Ivory Matte',
		MT1707: 'Pale Grey Matte', MT1709: 'Stone Grey Matte', MT1711: 'Charcoal Matte',
		ME1213: 'Brushed Champagne Metal', ME1215: 'Pearl Silver Metal',
		ST1105: 'Cream Onyx Marble', ST1107: 'Carrara White Marble',
		ST1109: 'Cloud White Marble'
	};

	window.renuvaFinishName = function (code) {
		return NAMES[code] || code;
	};

	window.renuvaFinishShots = function (code) {
		return [{ src: APPLIED + code + '.jpg', caption: 'On kitchen cabinets' }];
	};

	/* ---------- shared "see it applied" strip ----------
	   The swatch stays the hero: the strip sits under the finish copy, opens
	   with the swatch selected, and picking the kitchen swaps the big image in
	   place. Injects its own styles once so every host looks the same. */

	var STYLE_ID = 'rv-shots-style';
	function ensureStyles() {
		if (document.getElementById(STYLE_ID)) return;
		var css = [
			'.rv-shots{margin-top:22px}',
			'.rv-shots-label{font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#A2937F}',
			'.rv-shots-row{display:flex;gap:9px;margin-top:11px;flex-wrap:wrap}',
			/* thumbnails stay at full opacity — dimming them would misreport a
			   finish's colour, which is the whole point of the swatch */
			'.rv-shot{width:52px;height:65px;padding:0;border:1px solid rgba(75,69,64,.18);border-radius:6px;overflow:hidden;background:#E8E2D8;cursor:pointer;transition:border-color .2s ease,transform .2s ease,box-shadow .2s ease}',
			'.rv-shot img{width:100%;height:100%;object-fit:cover;display:block}',
			'.rv-shot:hover{transform:translateY(-2px);border-color:rgba(140,119,102,.6)}',
			'.rv-shot.is-active{border-color:#8C7766;box-shadow:0 0 0 2px rgba(140,119,102,.45)}',
			'.rv-shot:focus-visible{outline:2px solid #8C7766;outline-offset:2px}',
			'.rv-shot-caption{margin-top:9px;font-size:12px;color:#8A8177;letter-spacing:.02em}',
			'@media (max-width:1100px){.rv-shots{margin-top:14px}.rv-shot{width:44px;height:55px}}',
			'@media (prefers-reduced-motion:reduce){.rv-shot{transition:none}}'
		].join('');
		var el = document.createElement('style');
		el.id = STYLE_ID;
		el.textContent = css;
		document.head.appendChild(el);
	}

	window.renuvaShotStripHTML = function (code) {
		ensureStyles();
		var shots = window.renuvaFinishShots(code);
		var swatchThumb = '/assets/finishes/renuva/' + code + '.jpg';
		var swatchFull = '/assets/finishes/renuva/' + code + '-xl.jpg';
		var html = '<div class="rv-shots" data-shots="' + code + '">' +
			'<p class="rv-shots-label">See it applied</p>' +
			'<div class="rv-shots-row">' +
			'<button type="button" class="rv-shot is-active" data-full="' + swatchFull +
			'" data-caption="Finish swatch" aria-label="Finish swatch">' +
			'<img src="' + swatchThumb + '" alt="" loading="lazy" /></button>';
		shots.forEach(function (s) {
			html += '<button type="button" class="rv-shot" data-full="' + s.src +
				'" data-caption="' + s.caption + '" aria-label="' + s.caption + '">' +
				'<img src="' + s.src + '" alt="" loading="lazy" /></button>';
		});
		html += '</div><p class="rv-shot-caption">Finish swatch</p></div>';
		return html;
	};

	/* Wire the strip inside `root`. setImage(src) puts the chosen shot in the
	   big image; it is called with the full-size source. */
	window.renuvaWireShotStrip = function (root, setImage) {
		if (!root) return;
		var strip = root.querySelector('.rv-shots');
		if (!strip) return;
		var caption = strip.querySelector('.rv-shot-caption');
		var buttons = Array.prototype.slice.call(strip.querySelectorAll('.rv-shot'));
		buttons.forEach(function (btn) {
			btn.addEventListener('click', function (e) {
				e.stopPropagation();
				buttons.forEach(function (b) { b.classList.remove('is-active'); });
				btn.classList.add('is-active');
				caption.textContent = btn.getAttribute('data-caption');
				setImage(btn.getAttribute('data-full'));
			});
		});
	};
})();
