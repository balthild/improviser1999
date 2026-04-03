import type { ArcanistId, PoolId, PoolTypeId } from './primitive';

export interface QuerySummonRecord {
	poolId: PoolId;
	poolType: PoolTypeId;
	poolName: string;
	summonType: '1' | '10';
	createTime: string;
	gainIds: ArcanistId[];
	luckyBagIds: number[];
}

export interface QuerySummonResponse {
	code: number;
	msg: string;
	data: {
		pageData: QuerySummonRecord[];
	};
}
