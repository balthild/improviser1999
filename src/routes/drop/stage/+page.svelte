<script lang="ts">
	import type { Snippet } from 'svelte';

	import { resolve } from '$app/paths';

	import { renderChapterNum } from '$lib/data';
	import { tr } from '$lib/i18n.svelte';
	import type { ChapterNum } from '$lib/types/primitive';
	import { keyBy } from '$lib/utils';

	import type { Snapshot } from './$types';

	const { data } = $props();

	const stagesByName = $derived(
		keyBy(
			Object.values(data.stages),
			(stage) => `${stage.chapter}-${stage.episode}${stage.difficulty}`,
		),
	);

	let selectedChapter = $state(1 as unknown as ChapterNum);

	const selectedEpisodes = $derived(
		Object.values(data.chapters[selectedChapter].episodes).map((episode) => {
			const stage = {
				normal: stagesByName[`${selectedChapter}-${episode.num}普通`],
				hard: stagesByName[`${selectedChapter}-${episode.num}厄险`],
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
				<p class="text-sm mt-px mb-1">{tr(chapter.title)}</p>
			</button>
		{/each}
	</aside>

	<div class="w-2.5 border-r border-gray-300 bg-stripe"></div>

	<main class="flex-1 pb-4">
		{#each selectedEpisodes as episode (episode.num)}
			<div class="relative border-b border-gray-300 flex">
				<div class="scrap -left-1 -bottom-1"></div>

				<div class="text-ms mx-6 mt-8 mb-3 flex items-baseline">
					<span class="text-4xl font-medium font-garamond leading-[1em]">
						{episode.num.toString().padStart(2, '0')}
					</span>
					<span class="h-5 mx-2 border-r border-gray-400 translate-y-0.5 -skew-x-25"></span>
					<div class="ml-1 -mb-px flex gap-5 items-center h-6">
						<span>{tr(episode.title)}</span>

						{#if episode.stage.normal}
							<a href={resolve(`/drop/stage/${episode.stage.normal.id}`)} class="flex items-center">
								{@render StarSvg(StarNormalPath, 'text-amber-600')}
								<span class="[a:hover>&]:underline underline-offset-3">
									{tr({ zh: '普通', en: 'Normal' })}
								</span>
							</a>
						{/if}

						{#if episode.stage.hard}
							<a href={resolve(`/drop/stage/${episode.stage.hard.id}`)} class="flex items-center">
								{@render StarSvg(StarHardPath, 'text-orange-700')}
								<span class="[a:hover>&]:underline underline-offset-3">
									{tr({ zh: '厄险', en: 'Hard' })}
								</span>
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

{#snippet StarSvg(content: Snippet<[number, number]>, classes: string)}
	{@const [w, h] = [340, 400]}

	<svg viewBox={`-${w} -${h} ${2 * w} ${2 * h}`} class={['mr-0.5 h-4.5', classes]}>
		{@render content(w, h)}
	</svg>
{/snippet}

{#snippet StarNormalPath(w: number, h: number)}
	{@const [cx, cy] = [70, 60]}
	{@const [lx, ly] = [30, 100]}
	{@const [sx, sy] = [100, 30]}

	{@const path = `
		M ${0},${-h}

		C ${0},${-h} ${-lx},${-ly} ${-cx},${-cy}
		C ${-sx},${-sy} ${-w},${0} ${-w},${0}

		C ${-w},${0} ${-sx},${+sy} ${-cx},${+cy}
		C ${-lx},${+ly} ${0},${+h} ${0},${+h}

		C ${0},${+h} ${+lx},${+ly} ${+cx},${+cy}
		C ${+sx},${+sy} ${+w},${0} ${+w},${0}

		C ${+w},${0} ${+sx},${-sy} ${+cx},${-cy}
		C ${+lx},${-ly} ${0},${-h} ${0},${-h}

		Z
	`}

	<path d={path} fill="currentColor" />
{/snippet}

{#snippet StarHardPath(w: number, h: number)}
	{@const [c, s, l] = [60, 210, 240]}

	{@const path = `
		M ${0},${-c}
		L ${-l},${-l} L ${-c},${0}
		L ${-s},${+s} L ${0},${+c}
		L ${+l},${+l} L ${+c},${0}
		L ${+s},${-s} L ${0},${-c}
	`}

	<path d={path} fill="currentColor" />

	{@render StarNormalPath(w, h)}
{/snippet}
