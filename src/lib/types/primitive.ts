declare const __brand: unique symbol;
type Brand<T extends string> = { [__brand]: T };

export type PoolId = number & Brand<'PoolId'>;
export type PoolTypeId = number & Brand<'PoolTypeId'>;
export type ArcanistId = number & Brand<'ArcanistId'>;
export type MaterialId = number & Brand<'MaterialId'>;
export type StageId = number & Brand<'StageId'>;

export type ChapterNum = number & Brand<'ChapterNum'>;
export type EpisodeNum = number & Brand<'EpisodeNum'>;

export type CommonStageKey = string & Brand<'CommonStageKey'>;
