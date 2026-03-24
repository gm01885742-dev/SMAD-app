/**
 * CBE studio | SMAD App Service Worker
 * 版本號：v10 (每次修改頁面內容後，請手動將此數字往上加，例如 v11)
 */
const CACHE_NAME = 'cbe-smad-v10';

// 需要離線儲存的資源清單
const ASSETS = [
  './',
  'index.html',
  'diag.html',
  'data.html',
  'manifest.json',
  // 第三方樣式與圖示庫
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css'
];

// 1. 安裝階段 (Install)：下載資源並儲存至快取
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing v10...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching all assets');
      return cache.addAll(ASSETS);
    })
  );
  // 強制讓新的 Service Worker 立即進入 Activate 狀態，不需等待舊版關閉
  self.skipWaiting();
});

// 2. 激活階段 (Activate)：刪除舊版本的快取空間
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  // 確保 Service Worker 立即取得頁面的控制權
  return self.clients.claim();
});

// 3. 攔截請求 (Fetch)：實現離線瀏覽
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 如果快取中有資料就用快取的，沒有就去網路上抓
      return response || fetch(event.request);
    })
  );
});
