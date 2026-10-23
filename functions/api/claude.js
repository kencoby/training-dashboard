// AI backend: Google Gemini (free tier)
// gemini-2.0-flash was shut down (Oct 2026). 'gemini-flash-latest' is
// Google's alias for the newest Flash model, so retirements don't break this
// again. Set GEMINI_MODEL in Cloudflare Pages to pin a specific model.
const DEFAULT_MODEL = 'gemini-flash-latest';
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

// Cloudflare Workers AI (used when the Pages project has an AI binding named
// "AI"): free allowance of 10,000 Neurons/day. Photos go to a Llama vision
// model, text to Llama 3.3 70B.
const CF_VISION_MODEL = '@cf/meta/llama-3.2-11b-vision-instruct';
const CF_TEXT_MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
// Pull the JSON object out of a reply that may have extra words or ``` fences.
function extractJson(text) {
  const s = String(text || '');
  const start = s.indexOf('{'), end = s.lastIndexOf('}');
  return start >= 0 && end > start ? s.slice(start, end + 1) : s;
}

async function runWorkersAI(env, userMessage, image, wantJson) {
  const system = wantJson
    ? 'Reply with a single valid JSON object only — no explanation, no markdown.'
    : 'You are a concise, practical assistant.';
  const messages = [{ role: 'system', content: system }, { role: 'user', content: userMessage }];
  if (image) {
    const run = () => env.AI.run(CF_VISION_MODEL, { messages, image: b64ToBytes(image.data), max_tokens: 1024 });
    let out;
    try { out = await run(); }
    catch (e) {
      // Meta's licence must be accepted once per account before first use.
      if (!/agree|licen[cs]e/i.test(e.message || '')) throw e;
      await env.AI.run(CF_VISION_MODEL, { prompt: 'agree' });
      out = await run();
    }
    return out.response || '';
  }
  const out = await env.AI.run(CF_TEXT_MODEL, { messages, max_tokens: 1024 });
  return out.response || '';
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return json(200, {});
  if (request.method !== 'POST') return json(405, { error: 'Method not allowed' });

  const apiKey = env.GEMINI_API_KEY;
  if (!env.AI && !apiKey) return json(500, { error: 'No AI configured: add a Workers AI binding named AI (or GEMINI_API_KEY)' });

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

  // Prefer Cloudflare Workers AI when the binding exists; Gemini otherwise.
  if (env.AI) {
    try {
      const text = await runWorkersAI(env, userMessage, image, json_);
      return json(200, { text: json_ ? extractJson(text) : text });
    } catch (err) {
      return json(502, { error: `Cloudflare AI: ${err.message}` });
    }
  }

  try {
    const res = await fetch(geminiUrl(env.GEMINI_MODEL || DEFAULT_MODEL), {
      method: 'POST',
      // Key in the header (works for both old "AIza…" and new "AQ.…" keys).
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
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
