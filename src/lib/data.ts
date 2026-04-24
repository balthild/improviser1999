import type { ChapterNum, CommonStageKey, EpisodeNum } from './types/primitive';

export function renderChapterNum(chapter: number, uppercase = true) {
	const suffixes = {
		zero: 'TH',
		one: 'ST',
		two: 'ND',
		few: 'RD',
		many: 'TH',
		other: 'TH',
	};

	const rule = new Intl.PluralRules('en-US', { type: 'ordinal' }).select(chapter);
	const suffix = uppercase ? suffixes[rule] : suffixes[rule].toLowerCase();

	return `${chapter}${suffix}`;
}

export function parseLevelReportKey(key: string) {
	const match = key.match(
		/^(?<stage>(?<chapter>\d+)-(?<episode>\d+)(?<difficulty>[^\d]+))\(\d+\)Ver(?<version>\d+\.\d+)$/,
	);
	if (!match || !match.groups) {
		return null;
	}

	return {
		stage: match.groups.stage as CommonStageKey,
		chapter: Number(match.groups.chapter),
		episode: Number(match.groups.episode),
		difficulty: match.groups.difficulty,
		version: match.groups.version,
	};
}

/**
 * Note: keep in sync with `stage` field returned by `parseLevelReportKey`
 */
export function commonStageKey(
	chapter: ChapterNum,
	episode: EpisodeNum,
	difficulty: '普通' | '厄险',
) {
	return `${chapter}-${episode}${difficulty}` as CommonStageKey;
}
