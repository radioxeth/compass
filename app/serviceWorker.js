const CACHE_NAME = 'compass-cache-v3'
const urlsToCache = [
    '/',
    '/style.css',
    '/main.js'
]

const addResourcesToCache = async (resources) => {
    const cache = await caches.open(CACHE_NAME)
    await cache.addAll(resources)
}


self.addEventListener('install', async (event) => {
    try {
        addResourcesToCache(urlsToCache)
    } catch (err) {
        console.error('Error during service worker install:', err)
    }
})


self.addEventListener('fetch', async (event) => {
    event.respondWith((async () => {
        const response = await caches.match(event.request)
        return response || fetch(event.request)
    })())
})


self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log(`Deleting old cache: ${cacheName}`)
                        return caches.delete(cacheName)
                    }
                })
            )
        })
    )
});


