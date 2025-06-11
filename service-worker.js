// import "/favicon.png"


self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("static-v1").then((cache) => {
      return cache.addAll([
        "/",
        "/index.html",
        "/style.css",
        "/app.js", // Add other static assets like JS and CSS files you need
        "/favicon.png"
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
  const icon = data.icon || "/favicon.png"; // Use the path to your favicon.png from the public folder
  console.log("Using icon:", icon);
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: icon,
       badge: "/favicon.png" // Optional: add a badge image
    })
  );
});
