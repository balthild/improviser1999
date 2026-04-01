<script lang="ts">
	interface Props {
		rarity: 4 | 5 | 6;
		class?: string;
	}

	const props: Props = $props();
</script>

<span class={[`tracking-wider rarity-${props.rarity}`, props.class]}>
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
			@apply text-violet-500;
		}
	}
</style>
