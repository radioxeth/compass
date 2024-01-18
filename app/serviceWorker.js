const CACHE_NAME = 'v1705620223113'
const urlsToCache = [
    '/',
    '/style.css',
    '/main.js',
    '/images/compass-dir-up-dark.svg',
    '/images/compass-dir-up-light.svg',
    '/images/compass-north-up-dark.svg',
    '/images/compass-north-up-light.svg',
    '/images/light-to-dark.svg',
    '/images/dark-to-light.svg',
]

const addResourcesToCache = async (resources) => {
    const cache = await caches.open(CACHE_NAME)
    await cache.addAll(resources)
}

self.addEventListener('install', (event) => {
    event.waitUntil(
        addResourcesToCache(urlsToCache)
            .then(() => self.skipWaiting()) // Forces the waiting service worker to become the active service worker
            .catch((err) => console.error('Error during service worker install:', err))
    )
})

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    )
})

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME]
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName)
                    }
                })
            )
        }).then(() => self.clients.claim()) // Takes control of the clients as soon as the service worker becomes active
    )
})
