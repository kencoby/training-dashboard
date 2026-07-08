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

  try {
    const resp = await fetch(sheetUrl, { redirect: 'follow', headers });
    const text = await resp.text();

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
    return new Response('Fetch failed: ' + e.message, { status: 502, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}

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
