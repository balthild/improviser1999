import type {
	ArcanistId,
	StageId,
	MaterialId,
	ChapterNum,
	EpisodeNum,
	PoolId,
	PoolTypeId,
	ResonanceModelId,
	ResonanceCubeId,
	ResonancePatternId,
} from './primitive';

export type DatasetTypes = {
	pools: PoolsDataset;
	arcanists: ArcanistsDataset;
	materials: MaterialsDataset;
	chapters: ChaptersDataset;
	stages: StagesDataset;
	resonances: ResonancesDataset;
	drops: DropsDataset;
	values: ValuesDataset;
};

export type DatasetKeys = keyof DatasetTypes;
export type DatasetSources = Record<DatasetKeys, string>;

// #region dataset

export type PoolsDataset = Record<PoolId, Pool>;
export type ArcanistsDataset = Record<ArcanistId, Arcanist>;
export type MaterialsDataset = Record<MaterialId, Material>;
export type ChaptersDataset = Record<ChapterNum, Chapter>;
export type StagesDataset = Record<StageId, Stage>;

export type ResonancesDataset = {
	characters: Record<ArcanistId, ResonanceConfig>;
	models: Record<ResonanceModelId, ResonanceModel>;
	cubes: Record<ResonanceCubeId, ResonanceCube>;
};

export interface DropsDataset {
	data: {
		sourceUrl: string;
		updatedAt: string;
		levelReport: Record<string, StageDropReport>;
	};
}

export interface ValuesDataset {
	data: {
		sourceUrl: string;
		updatedAt: string;
		values: Record<MaterialId, string>;
	};
}

// #endregion

export interface Pool {
	id: PoolId;
	type: PoolTypeId;
	name: { zh: string; en: string };
	pity: number;
	order: number;
	arcanists?: {
		options?: ArcanistId[];
		up6?: ArcanistId[];
		up5?: ArcanistId[];
	};
}

export type Arcanist = {
	id: ArcanistId;
	name: { zh: string; en: string };
	rarity: 6 | 5 | 4 | 3 | 2;
	career: number;
};

export type Material = {
	id: MaterialId;
	name: { zh: string; en: string };
	rarity: 6 | 5 | 4 | 3 | 2;
};

export type Episode = {
	num: EpisodeNum;
	title: { zh: string; en: string };
	year: string;
	date: string;
	time: string;
};

export type Chapter = {
	num: ChapterNum;
	title: { zh: string; en: string };
	year: string;
	episodes: Record<EpisodeNum, Episode>;
};

export type Stage = {
	id: StageId;
	chapter: ChapterNum;
	episode: EpisodeNum;
	difficulty: '普通' | '厄险';
	drops: MaterialId[];
};

export type StageDropReport = {
	cost: number;
	count: number;
	drops: Record<MaterialId, number>;
};

// #region resonance

type ResonanceConfig = {
	model: ResonanceModelId;
	main: {
		cube: ResonanceCubeId;
		levels: Record<number, number>;
	};
	reference: ResonanceAttrsFixed;
};

type ResonanceModel = {
	levels: {
		[level: number]: {
			size: [number, number];
			cubes: {
				[id: ResonanceCubeId]: {
					count: number;
					level: number;
				};
			};
		};
	};
	patterns: {
		[id: ResonancePatternId]: {
			name: { zh: string; en: string };
			icon: string;
			replace: Partial<Record<ResonanceCubeId, ResonanceCubeId>>;
		};
	};
};

type ResonanceCube = {
	sort: number;
	icon: string;
	levels: Record<number, ResonanceCubeLevel>;
};

type ResonanceCubeLevel = {
	attrs: Partial<ResonanceAttrsFixed & ResonanceAttrsPercentage>;
};

type ResonanceAttrsFixed = {
	hp: number;
	attack: number;
	defense: number;
	mdefense: number;
};

type ResonanceAttrsPercentage = {
	cri: string;
	recri: string;
	criDmg: string;
	criDef: string;
	addDmg: string;
	dropDmg: string;
	revive: string;
	absorb: string;
	clutch: string;
	heal: string;
	defenseIgnore: string;
	normalSkillRate: string;
};

// #endregion
