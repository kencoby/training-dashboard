// AI backend: Google Gemini (free tier)
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { maxOutputTokens: 1024, ...(json_ ? { responseMimeType: 'application/json' } : {}) }
      })
    });
    const data = await res.json();
    if (!res.ok) return json(res.status, { error: data.error?.message || 'Gemini API error' });
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return json(200, { text });
  } catch (err) {
    return json(500, { error: err.message });
  }
}
