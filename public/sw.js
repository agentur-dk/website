const CACHE = 'dk-v1';

const PRECACHE = [
  '/website/fonts/space-grotesk-v3-latin-700.woff2',
  '/website/fonts/manrope-v20-latin-400.woff2',
  '/website/fonts/manrope-v20-latin-500.woff2',
  '/website/fonts/manrope-v20-latin-600.woff2',
  '/website/fonts/manrope-v20-latin-700.woff2',
  '/website/fonts/roboto-mono-v31-latin-300.woff2',
  '/website/fonts/roboto-mono-v31-latin-regular.woff2',
  '/website/fonts/roboto-mono-v31-latin-700.woff2',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  const ext = url.pathname.split('.').pop();
  if (ext !== 'woff2' && ext !== 'woff' && ext !== 'js') return;

  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const hit = await cache.match(e.request);
      if (hit) return hit;
      const res = await fetch(e.request);
      if (res.ok) cache.put(e.request, res.clone());
      return res;
    })
  );
});
