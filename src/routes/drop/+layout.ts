import { fetchDataset } from '$lib/dataset';

import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch }) => {
	const [materials, stages, drops] = await Promise.all([
		fetchDataset('materials', fetch),
		fetchDataset('stages', fetch),
		fetchDataset('drops', fetch),
	]);

	return { materials, stages, drops };
};
