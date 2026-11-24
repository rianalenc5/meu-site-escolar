const CACHE_NAME = 'medinfo-digital-v1';

const ARQUIVOS_OFFLINE = [
  './',
  './index.html',
  './login.html',
  './style.css',
  './dados.js',
  './script.js',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ARQUIVOS_OFFLINE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((chaves) => {
      return Promise.all(
        chaves.map((chave) => {
          if (chave !== CACHE_NAME) {
            return caches.delete(chave);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((respostaRede) => {
        if (event.request.url.startsWith(self.location.origin)) {
          const copiaResposta = respostaRede.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copiaResposta));
        }
        return respostaRede;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});