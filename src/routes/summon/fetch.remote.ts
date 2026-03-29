import * as v from 'valibot';

import { command } from '$app/server';

import { QUERY_SUMMON_URL_BASE } from '$lib/constants';
import { type QuerySummonResponse } from '$lib/types/summon';

export const fetchSummons = command(
	v.pipe(v.string(), v.startsWith(QUERY_SUMMON_URL_BASE)),
	async (url: string): Promise<QuerySummonResponse> => {
		const response = await fetch(url);
		return await response.json();
	},
);
