// import
// import icon as "./assets/favicon"


self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("static-v1").then((cache) => {
      return cache.addAll([
        "/",
        "/index.html",
        "/style.css",
        "/app.js", // Add other static assets like JS and CSS files you need
       
      ]);
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

// service-worker.js
self.addEventListener("push", (event) => {
  const data = event.data.json();
  const icon = "https://fonts.gstatic.com/s/i/materialicons/notifications/v8/24px.svg";

  console.log("Using icon:", icon);
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: icon,
    })
  );
});
