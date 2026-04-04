import { fetchDataset } from '$lib/dataset';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const arcanists = await fetchDataset('arcanists', fetch);
	return { arcanists };
};
