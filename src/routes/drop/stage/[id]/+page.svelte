<script lang="ts">
	import { compareVersions } from 'compare-versions';
	import type { Action } from 'svelte/action';
	import { on } from 'svelte/events';

	import { resolve } from '$app/paths';

	import { parseLevelReportKey, renderChapterNum } from '$lib/data';
	import type { MaterialId, StageId } from '$lib/types/primitive';

	let { params, data } = $props();

	const stage = $derived(data.stages[params.id as unknown as StageId]);
	const title = $derived(data.chapters[stage.chapter].episodes[stage.episode].title);

	interface MaterialStat {
		id: MaterialId;
		name: string;
		samples: number;
		drops: number;
		expectDropRate: number;
		expectItemCost: number;
	}

	const stats = $derived.by(() => {
		let version = '0';
		let stats: MaterialStat[] = [];

		for (const [key, report] of Object.entries(data.drops.data.levelReport)) {
			const parsed = parseLevelReportKey(key);
			if (!parsed) {
				console.warn(`Unexpected key: ${key}`);
				continue;
			}

			if (parsed.chapter !== stage.chapter) continue;
			if (parsed.episode !== stage.episode) continue;
			if (parsed.difficulty !== stage.difficulty) continue;

			if (compareVersions(version, parsed.version) > 0) {
				continue;
			}

			version = parsed.version;
			stats = Object.entries(report.drops).map(([id, drops]) => {
				const materialId = Number(id) as unknown as MaterialId;
				const expectDropRate = drops / report.count;
				const expectItemCost = report.cost / expectDropRate;
				return {
					id: materialId,
					name: data.materials[materialId].name,
					samples: report.count,
					drops,
					expectDropRate,
					expectItemCost,
				};
			});
		}

		return stats!;
	});

	type SortKey = 'expectItemCost' | 'expectDropRate' | 'drops' | 'samples';
	let sortKey: SortKey = $state('expectItemCost');
	let sortAsc = $state(true);

	const sorted = $derived.by(() => {
		return stats.toSorted((left, right) => {
			const sign = sortAsc ? 1 : -1;
			return sign * (left[sortKey] - right[sortKey]);
		});
	});

	const sorting: Action<HTMLElement, SortKey> = (el, key) => {
		$effect(() => {
			return on(el, 'click', () => {
				if (sortKey === key) {
					sortAsc = !sortAsc;
				} else {
					sortKey = key;
					sortAsc = true;
				}
			});
		});

		$effect(() => {
			el.classList.toggle('asc', sortKey === key && sortAsc);
			el.classList.toggle('desc', sortKey === key && !sortAsc);
		});
	};
</script>

<section class="px-4 pb-2 pt-7 border-b border-gray-300">
	<h3 class="pt-px">
		<span class="text-2xl font-medium">
			{renderChapterNum(stage.chapter)}-{stage.episode.toString().padStart(2, '0')}
			{stage.difficulty}
		</span>
		<span class="text-ms font-normal ml-4">{title.zh}</span>
	</h3>
</section>

<table class="table w-full">
	<thead>
		<tr>
			<th><span>关卡</span></th>
			<th class="sortable" use:sorting={'samples'}><span>样本数</span></th>
			<th class="sortable" use:sorting={'drops'}><span>掉落数</span></th>
			<th class="sortable" use:sorting={'expectDropRate'}><span>掉落率</span></th>
			<th class="sortable" use:sorting={'expectItemCost'}><span>单件期望活性</span></th>
		</tr>
	</thead>
	<tbody>
		{#each sorted as stat (stat.name)}
			<tr>
				<td>
					<a href={resolve(`/drop/material/${stat.id}`)} class="inline-flex items-center gap-1">
						{stat.name}
						<span class="icon-[ri--link-m] text-gray-400 [:hover>&]:text-gray-600"></span>
					</a>
				</td>
				<td>{stat.samples}</td>
				<td>{stat.drops}</td>
				<td>{(stat.expectDropRate * 100).toFixed(2)}%</td>
				<td>{stat.expectItemCost.toFixed(2)}</td>
			</tr>
		{/each}
	</tbody>
</table>
