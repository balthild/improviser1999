<script lang="ts">
	import { asset } from '$app/paths';

	import type { DropsDataset } from '$lib/types/dataset';

	interface Props {
		drops: DropsDataset;
	}

	const props: Props = $props();

	const source = $derived(props.drops.data.sourceUrl);
	const date = $derived(props.drops.data.updatedAt.split('T')[0].replaceAll('-', '/'));
</script>

<div class="flex items-center gap-2 text-xs">
	<img src={asset('/image/by-nc.svg')} width="80" height="15" alt="CC BY-NC" />
	<span>
		<a
			href={source}
			rel="external noopener noreferrer"
			target="_blank"
			class="text-link no-underline"
		>Source</a>. Data aggregated and reformatted. Last updated at {date}.
	</span>
</div>
