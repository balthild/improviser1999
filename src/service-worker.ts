/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />
/// <reference types="../.svelte-kit/ambient.d.ts" />

/* eslint-disable svelte/no-add-event-listener */

const worker = self as unknown as ServiceWorkerGlobalScope;

worker.addEventListener('fetch', (event) => {
	if (event.request.url.includes('//cdn.jsdelivr.net/gh/myssal/Reverse-1999-CN-Asset/')) {
		event.respondWith(
			(async () => {
				// avoid getting opaque responses whose status is always 0
				// jsDelivr has `Access-Control-Allow-Origin: *` so this will work
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
