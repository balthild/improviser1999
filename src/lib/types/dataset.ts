import type { ArcanistId, StageId, MaterialId, ChapterNum, EpisodeNum } from './primitive';

export type DatasetTypes = {
	arcanists: ArcanistsDataset;
	materials: MaterialsDataset;
	chapters: ChaptersDataset;
	stages: StagesDataset;
	drops: DropsDataset;
	values: ValuesDataset;
};

export type DatasetKeys = keyof DatasetTypes;
export type DatasetSources = Record<DatasetKeys, string>;

export interface ArcanistsDataset {
	[id: ArcanistId]: {
		id: ArcanistId;
		name: string;
		rarity: 6 | 5 | 4 | 3 | 2;
		career: number;
	};
}

export interface MaterialsDataset {
	[id: MaterialId]: {
		id: MaterialId;
		name: string;
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
		episodes: {
			[num: EpisodeNum]: {
				num: EpisodeNum;
				title: {
					zh: string;
					en: string;
				};
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
