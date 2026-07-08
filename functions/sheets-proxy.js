export async function onRequest(context) {
  const url = new URL(context.request.url);
  const sheetUrl = url.searchParams.get('url');

  if (!sheetUrl || !sheetUrl.includes('docs.google.com/spreadsheets')) {
    return new Response('Invalid URL', { status: 400 });
  }

  try {
    const resp = await fetch(sheetUrl, { redirect: 'follow' });
    const text = await resp.text();
    return new Response(text, {
      status: resp.status,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    return new Response('Fetch failed: ' + e.message, { status: 502 });
  }
}
