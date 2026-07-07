const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-5';

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

  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) return json(500, { error: 'ANTHROPIC_API_KEY not configured' });

  let prompt, ctx;
  try {
    ({ prompt, context: ctx } = JSON.parse(await request.text() || '{}'));
  } catch {
    return json(400, { error: 'Invalid JSON body' });
  }
  if (!prompt) return json(400, { error: 'Missing prompt' });

  const userMessage = ctx ? `${prompt}\n\nContext:\n${ctx}` : prompt;

  try {
    const res = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        messages: [{ role: 'user', content: userMessage }]
      })
    });
    const data = await res.json();
    if (!res.ok) return json(res.status, { error: data.error?.message || 'Anthropic API error' });
    const text = data.content?.[0]?.text || '';
    return json(200, { text });
  } catch (err) {
    return json(500, { error: err.message });
  }
}
