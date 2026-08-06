/* RenuvaVisualizer — upload a kitchen photo, pick a Renuva finish, and preview
   the cabinets re-wrapped in it (AI render via /.netlify/functions/visualize).

   Usage: RenuvaVisualizer.mount(containerEl)
   Styles: /styles/renuva-visualizer.css (shared by every page that embeds it). */
window.RenuvaVisualizer = (function () {
	'use strict';

	var IMG_DIR = '/assets/finishes/renuva/';
	var ENDPOINT = '/.netlify/functions/visualize';
	var STORAGE_KEY = 'renuva_visualizer_saved';

	/* All 27 Renuva finishes (same data as the Finishes page). RW-series
	   product URLs use "lw" — that's how surfacesupply.com lists them. */
	var FINISHES = [
		{ code: 'PW1512', name: 'Cream Ash', series: 'Premium Wood' },
		{ code: 'PW1514', name: 'Sand Oak', series: 'Premium Wood' },
		{ code: 'PW1516', name: 'Honey Oak', series: 'Premium Wood' },
		{ code: 'PW1518', name: 'Golden Rift Oak', series: 'Premium Wood' },
		{ code: 'PW1520', name: 'Amber Oak', series: 'Premium Wood' },
		{ code: 'PW1522', name: 'Rosewood Mahogany', series: 'Premium Wood' },
		{ code: 'RW1412', name: 'Warm White Painted Wood', series: 'Painted Wood' },
		{ code: 'RW1414', name: 'Cream Painted Wood', series: 'Painted Wood' },
		{ code: 'RW1416', name: 'Dove Grey Painted Wood', series: 'Painted Wood' },
		{ code: 'RW1418', name: 'Bright White Painted Wood', series: 'Painted Wood' },
		{ code: 'FP1840', name: 'White Linen Weave', series: 'Fabric' },
		{ code: 'FP1842', name: 'Grey Linen Weave', series: 'Fabric' },
		{ code: 'MTS1308', name: 'Slate Grey Soft Matte', series: 'Soft Matte' },
		{ code: 'HG1630', name: 'Pure White Gloss', series: 'High Gloss Solid' },
		{ code: 'HG1632', name: 'Ivory Gloss', series: 'High Gloss Solid' },
		{ code: 'HG1634', name: 'Greige Gloss', series: 'High Gloss Solid' },
		{ code: 'MT1701', name: 'Pure White Matte', series: 'Matte Solid' },
		{ code: 'MT1703', name: 'Soft White Matte', series: 'Matte Solid' },
		{ code: 'MT1705', name: 'Ivory Matte', series: 'Matte Solid' },
		{ code: 'MT1707', name: 'Pale Grey Matte', series: 'Matte Solid' },
		{ code: 'MT1709', name: 'Stone Grey Matte', series: 'Matte Solid' },
		{ code: 'MT1711', name: 'Charcoal Matte', series: 'Matte Solid' },
		{ code: 'ME1213', name: 'Brushed Champagne Metal', series: 'Metal' },
		{ code: 'ME1215', name: 'Pearl Silver Metal', series: 'Metal' },
		{ code: 'ST1105', name: 'Cream Onyx Marble', series: 'Marble' },
		{ code: 'ST1107', name: 'Carrara White Marble', series: 'Marble' },
		{ code: 'ST1109', name: 'Cloud White Marble', series: 'Marble' }
	];

	var SERIES_SLUG = {
		'Premium Wood': 'premium-wood', 'Painted Wood': 'painted-wood', 'Fabric': 'fabric',
		'Soft Matte': 'soft-matte', 'High Gloss Solid': 'high-gloss-solid',
		'Matte Solid': 'matte-solid', 'Metal': 'metal', 'Marble': 'marble'
	};

	function productUrl(f) {
		var code = f.code.replace(/^RW/, 'LW').toLowerCase();
		return 'https://surfacesupply.com/products/renuva-architectural-film-' + SERIES_SLUG[f.series] + '-' + code;
	}

	var TYPES = [
		{ key: 'all', label: 'All', match: function () { return true; } },
		{ key: 'wood', label: 'Wood', match: function (f) { return /Wood/.test(f.series); } },
		{ key: 'solid', label: 'Solid', match: function (f) { return /Matte|Gloss/.test(f.series); } },
		{ key: 'marble', label: 'Marble', match: function (f) { return f.series === 'Marble'; } },
		{ key: 'metal', label: 'Metal', match: function (f) { return f.series === 'Metal'; } },
		{ key: 'fabric', label: 'Fabric', match: function (f) { return f.series === 'Fabric'; } }
	];

	var FACTS = [
		'Renuva installs over your existing cabinets. No demolition, no dust.',
		'Most kitchens are completed in 1–3 days.',
		'Save 80%+ compared to a traditional remodel.',
		'Renuva architectural film is rated to last 10+ years.',
		'Generating your preview. This can take a moment.'
	];

	/* ---- helpers ---- */

	function el(tag, cls, html) {
		var n = document.createElement(tag);
		if (cls) n.className = cls;
		if (html != null) n.innerHTML = html;
		return n;
	}

	function fileToResizedDataUrl(file, maxDim) {
		return new Promise(function (resolve, reject) {
			var reader = new FileReader();
			reader.onload = function () {
				var img = new Image();
				img.onload = function () {
					var scale = Math.min(1, (maxDim || 1600) / Math.max(img.width, img.height));
					var w = Math.round(img.width * scale), h = Math.round(img.height * scale);
					var canvas = document.createElement('canvas');
					canvas.width = w; canvas.height = h;
					var ctx = canvas.getContext('2d');
					if (!ctx) return resolve(reader.result);
					ctx.drawImage(img, 0, 0, w, h);
					resolve(canvas.toDataURL('image/jpeg', 0.9));
				};
				img.onerror = reject;
				img.src = reader.result;
			};
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	}

	/* The swatch reference rides along as a small data URL so the serverless
	   function never has to fetch anything. */
	function swatchToDataUrl(code) {
		return new Promise(function (resolve) {
			var img = new Image();
			img.onload = function () {
				var canvas = document.createElement('canvas');
				var s = Math.min(1, 512 / Math.max(img.width, img.height));
				canvas.width = Math.round(img.width * s);
				canvas.height = Math.round(img.height * s);
				var ctx = canvas.getContext('2d');
				if (!ctx) return resolve(null);
				ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
				resolve(canvas.toDataURL('image/jpeg', 0.85));
			};
			img.onerror = function () { resolve(null); };
			img.src = IMG_DIR + code + '.jpg';
		});
	}

	function loadSaved() {
		try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || []; } catch (_) { return []; }
	}
	function persistSaved(items) {
		try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 12))); } catch (_) { /* huge data URLs may not fit — keep in memory */ }
	}

	/* ---- widget ---- */

	function mount(root) {
		if (!root || root.__rvMounted) return;
		root.__rvMounted = true;
		root.classList.add('rv');

		var state = {
			uploaded: '',       /* original photo (data URL) */
			current: '',        /* what the preview shows */
			finish: FINISHES[2], /* Honey Oak — a crowd-pleaser default */
			type: 'all',
			generating: false,
			saved: loadSaved()
		};

		root.innerHTML =
			'<div class="rv-main">' +
			'  <div class="rv-left">' +
			'    <div class="rv-upload" role="button" tabindex="0" aria-label="Upload kitchen photo">' +
			'      <div class="rv-upload-inner">' +
			'        <div class="rv-upload-icon">' +
			'          <svg viewBox="0 0 24 22" aria-hidden="true"><path d="M9 4.5 10.4 3h3.2L15 4.5H18A2.5 2.5 0 0 1 20.5 7v9A2.5 2.5 0 0 1 18 18.5H6A2.5 2.5 0 0 1 3.5 16V7A2.5 2.5 0 0 1 6 4.5h3Zm3 10.25a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5Zm0-1.75a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z"/></svg>' +
			'        </div>' +
			'        <h4>Click or drag in a photo of your kitchen</h4>' +
			'        <p>One photo &middot; JPG, PNG, or WebP</p>' +
			'      </div>' +
			'      <div class="rv-preview" hidden>' +
			'        <img class="rv-preview-img" alt="Your kitchen preview" />' +
			'        <div class="rv-preview-actions">' +
			'          <button type="button" class="rv-change">Change photo</button>' +
			'          <button type="button" class="rv-download">Download</button>' +
			'        </div>' +
			'      </div>' +
			'      <div class="rv-loading" hidden>' +
			'        <div class="rv-loading-blur"></div>' +
			'        <div class="rv-loading-inner"><div class="rv-spinner"></div>' +
			'          <div class="rv-loading-title">Generating your preview&hellip;</div>' +
			'          <div class="rv-loading-fact"></div></div>' +
			'      </div>' +
			'    </div>' +
			'    <input type="file" accept="image/png,image/jpeg,image/webp" hidden />' +
			'  </div>' +
			'  <div class="rv-right">' +
			'    <h3>Choose a Renuva finish</h3>' +
			'    <p class="rv-sub">Pick a finish, then generate a preview of your own cabinets wearing it.</p>' +
			'    <div class="rv-types"></div>' +
			'    <div class="rv-swatches" role="listbox" aria-label="Renuva finishes"></div>' +
			'    <button type="button" class="rv-generate">Generate my preview</button>' +
			'    <div class="rv-selected">Selected: <strong></strong></div>' +
			'    <div class="rv-error" hidden></div>' +
			'    <a class="rv-buy" target="_blank" rel="noopener">View this finish at Surface Supply &#8599;</a>' +
			'  </div>' +
			'</div>' +
			'<div class="rv-history" hidden>' +
			'  <h4>Saved previews</h4>' +
			'  <div class="rv-history-grid"></div>' +
			'</div>';

		var uploadBox = root.querySelector('.rv-upload');
		var uploadInner = root.querySelector('.rv-upload-inner');
		var previewWrap = root.querySelector('.rv-preview');
		var previewImg = root.querySelector('.rv-preview-img');
		var loading = root.querySelector('.rv-loading');
		var loadingBlur = root.querySelector('.rv-loading-blur');
		var loadingFact = root.querySelector('.rv-loading-fact');
		var fileInput = root.querySelector('input[type=file]');
		var typesEl = root.querySelector('.rv-types');
		var swatchesEl = root.querySelector('.rv-swatches');
		var generateBtn = root.querySelector('.rv-generate');
		var selectedEl = root.querySelector('.rv-selected strong');
		var errorEl = root.querySelector('.rv-error');
		var buyLink = root.querySelector('.rv-buy');
		var historyEl = root.querySelector('.rv-history');
		var historyGrid = root.querySelector('.rv-history-grid');
		var factTimer = null;

		function showError(msg) {
			errorEl.hidden = !msg;
			errorEl.textContent = msg || '';
		}

		function renderPreview() {
			var has = !!state.current;
			uploadInner.hidden = has;
			previewWrap.hidden = !has;
			uploadBox.classList.toggle('has-image', has);
			if (has) previewImg.src = state.current;
		}

		function renderTypes() {
			typesEl.innerHTML = '';
			TYPES.forEach(function (t) {
				var b = el('button', 'rv-type' + (state.type === t.key ? ' active' : ''), t.label);
				b.type = 'button';
				b.addEventListener('click', function () { state.type = t.key; renderTypes(); renderSwatches(); });
				typesEl.appendChild(b);
			});
		}

		function renderSelected() {
			selectedEl.textContent = state.finish.code + ' · ' + state.finish.name;
			buyLink.href = productUrl(state.finish);
		}

		function renderSwatches() {
			var type = TYPES.filter(function (t) { return t.key === state.type; })[0] || TYPES[0];
			var list = FINISHES.filter(type.match);
			if (list.indexOf(state.finish) === -1 && list.length) { state.finish = list[0]; }
			swatchesEl.innerHTML = '';
			list.forEach(function (f) {
				var b = el('button', 'rv-swatch' + (state.finish === f ? ' active' : ''));
				b.type = 'button';
				b.setAttribute('role', 'option');
				b.setAttribute('aria-selected', state.finish === f ? 'true' : 'false');
				b.innerHTML =
					'<span class="rv-swatch-img" style="background-image:url(\'' + IMG_DIR + f.code + '.jpg\')"></span>' +
					'<span class="rv-swatch-code">' + f.code + '</span>' +
					'<span class="rv-swatch-name">' + f.name + '</span>';
				b.addEventListener('click', function () { state.finish = f; renderSwatches(); });
				swatchesEl.appendChild(b);
			});
			renderSelected();
		}

		function renderHistory() {
			historyEl.hidden = state.saved.length === 0;
			historyGrid.innerHTML = '';
			state.saved.forEach(function (item, i) {
				var d = el('div', 'rv-history-item');
				d.innerHTML =
					'<button type="button" class="rv-history-open" aria-label="View ' + item.label + '"><img alt="' + item.label + '" /></button>' +
					'<button type="button" class="rv-history-delete" aria-label="Delete">&times;</button>' +
					'<div class="rv-history-label">' + item.label + '</div>';
				d.querySelector('img').src = item.image;
				d.querySelector('.rv-history-open').addEventListener('click', function () {
					state.current = item.image;
					if (!state.uploaded) state.uploaded = item.image;
					renderPreview();
				});
				d.querySelector('.rv-history-delete').addEventListener('click', function () {
					state.saved.splice(i, 1);
					persistSaved(state.saved);
					renderHistory();
				});
				historyGrid.appendChild(d);
			});
		}

		function addSaved(label, image) {
			state.saved.unshift({ label: label, image: image });
			state.saved = state.saved.slice(0, 12);
			persistSaved(state.saved);
			renderHistory();
		}

		function handleFile(file) {
			if (!file || ['image/jpeg', 'image/png', 'image/webp'].indexOf(file.type) === -1) {
				showError('Please upload a JPG, PNG, or WebP image.');
				return;
			}
			showError('');
			fileToResizedDataUrl(file).then(function (dataUrl) {
				state.uploaded = dataUrl;
				state.current = dataUrl;
				addSaved('Original photo', dataUrl);
				renderPreview();
			}, function () {
				showError("We couldn't read that image. Please try a different photo.");
			});
		}

		function setGenerating(on) {
			state.generating = on;
			loading.hidden = !on;
			generateBtn.disabled = on;
			generateBtn.textContent = on ? 'Generating preview…' : 'Generate my preview';
			if (on) {
				loadingBlur.style.backgroundImage = state.current ? 'url("' + state.current + '")' : 'none';
				var i = 0;
				loadingFact.textContent = FACTS[0];
				factTimer = setInterval(function () { i = (i + 1) % FACTS.length; loadingFact.textContent = FACTS[i]; }, 4200);
			} else if (factTimer) {
				clearInterval(factTimer);
				factTimer = null;
			}
		}

		function generate() {
			if (state.generating) return;
			if (!state.uploaded) { showError('Upload a photo of your kitchen first.'); return; }
			showError('');
			setGenerating(true);
			var f = state.finish;
			swatchToDataUrl(f.code).then(function (swatch) {
				return fetch(ENDPOINT, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						image: state.uploaded,
						finish: f.name + ' (Renuva™ ' + f.series + ' ' + f.code + ')',
						swatch: swatch
					})
				});
			}).then(function (res) {
				return res.json().catch(function () { return null; }).then(function (data) {
					if (!res.ok || !data || !data.success || !data.image) {
						throw new Error((data && data.message) || 'Generation failed. Please try again.');
					}
					state.current = data.image;
					addSaved(f.code + ' · ' + f.name, data.image);
					renderPreview();
				});
			}).catch(function (err) {
				showError(err && err.message ? err.message : 'Something went wrong generating the preview.');
			}).then(function () {
				setGenerating(false);
			});
		}

		/* upload interactions */
		uploadBox.addEventListener('click', function (e) {
			if (e.target.closest('.rv-change')) { fileInput.click(); return; }
			if (e.target.closest('.rv-download')) {
				if (!state.current) return;
				var a = document.createElement('a');
				a.href = state.current;
				a.download = 'renuva-kitchen-preview.png';
				document.body.appendChild(a); a.click(); a.remove();
				return;
			}
			if (!state.uploaded) fileInput.click();
		});
		uploadBox.addEventListener('keydown', function (e) {
			if ((e.key === 'Enter' || e.key === ' ') && !state.uploaded) { e.preventDefault(); fileInput.click(); }
		});
		uploadBox.addEventListener('dragover', function (e) { e.preventDefault(); uploadBox.classList.add('dragover'); });
		uploadBox.addEventListener('dragleave', function () { uploadBox.classList.remove('dragover'); });
		uploadBox.addEventListener('drop', function (e) {
			e.preventDefault();
			uploadBox.classList.remove('dragover');
			handleFile(e.dataTransfer.files && e.dataTransfer.files[0]);
		});
		fileInput.addEventListener('change', function () { handleFile(fileInput.files && fileInput.files[0]); });
		generateBtn.addEventListener('click', generate);

		renderTypes();
		renderSwatches();
		renderHistory();
		renderPreview();
	}

	return { mount: mount };
})();
