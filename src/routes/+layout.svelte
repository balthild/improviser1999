<script lang="ts">
	import '$lib/styles/index.css';

	import { OverlayScrollbarsComponent } from 'overlayscrollbars-svelte';

	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/header.svelte';
	import Sidebar from '$lib/components/sidebar.svelte';

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

		<main class="min-w-0 flex-1 overflow-visible relative xl:max-w-240 xl:border-r xl:border-dashed xl:border-gray-400/50">
			<div class="scrap hidden xl:block -right-1 -top-1"></div>

			<OverlayScrollbarsComponent
				defer
				class="h-full"
				options={{ scrollbars: { autoHide: 'scroll' } }}
			>
				{@render children()}
			</OverlayScrollbarsComponent>
		</main>
	</div>
</div>
