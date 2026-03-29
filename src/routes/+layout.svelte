<script lang="ts">
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

		<main class="min-w-0 flex-1 overflow-y-auto p-4">
			{@render children()}
		</main>
	</div>
</div>
