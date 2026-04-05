import { idb } from '$lib/idb';
import type { QuerySummonRecord } from '$lib/types/summon';

import { fetchSummons } from './fetch.remote';

export const doImport = async (url: string) => {
	const userId = new URL(url).searchParams.get('userId')!;

	const result = await fetchSummons(url);
	if (result.code !== 200) {
		return { error: result.msg };
	}

	const imported = await doImportPage(userId, result.data.pageData);
	console.log({ count: imported });
	// TODO: loop through pages

	return { imported };
};

async function doImportPage(userId: string, records: QuerySummonRecord[]) {
	let imported = 0;

	for (const record of records) {
		const summon = await idb.summons.get({
			userId,
			'record.poolId': record.poolId,
			'record.summonType': record.summonType,
			'record.createTime': record.createTime,
		});

		if (!summon) {
			imported++;
		}

		await idb.summons.add({ userId, record });
	}

	return imported;
}
