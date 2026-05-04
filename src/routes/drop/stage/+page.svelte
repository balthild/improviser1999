<script lang="ts">
	import { resolve } from '$app/paths';

	import { commonStageKey, renderChapterNum } from '$lib/data';
	import { tr } from '$lib/i18n.svelte';
	import type { Stage } from '$lib/types/dataset';
	import type { ChapterNum, CommonStageKey } from '$lib/types/primitive';
	import { keyBy } from '$lib/utils';

	import type { Snapshot } from './$types';

	const uniqueId = $props.id();

	const { data } = $props();

	const stages: Record<CommonStageKey, Stage> = $derived(
		keyBy(Object.values(data.stages), (stage) =>
			commonStageKey(stage.chapter, stage.episode, stage.difficulty),
		),
	);

	let selectedChapter = $state(1 as ChapterNum);

	const selectedEpisodes = $derived(
		Object.values(data.chapters[selectedChapter].episodes).map((episode) => {
			const stage = {
				normal: stages[commonStageKey(selectedChapter, episode.num, '普通')],
				hard: stages[commonStageKey(selectedChapter, episode.num, '厄险')],
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
	<div class="w-50 pb-4 border-r border-gray-300" role="radiogroup">
		{#each Object.values(data.chapters) as chapter (chapter.num)}
			<button
				class="btn btn-inlay px-3.5 py-1.5 border-b block w-full text-left"
				aria-checked={chapter.num === selectedChapter}
				onclick={() => (selectedChapter = chapter.num)}
				role="radio"
			>
				<p class="text-2xl leading-8 font-medium font-garamond small-caps">
					{renderChapterNum(chapter.num, false)}
				</p>
				<p class="text-sm mt-px mb-1">{tr(chapter.title)}</p>
			</button>
		{/each}
	</div>

	<div class="w-2.5 border-r border-gray-300 bg-stripe"></div>

	<main class="flex-1 pb-4" aria-live="polite">
		{#each selectedEpisodes as episode (episode.num)}
			<div class="relative border-b border-gray-300 flex">
				<div class="scrap -left-1 -bottom-1"></div>

				<div class="absolute left-0 top-0 h-full *:h-1/10 *:border-gray-300">
					{#each new Array(10).keys() as i (i)}
						<div class={[i > 0 && 'border-t', i === 5 ? 'w-2' : 'w-1']}></div>
					{/each}
				</div>

				<div class="text-ms mx-6 mt-8 mb-3 flex items-baseline">
					<span class="text-4xl font-medium font-garamond leading-[1em]">
						{episode.num.toString().padStart(2, '0')}
					</span>

					<div class="mx-2 flex flex-col items-center self-end rotate-24">
						<div class="size-0.5 rounded-full bg-gray-400 mb-0.75"></div>
						<div class="h-4 w-px bg-gray-400 mb-0.5"></div>
					</div>

					<div class="ml-1 -mb-px flex gap-5 items-center h-6">
						<span>{tr(episode.title)}</span>

						{#if episode.stage.normal}
							<a href={resolve(`/drop/stage/${episode.stage.normal.id}`)} class="flex items-center">
								<svg class="mr-0.5 size-4.5 text-amber-600">
									<use href="#star-normal-{uniqueId}" />
								</svg>
								<span class="[a:hover>&]:underline underline-offset-3">
									{tr({ zh: '故事', en: 'Story' })}
								</span>
							</a>
						{/if}

						{#if episode.stage.hard}
							<a href={resolve(`/drop/stage/${episode.stage.hard.id}`)} class="flex items-center">
								<svg class="mr-0.5 size-4.5 text-orange-700">
									<use href="#star-hard-{uniqueId}" />
								</svg>
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
		.btn-inlay[aria-checked='true'] {
			@apply bg-white/50;
			@apply cursor-default;
		}
	}
</style>

<svelte:boundary>
	<!-- half of width, half of height -->
	{@const [hw, hh] = [360, 400]}

	<!-- zero coordinate is at the center -->
	{@const bounds = `${-hw} ${-hh} ${2 * hw} ${2 * hh}`}

	<!-- large star: core point -->
	{@const [cx, cy] = [70, 60]}
	<!-- large star: handle from core point to long point -->
	{@const [lx, ly] = [30, 100]}
	<!-- large star: handle from core point to short point -->
	{@const [sx, sy] = [100, 30]}

	<!-- large star -->
	{@const large = `
		M ${0x0},${-hh}

		C ${0x0},${-hh} ${-lx},${-ly} ${-cx},${-cy}
		C ${-sx},${-sy} ${-hw},${0x0} ${-hw},${0x0}

		C ${-hw},${0x0} ${-sx},${+sy} ${-cx},${+cy}
		C ${-lx},${+ly} ${0x0},${+hh} ${0x0},${+hh}

		C ${0x0},${+hh} ${+lx},${+ly} ${+cx},${+cy}
		C ${+sx},${+sy} ${+hw},${0x0} ${+hw},${0x0}

		C ${+hw},${0x0} ${+sx},${-sy} ${+cx},${-cy}
		C ${+lx},${-ly} ${0x0},${-hh} ${0x0},${-hh}

		Z
	`}

	<!-- small star: core point, short point, long point -->
	{@const [c, s, l] = [60, 210, 240]}

	<!-- small star -->
	{@const small = `
		M ${+0},${-c}
		L ${-l},${-l} L ${-c},${+0}
		L ${-s},${+s} L ${+0},${+c}
		L ${+l},${+l} L ${+c},${+0}
		L ${+s},${-s} L ${+0},${-c}
		Z
	`}

	<svg class="hidden">
		<symbol id="star-normal-{uniqueId}" viewBox={bounds}>
			<path d={large} fill="currentColor" />
		</symbol>
		<symbol id="star-hard-{uniqueId}" viewBox={bounds}>
			<path d={large} fill="currentColor" />
			<path d={small} fill="currentColor" />
		</symbol>
	</svg>
</svelte:boundary>
