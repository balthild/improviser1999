export interface QuerySummonRecord {
	poolId: number;
	poolType: number;
	poolName: string;
	summonType: '1' | '10';
	createTime: string;
	gainIds: number[];
	luckyBagIds: number[];
}

export interface QuerySummonResponse {
	code: number;
	msg: string;
	data: {
		pageData: QuerySummonRecord[];
	};
}
