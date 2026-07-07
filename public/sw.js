// public/sw.js — network-first for app bundles; cache only shell assets.
const CACHE_NAME = 'myos-cache-v5';
const SHELL_ASSETS = ['/index.html', '/manifest.json', '/APPLOGO.png'];

function isAppBundle(pathname) {
	return (
		pathname.startsWith('/static/') ||
		pathname.endsWith('.js') ||
		pathname.endsWith('.css') ||
		pathname.endsWith('.json')
	);
}

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
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

self.addEventListener('message', (event) => {
	if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
	const req = event.request;
	if (req.method !== 'GET') return;

	const url = new URL(req.url);
	if (url.origin !== self.location.origin) return;

	if (req.mode === 'navigate') {
		event.respondWith(
			fetch(req)
				.then((res) => {
					if (res.ok) {
						const copy = res.clone();
						caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy));
					}
					return res;
				})
				.catch(() => caches.match('/index.html'))
		);
		return;
	}

	if (isAppBundle(url.pathname)) {
		event.respondWith(
			fetch(req).catch(() => caches.match(req))
		);
		return;
	}

	event.respondWith(
		caches.match(req).then(
			(cached) =>
				cached ||
				fetch(req).then((res) => {
					if (res.ok) {
						const copy = res.clone();
						caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
					}
					return res;
				})
		)
	);
});
