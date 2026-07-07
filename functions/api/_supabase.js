// Shared Supabase helpers for Cloudflare Pages Functions.
// Files with _ prefix are excluded from routing by Cloudflare Pages.

export async function sbGet(env, key) {
  const url = `${env.SUPABASE_URL}/rest/v1/dashboard_kv?key=eq.${encodeURIComponent(key)}&select=data,ts`;
  const res = await fetch(url, {
    headers: { apikey: env.SUPABASE_KEY, Authorization: `Bearer ${env.SUPABASE_KEY}` }
  });
  if (!res.ok) throw new Error(`Supabase GET failed: ${res.status}`);
  const rows = await res.json();
  return rows.length > 0 ? rows[0].data : null;
}

export async function sbSet(env, key, data) {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/dashboard_kv`, {
    method: 'POST',
    headers: {
      apikey: env.SUPABASE_KEY,
      Authorization: `Bearer ${env.SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates'
    },
    body: JSON.stringify({ key, data, ts: Date.now() })
  });
  if (!res.ok) throw new Error(`Supabase upsert failed: ${res.status} ${await res.text()}`);
}
