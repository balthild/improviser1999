import type { DropDataset, StageDataset, MaterialDataset } from '$lib/types/dataset';

import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch }) => {
	const [materials, stages, drops, values] = await Promise.all([
		fetchMaterialDataset(fetch),
		fetchStageDataset(fetch),
		fetchMaterialDropDataset(fetch),
		fetchMaterialValueDataset(fetch),
	]);

	return { materials, stages, drops, values };
};

async function fetchMaterialDataset(fetch: typeof globalThis.fetch) {
	const response = await fetch('https://r2.balthild.com/improviser1999/materials.json');
	const dataset = await response.json();
	return dataset as MaterialDataset;
}

async function fetchStageDataset(fetch: typeof globalThis.fetch) {
	const response = await fetch('https://r2.balthild.com/improviser1999/stages.json');
	const dataset = await response.json();
	return dataset as StageDataset;
}

async function fetchMaterialDropDataset(fetch: typeof globalThis.fetch) {
	const response = await fetch(
		'https://cdn.jsdelivr.net/gh/SaionjiReisaki/cpp-data/files/reverse1999-hisboundenduty-drops-china.json',
	);
	const dataset = await response.json();
	return dataset as DropDataset;
}

async function fetchMaterialValueDataset(fetch: typeof globalThis.fetch) {
	const response = await fetch(
		'https://cdn.jsdelivr.net/gh/SaionjiReisaki/cpp-data/files/reverse1999-hisboundenduty-values-china.json',
	);
	const dataset = await response.json();
	return dataset as DropDataset;
}
