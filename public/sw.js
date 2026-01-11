// West Valley Basketball League - Service Worker
// Enables offline functionality and PWA features

const CACHE_NAME = 'az-flight-v1.0.0';
const STATIC_CACHE_URLS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/app.js',
    '/js/api.js',
    '/js/constants.js',
    '/manifest.json',
    '/error.html',
    // External resources
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install event - cache static resources
self.addEventListener('install', event => {
    console.log('🔧 Service Worker installing...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Caching static resources');
                return cache.addAll(STATIC_CACHE_URLS);
            })
            .then(() => {
                console.log('✅ Service Worker installed successfully');
                self.skipWaiting();
            })
            .catch(error => {
                console.error('❌ Service Worker install failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('🚀 Service Worker activating...');

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(cacheName => cacheName !== CACHE_NAME)
                    .map(cacheName => {
                        console.log('🗑️ Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    })
            );
        }).then(() => {
            console.log('✅ Service Worker activated');
            self.clients.claim();
        })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version if available
                if (response) {
                    console.log('📦 Serving from cache:', event.request.url);
                    return response;
                }

                // Fetch from network
                return fetch(event.request)
                    .then(response => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone response for caching
                        const responseToCache = response.clone();

                        // Cache successful responses
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(error => {
                        console.error('🌐 Network fetch failed:', error);

                        // Return offline page for navigation requests
                        if (event.request.mode === 'navigate') {
                            return caches.match('/error.html');
                        }

                        throw error;
                    });
            })
    );
});

// Background sync for game data
self.addEventListener('sync', event => {
    if (event.tag === 'game-data-sync') {
        console.log('🔄 Syncing game data...');
        event.waitUntil(syncGameData());
    }
});

// Push notifications (for future use)
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'New game update available!',
        icon: '/assets/icons/android-chrome-192x192.png',
        badge: '/assets/icons/favicon-32x32.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Game',
                icon: '/assets/icons/scorekeeper-96x96.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/assets/icons/close-96x96.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('West Valley Basketball', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/?notification=game-update')
        );
    }
});

// Sync game data function
async function syncGameData() {
    try {
        // Get pending game data from IndexedDB
        const pendingData = await getPendingGameData();

        if (pendingData.length > 0) {
            // Sync with backend API
            for (const data of pendingData) {
                await fetch('/api/games/sync', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
            }

            // Clear pending data after successful sync
            await clearPendingGameData();
            console.log('✅ Game data synced successfully');
        }
    } catch (error) {
        console.error('❌ Game data sync failed:', error);
        throw error;
    }
}

// Helper functions for IndexedDB operations (placeholder)
async function getPendingGameData() {
    // Implementation for retrieving pending data from IndexedDB
    return [];
}

async function clearPendingGameData() {
    // Implementation for clearing synced data from IndexedDB
    return Promise.resolve();
}

console.log('🏀 West Valley Service Worker loaded');