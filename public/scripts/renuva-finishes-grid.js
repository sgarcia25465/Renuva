/* Renuva finishes page — grid of every finish, rows of 4. Clicking a tile
   lifts it into the same focused-card + detail-panel UI as the Finish Library
   on the home page: opaque backdrop, swatch flattened center-left, detail
   panel on the right. */
(function () {
	'use strict';

	var IMG_DIR = '/assets/finishes/renuva/';

	var FINISHES = [
	{
	"code": "PW1512",
	"name": "Cream Ash",
	"series": "Premium Wood",
	"desc": "A pale cream ash tone with a subtle, even figure and a light Scandinavian feel. Designed to refresh doors, cabinetry, and furniture in airy, minimal interiors.",
	"url": "https://surfacesupply.com/products/renuva-architectural-film-premium-wood-pw1512",
	"dark": false
	},
	{
	"code": "PW1514",
	"name": "Sand Oak",
	"series": "Premium Wood",
	"desc": "A light sandy oak tone with a fine cathedral figure. Designed to complement doors, cabinet fronts, and furniture in relaxed natural interiors.",
	"url": "https://surfacesupply.com/products/renuva-architectural-film-premium-wood-pw1514",
	"dark": false
	},
	{
	"code": "PW1516",
	"name": "Honey Oak",
	"series": "Premium Wood",
	"desc": "A warm golden oak tone with an even, natural grain. Designed to elevate doors, millwork, and furniture in warm residential spaces.",
	"url": "https://surfacesupply.com/products/renuva-architectural-film-premium-wood-pw1516",
	"dark": false
	},
	{
	"code": "PW1518",
	"name": "Golden Rift Oak",
	"series": "Premium Wood",
	"desc": "A medium golden oak tone with straight rift-sawn grain. Designed to complement doors, cabinetry, wall panels, and office furniture.",
	"url": "https://surfacesupply.com/products/renuva-architectural-film-premium-wood-pw1518",
	"dark": false
	},
	{
	"code": "PW1520",
	"name": "Amber Oak",
	"series": "Premium Wood",
	"desc": "A warm amber oak tone with soft cathedral figure and natural tonal movement. Designed to refresh doors, cabinet fronts, and millwork in traditional interiors.",
	"url": "https://surfacesupply.com/products/renuva-architectural-film-premium-wood-pw1520",
	"dark": true
	},
	{
	"code": "PW1522",
	"name": "Rosewood Mahogany",
	"series": "Premium Wood",
	"desc": "A deep reddish mahogany tone with straight, elegant grain. Designed to elevate executive furniture, doors, and panels in formal interiors.",
	"url": "https://surfacesupply.com/products/renuva-architectural-film-premium-wood-pw1522",
	"dark": true
	},
	{
	"code": "RW1412",
	"name": "Warm White Painted Wood",
	"series": "Painted Wood",
	"desc": "A warm white tone with visible brushstroke grain and a hand-painted character. Designed to refresh cabinet fronts, wardrobes, doors, and trim in classic interiors.",
	"url": "https://surfacesupply.com/products/renuva-architectural-film-painted-wood-lw1412",
	"dark": false
	},
	{
	"code": "RW1414",
	"name": "Cream Painted Wood",
	"series": "Painted Wood",
	"desc": "A soft cream tone with subtle raised grain that reads as freshly lacquered joinery. Designed to complement kitchens, wardrobes, and doors in warm traditional spaces.",
	"url": "https://surfacesupply.com/products/renuva-architectural-film-painted-wood-lw1414",
	"dark": false
	},
	{
	"code": "RW1416",
	"name": "Dove Grey Painted Wood",
	"series": "Painted Wood",
	"desc": "A calm dove grey tone with fine painted-timber texture. Designed to refresh cabinet fronts, doors, and built-ins in contemporary interiors.",
	"url": "https://surfacesupply.com/products/renuva-architectural-film-painted-wood-lw1416",
	"dark": false
	},
	{
	"code": "RW1418",
	"name": "Bright White Painted Wood",
	"series": "Painted Wood",
	"desc": "A bright white tone with dense, fine straight-grain texture. Designed to elevate kitchens, cabinet fronts, and doors in crisp modern spaces.",
	"url": "https://surfacesupply.com/products/renuva-architectural-film-painted-wood-lw1418",
	"dark": false
	},
	{
	"code": "FP1840",
	"name": "White Linen Weave",
	"series": "Fabric",
	"desc": "A crisp white tone with fine linen-weave texture at thread level. Designed to soften wall panels, wardrobe fronts, and headboard surrounds.",
	"url": "https://surfacesupply.com/products/renuva-architectural-film-fabric-fp1840",
	"dark": false
	},
	{
	"code": "FP1842",
	"name": "Grey Linen Weave",
	"series": "Fabric",
	"desc": "A mid-grey tone with linen-weave texture and natural vertical slub. Designed to complement wall panels, wardrobe fronts, and hospitality interiors.",
	"url": "https://surfacesupply.com/products/renuva-architectural-film-fabric-fp1842",
	"dark": true
	},
	{
	"code": "MTS1308",
	"name": "Slate Grey Soft Matte",
	"series": "Soft Matte",
	"desc": "An even mid-grey tone with a velvety soft-touch surface that diffuses light. Designed to bring a premium super-matte look to cabinet fronts, doors, and built-ins.",
	"url": "https://surfacesupply.com/products/renuva-architectural-film-soft-matte-mts1308",
	"dark": true
	},
	{
	"code": "HG1630",
	"name": "Pure White Gloss",
	"series": "High Gloss Solid",
	"desc": "A crisp pure white tone with a deep, reflective high-gloss finish. Designed to elevate modern kitchens, wardrobe fronts, and feature panels.",
	"url": "https://surfacesupply.com/products/renuva-architectural-film-high-gloss-solid-hg1630",
	"dark": false
	},
	{
	"code": "HG1632",
	"name": "Ivory Gloss",
	"series": "High Gloss Solid",
	"desc": "A warm ivory tone with a deep, reflective high-gloss finish. Designed to complement kitchens and wardrobes in warm contemporary interiors.",
	"url": "https://surfacesupply.com/products/renuva-architectural-film-high-gloss-solid-hg1632",
	"dark": false
	},
	{
	"code": "HG1634",
	"name": "Greige Gloss",
	"series": "High Gloss Solid",
	"desc": "A sophisticated greige tone with a deep, reflective high-gloss finish. Designed to elevate feature panels, kitchens, and wardrobes in refined modern spaces.",
	"url": "https://surfacesupply.com/products/renuva-architectural-film-high-gloss-solid-hg1634",
	"dark": false
	},
	{
	"code": "MT1701",
	"name": "Pure White Matte",
	"series": "Matte Solid",
	"desc": "A bright pure white tone with a smooth, even matte surface. Designed to refresh cabinets, doors, panels, and built-ins in clean modern spaces.",
	"url": "https://surfacesupply.com/products/renuva-architectural-film-matte-solid-mt1701",
	"dark": false
	},
	{
	"code": "MT1703",
	"name": "Soft White Matte",
	"series": "Matte Solid",
	"desc": "A softly warm white tone with a smooth, even matte surface. Designed to complement cabinets, wardrobes, and doors in soft neutral interiors.",
	"url": "https://surfacesupply.com/products/renuva-architectural-film-matte-solid-mt1703",
	"dark": false
	},
	{
	"code": "MT1705",
	"name": "Ivory Matte",
	"series": "Matte Solid",
	"desc": "A warm ivory tone with a smooth, even matte surface. Designed to refresh cabinet fronts, doors, and built-ins in warm neutral interiors.",
	"url": "https://surfacesupply.com/products/renuva-architectural-film-matte-solid-mt1705",
	"dark": false
	},
	{
	"code": "MT1707",
	"name": "Pale Grey Matte",
	"series": "Matte Solid",
	"desc": "A pale grey tone with a finely textured matte surface. Designed to complement cabinets, doors, and panels in contemporary interiors.",
	"url": "https://surfacesupply.com/products/renuva-architectural-film-matte-solid-mt1707",
	"dark": false
	},
	{
	"code": "MT1709",
	"name": "Stone Grey Matte",
	"series": "Matte Solid",
	"desc": "A balanced stone grey tone with a finely textured matte surface. Designed to elevate cabinet fronts, doors, and panels in modern grey palettes.",
	"url": "https://surfacesupply.com/products/renuva-architectural-film-matte-solid-mt1709",
	"dark": true
	},
	{
	"code": "MT1711",
	"name": "Charcoal Matte",
	"series": "Matte Solid",
	"desc": "A deep charcoal tone with a finely textured matte surface. Designed to anchor cabinets, doors, and feature panels in bold modern interiors.",
	"url": "https://surfacesupply.com/products/renuva-architectural-film-matte-solid-mt1711",
	"dark": true
	},
	{
	"code": "ME1213",
	"name": "Brushed Champagne Metal",
	"series": "Metal",
	"desc": "A warm champagne-silver tone with fine hairline brushing running the length of the film. Designed to elevate doors, panels, appliance surrounds, and trim in modern interiors.",
	"url": "https://surfacesupply.com/products/renuva-architectural-film-metal-me1213",
	"dark": false
	},
	{
	"code": "ME1215",
	"name": "Pearl Silver Metal",
	"series": "Metal",
	"desc": "A pearl-silver tone with a fine metallic stipple that catches light evenly. Designed to complement doors, panels, and fixtures in contemporary commercial spaces.",
	"url": "https://surfacesupply.com/products/renuva-architectural-film-metal-me1215",
	"dark": false
	},
	{
	"code": "ST1105",
	"name": "Cream Onyx Marble",
	"series": "Marble",
	"desc": "A warm cream tone with soft, cloud-like onyx veining and the gentle shifts of honed stone. Designed to complement feature walls, reception desks, and furniture in calm, warm interiors.",
	"url": "https://surfacesupply.com/products/renuva-architectural-film-marble-st1105",
	"dark": false
	},
	{
	"code": "ST1107",
	"name": "Carrara White Marble",
	"series": "Marble",
	"desc": "A clean white tone with sparse, confident grey veining in the classic Carrara manner. Designed to elevate feature walls, columns, and furniture in bright, classic spaces.",
	"url": "https://surfacesupply.com/products/renuva-architectural-film-marble-st1107",
	"dark": false
	},
	{
	"code": "ST1109",
	"name": "Cloud White Marble",
	"series": "Marble",
	"desc": "A bright white tone with dense, feathered grey veining and a polished-marble depth. Designed to bring a polished stone look to feature walls, vanity surrounds, and furniture.",
	"url": "https://surfacesupply.com/products/renuva-architectural-film-marble-st1109",
	"dark": false
	}
	];

	var grid = document.getElementById('fgGrid');
	var backdrop = document.getElementById('fgBackdrop');
	var focusCard = document.getElementById('fgFocus');
	var focusImg = focusCard.querySelector('img');
	var detail = document.getElementById('fgDetail');
	var closeBtn = document.getElementById('fgClose');
	if (!grid) return;

	var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/* ---- build the grid ---- */
	var tiles = FINISHES.map(function (f, i) {
		var el = document.createElement('button');
		el.type = 'button';
		el.className = 'fg-tile' + (f.dark ? ' is-dark' : '');
		el.setAttribute('aria-label', f.name + ' — ' + f.code + '. Open detail.');
		el.innerHTML =
			'<img src="' + IMG_DIR + f.code + '.jpg" alt="" loading="lazy" draggable="false" />' +
			'<span class="fg-code">' + f.code + '</span>';
		el.addEventListener('click', function () { openFinish(i); });
		grid.appendChild(el);
		return el;
	});

	var open = -1;

	/* focused-card target rect — same placement math as the home-page Finish
	   Library: enlarged and nudged left on desktop, centered-high on mobile */
	function targetRect() {
		var W = window.innerWidth, H = window.innerHeight;
		var h = W > 1100 ? Math.min(H * 0.84, W * 0.55 * 1.25) : H * 0.62;
		var w = h * 0.8; /* 4:5 card */
		if (w > W * 0.92) { w = W * 0.92; h = w / 0.8; }
		var cx = W > 1100 ? W / 2 - W * 0.15 : W / 2;
		var cy = W > 1100 ? H / 2 : H / 2 - H * 0.12;
		return { left: cx - w / 2, top: cy - h / 2, width: w, height: h };
	}

	function placeFocus() {
		var r = targetRect();
		focusCard.style.left = r.left + 'px';
		focusCard.style.top = r.top + 'px';
		focusCard.style.width = r.width + 'px';
		focusCard.style.height = r.height + 'px';
	}

	function openFinish(i) {
		if (open >= 0) return;
		open = i;
		var f = FINISHES[i];

		detail.innerHTML =
			'<p class="fd-series">Renuva™ ' + f.series + '</p>' +
			'<h3>' + f.name + '</h3>' +
			'<p class="fd-desc">' + f.desc + '</p>' +
			'<dl class="fd-specs">' +
			'<div><dt>Code</dt><dd>' + f.code + '</dd></div>' +
			'<div><dt>Series</dt><dd>' + f.series + '</dd></div>' +
			'</dl>' +
			'<a class="fd-link" href="' + f.url + '" target="_blank" rel="noopener">View at Surface Supply</a>';

		/* instant low-res, swap to xl when it arrives */
		focusImg.src = IMG_DIR + f.code + '.jpg';
		focusImg.alt = 'Renuva ' + f.name + ' — ' + f.code;
		var probe = new Image();
		probe.onload = function () { if (open === i) focusImg.src = probe.src; };
		probe.src = IMG_DIR + f.code + '-xl.jpg';

		/* FLIP: park the card at its final rect, start it transformed down onto
		   the clicked tile, then release to identity */
		placeFocus();
		var from = tiles[i].getBoundingClientRect();
		var to = targetRect();
		var sx = from.width / to.width, sy = from.height / to.height;
		var dx = from.left + from.width / 2 - (to.left + to.width / 2);
		var dy = from.top + from.height / 2 - (to.top + to.height / 2);

		document.body.classList.add('fg-open');
		tiles[i].classList.add('is-origin');
		focusCard.style.visibility = 'visible';
		if (reduced) {
			focusCard.style.transform = 'none';
		} else {
			focusCard.style.transition = 'none';
			focusCard.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')';
			void focusCard.offsetWidth;
			focusCard.style.transition = '';
			focusCard.style.transform = 'none';
		}
	}

	function closeFinish() {
		if (open < 0) return;
		var i = open;
		open = -1;

		document.body.classList.remove('fg-open');

		var from = tiles[i].getBoundingClientRect();
		var to = focusCard.getBoundingClientRect();
		var sx = from.width / to.width, sy = from.height / to.height;
		var dx = from.left + from.width / 2 - (to.left + to.width / 2);
		var dy = from.top + from.height / 2 - (to.top + to.height / 2);

		if (reduced) {
			focusCard.style.visibility = '';
			tiles[i].classList.remove('is-origin');
			return;
		}
		focusCard.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')';
		setTimeout(function () {
			if (open >= 0) return;
			focusCard.style.visibility = '';
			focusCard.style.transform = 'none';
			tiles[i].classList.remove('is-origin');
		}, 780);
	}

	closeBtn.addEventListener('click', closeFinish);
	backdrop.addEventListener('click', closeFinish);
	focusCard.addEventListener('click', closeFinish);
	document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeFinish(); });
	window.addEventListener('resize', function () { if (open >= 0) placeFocus(); });
})();
