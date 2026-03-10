const CACHE_NAME = 'l3bty-v2.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/images/icon-192x192.png',
  '/images/icon-512x512.png',
  '/sounds/alert.mp3',
  '/sounds/timeout.mp3'
];

// التثبيت - تخزين الملفات مؤقتاً
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// التنشيط - تنظيف الكاش القديم
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch - تقديم الملفات من الكاش أو الشبكة
self.addEventListener('fetch', event => {
  // تجاهل طلبات POST وغيرها
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // إذا وجد في الكاش، أرجعها
        if (response) {
          return response;
        }

        // إذا لم توجد، أحمل من الشبكة
        return fetch(event.request)
          .then(response => {
            // تحقق من أن الرد صالح للتخزين
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // استنساخ الرد لأنه قابل للقراءة مرة واحدة فقط
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(error => {
            // في حالة فشل الشبكة، يمكن إرجاع صفحة افتراضية
            console.log('Fetch failed:', error);
            
            // إذا كان طلب HTML، أرجع الصفحة الرئيسية
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/index.html');
            }
            
            // يمكن إرجاع رسالة خطأ أو أي شيء آخر
            return new Response('Network error happened', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// استقبال رسائل Push
self.addEventListener('push', event => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/images/icon-192x192.png',
    badge: '/images/badge.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url
    },
    actions: [
      {
        action: 'view',
        title: 'عرض'
      },
      {
        action: 'close',
        title: 'إغلاق'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// التعامل مع نقرات الإشعارات
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url || '/');
      }
    })
  );
});

// Sync Background - للمزامنة في الخلفية
self.addEventListener('sync', event => {
  if (event.tag === 'sync-rentals') {
    event.waitUntil(syncRentals());
  }
});

async function syncRentals() {
  // هنا يمكنك إضافة منطق مزامنة البيانات
  console.log('Syncing rentals data...');
}

// إرسال رسالة إلى الصفحة
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});