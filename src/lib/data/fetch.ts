import type { DatasetKeys, DatasetSources, DatasetTypes } from '$lib/types/dataset';

const sources: DatasetSources = {
	pools: 'https://r2.balthild.com/improviser1999/pools.json',
	arcanists: 'https://r2.balthild.com/improviser1999/arcanists.json',
	materials: 'https://r2.balthild.com/improviser1999/materials.json',
	chapters: 'https://r2.balthild.com/improviser1999/chapters.json',
	stages: 'https://r2.balthild.com/improviser1999/stages.json',

	drops:
		'https://cdn.jsdelivr.net/gh/SaionjiReisaki/cpp-data/files/reverse1999-hisboundenduty-drops-china.json',
	values:
		'https://cdn.jsdelivr.net/gh/SaionjiReisaki/cpp-data/files/reverse1999-hisboundenduty-values-china.json',
};

export async function fetchDataset<T extends DatasetKeys>(key: T, fetch: typeof window.fetch) {
	const response = await fetch(sources[key]);
	if (!response.ok) {
		throw new Error(`Failed to fetch ${key} dataset: ${response.status} ${response.statusText}`);
	}

	const dataset = await response.json();
	return dataset as DatasetTypes[T];
}
