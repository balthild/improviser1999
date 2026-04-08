import type { Handle } from '@sveltejs/kit';

import { getLanguage } from '$lib/i18n.svelte';

export const handle: Handle = ({ event, resolve }) => {
	const language = getLanguage();
	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', language),
	});
};
