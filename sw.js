/**
 * CBE studio | SMAD App Service Worker
 * 版本號：v20 (每次修改頁面內容後，請手動將此數字往上加)
 */
const CACHE_NAME = 'cbe-smad-v20';

// 1. 定義需要快取的靜態資源
// 這裡必須包含所有分流頁面，否則跳轉會失效
const ASSETS = [
  './',
  'index.html',
  'diag.html',
  'data.html',
  'manifest.json',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css'
];

// 2. 安裝階段 (Install)
self.addEventListener('install', (event) => {
  console.log('[Service Worker] 安裝中並快取資源...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  // 強制讓新的 Service Worker 立即跳過等待期 (Skip Waiting)
  self.skipWaiting();
});

// 3. 激活階段 (Activate)
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] 激活中，正在清理舊快取...');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        // 如果快取名稱不是目前的 v20，就刪除它
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
  // 立即取得頁面的控制權
  return self.clients.claim();
});

// 4. 攔截請求 (Fetch)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 優先從快取中讀取，若無則發起網路請求
      return response || fetch(event.request).catch(() => {
        // 如果網路也斷了且快取沒有，可以導向首頁
        if (event.request.mode === 'navigate') {
          return caches.match('index.html');
        }
      });
    })
  );
});
