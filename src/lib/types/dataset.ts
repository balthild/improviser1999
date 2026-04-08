import type {
	ArcanistId,
	StageId,
	MaterialId,
	ChapterNum,
	EpisodeNum,
	PoolId,
	PoolTypeId,
} from './primitive';

export type DatasetTypes = {
	pools: PoolsDataset;
	arcanists: ArcanistsDataset;
	materials: MaterialsDataset;
	chapters: ChaptersDataset;
	stages: StagesDataset;
	drops: DropsDataset;
	values: ValuesDataset;
};

export type DatasetKeys = keyof DatasetTypes;
export type DatasetSources = Record<DatasetKeys, string>;

export interface PoolsDataset {
	[id: PoolId]: {
		id: PoolId;
		type: PoolTypeId;
		name: string;
		pity: number;
		arcanists?: {
			options?: ArcanistId[];
			up6?: ArcanistId[];
			up5?: ArcanistId[];
		};
	};
}

export interface ArcanistsDataset {
	[id: ArcanistId]: {
		id: ArcanistId;
		name: {
			zh: string;
			en: string;
		};
		rarity: 6 | 5 | 4 | 3 | 2;
		career: number;
	};
}

export interface MaterialsDataset {
	[id: MaterialId]: {
		id: MaterialId;
		name: {
			zh: string;
			en: string;
		};
		rarity: 6 | 5 | 4 | 3 | 2;
	};
}

export interface ChaptersDataset {
	[num: ChapterNum]: {
		num: ChapterNum;
		title: {
			zh: string;
			en: string;
		};
		year: number;
		episodes: {
			[num: EpisodeNum]: {
				num: EpisodeNum;
				title: {
					zh: string;
					en: string;
				};
				year: number;
				date: string;
				time: string;
			};
		};
	};
}

export interface StagesDataset {
	[id: StageId]: {
		id: StageId;
		chapter: ChapterNum;
		episode: EpisodeNum;
		difficulty: string;
		drops: MaterialId[];
	};
}

export interface DropsDataset {
	data: {
		levelReport: {
			[name: string]: {
				cost: number;
				count: number;
				drops: {
					[id: MaterialId]: number;
				};
			};
		};
	};
}

export interface ValuesDataset {
	data: {
		sourceUrl: string;
		updatedAt: string;
		values: {
			[id: MaterialId]: string;
		};
	};
}
