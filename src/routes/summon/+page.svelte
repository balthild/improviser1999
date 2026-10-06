<script lang="ts">
	import { liveQuery } from 'dexie';
	import { untrack } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';

	import { snapshot } from '$app/navigation';

	import { expander } from '#lib/components/parts/aria.svelte';
	import Rarity from '#lib/components/rarity.svelte';
	import { dummyArcanist, dummyPool, isolatedPoolKey } from '#lib/data';
	import { tr } from '#lib/i18n';
	import { idb } from '#lib/idb';
	import type { Pool } from '#lib/types/dataset';
	import type { GameUserId, IsolatedPoolKey } from '#lib/types/primitive';
	import { compare, distinct } from '#lib/utils';

	import type { Gain } from './history.svelte';
	import History from './history.svelte';
	import Import from './import.svelte';

	const { data } = $props();

	let importButton: HTMLButtonElement;
	let importDialog: HTMLDialogElement;

	const rawSummons = liveQuery(() => idb.summons.orderBy('record.createTime').toArray());

	const allUserIds = $derived(distinct($rawSummons?.map((it) => it.userId)).sort());

	const allPoolKeys = $derived.by(() => {
		const info = new Map(
			$rawSummons?.map((it) => {
				const { poolId, poolType } = it.record;
				const key = isolatedPoolKey(poolId, poolType);
				const pool = data.pools[poolId] ?? dummyPool({ id: poolId, type: poolType });
				const info = {
					id: poolId,
					order: poolId === 2 ? 999 : pool.order,
				};
				return [key, info];
			}),
		);

		return Array.from(info.keys()).sort((left, right) => {
			const a = info.get(left)!;
			const b = info.get(right)!;
			return compare([a.order, b.order], [b.id, a.id]);
		});
	});

	const history = $derived.by(() => {
		const result = new SvelteMap<GameUserId, SvelteMap<IsolatedPoolKey, Gain[]>>(
			allUserIds.map((id) => [id, new SvelteMap()]),
		);

		for (const summon of $rawSummons ?? []) {
			const { userId } = summon;
			const { poolId, poolType, poolName } = summon.record;
			const poolKey = isolatedPoolKey(poolId, poolType);

			const pools = result.get(userId)!;
			const gains = pools.get(poolKey) ?? [];

			for (const [index, gainId] of summon.record.gainIds.entries()) {
				const arcanist = data.arcanists[gainId] ?? dummyArcanist({ id: gainId });
				const pool = data.pools[poolId] ?? dummyPool({ id: poolId, type: poolType, name: poolName });

				const last = gains.findLastIndex((it) => it.arcanist.rarity === arcanist.rarity);
				const invested = gains.length - last;

				const rarity = arcanist.rarity as 6 | 5;
				const up = pool.arcanists?.[`up${rarity}`]?.includes(arcanist.id);
				const win = up && (last == -1 ? true : gains[last].up);

				gains.push({
					key: `${summon.id},${index}`,
					id: gainId,
					time: summon.record.createTime,
					arcanist,
					pool,
					invested,
					up,
					win,
				});
			}

			if (gains.length > 0) {
				pools.set(poolKey, gains);
			}
		}

		for (const pools of result.values()) {
			for (const gains of pools.values()) {
				gains.reverse();
			}
		}

		return result;
	});

	let selectedUserId = $state('' as GameUserId);
	let selectedPoolKey = $state('' as IsolatedPoolKey);

	// do this rather than `pools.keys()` to maintain the order
	const investedPoolKeys = $derived.by(() => {
		const pools = history.get(selectedUserId);
		return allPoolKeys.filter((key) => pools?.has(key));
	});

	// looks like an anti-pattern but it works as for now ¯\_(ツ)_/¯
	$effect(() => {
		if (!allUserIds.includes(untrack(() => selectedUserId))) {
			selectedUserId = allUserIds[0];
		}

		if (!investedPoolKeys.includes(untrack(() => selectedPoolKey))) {
			selectedPoolKey = investedPoolKeys[0];
		}
	});

	type PoolCategory = 'all' | 'limited' | 'other';
	let selectedPoolCategory = $state<PoolCategory>('all');

	const filteredPoolKeys = $derived.by(() => {
		switch (selectedPoolCategory) {
			case 'limited':
				return investedPoolKeys.filter((key) => key.startsWith('id='));
			case 'other':
				return investedPoolKeys.filter((key) => key.startsWith('type='));
			default:
				return investedPoolKeys;
		}
	});

	const filteredPools = $derived.by(() => {
		const pools = history.get(selectedUserId);
		if (!pools) return new Map<IsolatedPoolKey, Pool>();

		return new Map(
			filteredPoolKeys.values().map((key) => {
				const [gain] = pools.get(key)!;
				return [key, gain.pool] as const;
			}),
		);
	});

	const invested6 = $derived.by(() => {
		const result = new SvelteMap<IsolatedPoolKey, number>();

		for (const [pool, gains] of history.get(selectedUserId)?.entries() ?? []) {
			const index = gains.findIndex((it) => it.arcanist.rarity === 6);
			result.set(pool, index === -1 ? gains.length : index);
		}

		return result;
	});

	snapshot({
		capture: () => {
			return [selectedUserId, selectedPoolKey] as const;
		},
		restore: (value) => {
			[selectedUserId, selectedPoolKey] = value ?? [];
		},
	});
</script>

<dialog
	closedby="any"
	class="dialog w-160 h-120"
	bind:this={importDialog}
	use:expander={() => importButton}
>
	<Import
		onopen={() => importDialog.showModal()}
		onclose={() => importDialog.close()}
	/>
</dialog>

<section
	class="grid grid-cols-2 h-full"
	style:grid-template-columns="max-content 1fr"
	style:grid-template-rows="max-content 1fr"
>
	<label class="flex justify-stretch">
		<span class="sr-only">{tr({ zh: '选择用户', en: 'Select User' })}</span>
		<select
			class="w-full px-3 py-0 text-sm border-0 bg-transparent a11y-ring"
			bind:value={selectedUserId}
		>
			{#each allUserIds as userId (userId)}
				<option value={userId}>{userId}</option>
			{/each}
		</select>
	</label>

	<div class="flex flex-row items-stretch justify-end border-l border-gray-300">
		<button
			class="btn btn-inlay border-l"
			onclick={() => importDialog.showModal()}
			aria-haspopup="dialog"
			aria-expanded="false"
			bind:this={importButton}
		>
			{tr({ zh: '导入', en: 'Import' })}
		</button>
	</div>

	<aside class="w-50 pb-4 border-t border-gray-300">
		<div class="text-xs py-1.75 px-2 border-b border-gray-300 flex gap-px" role="group">
			<label class="filter" class:active={selectedPoolCategory === 'all'}>
				<input type="radio" value="all" bind:group={selectedPoolCategory} />
				{tr({ zh: '全部', en: 'All' })}
			</label>
			<label class="filter" class:active={selectedPoolCategory === 'limited'}>
				<input type="radio" value="limited" bind:group={selectedPoolCategory} />
				{tr({ zh: '限定', en: 'Limited' })}
			</label>
			<label class="filter" class:active={selectedPoolCategory === 'other'}>
				<input type="radio" value="other" bind:group={selectedPoolCategory} />
				{tr({ zh: '其他', en: 'Other' })}
			</label>
		</div>

		{#each filteredPools as [key, pool] (key)}
			<button
				class="pool block w-full text-left"
				class:active={key === selectedPoolKey}
				onclick={() => (selectedPoolKey = key)}
			>
				<p class="text-lg font-semibold">
					{invested6.get(key)}&ThinSpace;/&ThinSpace;{key === `type=2` ? 30 : 70}
				</p>
				<p class="text-xs font-medium"><Rarity rarity={6} /> {tr({ zh: '保底', en: 'Pity' })}</p>
				<p class="text-sm font-medium mt-2 mb-px">{tr(pool.name)}</p>
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
		<History gains={history.get(selectedUserId)?.get(selectedPoolKey) ?? []} />
	</main>
</section>

<style lang="postcss">
	@reference '#lib/styles/index.css';

	@layer components {
		.filter {
			@apply font-medium;
			@apply px-1.25 py-0.5 rounded-xs;
			@apply cursor-pointer;
			@apply transition-colors;
			@apply a11y-ring;

			&:has(input:focus-visible) {
				@apply ring-1;
			}

			&.active {
				@apply bg-gray-500/25;
				@apply text-gray-900;
				@apply cursor-default;
			}

			input {
				@apply sr-only;
			}
		}

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
	}
</style>
