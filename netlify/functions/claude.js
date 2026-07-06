const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-5';

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json(500, { error: 'ANTHROPIC_API_KEY not configured' });
  }

  let prompt, context;
  try {
    ({ prompt, context } = JSON.parse(event.body || '{}'));
  } catch {
    return json(400, { error: 'Invalid JSON body' });
  }
  if (!prompt) return json(400, { error: 'Missing prompt' });

  const userMessage = context ? `${prompt}\n\nContext:\n${context}` : prompt;

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
        max_tokens: 1500,
        messages: [{ role: 'user', content: userMessage }]
      })
    });

    const data = await res.json();
    if (!res.ok) return json(res.status, { error: data.error?.message || 'Claude API error' });

    const text = (data.content || []).map(block => block.text || '').join('');
    return json(200, { text });
  } catch (err) {
    return json(500, { error: err.message });
  }
};
