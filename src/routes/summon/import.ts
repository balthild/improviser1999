import { idb } from '$lib/idb';
import type { QuerySummonRecord } from '$lib/types/summon';

import { fetchSummons } from './fetch.remote';

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
			'record.poolId': record.poolId,
			'record.summonType': record.summonType,
			'record.createTime': record.createTime,
		});

		if (summon) {
			return [index, true];
		}

		await idb.summons.add({ userId, record });
	}

	return [records.length, false];
}
