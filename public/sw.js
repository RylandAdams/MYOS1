// public/sw.js
const CACHE_NAME = 'myos-cache-v2';
const CORE_ASSETS = ['/', '/index.html', '/manifest.json', '/APPLOGO.png'];

function shouldCache(request, response) {
	if (!response || !response.ok) return false;
	const type = response.headers.get('content-type') || '';
	const path = new URL(request.url).pathname;
	if (path.endsWith('.js') || path.endsWith('.css')) {
		return type.includes('javascript') || type.includes('css');
	}
	if (path.endsWith('.json')) {
		return type.includes('json');
	}
	if (path.endsWith('.html') || path === '/') {
		return type.includes('html');
	}
	return true;
}

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
	);
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((keys) =>
			Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
		)
	);
	self.clients.claim();
});

self.addEventListener('fetch', (event) => {
	const req = event.request;
	if (req.method !== 'GET') return;

	if (req.mode === 'navigate') {
		event.respondWith(fetch(req).catch(() => caches.match('/index.html')));
		return;
	}

	event.respondWith(
		caches.match(req).then((cached) => {
			if (cached) return cached;
			return fetch(req).then((res) => {
				if (shouldCache(req, res)) {
					const copy = res.clone();
					caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
				}
				return res;
			});
		})
	);
});
