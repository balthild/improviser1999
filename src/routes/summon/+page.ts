import type { ArcanistDataset } from '$lib/types/dataset';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const arcanists = await fetchArcanistDataset(fetch);
	return { arcanists };
};

async function fetchArcanistDataset(fetch: typeof globalThis.fetch) {
	const response = await fetch('https://r2.balthild.com/improviser1999/arcanists.json');
	const dataset = await response.json();
	return dataset as ArcanistDataset;
}
