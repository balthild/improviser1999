<script lang="ts">
	import { liveQuery } from 'dexie';
	import { untrack } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import * as v from 'valibot';

	import Rarity from '$lib/components/rarity.svelte';
	import { idb, type Summon } from '$lib/idb';
	import { validate } from '$lib/template/validate.svelte';
	import { distinct } from '$lib/utils';

	import { doImport } from './import';
	import { ImportUrlScheme, QUERY_SUMMON_URL_BASE } from './validation';

	const { data } = $props();
	const uniqueId = $props.id();

	let importUrl = $state('');
	let importFull = $state(false);

	const handleImport = async (event: Event) => {
		event.preventDefault();
		const count = await doImport(importUrl, importFull);
		alert(`导入完成，新增 ${count} 条记录`);
	};

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
		const names = new SvelteMap<number, string>();
		for (const summon of $rawSummons ?? []) {
			if (!names.has(summon.record.poolType)) {
				names.set(summon.record.poolType, summon.record.poolName);
			}
		}

		return names;
	});

	let selectedUserId = $state('');
	let selectedPoolType = $state(0);

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
		id: number;
		time: string;
		name: string;
		rarity: number;
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
				})),
			);
		}

		return gains;
	});

	const poolPities6 = $derived.by(() => {
		const pities = new SvelteMap<number, number>();
		for (const [pool, gain] of poolGains.entries()) {
			const pity = gain.findIndex((it) => it.rarity === 6);
			pities.set(pool, pity === -1 ? gain.length : pity);
		}

		return pities;
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
	const pastGains6 = $derived(calculatePastGain(gains, 6));
	const pastGains5 = $derived(calculatePastGain(gains, 5));
	const pastGains = $derived({ 6: pastGains6, 5: pastGains5 }[selectedRarity]);

	const count6 = $derived(gains.filter((it) => it.rarity === 6).length ?? 0);
	const count5 = $derived(gains.filter((it) => it.rarity === 5).length ?? 0);
	const count4 = $derived(gains.filter((it) => it.rarity === 4).length ?? 0);

	const average6 = $derived.by(() => {
		const total = pastGains6.reduce((sum, it) => sum + it.invested, 0);
		return total / count6;
	});

	const average5 = $derived.by(() => {
		const total = pastGains5.reduce((sum, it) => sum + it.invested, 0);
		return total / count5;
	});
</script>

<section class="mb-3 flex flex-row justify-between items-center">
	<h2 class="text-xl font-medium">征集记录</h2>
	<button class="btn" popovertarget={`popover-import-${uniqueId}`}>
		导入
	</button>
</section>

<form
	id={`popover-import-${uniqueId}`}
	class="mb-3 p-2 border border-gray-300 w-80 rounded-sm mt-2 shadow-lg"
	style:position-area="bottom span-left"
	onsubmit={handleImport}
	popover
>
	<label>
		<p class="mb-1 text-sm font-medium text-gray-600">地址</p>
		<textarea
			name="url"
			bind:value={importUrl}
			rows="4"
			class="input block w-full flex-1 resize-none break-all"
			placeholder={`${QUERY_SUMMON_URL_BASE}?userId=...`}
			use:validate={v.message(ImportUrlScheme, '地址无效')}
			autocomplete="off"
			// I have no clue why 1password show username suggestions here
			data-1p-ignore
		></textarea>
	</label>

	<div class="flex flex-row items-center justify-between gap-2 mt-2">
		<label class="flex items-center gap-1.25">
			<input type="checkbox" name="full" bind:checked={importFull} />
			<span class="text-sm">全量更新</span>
		</label>
		<button class="btn btn-accent">确认</button>
	</div>
</form>

<section class="flex flex-row items-start gap-4">
	<aside class="w-50 space-y-3">
		<select class="input block w-full px-3 py-1.5" bind:value={selectedUserId}>
			{#each userIds as userId (userId)}
				<option value={userId}>{userId}</option>
			{/each}
		</select>

		{#each poolTypes as poolType (poolType)}
			<button
				class="pool block w-full text-left"
				class:active={poolType === selectedPoolType}
				onclick={() => (selectedPoolType = poolType)}
			>
				<p class="text-lg font-semibold">{poolPities6.get(poolType)}&ThinSpace;/&ThinSpace;70</p>
				<p class="text-xs font-medium"><Rarity rarity={6} /> 保底</p>
				<p class="text-sm font-medium mt-2 mb-px">{poolNames.get(poolType)}</p>
			</button>
		{/each}
	</aside>

	<main class="flex-1 grid grid-cols-2 gap-4">
		<section class="panel">
			<h3 class="truncate text-ml font-semibold mb-2">
				{poolNames.get(selectedPoolType) ?? '暂无数据'}
			</h3>

			<dl class="space-y-1 text-sm tabular-nums">
				<div class="flex justify-between">
					<dt>总计征集次数</dt>
					<dd class="font-medium">{gains.length}</dd>
				</div>
				<div class="flex justify-between">
					<dt><Rarity rarity={6} /> 获取次数</dt>
					<dd class="font-medium">{count6}</dd>
				</div>
				<div class="flex justify-between">
					<dt><Rarity rarity={5} /> 获取次数</dt>
					<dd class="font-medium">{count5}</dd>
				</div>
				<div class="flex justify-between">
					<dt><Rarity rarity={4} /> 获取次数</dt>
					<dd class="font-medium">{count4}</dd>
				</div>
			</dl>
		</section>

		<section class="panel">
			<h3 class="truncate text-ml font-semibold mb-2">运气指标</h3>

			<dl class="space-y-1 text-sm tabular-nums">
				<div class="flex justify-between">
					<dt><Rarity rarity={6} /> 平均征集次数</dt>
					<dd class="font-medium">{isNaN(average6) ? '无数据' : average6.toFixed(2)}</dd>
				</div>
				<div class="flex justify-between">
					<dt><Rarity rarity={5} /> 平均征集次数</dt>
					<dd class="font-medium">{isNaN(average5) ? '无数据' : average5.toFixed(2)}</dd>
				</div>
			</dl>
		</section>

		<section class="border border-gray-300 bg-white/50 col-span-2">
			<header class="flex flex-row items-stretch text-ms border-b border-gray-300">
				<button
					class="py-1.25 flex-1 cursor-pointer"
					class:bg-stripe={selectedRarity === 6}
					class:bg-gray-50={selectedRarity === 6}
					onclick={() => (selectedRarity = 6)}
				>
					<Rarity rarity={6} class="-mr-px" />
				</button>
				<div class="border-r border-gray-300"></div>
				<button
					class="py-1.25 flex-1 cursor-pointer"
					class:bg-stripe={selectedRarity === 5}
					class:bg-gray-50={selectedRarity === 5}
					onclick={() => (selectedRarity = 5)}
				>
					<Rarity rarity={5} class="-mr-px" />
				</button>
			</header>
			<ol class="gains min-h-8">
				{#each pastGains as gain (gain.key)}
					<li class="flex flex-col items-center p-2 pb-4">
						<div class="aspect-4/7 m-[12%] mb-0 border border-gray-200 bg-gray-50 bg-stripe rounded-t-full overflow-hidden">
							<img
								src="https://cdn.jsdelivr.net/gh/myssal/Reverse-1999-CN-Asset/singlebg/headicon_middle/{gain.id}01.png"
								alt={gain.name}
								class=""
							/>
						</div>
						<p class="text-ml font-medium text-gray-600 mt-3">{gain.name}</p>
						<p class="text-sm font-normal">({gain.invested})</p>
					</li>
				{:else}
					<li class="text-gray-500 text-center border-0 col-span-full p-4">无数据</li>
				{/each}
			</ol>
		</section>
	</main>
</section>

<style lang="postcss">
	@reference '$lib/styles/index.css';

	@layer components {
		.pool {
			@apply border border-dashed border-gray-400/60 hover:border-gray-400 rounded-xs;
			@apply px-3 py-2;
			@apply cursor-pointer;
			@apply transition-colors;

			&.active {
				@apply border-solid border-gray-400/80 bg-white/50;
				@apply cursor-default;
			}
		}

		.panel {
			@apply px-3.5 py-3;
			@apply border border-gray-300 bg-white/50;
			@apply rounded-xs;
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
		}
	}
</style>
