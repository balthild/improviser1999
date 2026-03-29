<script lang="ts">
	import { liveQuery } from 'dexie';
	import { SvelteMap } from 'svelte/reactivity';
	import * as v from 'valibot';

	import { idb } from '$lib/idb';
	import { validate } from '$lib/template/validate.svelte';
	import { distinct } from '$lib/utils';

	import { doImport } from './import';
	import { ImportUrlScheme, QUERY_SUMMON_URL_BASE } from './validation';

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

	const poolTypes = $derived(distinct($summons?.map((it) => it.record.poolType)).sort());
	const poolNames = $derived.by(() => {
		const names = new SvelteMap<number, string>();

		for (const summon of $summons ?? []) {
			if (!names.has(summon.record.poolType)) {
				names.set(summon.record.poolType, summon.record.poolName);
			}
		}

		return names;
	});

	let currentUserId = $state('');
	let currentPoolType = $state(0);

	// looks like an anti-pattern but it works as for now ¯\_(ツ)_/¯
	$effect(() => {
		if (!currentUserId && userIds.length > 0) {
			currentUserId = userIds[0];
		}

		if (!currentPoolType && poolTypes.length > 0) {
			currentPoolType = poolTypes[0];
		}
	});

	const currentPoolRecords = $derived.by(() => {
		if (!$summons) return [];
		return $summons
			.filter((it) => it.userId === currentUserId && it.record.poolType === currentPoolType)
			.map((it) => it.record);
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

<section class="flex flex-row gap-4">
	<aside class="w-50 space-y-3">
		<select class="input block w-full" bind:value={currentUserId}>
			{#each userIds as userId (userId)}
				<option value={userId}>{userId}</option>
			{/each}
		</select>

		{#each poolTypes as poolType (poolType)}
			<button
				class="pool block w-full text-left"
				class:active={poolType === currentPoolType}
				onclick={() => (currentPoolType = poolType)}
			>
				<p class="text-lg font-semibold">20/70</p>
				<p class="text-xs font-medium">6✦ 保底</p>
				<p class="text-sm font-medium mt-2 mb-px">{poolNames.get(poolType)}</p>
			</button>
		{/each}
	</aside>

	<main>
		<pre>{JSON.stringify(currentPoolRecords, null, 2)}</pre>
	</main>
</section>

<style lang="postcss">
	@reference '$lib/styles/index.css';

	.pool {
		@apply border border-dashed border-gray-400/60 hover:border-gray-400 rounded-xs;
		/* @apply bg-white; */
		@apply px-3 py-2;
		@apply cursor-pointer;
		@apply transition-colors;

		&.active {
			@apply border-solid border-gray-400 bg-white/50;
			@apply cursor-default;
		}
	}
</style>
