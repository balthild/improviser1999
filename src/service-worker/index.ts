import { self } from '$app/service-worker';

self.addEventListener('fetch', (event) => {
	if (event.request.url.includes('//cdn.jsdelivr.net/gh/myssal/Reverse-1999-CN-Asset/')) {
		event.respondWith(
			(async () => {
				// avoid getting opaque responses whose status is always 0
				// jsDelivr has `Access-Control-Allow-Origin: *` so this works
				const request = new Request(event.request, {
					mode: 'cors',
					credentials: 'omit',
				});

				const storage = await caches.open('reverse1999-assets');
				const cached = await storage.match(request);
				if (cached?.ok) return cached;

				const fresh = await fetch(request);
				if (fresh.ok) storage.put(request, fresh.clone());
				return fresh;
			})(),
		);
	}
});
