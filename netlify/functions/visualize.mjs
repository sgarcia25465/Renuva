/* Renuva kitchen visualizer — serverless image generation.
   POST { image: dataURL, finish: string, swatch?: dataURL }              (one finish)
   POST { image: dataURL, surfaces: [{ surface, finish, swatch? }] }      (two-tone etc.)
   → { success: true, image: dataURL } | { success: false, message }

   A request naming only the whole kitchen behaves exactly as it always did and
   still honours VISUALIZER_PROMPT. Mixing finishes needs per-surface
   instructions, so those requests build their own prompt below.

   Requires the GEMINI_API_KEY environment variable (set in the Netlify UI).
   Optional: VISUALIZER_GEMINI_MODEL, VISUALIZER_PROMPT ({finish} placeholder). */

const DEFAULT_MODEL = 'gemini-2.5-flash-image';

// Broad first, then top-to-bottom. Also the allowlist.
const SURFACE_ORDER = ['cabinets', 'upper', 'lower', 'island', 'countertop'];

const SURFACE_LABEL = {
  cabinets: 'ALL CABINETRY',
  upper: 'UPPER CABINETS',
  lower: 'LOWER CABINETS',
  island: 'KITCHEN ISLAND BASE',
  countertop: 'COUNTERTOPS',
};

const DEFAULT_PROMPT =
  'You are a professional kitchen cabinet refinishing visualizer. The first image is a real photo of a kitchen. ' +
  'Re-render ONLY the cabinet doors, drawer fronts and cabinet panels so they look professionally wrapped in a "{finish}" finish. ' +
  'Keep everything else in the photo exactly the same — countertops, walls, backsplash, floor, appliances, hardware, windows, lighting, layout, perspective and shadows must remain unchanged. ' +
  'The result must be photorealistic, as if the cabinets were professionally wrapped in vinyl film. Return only the edited image.';

// What each surface covers, in the model's own working vocabulary. When the
// island is its own assignment the broader cabinet surfaces must hand it off,
// otherwise they absorb it.
function surfaceDefinition(surface, islandIsSeparate) {
  switch (surface) {
    case 'cabinets':
      return (
        'Every cabinet door, drawer front, false front and exposed cabinet side or end panel in the photo, both the wall-mounted cabinets above the countertop and the base cabinets below it' +
        (islandIsSeparate
          ? ', but NOT the island base, which is listed separately below.'
          : ', including the island base if one is visible.')
      );
    case 'upper':
      return 'Only the wall-mounted cabinets above the countertop: their doors, drawer fronts, exposed side panels and the frames around any glass-front doors. Nothing below the countertop changes to this finish.';
    case 'lower':
      return (
        'Only the cabinets below the countertop: their doors, drawer fronts, false fronts, toe kicks and exposed end panels' +
        (islandIsSeparate
          ? ', but NOT the island base, which is listed separately below.'
          : ', including the island base if one is visible.') +
        ' Nothing above the countertop changes to this finish.'
      );
    case 'island':
      // The island is the only listed surface that may not exist in the photo.
      // A softer instruction here was a coin flip in testing: the model would
      // happily repaint an arbitrary run of base cabinets instead.
      return 'Only the cabinetry, doors, drawer fronts and end panels of the FREESTANDING island — the block that stands away from the walls with space to walk around it — below its own countertop. If this photo contains no freestanding island, apply this finish NOWHERE AT ALL: leave every wall and base cabinet exactly as the other listed items specify. A run of base cabinets against a wall is not an island. A peninsula attached to the wall run is not an island. Never substitute anything else for a missing island.';
    case 'countertop':
      return 'Only the horizontal countertop slabs and their visible front edges, including the island top and any peninsula. Do NOT change the backsplash, the sink, the faucet, the cooktop, or anything resting on the counter.';
    default:
      return '';
  }
}

function buildSurfacePrompt(surfaces) {
  const islandIsSeparate = surfaces.some((s) => s.surface === 'island');
  const keys = new Set(surfaces.map((s) => s.surface));

  const assignments = surfaces
    .map((s, i) => {
      const verb =
        s.surface === 'countertop'
          ? `Treat it as re-surfaced in "${s.finish}"`
          : `Treat it as professionally wrapped in "${s.finish}" architectural vinyl film`;
      return `${i + 1}. ${SURFACE_LABEL[s.surface]} → "${s.finish}". ${surfaceDefinition(s.surface, islandIsSeparate)} ${verb}, following the existing panel shapes and edges.`;
    })
    .join('\n');

  const untouched = [
    'the walls',
    'the backsplash',
    'the flooring',
    'the ceiling and trim',
    ...(keys.has('countertop') ? [] : ['the countertops and their edges']),
    'the appliances',
    'the sink and faucet',
    'all cabinet hardware (knobs, pulls, handles, hinges)',
    'the windows and the view through them',
    'the light fixtures',
    'and every item sitting on the counters or shelves',
  ].join(', ');

  // Only claim two surfaces must look different when different finishes were
  // actually assigned — a two-tone request that reuses one finish on both
  // halves is legitimate, and forcing contrast invents one nobody asked for.
  const finishFor = (k) => surfaces.find((s) => s.surface === k)?.finish;
  const differ = (a, b) => {
    const fa = finishFor(a);
    const fb = finishFor(b);
    return Boolean(fa && fb && fa.toLowerCase() !== fb.toLowerCase());
  };

  const separations = [];
  if (differ('upper', 'lower')) {
    separations.push('The upper cabinets and the lower cabinets must clearly read as two different finishes, with a clean break at the countertop line.');
  }
  if (differ('island', 'lower') || differ('island', 'cabinets')) {
    separations.push('The island base must clearly read as a different finish from the cabinets along the walls.');
  }
  if (keys.has('countertop')) {
    separations.push('The countertops must stay visually distinct from the cabinet fronts, with a crisp edge where the two meet.');
  }

  return [
    'Edit this uploaded kitchen photo. Keep the exact same kitchen layout, walls, flooring, appliances, lighting and camera angle. Apply a separate finish to each surface listed below, and change nothing else.',
    '',
    assignments,
    '',
    `Leave completely untouched, exactly as photographed: ${untouched}.`,
    '',
    'Hard rules:',
    '- Do not change the camera angle, framing, crop, zoom, perspective or aspect ratio. The edited photo must line up with the original.',
    '- Do not redesign the room. Do not add, remove, move, resize or straighten any cabinet, drawer, appliance or fixture. Cabinet proportions, door styles, panel reveals, seams and gaps stay exactly where they are.',
    '- Keep the original lighting, exposure, white balance, reflections and shadows. Each new finish must pick up the light that already falls on that surface.',
    ...separations.map((s) => `- ${s}`),
    '- Do not spread any one finish beyond the surface it was assigned to.',
    '- If a listed surface does not exist in this photo, skip that assignment completely and change nothing for it. Never move a finish onto a different surface because the one it was assigned to is missing — returning the photo with fewer surfaces changed is the correct result.',
    '- No text, watermarks, labels, borders or side-by-side collage.',
    '',
    'The result must be photorealistic, as if the surfaces were professionally wrapped in vinyl film. Return only the edited image.',
  ].join('\n');
}

// Best-effort burst limiter. Function instances are ephemeral, so this only
// catches rapid-fire abuse from one warm instance — good enough for a
// marketing page; the real spend cap is Gemini-side quota.
const hits = new Map();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;

function limited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > MAX_PER_WINDOW;
}

function parseDataUrl(input) {
  const m = /^data:([^;]+);base64,(.*)$/s.exec(input || '');
  if (m) return { mime: m[1], data: m[2] };
  return null;
}

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export default async (req, context) => {
  if (req.method !== 'POST') return json(405, { success: false, message: 'Method not allowed.' });

  const ip = context.ip || req.headers.get('x-forwarded-for') || 'unknown';
  if (limited(ip)) {
    return json(429, { success: false, message: 'Too many previews at once — give it a minute and try again.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return json(503, { success: false, message: 'The visualizer is not configured yet. Please try again later.' });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json(400, { success: false, message: 'Invalid request.' });
  }

  const photo = parseDataUrl(body.image);
  if (!photo) return json(400, { success: false, message: 'No photo provided.' });
  // ~12 MB of base64 ≈ a 9 MB image — generous, but bounds abuse.
  if (photo.data.length > 12_000_000) {
    return json(400, { success: false, message: 'Photo is too large. Please use a smaller image.' });
  }

  // Validate, de-duplicate and order any per-surface assignments. A lone
  // `cabinets` entry is the legacy whole-kitchen request said a different way,
  // so it collapses back to the tuned single-finish prompt.
  const bySurface = new Map();
  if (Array.isArray(body.surfaces)) {
    if (body.surfaces.length > SURFACE_ORDER.length) {
      return json(400, { success: false, message: 'Too many surfaces in one preview.' });
    }
    for (const entry of body.surfaces) {
      const surface = String(entry?.surface || '').trim().toLowerCase();
      if (!SURFACE_ORDER.includes(surface)) {
        return json(400, { success: false, message: 'Unknown surface in request.' });
      }
      const name = String(entry?.finish || '').trim().slice(0, 200);
      if (!name) {
        return json(400, { success: false, message: `Choose a finish for ${SURFACE_LABEL[surface].toLowerCase()}.` });
      }
      bySurface.set(surface, { surface, finish: name, swatch: parseDataUrl(entry?.swatch) });
    }
  }
  const isMulti = bySurface.size > 1 || (bySurface.size === 1 && !bySurface.has('cabinets'));
  const surfaces = SURFACE_ORDER.filter((k) => bySurface.has(k)).map((k) => bySurface.get(k));

  let prompt;
  let swatches;
  if (isMulti) {
    prompt = buildSurfacePrompt(surfaces);
    swatches = surfaces
      .filter((s) => s.swatch && s.swatch.data.length < 2_000_000)
      .map((s) => ({ label: SURFACE_LABEL[s.surface], finish: s.finish, inline: s.swatch }));
  } else {
    const only = bySurface.get('cabinets');
    const finish = String((only && only.finish) || body.finish || 'a new').slice(0, 200);
    prompt = (process.env.VISUALIZER_PROMPT || DEFAULT_PROMPT).replace(/\{finish\}/g, finish);
    const single = (only && only.swatch) || parseDataUrl(body.swatch);
    swatches = single && single.data.length < 2_000_000
      ? [{ label: SURFACE_LABEL.cabinets, finish, inline: single }]
      : [];
  }

  // Swatch references come from the client as small data URLs (it reads the
  // site's own /assets/finishes images) — never a URL we fetch, so no SSRF.
  if (swatches.length) {
    prompt += isMulti
      ? ' Reference swatch images follow the kitchen photo. Each one is labelled with the surface it belongs to — match that surface to its own swatch exactly in colour, tone, sheen and grain, and do not swap them.'
      : ' Match the exact colour, tone, sheen and grain of the finish shown in the reference swatch image provided.';
  }

  const parts = [
    { text: prompt },
    { inline_data: { mime_type: photo.mime, data: photo.data } },
  ];
  for (const s of swatches) {
    if (isMulti) {
      parts.push({ text: `Reference swatch for ${s.label} — the "${s.finish}" finish. Apply this one to ${s.label} only.` });
    }
    parts.push({ inline_data: { mime_type: s.inline.mime, data: s.inline.data } });
  }

  const model = process.env.VISUALIZER_GEMINI_MODEL || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }] }),
    });
  } catch {
    return json(503, { success: false, message: 'Could not reach the image service. Please try again.' });
  }

  const out = await res.json().catch(() => null);
  if (!res.ok) {
    return json(503, { success: false, message: out?.error?.message || 'Image generation failed. Please try again.' });
  }

  const outParts = out?.candidates?.[0]?.content?.parts || [];
  const imgPart = outParts.find((p) => p.inlineData?.data || p.inline_data?.data);
  const inline = imgPart?.inlineData || imgPart?.inline_data;
  if (!inline?.data) {
    return json(503, { success: false, message: 'The model did not return an image. Please try a different photo.' });
  }

  const mime = inline.mimeType || inline.mime_type || 'image/png';
  return json(200, { success: true, image: `data:${mime};base64,${inline.data}` });
};
