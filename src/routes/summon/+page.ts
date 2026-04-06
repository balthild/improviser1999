import { fetchDataset } from '$lib/dataset';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const pools = await fetchDataset('pools', fetch);
	const arcanists = await fetchDataset('arcanists', fetch);
	return { pools, arcanists };
};
