export function percent(value: number): string {
	return `${(value * 100).toFixed(2)}%`;
}

export function distinct<T>(items: Iterable<T>): T[] {
	return Array.from(new Set(items));
}

export function keyBy<T, K extends PropertyKey>(array: T[], key: (item: T) => K): Record<K, T> {
	const result = {} as Record<K, T>;
	for (const item of array) {
		result[key(item)] = item;
	}
	return result;
}

export function groupBy<T, K extends PropertyKey>(array: T[], key: (item: T) => K): Record<K, T[]> {
	const result = {} as Record<K, T[]>;
	for (const item of array) {
		const k = key(item);
		result[k] ??= [];
		result[k].push(item);
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
