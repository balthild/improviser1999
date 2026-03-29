import { command } from '$app/server';

import { type QuerySummonResponse } from '$lib/types/summon';

import { ImportUrlScheme } from './validation';

export const fetchSummons = command(
	ImportUrlScheme,
	async (url: URL): Promise<QuerySummonResponse> => {
		const response = await fetch(url);
		return await response.json();
	},
);
