import { fetchDataset } from '$lib/dataset';

import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch }) => {
	const chapters = await fetchDataset('chapters', fetch);
	return { chapters };
};
