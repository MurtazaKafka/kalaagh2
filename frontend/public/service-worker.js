// Service Worker for Kalaagh Educational Platform
// Provides offline functionality and smart caching

const CACHE_VERSION = 'kalaagh-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const CONTENT_CACHE = `${CACHE_VERSION}-content`;
const VIDEO_CACHE = `${CACHE_VERSION}-videos`;

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/css/app.css',
  '/js/app.js',
  '/manifest.json',
  '/images/logo.png',
  '/fonts/noto-sans-arabic.woff2'
];

// Content types and their cache strategies
const CACHE_STRATEGIES = {
  '/api/': 'network-first',
  '/content/videos/': 'cache-first',
  '/content/interactive/': 'cache-first',
  '/content/books/': 'cache-first',
  '/images/': 'cache-first',
  '/api/progress/': 'background-sync'
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  
  // Force activation
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith('kalaagh-') && cacheName !== CACHE_VERSION)
          .map((cacheName) => {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  
  // Take control of all pages
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Determine cache strategy
  const strategy = getCacheStrategy(url.pathname);
  
  switch (strategy) {
    case 'cache-first':
      event.respondWith(cacheFirst(request));
      break;
    case 'network-first':
      event.respondWith(networkFirst(request));
      break;
    case 'background-sync':
      event.respondWith(backgroundSync(request));
      break;
    default:
      event.respondWith(networkFirst(request));
  }
});

// Cache strategies
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return caches.match('/offline.html');
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    return cached || caches.match('/offline.html');
  }
}

async function backgroundSync(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    // Queue for sync when online
    await queueRequest(request);
    
    // Return cached response or empty success
    const cached = await caches.match(request);
    return cached || new Response(JSON.stringify({ queued: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Get cache strategy for URL
function getCacheStrategy(pathname) {
  for (const [pattern, strategy] of Object.entries(CACHE_STRATEGIES)) {
    if (pathname.includes(pattern)) {
      return strategy;
    }
  }
  return 'network-first';
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-progress') {
    event.waitUntil(syncProgress());
  }
});

async function syncProgress() {
  const db = await openDB();
  const tx = db.transaction('sync-queue', 'readonly');
  const requests = await tx.objectStore('sync-queue').getAll();
  
  for (const requestData of requests) {
    try {
      await fetch(requestData.url, {
        method: requestData.method,
        headers: requestData.headers,
        body: requestData.body
      });
      
      // Remove from queue
      const deleteTx = db.transaction('sync-queue', 'readwrite');
      await deleteTx.objectStore('sync-queue').delete(requestData.id);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}

// Queue requests for background sync
async function queueRequest(request) {
  const db = await openDB();
  const requestData = {
    id: Date.now(),
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: await request.text()
  };
  
  const tx = db.transaction('sync-queue', 'readwrite');
  await tx.objectStore('sync-queue').add(requestData);
  
  // Register sync
  await self.registration.sync.register('sync-progress');
}

// IndexedDB helper
async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('kalaagh-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('sync-queue')) {
        db.createObjectStore('sync-queue', { keyPath: 'id' });
      }
    };
  });
}

// Message handling
self.addEventListener('message', (event) => {
  if (event.data.type === 'CACHE_VIDEO') {
    cacheVideo(event.data.url, event.data.quality);
  } else if (event.data.type === 'CLEAR_CACHE') {
    clearCache(event.data.cacheName);
  } else if (event.data.type === 'GET_CACHE_SIZE') {
    getCacheSize().then(size => {
      event.ports[0].postMessage({ size });
    });
  }
});

// Cache video content
async function cacheVideo(url, quality) {
  try {
    const cache = await caches.open(VIDEO_CACHE);
    const qualityUrl = url.replace('.mp4', `_${quality}.mp4`);
    
    // Fetch with progress
    const response = await fetchWithProgress(qualityUrl);
    await cache.put(qualityUrl, response);
    
    // Notify clients
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'VIDEO_CACHED',
          url: qualityUrl
        });
      });
    });
  } catch (error) {
    console.error('Failed to cache video:', error);
  }
}

// Fetch with progress tracking
async function fetchWithProgress(url) {
  const response = await fetch(url);
  const reader = response.body.getReader();
  const contentLength = +response.headers.get('Content-Length');
  
  let receivedLength = 0;
  const chunks = [];
  
  while (true) {
    const { done, value } = await reader.read();
    
    if (done) break;
    
    chunks.push(value);
    receivedLength += value.length;
    
    // Report progress
    const progress = (receivedLength / contentLength) * 100;
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'DOWNLOAD_PROGRESS',
          url: url,
          progress: progress
        });
      });
    });
  }
  
  const chunksAll = new Uint8Array(receivedLength);
  let position = 0;
  for (const chunk of chunks) {
    chunksAll.set(chunk, position);
    position += chunk.length;
  }
  
  return new Response(chunksAll, {
    headers: response.headers
  });
}

// Clear specific cache
async function clearCache(cacheName) {
  if (cacheName) {
    await caches.delete(cacheName);
  } else {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter(name => name.startsWith('kalaagh-'))
        .map(name => caches.delete(name))
    );
  }
}

// Get cache size
async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;
  
  for (const cacheName of cacheNames) {
    if (cacheName.startsWith('kalaagh-')) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
    }
  }
  
  return totalSize;
}

// Periodic background sync for content updates
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'content-update') {
    event.waitUntil(updateContent());
  }
});

async function updateContent() {
  try {
    // Fetch latest content metadata
    const response = await fetch('/api/v1/content/updates');
    const updates = await response.json();
    
    // Cache updated content
    const cache = await caches.open(CONTENT_CACHE);
    for (const item of updates) {
      if (item.needsUpdate) {
        const contentResponse = await fetch(item.url);
        await cache.put(item.url, contentResponse);
      }
    }
  } catch (error) {
    console.error('Content update failed:', error);
  }
}