import * as v from 'valibot';

import { QUERY_SUMMON_URL_BASE } from '$lib/constants';
import { idb } from '$lib/idb';
import type { QuerySummonRecord } from '$lib/types/summon';

import { fetchSummons } from './fetch.remote';

export const ImportUrlScheme = v.pipe(
	v.string(),
	v.url('地址无效'),
	v.startsWith(QUERY_SUMMON_URL_BASE, '地址无效'),
	v.transform((url) => new URL(url)),
	v.check((url) => url.searchParams.has('userId'), '地址无效'),
);

export const doImport = async (url: string, full: boolean) => {
	const userId = new URL(url).searchParams.get('userId')!;

	const result = await fetchSummons(url);
	// TODO: check result.code

	const [count, stop] = await doImportPage(userId, result.data.pageData);
	console.log(full, count, stop);
	// TODO: loop through pages

	return count;
};

async function doImportPage(userId: string, records: QuerySummonRecord[]) {
	for (const [index, record] of records.entries()) {
		const summon = await idb.summons.get({
			userId,
			poolId: record.poolId,
			summonType: record.summonType,
			createTime: record.createTime,
		});

		if (summon) {
			return [index, true];
		}

		await idb.summons.add({
			userId,
			...record,
		});
	}

	return [records.length, false];
}
