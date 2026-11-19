const CACHE_NAME = "grabiii-v1";

const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/manifest.json",
    "/css/bootstrap.min.css",
    "/css/style.css",
    "/js/app.js",
    "/images/images192.png",
    "/images/images512.png"
];


self.addEventListener("install", (event) => {
    console.log("Service Worker: Installing...");

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Caching app files...");

            return Promise.all(
                FILES_TO_CACHE.map((url) =>
                    cache.add(url).catch((err) => {
                        console.warn("Failed to cache:", url, err);
                    })
                )
            );
        })
    );

    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    console.log("Service Worker: Activated...");

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );

    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    const request = event.request;

    if (request.method !== "GET") {
        return;
    }

    if (!request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(request)
                .then((networkResponse) => {
                    if (
                        networkResponse &&
                        networkResponse.status === 200 &&
                        networkResponse.type === "basic"
                    ) {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, networkResponse.clone());
                        });
                    }

                    return networkResponse;
                })
                .catch(() => {
                    console.warn(
                        "Fetch failed, walang cache at walang net:",
                        request.url
                    );
                    return caches.match("/index.html");
                });
        })
    );
});