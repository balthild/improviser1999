<script lang="ts">
	import { OverlayScrollbarsComponent } from 'overlayscrollbars-svelte';

	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/header.svelte';
	import Sidebar from '$lib/components/sidebar.svelte';

	import '$lib/styles/index.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>流浪即兴曲</title>
</svelte:head>

<div class="flex h-screen flex-col overflow-hidden">
	<Header />

	<div class="flex min-h-0 flex-1">
		<Sidebar />

		<main class="min-w-0 flex-1 overflow-visible relative xl:max-w-240 xl:border-r xl:border-gray-300">
			<div class="hidden xl:block size-1.75 rotate-45 absolute -right-1 -top-1 z-999 bg-white border border-gray-300">
			</div>

			<OverlayScrollbarsComponent defer class="p-4 h-full">
				{@render children()}
			</OverlayScrollbarsComponent>
		</main>
	</div>
</div>
