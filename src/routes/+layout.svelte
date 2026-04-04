<script lang="ts">
	import '$lib/styles/index.css';

	import { OverlayScrollbarsComponent } from 'overlayscrollbars-svelte';

	import favicon from '$lib/assets/favicon.svg';
	import Sidebar from '$lib/components/sidebar.svelte';

	import type { Snapshot } from './$types';

	let { children } = $props();

	let container: OverlayScrollbarsComponent | null;

	export const snapshot: Snapshot<number> = {
		capture: () => {
			const elements = container?.osInstance()?.elements();
			return elements?.viewport.scrollTop ?? 0;
		},
		restore: (value) => {
			const elements = container?.osInstance()?.elements();
			elements?.viewport.scrollTo({ top: value });
		},
	};
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>流浪即兴曲</title>
</svelte:head>

<div class="flex h-screen flex-col overflow-hidden">
	<header class="shrink-0 border-b border-gray-300 bg-gray-900/6">
		<div class="h-12 w-full max-w-wl flex items-center gap-2 px-4 text-gray-600">
			<span class="text-xl text-blue-700 icon-[ri--instance-line]"></span>
			<h1 class="font-bold text-ml">流浪即兴曲</h1>
		</div>
	</header>

	<main class="flex flex-1 min-h-0 w-full max-w-wl relative border-gray-400/50 wl:border-r wl:border-dashed">
		<div class="scrap -right-1 -top-1 hidden wl:block"></div>

		<Sidebar />

		<OverlayScrollbarsComponent
			defer
			class="h-full flex-1 os-toplevel"
			options={{ scrollbars: { autoHide: 'scroll' } }}
			bind:this={container}
		>
			{@render children()}
		</OverlayScrollbarsComponent>
	</main>
</div>
