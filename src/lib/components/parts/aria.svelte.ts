import type { Action } from 'svelte/action';
import { on } from 'svelte/events';

type GetExpander = () => HTMLElement;

export const expander: Action<HTMLElement, GetExpander> = (popover, getExpander) => {
	$effect(() => {
		return on(popover, 'toggle', (event) => {
			const expander = getExpander();
			if (!expander) return;

			const open = event.newState === 'open';
			expander.ariaExpanded = open ? 'true' : 'false';
		});
	});
};
