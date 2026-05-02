<script lang="ts">
	import { liveQuery } from 'dexie';
	import { untrack } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';

	import { expand } from '$lib/components/parts/expand.svelte';
	import Rarity from '$lib/components/rarity.svelte';
	import { dummyArcanist, dummyPool } from '$lib/data';
	import { tr } from '$lib/i18n.svelte';
	import { idb } from '$lib/idb';
	import type { GameUserId, PoolTypeId } from '$lib/types/primitive';
	import { distinct } from '$lib/utils';

	import type { Snapshot } from './$types';
	import type { Gain } from './history.svelte';
	import History from './history.svelte';
	import Import from './import.svelte';

	const { data } = $props();

	let importButton: HTMLButtonElement;
	let importDialog: HTMLDialogElement;

	const rawSummons = liveQuery(() => idb.summons.orderBy('record.createTime').toArray());

	const userIds = $derived(distinct($rawSummons?.map((it) => it.userId)).sort());

	// TODO: sort in predefined order
	const poolTypes = $derived(distinct($rawSummons?.map((it) => it.record.poolType)).reverse());

	const poolNames = $derived.by(() => {
		const result = new SvelteMap<PoolTypeId, { zh: string; en: string }>();

		for (const summon of $rawSummons ?? []) {
			const name = data.pools[summon.record.poolId]?.name ?? {
				zh: summon.record.poolName,
				en: summon.record.poolName,
			};

			result.set(summon.record.poolType, name);
		}

		return result;
	});

	const history = $derived.by(() => {
		const result = new SvelteMap<GameUserId, SvelteMap<PoolTypeId, Gain[]>>(
			userIds.map((id) => [id, new SvelteMap(poolTypes.map((type) => [type, []]))]),
		);

		for (const summon of $rawSummons ?? []) {
			const { userId } = summon;
			const { poolId, poolType } = summon.record;

			const gains = result.get(userId)!.get(poolType)!;

			for (const [index, gainId] of summon.record.gainIds.entries()) {
				const arcanist = data.arcanists[gainId] ?? dummyArcanist({ id: gainId });
				const pool = data.pools[poolId] ?? dummyPool({ id: poolId, type: poolType });

				const last = gains.findLastIndex((it) => it.arcanist.rarity === arcanist.rarity);
				const invested = gains.length - last;

				const up = pool.arcanists?.[`up${arcanist.rarity as 6 | 5}`];
				const win = up?.includes(arcanist.id);

				gains.push({
					key: `${summon.id},${index}`,
					id: gainId,
					time: summon.record.createTime,
					arcanist,
					pool,
					invested,
					win,
				});
			}
		}

		for (const userGains of result.values()) {
			for (const poolGains of userGains.values()) {
				poolGains.reverse();
			}
		}

		return result;
	});

	let selectedUserId = $state('' as GameUserId);
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

	const invested6 = $derived.by(() => {
		const result = new SvelteMap<PoolTypeId, number>();

		for (const [pool, gains] of history.get(selectedUserId)?.entries() ?? []) {
			const index = gains.findIndex((it) => it.arcanist.rarity === 6);
			result.set(pool, index === -1 ? gains.length : index);
		}

		return result;
	});

	export const snapshot: Snapshot<[GameUserId, PoolTypeId]> = {
		capture: () => {
			return [selectedUserId, selectedPoolType];
		},
		restore: (value) => {
			[selectedUserId, selectedPoolType] = value ?? [];
		},
	};
</script>

<dialog
	closedby="any"
	class="dialog w-160 h-120"
	bind:this={importDialog}
	use:expand={() => importButton}
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
			{#each userIds as userId (userId)}
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
		{#each poolTypes as poolType (poolType)}
			<button
				class="pool block w-full text-left"
				class:active={poolType === selectedPoolType}
				onclick={() => (selectedPoolType = poolType)}
			>
				<p class="text-lg font-semibold">
					{invested6.get(poolType)}&ThinSpace;/&ThinSpace;{poolType === 2 ? 30 : 70}
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
		<History
			pool={tr(poolNames.get(selectedPoolType) ?? { zh: '未知', en: 'Unknown' })}
			gains={history.get(selectedUserId)?.get(selectedPoolType) ?? []}
		/>
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
	}
</style>
