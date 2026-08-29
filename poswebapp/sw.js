// Service Worker بسيط - يخلي الموقع "قابل للتنصيب" كتطبيق (PWA) ويشتغل شوي حتى بدون نت
// ملاحظة مهمة: ما بيتدخل إطلاقًا بطلبات خارج الموقع (متل Supabase) - هاي لازم تروح دايمًا مباشرة للإنترنت

const CACHE_NAME = "pos-app-v1";
const APP_SHELL = ["./", "./index.html", "./manifest.json", "./icons/icon-192.png", "./icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // أي طلب لخارج نفس الموقع (Supabase مثلًا) ما نلمسه إطلاقًا - يروح مباشرة للإنترنت
  if (url.origin !== self.location.origin) return;

  // ملفات الموقع نفسه: جرب الإنترنت أول (عشان توصل آخر تحديث)، ولو ما في نت استخدم النسخة المخزّنة
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
