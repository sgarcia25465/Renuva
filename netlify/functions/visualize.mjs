/* Renuva kitchen visualizer — serverless image generation.
   POST { image: dataURL, finish: string, swatch?: dataURL }
   → { success: true, image: dataURL } | { success: false, message }

   Requires the GEMINI_API_KEY environment variable (set in the Netlify UI).
   Optional: VISUALIZER_GEMINI_MODEL, VISUALIZER_PROMPT ({finish} placeholder). */

const DEFAULT_MODEL = 'gemini-2.5-flash-image';

const DEFAULT_PROMPT =
  'You are a professional kitchen cabinet refinishing visualizer. The first image is a real photo of a kitchen. ' +
  'Re-render ONLY the cabinet doors, drawer fronts and cabinet panels so they look professionally wrapped in a "{finish}" finish. ' +
  'Keep everything else in the photo exactly the same — countertops, walls, backsplash, floor, appliances, hardware, windows, lighting, layout, perspective and shadows must remain unchanged. ' +
  'The result must be photorealistic, as if the cabinets were professionally wrapped in vinyl film. Return only the edited image.';

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

  const finish = String(body.finish || 'a new').slice(0, 200);
  let prompt = (process.env.VISUALIZER_PROMPT || DEFAULT_PROMPT).replace(/\{finish\}/g, finish);

  const parts = [
    { text: prompt },
    { inline_data: { mime_type: photo.mime, data: photo.data } },
  ];

  // Swatch reference comes from the client as a small data URL (it reads the
  // site's own /assets/finishes images) — never a URL we fetch, so no SSRF.
  const swatch = parseDataUrl(body.swatch);
  if (swatch && swatch.data.length < 2_000_000) {
    prompt += ' Match the exact colour, tone, sheen and grain of the finish shown in the reference swatch image provided.';
    parts[0] = { text: prompt };
    parts.push({ inline_data: { mime_type: swatch.mime, data: swatch.data } });
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
