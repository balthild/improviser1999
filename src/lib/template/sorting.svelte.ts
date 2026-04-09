import type { Action } from 'svelte/action';
import { on } from 'svelte/events';

type Comparable = number | bigint;

export function createSorter<Key extends string>(initial: Key) {
	const state = $state({
		key: initial,
		asc: true,
	});

	const sort = <T extends Record<Key, Comparable>>(data: T[]) => {
		return data.toSorted((left, right) => {
			const sign = state.asc ? 1 : -1;
			return sign * (left[state.key] - right[state.key]);
		});
	};

	// typescript doesn't resolve `Action<..., Key>` here
	const th = (el: HTMLTableCellElement, key: Key) => {
		$effect(() => {
			return on(el, 'click', () => {
				if (state.key === key) {
					state.asc = !state.asc;
				} else {
					state.key = key;
					state.asc = true;
				}
			});
		});

		$effect(() => {
			if (state.key === key) {
				el.ariaSort = state.asc ? 'ascending' : 'descending';
			} else {
				el.ariaSort = 'none';
			}
		});
	};

	return {
		state,
		sort,
		th: th as Action<HTMLTableCellElement, Key>,
	};
}
