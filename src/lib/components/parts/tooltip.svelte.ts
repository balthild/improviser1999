import { computePosition, flip, offset, shift } from '@floating-ui/dom';
import type { Action } from 'svelte/action';
import { on } from 'svelte/events';

export const tooltip: Action<HTMLElement, string> = (el, text) => {
	const tooltip = document.createElement('div');
	tooltip.role = 'tooltip';
	tooltip.className = 'tooltip';
	tooltip.textContent = text;

	$effect(() => {
		document.body.appendChild(tooltip);

		const offMouseEnter = on(el, 'mouseenter', async () => {
			const { x, y } = await computePosition(el, tooltip, {
				placement: 'right',
				middleware: [flip(), offset(4), shift({ padding: 4 })],
			});

			tooltip.style.visibility = 'visible';
			tooltip.style.left = `${x}px`;
			tooltip.style.top = `${y}px`;
		});

		const offMouseLeave = on(el, 'mouseleave', () => {
			tooltip.style.visibility = 'hidden';
		});

		return () => {
			offMouseEnter();
			offMouseLeave();
			tooltip.remove();
		};
	});
};
