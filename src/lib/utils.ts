export function distinct<T>(items: Iterable<T>): T[] {
	return Array.from(new Set(items));
}
