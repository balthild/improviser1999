import { Dexie } from 'dexie';
import type { EntityTable } from 'dexie';

import type { QuerySummonRecord } from '$lib/types/summon';

import type { GameUserId } from './types/primitive';

export interface Summon {
	id: number;
	userId: GameUserId;
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
		record.poolType,
		record.summonType,
		record.createTime,
		*record.gainIds,
		[userId+record.poolId+record.summonType+record.createTime]
	`,
});
