// One-time admin endpoint used on 2026-09-24 to remove a single bad
// weight_body_mass reading (2026-09-21) from the health-data blob. That job
// is done — this is now permanently disabled rather than left live with a
// working token. The file itself is still pending physical deletion (see
// the other dead-file cleanup blocked on device_bash — same issue).
export async function onRequest() {
  return new Response(JSON.stringify({ error: 'Disabled' }), {
    status: 410,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
