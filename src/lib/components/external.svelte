<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		href: string;
		children?: Snippet;
	}

	const props: Props = $props();
</script>

<a
	class={props.class}
	href={props.href}
	rel="external noopener noreferrer"
	target="_blank"
>
	{#if props.children}
		{@render props.children()}
	{:else}
		{props.href}
	{/if}
</a>
