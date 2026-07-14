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

  let prompt, ctx;
  try {
    ({ prompt, context: ctx } = JSON.parse(await request.text() || '{}'));
  } catch {
    return json(400, { error: 'Invalid JSON body' });
  }
  if (!prompt) return json(400, { error: 'Missing prompt' });

  const userMessage = ctx ? `${prompt}\n\nContext:\n${ctx}` : prompt;

  try {
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userMessage }] }],
        generationConfig: { maxOutputTokens: 1024 }
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
