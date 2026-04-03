import type { ArcanistId, MaterialId } from './primitive';

export interface ArcanistDataset {
	[id: ArcanistId]: {
		id: ArcanistId;
		name: string;
		rarity: 6 | 5 | 4 | 3 | 2;
		career: number;
	};
}

export interface MaterialDataset {
	[id: MaterialId]: {
		id: MaterialId;
		name: string;
		rarity: 6 | 5 | 4 | 3 | 2;
	};
}

export interface DropDataset {
	data: {
		levelReport: {
			[stage: string]: {
				cost: number;
				count: number;
				drops: {
					[id: MaterialId]: number;
				};
			};
		};
	};
}
