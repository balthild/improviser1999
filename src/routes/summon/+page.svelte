<script lang="ts">
	import { liveQuery } from 'dexie';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';
	import * as v from 'valibot';

	import { idb } from '$lib/idb';
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

	const summons = liveQuery(() => idb.summons.orderBy('record.createTime').reverse().toArray());

	const userIds = $derived(distinct($summons?.map((it) => it.userId)).sort());

	// TODO: sort in predefined order
	const poolTypes = $derived(distinct($summons?.map((it) => it.record.poolType)));

	const poolNames = $derived.by(() => {
		const names = new SvelteMap<number, string>();

		for (const summon of $summons ?? []) {
			if (!names.has(summon.record.poolType)) {
				names.set(summon.record.poolType, summon.record.poolName);
			}
		}

		return names;
	});

	const poolPities = $derived.by(() => {
		const pities = new SvelteMap<number, number>();
		const done = new SvelteSet<number>();

		for (const summon of $summons ?? []) {
			if (done.has(summon.record.poolType)) {
				continue;
			}

			let pity = pities.get(summon.record.poolType) ?? 0;

			for (const gainId of summon.record.gainIds.reverse()) {
				const arcanistId = String(gainId);
				if (data.arcanists[arcanistId].rarity < 6) {
					pity++;
					continue;
				} else {
					done.add(summon.record.poolType);
					break;
				}
			}

			pities.set(summon.record.poolType, pity);
		}

		return pities;
	});

	let selectedUserId = $state('');
	let selectedPoolType = $state(0);

	// looks like an anti-pattern but it works as for now ¯\_(ツ)_/¯
	$effect(() => {
		if (!selectedUserId && userIds.length > 0) {
			selectedUserId = userIds[0];
		}

		if (!selectedPoolType && poolTypes.length > 0) {
			selectedPoolType = poolTypes[0];
		}
	});

	const presenting = $derived.by(() => {
		return Iterator.from($summons ?? [])
			.filter((it) => it.userId === selectedUserId)
			.filter((it) => it.record.poolType === selectedPoolType)
			.flatMap((it) =>
				it.record.gainIds.reverse().map((gainId) => {
					const arcanistId = String(gainId);
					return {
						time: it.record.createTime,
						name: data.arcanists[arcanistId].name,
						rarity: data.arcanists[arcanistId].rarity,
					};
				}),
			)
			.toArray();
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
				<p class="text-lg font-semibold">{poolPities.get(poolType)}&ThinSpace;/&ThinSpace;70</p>
				<p class="text-xs font-medium"><span class="rarity-6">6✦</span> 保底</p>
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
					<dd class="font-medium">{presenting.length}</dd>
				</div>
				<div class="flex justify-between">
					<dt><span class="rarity-6">6✦</span> 获取次数</dt>
					<dd class="font-medium">{presenting.filter((it) => it.rarity === 6).length}</dd>
				</div>
				<div class="flex justify-between">
					<dt><span class="rarity-5">5✦</span> 获取次数</dt>
					<dd class="font-medium">{presenting.filter((it) => it.rarity === 5).length}</dd>
				</div>
				<div class="flex justify-between">
					<dt><span class="rarity-4">4✦</span> 获取次数</dt>
					<dd class="font-medium">{presenting.filter((it) => it.rarity === 4).length}</dd>
				</div>
			</dl>
		</section>

		<section class="panel">
			<h3 class="truncate text-ml font-semibold mb-2">运气指标</h3>

			<dl class="space-y-1 text-sm tabular-nums">
				<div class="flex justify-between">
					<dt><span class="rarity-6">6✦</span> 平均征集次数</dt>
					<dd class="font-medium">TODO</dd>
				</div>
				<div class="flex justify-between">
					<dt><span class="rarity-5">5✦</span> 平均征集次数</dt>
					<dd class="font-medium">TODO</dd>
				</div>
			</dl>
		</section>

		<section class="panel col-span-2">
			<pre class="text-sm">{JSON.stringify(presenting, null, 2)}</pre>
		</section>
	</main>
</section>

<style lang="postcss">
	@reference '$lib/styles/index.css';

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

	.rarity-6 {
		@apply text-amber-600;
		@apply tracking-wider;
	}

	.rarity-5 {
		color: color-mix(in oklch, var(--color-yellow-500), var(--color-black) 5%);
		@apply tracking-wider;
	}

	.rarity-4 {
		@apply text-violet-500;
		@apply tracking-wider;
	}
</style>
