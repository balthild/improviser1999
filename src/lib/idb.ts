import { Dexie, type EntityTable } from 'dexie';

import type { QuerySummonRecord } from '$lib/types/summon';

export interface Summon {
	id: number;
	userId: string;
	record: QuerySummonRecord;
}

export const idb = new Dexie('improviser1999') as Dexie & {
	summons: EntityTable<Summon, 'id'>;
};

idb.version(1).stores({
	summons: `
		++id,
		userId,
		record.poolId,
		record.summonType,
		record.createTime,
		*record.gainIds,
		[userId+record.poolId+record.summonType+record.createTime]
	`,
});
