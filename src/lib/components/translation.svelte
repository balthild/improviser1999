<script lang="ts">
	import type { Snippet } from 'svelte';

	import { getLanguage } from '#lib/i18n';
	import type { Language } from '#lib/i18n';

	const props: Record<Language, Snippet | string> = $props();

	const content = $derived(props[getLanguage()]);
</script>

{#if typeof content === 'string'}
	{content}
{:else}
	{@render content()}
{/if}
