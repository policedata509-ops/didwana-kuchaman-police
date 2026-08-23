// ============================================================
// डीडवाना-कुचामन पुलिस पोर्टल — Service Worker
// इसे पोर्टल की HTML फाइल के बिल्कुल उसी फोल्डर में "sw.js" नाम से रखें
// (जिस जगह से पोर्टल का लिंक खुलता है, वहीं यह फाइल भी होनी चाहिए)।
// इसके बाद पोर्टल पहली बार इंटरनेट के साथ खुलने पर अपने-आप इसे रजिस्टर
// कर लेगा — फिर अगली बार इंटरनेट न होने पर भी पोर्टल खुल जाएगा (डेटा
// आखिरी बार सफलतापूर्वक सिंक हुआ डेटा दिखेगा, बिल्कुल खाली नहीं)।
// ============================================================
const CACHE_NAME = 'dk-portal-cache-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // मुख्य पेज को तुरंत कैश कर लें ताकि पहली विज़िट के बाद से ही ऑफलाइन काम करे
      return cache.addAll(['./']).catch(() => {});
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // नेटवर्क से सफलतापूर्वक मिला — कैश को ताज़ा कर दें
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone)).catch(() => {});
        return res;
      })
      .catch(() =>
        // नेटवर्क फेल — पुराना कैश्ड पेज दिखाएँ (न मिले तो मुख्य पेज ही दिखाएँ)
        caches.match(e.request).then((cached) => cached || caches.match('./'))
      )
  );
});
