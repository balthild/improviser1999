export function renderChapterNum(chapter: number, uppercase = true) {
	const upper = { zero: 'TH', one: 'ST', two: 'ND', few: 'RD', many: 'TH', other: 'TH' };
	const lower = { zero: 'th', one: 'st', two: 'nd', few: 'rd', many: 'th', other: 'th' };
	const suffix = uppercase ? upper : lower;

	const rule = new Intl.PluralRules('en-US', { type: 'ordinal' }).select(chapter);

	return `${chapter}${suffix[rule]}`;
}

export function parseLevelReportKey(key: string) {
	const match = key.match(
		/^(?<stage>(?<chapter>\d+)-(?<episode>\d+)(?<difficulty>[^\d]+))\(\d+\)Ver(?<version>\d+\.\d+)$/,
	);
	if (!match || !match.groups) {
		return null;
	}

	return {
		stage: match.groups.stage,
		chapter: Number(match.groups.chapter),
		episode: Number(match.groups.episode),
		difficulty: match.groups.difficulty,
		version: match.groups.version,
	};
}
