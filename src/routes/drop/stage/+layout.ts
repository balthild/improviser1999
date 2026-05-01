import { fetchDataset } from '$lib/data';

import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch }) => {
	const chapters = await fetchDataset('chapters', fetch);
	return { chapters };
};
