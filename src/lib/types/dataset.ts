import type { ArcanistId, StageId, MaterialId, ChapterNum, EpisodeNum } from './primitive';

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

export interface ChapterDataset {
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

export interface StageDataset {
	[id: StageId]: {
		id: StageId;
		chapter: ChapterNum;
		episode: EpisodeNum;
		difficulty: string;
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
