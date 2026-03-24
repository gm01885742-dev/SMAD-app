/**
 * CBE studio | SMAD App Service Worker
 * 版本號：v40 (每次修改 HTML 內容後，請手動將此數字往上加)
 */
const CACHE_NAME = 'cbe-smad-v40';

// 1. 定義需要快取的靜態資源清單
// 確保包含所有頁面與外部 CSS 資源，以支援離線瀏覽
const ASSETS = [
  './',
  'index.html',
  'diag.html',
  'data.html',
  'manifest.json',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css'
];

// 2. 安裝階段 (Install)：下載並儲存資源
self.addEventListener('install', (event) => {
  console.log('[Service Worker] 安裝中，快取版本:', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  // 強制讓新的 Service Worker 立即跳過等待期
  self.skipWaiting();
});

// 3. 激活階段 (Activate)：清理舊版本快取
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] 激活中，正在清理舊快取空間...');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] 刪除過期快取:', key);
          return caches.delete(key);
        }
      }));
    })
  );
  // 立即取得頁面的控制權
  return self.clients.claim();
});

// 4. 攔截請求 (Fetch)：優先讀取快取，實現 PWA 離線功能
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 找到快取則回傳，否則發起網路請求
      return response || fetch(event.request).catch(() => {
        // 如果連網失敗且快取無資料，導向首頁避免 404
        if (event.request.mode === 'navigate') {
          return caches.match('index.html');
        }
      });
    })
  );
});
