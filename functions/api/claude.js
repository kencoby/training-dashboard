// AI backend: Google Gemini (free tier)
// gemini-2.0-flash was shut down (Oct 2026); 3.8 Flash is Google's current
// stable Flash model. Set GEMINI_MODEL in Cloudflare Pages to switch without a code change.
const DEFAULT_MODEL = 'gemini-3.8-flash';
const geminiUrl = model => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};
function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: CORS });
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return json(200, {});
  if (request.method !== 'POST') return json(405, { error: 'Method not allowed' });

  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) return json(500, { error: 'GEMINI_API_KEY not configured' });

  let prompt, ctx, image, json_;
  try {
    // image (optional): { mimeType, data } with base64 data — used by the
    // Wardrobe tab to tag a clothing photo. json: true asks Gemini for a JSON reply.
    ({ prompt, context: ctx, image, json: json_ } = JSON.parse(await request.text() || '{}'));
  } catch {
    return json(400, { error: 'Invalid JSON body' });
  }
  if (!prompt) return json(400, { error: 'Missing prompt' });

  const userMessage = ctx ? `${prompt}\n\nContext:\n${ctx}` : prompt;
  const parts = [{ text: userMessage }];
  if (image) {
    if (!/^image\/(jpeg|png|webp)$/.test(image.mimeType || '') || typeof image.data !== 'string' || image.data.length > 7e6) {
      return json(400, { error: 'image must be { mimeType: image/jpeg|png|webp, data: base64 } under ~5 MB' });
    }
    parts.push({ inline_data: { mime_type: image.mimeType, data: image.data } });
  }

  try {
    const res = await fetch(`${geminiUrl(env.GEMINI_MODEL || DEFAULT_MODEL)}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        // Newer models can spend part of the budget thinking before answering,
        // so leave more room than the old 1024.
        generationConfig: { maxOutputTokens: 4096, ...(json_ ? { responseMimeType: 'application/json' } : {}) }
      })
    });
    const data = await res.json();
    if (!res.ok) return json(res.status, { error: data.error?.message || 'Gemini API error' });
    // Join every answer part (skipping any thought parts) rather than just the first.
    const text = (data.candidates?.[0]?.content?.parts || []).filter(p => p && p.text && !p.thought).map(p => p.text).join('') || '';
    return json(200, { text });
  } catch (err) {
    return json(500, { error: err.message });
  }
}
