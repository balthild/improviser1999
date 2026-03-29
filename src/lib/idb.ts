import { Dexie, type EntityTable } from 'dexie';

import type { QuerySummonRecord } from '$lib/types/summon';

export interface Summon extends QuerySummonRecord {
	id: number;
	userId: string;
}

export const idb = new Dexie('improviser1999') as Dexie & {
	summons: EntityTable<Summon, 'id'>;
};

idb.version(1).stores({
	summons: `
		++id,
		userId,
		poolId,
		summonType,
		createTime,
		*gainIds,
		[userId+poolId+summonType+createTime]
	`,
});
