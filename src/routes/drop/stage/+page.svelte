<script lang="ts">
	import { resolve } from '$app/paths';

	import type { ChapterNum, StageId } from '$lib/types/primitive.js';
	import { renderChapterNum } from '$lib/utils.js';

	const { data } = $props();

	const stageIdByName = $derived.by(() => {
		const stages: Record<string, StageId> = {};
		for (const [id, stage] of Object.entries(data.stages)) {
			const name = `${stage.chapter}-${stage.episode}${stage.difficulty}`;
			stages[name] = Number(id) as unknown as StageId;
		}

		return stages;
	});

	let selectedChapter = $state(1 as unknown as ChapterNum);

	const selectedEpisodes = $derived(
		Object.values(data.chapters[selectedChapter].episodes).map((episode) => {
			const stage = {
				normal: data.stages[stageIdByName[`${selectedChapter}-${episode.num}普通`]],
				hard: data.stages[stageIdByName[`${selectedChapter}-${episode.num}厄险`]],
			};

			return { ...episode, stage };
		}),
	);

	const normalStages = $derived(selectedEpisodes.filter((episode) => episode.stage.normal));
	const hardStages = $derived(selectedEpisodes.filter((episode) => episode.stage.hard));
</script>

<section class="flex w-full">
	<aside class="w-50 border-r border-gray-300">
		{#each Object.values(data.chapters) as chapter (chapter.num)}
			<button
				class="btn btn-inlay px-3 py-2.5 border-b block w-full text-left"
				class:active={chapter.num === selectedChapter}
				onclick={() => (selectedChapter = chapter.num)}
			>
				<p class="text-lg font-medium">{renderChapterNum(chapter.num)}</p>
				<p class="text-sm mb-px">{chapter.title.zh}</p>
			</button>
		{/each}
	</aside>

	<main class="flex-1">
		<div class="stages">
			{#each normalStages as episode (episode.num)}
				<a href={resolve(`/drop/stage/${episode.stage.normal.id}`)} class="btn btn-inlay">
					<p class="text-lg font-medium">
						{selectedChapter}-{episode.num}
					</p>
					<p class="text-sm mb-px">{episode.title.zh}</p>
				</a>
			{/each}
		</div>

		<div class="h-2.5 border-b border-gray-300 bg-stripe"></div>

		<div class="stages">
			{#each hardStages as episode (episode.num)}
				<a href={resolve(`/drop/stage/${episode.stage.hard.id}`)} class="btn btn-inlay">
					<p class="text-lg font-medium">
						{selectedChapter}-{episode.num} 厄险
					</p>
					<p class="text-sm mb-px">{episode.title.zh}</p>
				</a>
			{/each}
		</div>
	</main>
</section>

<style lang="postcss">
	@reference '$lib/styles/index.css';

	@layer components {
		.btn-inlay.active {
			@apply bg-white/50;
			@apply cursor-default;
		}

		.stages {
			@apply grid grid-cols-3 auto-rows-min;
			@apply border-b border-gray-300;

			a {
				@apply px-3 py-2.5;
				@apply border-r border-b;
			}

			a:nth-child(3n) {
				@apply border-r-0;
			}

			/* https://keithclark.co.uk/articles/targeting-first-and-last-rows-in-css-grid-layouts/ */
			a:nth-child(3n+1):nth-last-child(-n+3),
			a:nth-child(3n+1):nth-last-child(-n+3) ~ a {
				@apply border-b-0;
			}
		}
	}
</style>
