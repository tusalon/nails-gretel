// sw.js - Service Worker para Nails Gretel

const CACHE_NAME = 'nails-gretel-v3';
const urlsToCache = [
  '/nails-gretel/',
  '/nails-gretel/index.html',
  '/nails-gretel/admin.html',
  '/nails-gretel/admin-login.html',
  '/nails-gretel/calendar.html',
  '/nails-gretel/setup-wizard.html',
  '/nails-gretel/editar-negocio.html',
  '/nails-gretel/manifest.json',
  '/nails-gretel/icons/icon-72x72.png',
  '/nails-gretel/icons/icon-96x96.png',
  '/nails-gretel/icons/icon-128x128.png',
  '/nails-gretel/icons/icon-144x144.png',
  '/nails-gretel/icons/icon-152x152.png',
  '/nails-gretel/icons/icon-192x192.png',
  '/nails-gretel/icons/icon-384x384.png',
  '/nails-gretel/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
  console.log('Service Worker instalando...');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache creado, guardando archivos...');
        return cache.addAll(urlsToCache);
      })
      .catch(error => console.error('Error al cachear archivos:', error))
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker activado, limpiando caches antiguos...');
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames.map(cacheName => {
        if (cacheName !== CACHE_NAME) {
          console.log('Eliminando cache antiguo:', cacheName);
          return caches.delete(cacheName);
        }
      })
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (!event.request.url.startsWith('http')) return;
  if (
    event.request.url.includes('wa.me') ||
    event.request.url.includes('api.whatsapp.com') ||
    event.request.url.includes('whatsapp.com')
  ) return;
  if (event.request.url.includes('supabase.co')) return;
  if (event.request.url.includes('ntfy.sh')) return;
  if (event.request.url.includes('unsplash.com')) return;
  if (
    event.request.url.includes('cdn.') ||
    event.request.url.includes('unpkg.com') ||
    event.request.url.includes('trickle.so')
  ) return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) return cachedResponse;
        if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) {
          return caches.match('/nails-gretel/icons/icon-192x192.png');
        }
        return new Response('Error de red', { status: 408 });
      }))
  );
});

self.addEventListener('message', event => {
  console.log('Mensaje recibido:', event.data);
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(cacheNames => cacheNames.forEach(cacheName => caches.delete(cacheName)));
  }
});

console.log('Service Worker configurado para Nails Gretel');
console.log('Cache:', CACHE_NAME);
console.log('Archivos a cachear:', urlsToCache.length);
