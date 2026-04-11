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
				const cache = await caches.open('reverse1999-assets');
				const cached = await cache.match(event.request);
				if (cached) return cached;

				const fresh = await fetch(event.request);
				cache.put(event.request, fresh.clone());
				return fresh;
			})(),
		);
	}
});
