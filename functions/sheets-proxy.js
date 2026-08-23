export async function onRequest(context) {
  const url = new URL(context.request.url);
  const sheetUrl = url.searchParams.get('url');

  if (!sheetUrl || !sheetUrl.includes('docs.google.com/spreadsheets')) {
    return new Response('Invalid URL', { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-GB,en;q=0.9',
  };

  // Google's CSV export can be slow to generate and occasionally the fetch to it
  // times out at the edge — Cloudflare then hands back a terse "error code: 524"
  // style body with a 200-ish status instead of throwing. Retry a couple of times
  // before giving up, and always check the inner response status/shape rather than
  // trusting a 200 blindly.
  const MAX_ATTEMPTS = 3;
  let lastErr = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const resp = await fetch(sheetUrl, { redirect: 'follow', headers });
      const text = await resp.text();

      // Treat a non-OK status, or a suspiciously short non-CSV body (Cloudflare's
      // own "error code: NNN" edge-timeout page), as a failed attempt worth retrying.
      const looksLikeEdgeError = !resp.ok || (text.length < 100 && /error code:\s*\d+/i.test(text));
      if (looksLikeEdgeError) {
        lastErr = `Google Sheets fetch returned ${resp.status}: ${text.slice(0, 200)}`;
        if (attempt < MAX_ATTEMPTS) { await sleep(500 * attempt); continue; }
        return new Response(
          `Google's sheet export timed out after ${MAX_ATTEMPTS} attempts (last: ${lastErr}). This is usually transient — try Sync again in a minute. If it keeps happening, check the sheet isn't huge and is still published to web.`,
          { status: 504, headers: { 'Access-Control-Allow-Origin': '*' } }
        );
      }

      // If we got actual CSV (no HTML doctype), return it directly
      if (!text.trim().startsWith('<')) {
        return new Response(text, {
          headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' },
        });
      }

      // Google returned HTML — parse the <table> and convert to CSV
      const csv = htmlTableToCsv(text);
      if (csv) {
        return new Response(csv, {
          headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' },
        });
      }

      return new Response('Could not extract table data from Google Sheets response', {
        status: 502, headers: { 'Access-Control-Allow-Origin': '*' },
      });
    } catch (e) {
      lastErr = e.message;
      if (attempt < MAX_ATTEMPTS) { await sleep(500 * attempt); continue; }
      return new Response('Fetch failed after ' + MAX_ATTEMPTS + ' attempts: ' + lastErr, { status: 502, headers: { 'Access-Control-Allow-Origin': '*' } });
    }
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function htmlTableToCsv(html) {
  const rows = [];
  const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;
  while ((rowMatch = rowRe.exec(html)) !== null) {
    const cells = [];
    const cellRe = /<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi;
    let cellMatch;
    while ((cellMatch = cellRe.exec(rowMatch[1])) !== null) {
      const raw = cellMatch[1]
        .replace(/<[^>]+>/g, '')   // strip tags
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .trim();
      cells.push('"' + raw.replace(/"/g, '""') + '"');
    }
    if (cells.length > 0) rows.push(cells.join(','));
  }
  return rows.length > 1 ? rows.join('\n') : null;
}
