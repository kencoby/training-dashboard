import { sbGet } from './_supabase.js';

const CORS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: CORS });
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'GET') return json(405, { error: 'Method not allowed' });
  try {
    return json(200, await sbGet(env, 'blob:health-data'));
  } catch (err) {
    return json(500, { error: err.message });
  }
}
