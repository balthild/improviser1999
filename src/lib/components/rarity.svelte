<script lang="ts">
	import type { ClassValue } from 'svelte/elements';

	import { tr } from '$lib/i18n.svelte';

	interface Props {
		rarity: 6 | 5 | 4 | 3 | 2;
		class?: ClassValue;
	}

	const props: Props = $props();
</script>

<span class="sr-only">
	{tr({ zh: `${props.rarity}星`, en: `${props.rarity}-star` })}
</span>

<span class={[`tracking-wider rarity-${props.rarity}`, props.class]} aria-hidden="true">
	{props.rarity}✦
</span>

<style lang="postcss">
	@reference '$lib/styles/index.css';

	@layer components {
		.rarity-6 {
			@apply text-amber-600;
		}

		.rarity-5 {
			color: color-mix(in oklch, var(--color-yellow-500), var(--color-black) 5%);
		}

		.rarity-4 {
			color: color-mix(in oklch, var(--color-blue-600), var(--color-gray-500) 60%);
		}

		.rarity-3 {
			@apply text-lime-600;
		}

		.rarity-2 {
			@apply text-gray-500;
		}
	}
</style>
