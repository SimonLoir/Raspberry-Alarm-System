self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('push', (e) => {
    const data = e.data.text();
    self.registration.showNotification('Alarm', {
        body: data,
        icon: 'https://picsum.photos/200/300',
    });
});

const currentCache = 'c1.0.0';
const networkFirst = (event) => {
    console.log(event);
    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                return caches.open(currentCache).then((cache) => {
                    if (
                        event.request.method === 'GET' &&
                        event.request.url.indexOf('/api/') === -1
                    )
                        cache.put(event.request, networkResponse.clone());
                    console.log(networkResponse);
                    return networkResponse;
                });
            })
            .catch((e) => {
                console.log('cache', e);
                return caches.match(event.request);
            })
    );
};

self.addEventListener('fetch', networkFirst);
