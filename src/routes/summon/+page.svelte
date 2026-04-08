<script lang="ts">
	import { liveQuery } from 'dexie';
	import { untrack } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';

	import Rarity from '$lib/components/rarity.svelte';
	import { tr } from '$lib/i18n.svelte';
	import { idb } from '$lib/idb';
	import type { Summon } from '$lib/idb';
	import type { PoolsDataset } from '$lib/types/dataset';
	import type { ArcanistId, PoolId, PoolTypeId } from '$lib/types/primitive';
	import { distinct } from '$lib/utils';

	import type { Snapshot } from './$types';
	import Import from './import.svelte';

	const { data } = $props();

	let importDialog: HTMLDialogElement;

	const rawSummons = liveQuery(() => idb.summons.orderBy('record.createTime').reverse().toArray());

	const userIds = $derived(distinct($rawSummons?.map((it) => it.userId)).sort());

	const userSummons = $derived.by(() => {
		const summons = new SvelteMap(userIds.map((id) => [id, [] as Summon[]]));
		for (const summon of $rawSummons ?? []) {
			summons.get(summon.userId)!.push(summon);
		}

		return summons;
	});

	// TODO: sort in predefined order
	const poolTypes = $derived(distinct($rawSummons?.map((it) => it.record.poolType)));

	const poolNames = $derived.by(() => {
		const names = new SvelteMap<PoolTypeId, { zh: string; en: string }>();

		for (const summon of $rawSummons ?? []) {
			if (!names.has(summon.record.poolType)) {
				const name = data.pools[summon.record.poolId]?.name ?? {
					zh: summon.record.poolName,
					en: summon.record.poolName,
				};

				names.set(summon.record.poolType, name);
			}
		}

		return names;
	});

	let selectedUserId = $state('');
	let selectedPoolType = $state(0 as PoolTypeId);

	// looks like an anti-pattern but it works as for now ¯\_(ツ)_/¯
	$effect(() => {
		if (!userIds.includes(untrack(() => selectedUserId))) {
			selectedUserId = userIds[0];
		}

		if (!poolTypes.includes(untrack(() => selectedPoolType))) {
			selectedPoolType = poolTypes[0];
		}
	});

	interface Gain {
		key: string;
		id: ArcanistId;
		time: string;
		name: { zh: string; en: string };
		rarity: number;
		pool?: PoolsDataset[PoolId];
	}

	interface PastGain extends Gain {
		invested: number;
	}

	const poolGains = $derived.by(() => {
		const gains = new SvelteMap(poolTypes.map((type) => [type, [] as Gain[]]));

		for (const summon of userSummons.get(selectedUserId) ?? []) {
			gains.get(summon.record.poolType)!.push(
				...summon.record.gainIds.toReversed().map((gainId, index) => ({
					key: `${summon.id},${index}`,
					id: gainId,
					time: summon.record.createTime,
					name: data.arcanists[gainId].name,
					rarity: data.arcanists[gainId].rarity,
					pool: data.pools[summon.record.poolId],
				})),
			);
		}

		return gains;
	});

	const poolInvested6 = $derived.by(() => {
		const invested = new SvelteMap<PoolTypeId, number>();
		for (const [pool, gain] of poolGains.entries()) {
			const pity = gain.findIndex((it) => it.rarity === 6);
			invested.set(pool, pity === -1 ? gain.length : pity);
		}

		return invested;
	});

	const gains = $derived(poolGains.get(selectedPoolType) ?? []);

	const calculatePastGain = (gains: Gain[], rarity: number) => {
		let last = -1;
		const past: PastGain[] = [];

		for (const [index, gain] of gains.toReversed().entries()) {
			if (gain.rarity === rarity) {
				past.push({ ...gain, invested: index - last });
				last = index;
			}
		}

		return past.reverse();
	};

	let selectedRarity: 6 | 5 = $state(6);
	const pastGains = $derived({
		6: calculatePastGain(gains, 6),
		5: calculatePastGain(gains, 5),
	});

	const count6 = $derived(gains.filter((it) => it.rarity === 6).length ?? 0);
	const count5 = $derived(gains.filter((it) => it.rarity === 5).length ?? 0);
	const count4 = $derived(gains.filter((it) => it.rarity === 4).length ?? 0);

	const average6 = $derived.by(() => {
		const total = pastGains[6].reduce((sum, it) => sum + it.invested, 0);
		return total / count6;
	});

	const average5 = $derived.by(() => {
		const total = pastGains[5].reduce((sum, it) => sum + it.invested, 0);
		return total / count5;
	});

	export const snapshot: Snapshot<[string, PoolTypeId]> = {
		capture: () => {
			return [selectedUserId, selectedPoolType];
		},
		restore: (value) => {
			[selectedUserId, selectedPoolType] = value ?? [];
		},
	};
</script>

<dialog closedby="any" class="dialog w-160 h-120" bind:this={importDialog}>
	<Import onclose={() => importDialog.close()} />
</dialog>

<section
	class="grid grid-cols-2 h-full"
	style:grid-template-columns="max-content 1fr"
	style:grid-template-rows="max-content 1fr"
>
	<select class="px-3 py-0 text-sm border-0 bg-transparent a11y-ring" bind:value={selectedUserId}>
		{#each userIds as userId (userId)}
			<option value={userId}>{userId}</option>
		{/each}
	</select>

	<div class="flex flex-row items-stretch justify-end border-l border-gray-300">
		<button class="btn btn-inlay border-l" onclick={() => importDialog.showModal()}>
			{tr({ zh: '导入', en: 'Import' })}
		</button>
	</div>

	<aside class="w-50 pb-4 border-t border-gray-300">
		{#each poolTypes as poolType (poolType)}
			<button
				class="pool block w-full text-left"
				class:active={poolType === selectedPoolType}
				onclick={() => (selectedPoolType = poolType)}
			>
				<p class="text-lg font-semibold">
					{poolInvested6.get(poolType)}&ThinSpace;/&ThinSpace;{poolType === 2 ? 30 : 70}
				</p>
				<p class="text-xs font-medium"><Rarity rarity={6} /> {tr({ zh: '保底', en: 'Pity' })}</p>
				<p class="text-sm font-medium mt-2 mb-px">{tr(poolNames.get(poolType)!)}</p>
			</button>
		{:else}
			<button class="pool block w-full text-left">
				<p class="text-lg font-semibold">0&ThinSpace;/&ThinSpace;70</p>
				<p class="text-xs font-medium"><Rarity rarity={6} /> {tr({ zh: '保底', en: 'Pity' })}</p>
				<p class="text-sm font-medium mt-2 mb-px">{tr({ zh: '暂无数据', en: 'No Data' })}</p>
			</button>
		{/each}
	</aside>

	<main class="pb-4 border-l border-t border-gray-300">
		<section class="flex items-stretch">
			<div class="flex-1 p-3">
				<h3 class="truncate text-ml font-semibold mb-2">
					{tr(poolNames.get(selectedPoolType) ?? { zh: '暂无数据', en: 'No Data' })}
				</h3>

				<dl class="space-y-1 text-sm tabular-nums">
					<div class="flex justify-between">
						<dt>{tr({ zh: '总计征集次数', en: 'Total Summons' })}</dt>
						<dd class="font-medium">{gains.length}</dd>
					</div>
					<div class="flex justify-between">
						<dt><Rarity rarity={6} /> {tr({ zh: '获取次数', en: 'Gains' })}</dt>
						<dd class="font-medium">{count6}</dd>
					</div>
					<div class="flex justify-between">
						<dt><Rarity rarity={5} /> {tr({ zh: '获取次数', en: 'Gains' })}</dt>
						<dd class="font-medium">{count5}</dd>
					</div>
					<div class="flex justify-between">
						<dt><Rarity rarity={4} /> {tr({ zh: '获取次数', en: 'Gains' })}</dt>
						<dd class="font-medium">{count4}</dd>
					</div>
				</dl>
			</div>
			<div class="border-r border-gray-300"></div>
			<div class="flex-1 p-3">
				<h3 class="truncate text-ml font-semibold mb-2">
					{tr({ zh: '运气指标', en: 'Luck Metrics' })}
				</h3>

				<dl class="space-y-1 text-sm tabular-nums">
					<div class="flex justify-between">
						<dt><Rarity rarity={6} /> {tr({ zh: '平均征集次数', en: 'Average Summons' })}</dt>
						<dd class="font-medium">
							{isNaN(average6) ? tr({ zh: '无数据', en: 'No Data' }) : average6.toFixed(2)}
						</dd>
					</div>
					<div class="flex justify-between">
						<dt><Rarity rarity={5} /> {tr({ zh: '平均征集次数', en: 'Average Summons' })}</dt>
						<dd class="font-medium">
							{isNaN(average5) ? tr({ zh: '无数据', en: 'No Data' }) : average5.toFixed(2)}
						</dd>
					</div>
				</dl>
			</div>
		</section>

		<div class="h-2.5 border-t border-gray-300 bg-stripe"></div>

		<section class="border-t border-b border-gray-300 bg-white/50 col-span-2">
			<header class="flex flex-row items-stretch text-ms border-b border-gray-300 p-1 gap-1">
				{#each [6, 5] as const as rarity (rarity)}
					{@const selected = selectedRarity === rarity}
					<button
						class="py-1 flex-1 cursor-pointer rounded-xs ring-inset ring-gray-200"
						class:ring-1={selected}
						class:bg-gray-100={selected}
						onclick={() => (selectedRarity = rarity)}
					>
						<Rarity rarity={rarity} class={['-mr-px', !selected && 'text-neutral-400']} />
					</button>
				{/each}
			</header>

			<ol class="gains min-h-8">
				{#each pastGains[selectedRarity] as gain (gain.key)}
					{@const up = new Set(gain.pool?.arcanists?.[`up${selectedRarity}`])}

					<li class="flex flex-col items-center p-2 pb-4 relative">
						<div class="aspect-4/7 m-[12%] mb-0 border border-gray-200 bg-gray-50 bg-stripe rounded-t-full overflow-hidden">
							<img
								src="https://cdn.jsdelivr.net/gh/myssal/Reverse-1999-CN-Asset/singlebg/headicon_middle/{gain.id}01.png"
								alt={tr(gain.name)}
							/>
						</div>

						<p class="font-medium text-gray-600 mt-3">{tr(gain.name)}</p>
						<p class="count text-sm text-gray-600" class:up={up.has(gain.id)}>
							{gain.invested}
						</p>
					</li>
				{:else}
					<li class="text-gray-500 text-center border-0 col-span-full p-4">
						{tr({ zh: '无数据', en: 'No Data' })}
					</li>
				{/each}
			</ol>
		</section>
	</main>
</section>

<style lang="postcss">
	@reference '$lib/styles/index.css';

	@layer components {
		.pool {
			@apply border-b border-gray-300;
			@apply px-3 py-2;
			@apply a11y-ring;
			@apply cursor-pointer;
			@apply transition-colors;

			&.active {
				@apply bg-white/50;
				@apply cursor-default;
			}
		}

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
				@apply flex items-center gap-0.5;

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
