import { idb } from '$lib/idb';
import type { GameUserId } from '$lib/types/primitive';
import type { QuerySummonRecord } from '$lib/types/summon';

import { fetchSummons } from './fetch.remote';

export async function doImport(url: string) {
	const userId = new URL(url).searchParams.get('userId')! as GameUserId;

	const result = await fetchSummons(url);
	if (result.code !== 200) {
		return { error: result.msg };
	}

	const imported = await doImportPage(userId, result.data.pageData);
	// TODO: loop through pages?

	return { imported };
}

async function doImportPage(userId: GameUserId, records: QuerySummonRecord[]) {
	let imported = 0;

	for (const record of records) {
		const summon = await idb.summons.get({
			userId,
			'record.poolId': record.poolId,
			'record.summonType': record.summonType,
			'record.createTime': record.createTime,
		});

		if (!summon) {
			await idb.summons.add({ userId, record });
			imported += record.gainIds.length;
		}
	}

	return imported;
}
