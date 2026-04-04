<script lang="ts">
	import { resolve } from '$app/paths';

	import { renderChapterNum } from '$lib/data';
	import type { ChapterNum, StageId } from '$lib/types/primitive';

	import type { Snapshot } from './$types';

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

	export const snapshot: Snapshot<ChapterNum> = {
		capture: () => {
			return selectedChapter;
		},
		restore: (value) => {
			selectedChapter = value;
		},
	};
</script>

<section class="flex w-full">
	<aside class="w-50 pb-4 border-r border-gray-300">
		{#each Object.values(data.chapters) as chapter (chapter.num)}
			<button
				class="btn btn-inlay px-3.5 py-1.5 border-b block w-full text-left"
				class:active={chapter.num === selectedChapter}
				onclick={() => (selectedChapter = chapter.num)}
			>
				<p class="text-2xl leading-8 font-medium font-garamond small-caps">
					{renderChapterNum(chapter.num, false)}
				</p>
				<p class="text-sm mt-px mb-1">{chapter.title.zh}</p>
			</button>
		{/each}
	</aside>

	<div class="w-2.5 border-r border-gray-300 bg-stripe"></div>

	<main class="flex-1 pb-4">
		{#each selectedEpisodes as episode (episode.num)}
			<div class="relative border-b border-gray-300 flex">
				<div class="scrap -left-1 -bottom-1"></div>

				<div class="text-ms mx-6 mt-8 mb-3 flex items-end">
					<span class="text-4xl font-medium font-garamond leading-[1em]">{episode.num}</span>
					<span class="inline-block h-5 mb-0.5 mx-2 border-r border-gray-400 -skew-x-25"></span>
					<div class="ml-1 -mb-px flex gap-5 items-center h-6">
						<span>{episode.title.zh}</span>

						{#if episode.stage.normal}
							<a href={resolve(`/drop/stage/${episode.stage.normal.id}`)} class="flex items-center">
								<span class="text-lg text-amber-600 mr-0.5">✶&#xFE0E;</span>
								<span class="[a:hover>&]:underline underline-offset-3">普通</span>
							</a>
						{/if}

						{#if episode.stage.hard}
							<a href={resolve(`/drop/stage/${episode.stage.hard.id}`)} class="flex items-center">
								<span class="text-lg text-orange-700 mr-0.5">✴&#xFE0E;</span>
								<span class="[a:hover>&]:underline underline-offset-3">厄险</span>
							</a>
						{/if}
					</div>
				</div>
			</div>
		{/each}
	</main>
</section>

<style lang="postcss">
	@reference '$lib/styles/index.css';

	@layer components {
		.btn-inlay.active {
			@apply bg-white/50;
			@apply cursor-default;
		}
	}
</style>
