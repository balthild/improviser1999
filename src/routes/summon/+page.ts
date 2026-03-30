import type { ArcanistDataset } from '$lib/types/data';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, setHeaders }) => {
	setHeaders({ 'cache-control': 'public, max-age=86400, immutable' });

	const response = await fetch('https://r2.balthild.com/improviser1999/arcanists.json');
	const arcanists = await response.json();

	return {
		arcanists: arcanists as ArcanistDataset,
	};
};
