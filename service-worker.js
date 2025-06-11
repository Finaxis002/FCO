// import "https://plus.unsplash.com/premium_photo-1748960861503-99b1f5412a81?q=80&w=1370&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
// import icon as "./assets/favicon"


self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("static-v1").then((cache) => {
      return cache.addAll([
        "/",
        "/index.html",
        "/style.css",
        "/app.js", // Add other static assets like JS and CSS files you need
        "https://plus.unsplash.com/premium_photo-1748960861503-99b1f5412a81?q=80&w=1370&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
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
  const icon = data.icon || "https://plus.unsplash.com/premium_photo-1748960861503-99b1f5412a81?q=80&w=1370&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"; // Use the path to your favicon.png from the public folder
  console.log("Using icon:", icon);
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: icon,
       badge: "https://plus.unsplash.com/premium_photo-1748960861503-99b1f5412a81?q=80&w=1370&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" // Optional: add a badge image
    })
  );
});
