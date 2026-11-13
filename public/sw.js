/* Lagos GO — service worker
 * - Navegação: rede primeiro; sem conexão, usa a última versão do app ou a página offline.
 * - /assets/* (arquivos com hash do Vite): cache primeiro (não mudam).
 * - CDNs de estilo/mapa/fontes: usa o cache e atualiza em segundo plano.
 * - Nunca guarda /api/*, Firebase/Firestore ou métodos diferentes de GET.
 */
const VERSION = 'lagosgo-v4';
const SHELL_CACHE = `${VERSION}-shell`;
const ASSET_CACHE = `${VERSION}-assets`;
const CDN_CACHE = `${VERSION}-cdn`;
const PRECACHE = ['/', '/offline.html', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png'];
const CDN_HOSTS = ['cdn.tailwindcss.com', 'unpkg.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const putInCache = async (cacheName, request, response) => {
  if (!response || (response.status !== 200 && response.type !== 'opaque')) return;
  const cache = await caches.open(cacheName);
  await cache.put(request, response.clone());
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // Nada de cache para API, autenticação ou banco de dados.
  if (url.origin === self.location.origin && url.pathname.startsWith('/api/')) return;
  if (/googleapis\.com$|firebaseio\.com$|firebaseapp\.com$|gstatic\.com$/.test(url.hostname) && !CDN_HOSTS.includes(url.hostname)) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        putInCache(SHELL_CACHE, '/', response.clone());
        return response;
      } catch {
        return (await caches.match('/')) || (await caches.match('/offline.html'));
      }
    })());
    return;
  }

  if (url.origin === self.location.origin && (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/'))) {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      putInCache(ASSET_CACHE, request, response);
      return response;
    })());
    return;
  }

  if (CDN_HOSTS.includes(url.hostname)) {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      const network = fetch(request).then((response) => { putInCache(CDN_CACHE, request, response); return response; }).catch(() => cached);
      return cached || network;
    })());
  }
});

/* ---------- Notificações push (Firebase Cloud Messaging) ---------- */
self.addEventListener('push', (event) => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch { payload = { notification: { body: event.data && event.data.text() } }; }
  const n = payload.notification || {};
  const d = payload.data || {};
  const title = n.title || d.title || 'Lagos GO';
  const link = d.link || (payload.fcmOptions && payload.fcmOptions.link) || '/';
  event.waitUntil(self.registration.showNotification(title, {
    body: n.body || d.body || '',
    icon: n.icon || '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    image: n.image || d.image || undefined,
    data: { link },
    tag: d.tag || undefined,
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const raw = (event.notification.data && event.notification.data.link) || '/';
  const target = new URL(raw, self.location.origin);
  if (target.origin !== self.location.origin) return; // só abre telas do próprio app
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const open = all.find((c) => new URL(c.url).origin === self.location.origin);
    if (open) { await open.focus(); return open.navigate(target.href); }
    return self.clients.openWindow(target.href);
  })());
});
