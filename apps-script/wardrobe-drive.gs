/**
 * Life Dashboard → Google Drive photo store for the Wardrobe tab
 * ==============================================================
 * A tiny Apps Script web app that keeps wardrobe photos in a folder in your
 * Drive ("Life Dashboard Wardrobe"). The dashboard never talks to it from the
 * browser: its /api/wardrobe-photo function calls it server-side with a
 * shared secret, so the photos stay private to your Drive.
 *
 * Setup (once)
 *   1. Go to script.google.com → New project. Replace Code.gs with this file.
 *   2. Project Settings (cog) → Script properties → add WARDROBE_SECRET
 *      (any long random string).
 *   3. Deploy → New deployment → type "Web app".
 *        Execute as: Me        Who has access: Anyone
 *      Deploy, approve the permissions prompt, and copy the Web app URL
 *      (ends in /exec). "Anyone" only means the URL can be called; every
 *      request without the secret is refused.
 *   4. In Cloudflare Pages → training-dashboard → Settings → Variables and
 *      secrets, add WARDROBE_SCRIPT_URL (the /exec URL) and WARDROBE_SECRET
 *      (same value as step 2), then redeploy.
 *
 * If you edit this script later: Deploy → Manage deployments → edit the
 * existing deployment → New version, so the URL stays the same.
 */

const FOLDER_NAME = 'Life Dashboard Wardrobe';
const MAX_BYTES = 5 * 1024 * 1024;

function doPost(e) {
  try {
    const req = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const secret = PropertiesService.getScriptProperties().getProperty('WARDROBE_SECRET');
    if (!secret) return out_({ error: 'WARDROBE_SECRET script property is not set' });
    if (req.secret !== secret) return out_({ error: 'Unauthorized' });

    if (req.action === 'upload') {
      if (!/^image\/(jpeg|png|webp)$/.test(req.mimeType || '')) return out_({ error: 'Only JPEG, PNG or WebP images' });
      const bytes = Utilities.base64Decode(req.data || '');
      if (!bytes.length || bytes.length > MAX_BYTES) return out_({ error: 'Image missing or over 5 MB' });
      const name = String(req.name || 'item').replace(/[^\w .-]/g, '').slice(0, 80) || 'item';
      const file = folder_().createFile(Utilities.newBlob(bytes, req.mimeType, name));
      return out_({ id: file.getId() });
    }

    if (req.action === 'get' || req.action === 'delete') {
      const file = fileInFolder_(req.id);
      if (!file) return out_({ error: 'Not found' });
      if (req.action === 'delete') { file.setTrashed(true); return out_({ ok: true }); }
      const blob = file.getBlob();
      return out_({ mimeType: blob.getContentType(), data: Utilities.base64Encode(blob.getBytes()) });
    }

    return out_({ error: 'Unknown action' });
  } catch (err) {
    return out_({ error: String(err && err.message || err) });
  }
}

// Only ever touch files inside the wardrobe folder, whatever id is sent.
function fileInFolder_(id) {
  if (!/^[\w-]{10,}$/.test(id || '')) return null;
  let file;
  try { file = DriveApp.getFileById(id); } catch (e) { return null; }
  if (file.isTrashed()) return null;
  const parents = file.getParents();
  const folderId = folder_().getId();
  while (parents.hasNext()) if (parents.next().getId() === folderId) return file;
  return null;
}

function folder_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('FOLDER_ID');
  if (id) {
    try { const f = DriveApp.getFolderById(id); if (!f.isTrashed()) return f; } catch (e) {}
  }
  const f = DriveApp.createFolder(FOLDER_NAME);
  props.setProperty('FOLDER_ID', f.getId());
  return f;
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
