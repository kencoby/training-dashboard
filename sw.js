// PWA/offline support has been removed from this app. This file is kept in
// place (rather than deleted) only because a browser that already installed
// the old service worker will request this exact URL one more time before it
// can unregister — deleting the file would make that request 404 instead.
// It no longer precaches or intercepts anything: it just clears out any
// caches left behind by the old version and unregisters itself so installed
// clients fall back to normal network requests.
const CACHE = 'training-dash-v26';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll())
      .then(clients => clients.forEach(c => c.navigate(c.url)))
  );
});
