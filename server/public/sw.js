const CACHE_NAME = 'rikasai-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/student/index.html',
  '/student/fairytale.css',
  '/guest/index.html',
  '/admin/index.html',
  '/privacy.html',
  '/manifest.json'
];

// インストール時に静的ファイルをキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 古いキャッシュの削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// フェッチ要求の処理
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 招待客用のチケットAPIはオフライン用にキャッシュを試みる
  if (url.pathname.startsWith('/api/guest-entry/')) {
    event.respondWith(
      fetch(event.request).then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, resClone);
        });
        return res;
      }).catch(() => {
        return caches.match(event.request, { ignoreSearch: true });
      })
    );
    return;
  }

  // その他のAPIリクエストはキャッシュしない
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  const isHtml = event.request.mode === 'navigate' || event.request.url.endsWith('.html');

  if (isHtml) {
    // HTMLはnetwork-first：常にサーバーから取得し、オフライン時だけキャッシュにフォールバック
    event.respondWith(
      fetch(event.request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return res;
      }).catch(() => caches.match(event.request))
    );
  } else {
    // CSS・JS・画像はcache-first（パフォーマンス維持）
    event.respondWith(
      caches.match(event.request, { ignoreSearch: true }).then((response) => {
        return response || fetch(event.request).then((fetchResponse) => {
          if (fetchResponse.status === 200) {
            const resClone = fetchResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
          }
          return fetchResponse;
        });
      })
    );
  }
});
