import { fetchDataset } from '$lib/dataset';

import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch }) => {
	const [materials, chapters, stages, drops, values] = await Promise.all([
		fetchDataset('materials', fetch),
		fetchDataset('chapters', fetch),
		fetchDataset('stages', fetch),
		fetchDataset('drops', fetch),
		fetchDataset('values', fetch),
	]);

	return { materials, chapters, stages, drops, values };
};
