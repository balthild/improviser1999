import type { Action } from 'svelte/action';
import { on } from 'svelte/events';

type GetTriggerElement = () => HTMLElement;

export const expand: Action<HTMLElement, GetTriggerElement> = (popover, getTrigger) => {
	$effect(() => {
		return on(popover, 'toggle', (event) => {
			const trigger = getTrigger();
			if (!trigger) return;

			const open = event.newState === 'open';
			trigger.ariaExpanded = open ? 'true' : 'false';
		});
	});
};
