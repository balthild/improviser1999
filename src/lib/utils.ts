export function percent(value: number): string {
	return `${(value * 100).toFixed(2)}%`;
}

export function distinct<T>(items: Iterable<T>): T[] {
	return Array.from(new Set(items));
}

export function keyBy<T>(array: T[], key: (item: T) => string): Record<string, T> {
	const result: Record<string, T> = {};
	for (const item of array) {
		result[key(item)] = item;
	}
	return result;
}

const Absent = Symbol('Absent');

export function lazy<T>(fn: () => T): () => T {
	let instance: T | typeof Absent = Absent;

	return () => {
		if (instance === Absent) {
			instance = fn();
		}

		return instance;
	};
}
