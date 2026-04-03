import type { ChapterDataset } from '$lib/types/dataset';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const chapters = await fetchChapterDataset(fetch);

	return { chapters };
};

async function fetchChapterDataset(fetch: typeof globalThis.fetch) {
	const response = await fetch('https://r2.balthild.com/improviser1999/chapters.json');
	const dataset = await response.json();
	return dataset as ChapterDataset;
}
