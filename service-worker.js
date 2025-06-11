const CACHE_NAME = 'static-v2';  // Changed version to force update
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/src/assets/favicon.png'  // This must match your actual file path
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});

self.addEventListener("push", (event) => {
  const data = event.data?.json() || {
    title: "New Notification",
    body: "You have updates!"
  };
  
  // Use absolute URL for production
  const iconUrl = new URL('/src/assets/favicon.png', self.location.origin).href;
  
  console.log("Notification icon URL:", iconUrl);
  
  event.waitUntil(
    // First verify the icon exists
    fetch(iconUrl, { mode: 'no-cors', cache: 'force-cache' })
      .then(() => {
        return self.registration.showNotification(data.title, {
          body: data.body,
          icon: iconUrl,
          badge: iconUrl,
          vibrate: [200, 100, 200]
        });
      })
      .catch(err => {
        console.error("Failed to load icon:", err);
        // Fallback without icon
        return self.registration.showNotification(data.title, {
          body: data.body,
          vibrate: [200, 100, 200]
        });
      })
  );
});