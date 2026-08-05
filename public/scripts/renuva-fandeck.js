/* Renuva swatch-book fan deck — real finishes from surfacesupply.com */
(function () {
	'use strict';

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

	var IMG_DIR = '/assets/finishes/renuva/';
	var deck = document.getElementById('deckFan');
	if (!deck) return;
	var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var N = FINISHES.length;
	/* fan from 26deg to 334deg so the first and last swatches peek out from under the cover */
	var START = 26;
	var STEP = (360 - 2 * START) / (N - 1);

	/* ---- build swatch strips ---- */
	FINISHES.forEach(function (f, i) {
		var el = document.createElement('button');
		el.className = 'swatch' + (f.dark ? ' is-dark' : '');
		el.type = 'button';
		el.setAttribute('role', 'listitem');
		el.setAttribute('aria-label', f.name + ' — ' + f.code + '. Open full view.');
		el.style.setProperty('--a', (START + i * STEP).toFixed(3) + 'deg');
		el.style.setProperty('--d', (0.10 + i * 0.028).toFixed(3) + 's');
		el.style.zIndex = String(N - i);
		el.style.backgroundImage = 'url("' + IMG_DIR + f.code + '.jpg")';
		el.innerHTML = '<span class="sw-label"><span class="sw-code">' + f.code + '</span><span class="sw-brand">RENUVA</span></span>';
		el.addEventListener('click', function () { openModal(i); });
		deck.appendChild(el);
	});

	/* ---- fan open on scroll into view ---- */
	if (reduced) {
		deck.classList.add('open', 'settled');
	} else {
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (en) {
				if (!en.isIntersecting) return;
				deck.classList.add('open');
				setTimeout(function () { deck.classList.add('settled'); }, 1400 + N * 28);
				io.unobserve(deck);
			});
		}, { threshold: 0.35 });
		io.observe(deck);
	}

	/* ---- full view modal ---- */
	var modal = document.getElementById('fdModal');
	var mImg = modal.querySelector('.fdm-img img');
	var mSeries = modal.querySelector('.fdm-series');
	var mName = modal.querySelector('.fdm-name');
	var mCode = modal.querySelector('.fdm-code');
	var mDesc = modal.querySelector('.fdm-desc');
	var mLink = modal.querySelector('.fdm-link');
	var mCount = modal.querySelector('.fdm-count');
	var current = -1;

	function preload(i) {
		var f = FINISHES[(i + N) % N];
		var im = new Image();
		im.src = IMG_DIR + f.code + '-xl.jpg';
	}

	function show(i) {
		current = (i + N) % N;
		var f = FINISHES[current];
		mImg.classList.remove('ready');
		var full = IMG_DIR + f.code + '-xl.jpg';
		var probe = new Image();
		probe.onload = function () { mImg.src = full; mImg.classList.add('ready'); };
		probe.src = full;
		mImg.src = IMG_DIR + f.code + '.jpg'; /* instant low-res while xl loads */
		mImg.alt = f.name + ' finish sample';
		mSeries.textContent = f.series;
		mName.textContent = f.name;
		mCode.textContent = f.code;
		mDesc.textContent = f.desc;
		mLink.href = f.url;
		mCount.textContent = (current + 1) + ' / ' + N;
		preload(current + 1); preload(current - 1);
	}

	function openModal(i) {
		show(i);
		modal.hidden = false;
		requestAnimationFrame(function () { modal.classList.add('on'); });
		document.body.style.overflow = 'hidden';
	}
	function closeModal() {
		modal.classList.remove('on');
		document.body.style.overflow = '';
		setTimeout(function () { modal.hidden = true; }, 320);
	}

	modal.querySelector('.fdm-close').addEventListener('click', closeModal);
	modal.querySelector('.fdm-back').addEventListener('click', closeModal);
	modal.querySelector('.fdm-prev').addEventListener('click', function () { show(current - 1); });
	modal.querySelector('.fdm-next').addEventListener('click', function () { show(current + 1); });
	document.addEventListener('keydown', function (e) {
		if (modal.hidden) return;
		if (e.key === 'Escape') closeModal();
		else if (e.key === 'ArrowLeft') show(current - 1);
		else if (e.key === 'ArrowRight') show(current + 1);
	});
})();
