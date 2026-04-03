export function distinct<T>(items: Iterable<T>): T[] {
	return Array.from(new Set(items));
}

export function renderChapterNum(chapter: number) {
	const suffixes = {
		zero: 'TH',
		one: 'ST',
		two: 'ND',
		few: 'RD',
		many: 'TH',
		other: 'TH',
	};

	const rule = new Intl.PluralRules('en-US', { type: 'ordinal' }).select(chapter);

	return `${chapter}${suffixes[rule]}`;
}
