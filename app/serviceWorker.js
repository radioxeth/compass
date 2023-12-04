const CACHE_NAME = 'compass-cache-v1'
const urlsToCache = [
    '/',
    '/style.css',
    '/main.js'
]

const addResourcesToCache = async (resources) => {
    const cache = await caches.open(CACHE_NAME)
    console.log('Opened cache')
    await cache.addAll(resources)
    console.log('Resources added to cache')
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


self.addEventListener('activate', async (event) => {
    const cacheWhitelist = [CACHE_NAME]
    event.waitUntil((async () => {
        const cacheNames = await caches.keys()
        await Promise.all(
            cacheNames.map(async (cacheName) => {
                if (!cacheWhitelist.includes(cacheName)) {
                    await caches.delete(cacheName)
                }
            })
        )
    })())
})

