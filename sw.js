const CACHE_NAME = 'cbe-smad-v2';

// 需要快取的資源清單
const ASSETS = [
  './',
  'index.html',
  'diag.html',
  'manifest.json',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css'
];

// 安裝階段：將資源存入快取
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('CBE PWA: 正在快取靜態資源');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// 激活階段：清理舊版本快取
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('CBE PWA: 清理舊快取', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

// 攔截請求：優先從快取讀取（實現離線瀏覽）
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
