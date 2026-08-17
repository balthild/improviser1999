<script lang="ts">
	import { asset } from '$app/paths';

	import External from '$lib/components/external.svelte';
	import type { DropsDataset } from '$lib/types/dataset';

	interface Props {
		drops: DropsDataset;
	}

	const props: Props = $props();

	const source = $derived(props.drops.data.sourceUrl);
	const date = $derived(props.drops.data.updatedAt.split('T')[0].replaceAll('-', '/'));
</script>

<div class="flex items-center gap-2 text-xs">
	<External href="https://creativecommons.org/licenses/by-nc/4.0/">
		<img src={asset('/image/by-nc.svg')} width="80" height="15" alt="CC BY-NC" />
	</External>
	<span>
		<External href={source} class="text-link no-underline">Source</External>. Data aggregated and
		reformatted. Last updated at {date}.
	</span>
</div>
