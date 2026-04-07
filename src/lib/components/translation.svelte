<script lang="ts">
	import type { Snippet } from 'svelte';

	import { getLanguage } from '$lib/i18n.svelte';
	import type { Language } from '$lib/i18n.svelte';

	const props: Record<Language, Snippet | string> = $props();

	const content = $derived(props[getLanguage()]);
</script>

{#if typeof content === 'string'}
	{content}
{:else}
	{@render content()}
{/if}
