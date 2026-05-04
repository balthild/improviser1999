<script lang="ts">
	import Rarity from '$lib/components/rarity.svelte';
	import { tr } from '$lib/i18n.svelte';
	import type { Arcanist, Pool } from '$lib/types/dataset';
	import type { ArcanistId } from '$lib/types/primitive';
	import { groupBy, percent } from '$lib/utils';

	interface Props {
		pool: string;
		gains: Gain[];
	}

	const props: Props = $props();

	let selectedRarity: 6 | 5 = $state(6);

	const gains = $derived.by(() => {
		const grouped = groupBy(props.gains, (gain) => gain.arcanist.rarity);

		return {
			6: grouped[6] ?? [],
			5: grouped[5] ?? [],
			4: grouped[4] ?? [],
		};
	});

	const average6 = $derived.by(() => {
		const total = gains[6].reduce((sum, it) => sum + it.invested, 0);
		return total / gains[6].length;
	});

	const average5 = $derived.by(() => {
		const total = gains[5].reduce((sum, it) => sum + it.invested, 0);
		return total / gains[5].length;
	});

	const wins6 = $derived.by(() => {
		if (gains[6].every((it) => it.win === undefined)) {
			return undefined;
		}

		const wins = gains[6].filter((it) => it.win).length;
		return wins / gains[6].length;
	});

	const expect6 = $derived.by(() => {
		const first = gains[6].findIndex((it) => it.win !== undefined);
		if (first === -1) {
			return undefined;
		}

		const count = gains[6].filter((it) => it.win).length;
		const total = gains[6].slice(first).reduce((sum, it) => sum + it.invested, 0);
		return total / count;
	});
</script>

<script lang="ts" module>
	export interface Gain {
		key: string;
		id: ArcanistId;
		time: string;
		arcanist: Arcanist;
		pool: Pool;
		invested: number;
		win: boolean | undefined;
	}
</script>

<section class="flex items-stretch">
	<div class="flex-1 p-3" aria-live="polite">
		<h3 class="truncate text-ml font-semibold mb-2">{props.pool}</h3>

		<dl class="space-y-1 text-sm tabular-nums *:flex *:justify-between">
			<div>
				<dt>{tr({ zh: '总计征集次数', en: 'Total Summons' })}</dt>
				<dd class="font-medium">{props.gains.length}</dd>
			</div>
			<div>
				<dt><Rarity rarity={4} /> {tr({ zh: '获取次数', en: 'Gains' })}</dt>
				<dd class="font-medium">{gains[4].length}</dd>
			</div>
			<div>
				<dt><Rarity rarity={5} /> {tr({ zh: '获取次数', en: 'Gains' })}</dt>
				<dd class="font-medium">{gains[5].length}</dd>
			</div>
			<div>
				<dt><Rarity rarity={6} /> {tr({ zh: '获取次数', en: 'Gains' })}</dt>
				<dd class="font-medium">{gains[6].length}</dd>
			</div>
		</dl>
	</div>
	<div class="border-r border-gray-300"></div>
	<div class="flex-1 p-3" aria-live="polite">
		<h3 class="truncate text-ml font-semibold mb-2">
			{tr({ zh: '运气指标', en: 'Luck Metrics' })}
		</h3>

		<dl class="space-y-1 text-sm tabular-nums *:flex *:justify-between">
			<div>
				<dt><Rarity rarity={5} /> {tr({ zh: '平均征集次数', en: 'Average Summons' })}</dt>
				<dd class="font-medium">
					{isNaN(average5) ? tr({ zh: '无数据', en: 'No Data' }) : average5.toFixed(2)}
				</dd>
			</div>
			<div>
				<dt><Rarity rarity={6} /> {tr({ zh: '平均征集次数', en: 'Average Summons' })}</dt>
				<dd class="font-medium">
					{isNaN(average6) ? tr({ zh: '无数据', en: 'No Data' }) : average6.toFixed(2)}
				</dd>
			</div>
			{#if wins6 !== undefined}
				<div>
					<dt><Rarity rarity={6} /> {tr({ zh: 'UP 不歪率', en: '50/50 Win Rate' })}</dt>
					<dd class="font-medium">
						{isNaN(wins6) ? tr({ zh: '无数据', en: 'No Data' }) : percent(wins6)}
					</dd>
				</div>
			{/if}
			{#if expect6 !== undefined}
				<div>
					<dt>
						<Rarity rarity={6} /> {tr({ zh: 'UP 不歪期望值', en: '50/50 Win Expectation' })}
					</dt>
					<dd class="font-medium">
						{isNaN(expect6) ? tr({ zh: '无数据', en: 'No Data' }) : expect6.toFixed(2)}
					</dd>
				</div>
			{/if}
		</dl>
	</div>
</section>

<div class="h-2.5 border-t border-gray-300 bg-stripe"></div>

<section class="border-t border-b border-gray-300 bg-white/50 col-span-2">
	<header
		class="flex flex-row items-stretch text-ms border-b border-gray-300 p-1 gap-1"
		role="radiogroup"
		aria-label={tr({ zh: '选择星级', en: 'Select Rarity' })}
	>
		{#each [6, 5] as const as rarity (rarity)}
			{@const selected = selectedRarity === rarity}
			<button
				class="py-1 flex-1 cursor-pointer rounded-xs ring-0 ring-inset ring-gray-200 aria-checked:ring-1 aria-checked:bg-gray-100"
				onclick={() => (selectedRarity = rarity)}
				role="radio"
				aria-checked={selected}
			>
				<Rarity rarity={rarity} class={['-mr-px', !selected && 'text-neutral-400']} />
			</button>
		{/each}
	</header>

	<ol
		class="gains min-h-8"
		aria-live="polite"
		aria-label={tr({ zh: '获取的角色', en: 'Arcanist Gains' })}
	>
		{#each gains[selectedRarity] as gain (gain.key)}
			<li class="p-2 pb-4 relative *:text-center">
				<div class="aspect-4/7 m-[12%] mb-0 border border-gray-200 bg-gray-50 bg-stripe rounded-t-full overflow-hidden">
					<div class="-mx-px">
						<img
							src="https://cdn.jsdelivr.net/gh/myssal/Reverse-1999-CN-Asset/singlebg/headicon_middle/{gain.arcanist.id}01.png"
							alt={tr(gain.arcanist.name)}
						/>
					</div>
				</div>

				<p class="font-medium text-gray-600 mt-3">{tr(gain.arcanist.name)}</p>
				<p class="count text-sm text-gray-600" class:up={gain.win}>
					<span class="sr-only">
						{tr({ zh: '消耗征集次数：', en: 'Summons Invested:' })}
					</span>
					{gain.invested}
					<span class="sr-only">
						{gain.win ? tr({ zh: '(UP没歪)', en: '(50/50 win)' }) : ''}
					</span>
				</p>
			</li>
		{:else}
			<li class="text-gray-500 text-center border-0 col-span-full p-4">
				{tr({ zh: '无数据', en: 'No Data' })}
			</li>
		{/each}
	</ol>
</section>

<style lang="postcss">
	@reference '$lib/styles/index.css';

	@layer components {
		.gains {
			@apply grid grid-cols-5;

			li:not(.empty) {
				@apply border-r border-b border-gray-300;
			}

			li:nth-child(5n) {
				@apply border-r-0;
			}

			/* https://keithclark.co.uk/articles/targeting-first-and-last-rows-in-css-grid-layouts/ */
			li:nth-child(5n+1):nth-last-child(-n+5),
			li:nth-child(5n+1):nth-last-child(-n+5) ~ li {
				@apply border-b-0;
			}

			.count {
				@apply flex justify-center items-center gap-0.5;

				&::before {
					@apply border-l;
				}

				&::after {
					@apply border-r;
				}

				&::before, &::after {
					content: '';
					@apply w-1 h-4;
					@apply border-gray-300 border-y;
				}

				&.up::before, &.up::after {
					@apply border-amber-500;
				}
			}
		}
	}
</style>
