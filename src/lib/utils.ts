export function distinct<T>(items: Iterable<T>): T[] {
	return Array.from(new Set(items));
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
