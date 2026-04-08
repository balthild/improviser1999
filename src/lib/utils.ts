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

const cache = new WeakMap<WeakKey, unknown>();

export function memoize<T>(fn: () => T): () => T {
	return () => {
		if (!cache.has(fn)) {
			cache.set(fn, fn());
		}

		return cache.get(fn) as T;
	};
}
