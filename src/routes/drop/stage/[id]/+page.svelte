<script lang="ts">
	import { compareVersions } from 'compare-versions';

	import { resolve } from '$app/paths';

	import { createSorter } from '$lib/components/parts/sorting.svelte';
	import Translation from '$lib/components/translation.svelte';
	import { parseLevelReportKey, renderChapterNum } from '$lib/data';
	import { dummyMaterial } from '$lib/dummy';
	import { tr } from '$lib/i18n.svelte';
	import type { Material } from '$lib/types/dataset';
	import type { MaterialId, StageId } from '$lib/types/primitive';

	let { params, data } = $props();

	const stage = $derived(data.stages[params.id as unknown as StageId]);
	const episode = $derived(data.chapters[stage.chapter].episodes[stage.episode]);

	interface MaterialStat {
		material: Material;
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

			if (compareVersions(parsed.version, version) < 0) {
				continue;
			}

			version = parsed.version;
			stats = Object.entries(report.drops)
				.values()
				.map(([id, drops]) => {
					const materialId = Number(id) as unknown as MaterialId;
					return [materialId, drops] as const;
				})
				.filter(([id, drops]) => {
					if (!data.materials[id]) {
						console.warn(`Unknown material id: ${id}`);
					}
					return drops || stage.drops.includes(id);
				})
				.map(([id, drops]) => {
					const expectDropRate = drops / report.count;
					const expectItemCost = report.cost / expectDropRate;
					return {
						material: data.materials[id] ?? dummyMaterial({ id }),
						samples: report.count,
						drops,
						expectDropRate,
						expectItemCost,
					};
				})
				.toArray();
		}

		return stats!;
	});

	type SortKey = 'expectItemCost' | 'expectDropRate' | 'drops' | 'samples';
	const sorter = createSorter<SortKey>('expectItemCost');
	const sorted = $derived(sorter.sort(stats));
</script>

<section class="px-4 pb-2 pt-16 border-b border-gray-300">
	<h3 class="flex items-baseline gap-4">
		<span class="text-2xl font-medium">
			{renderChapterNum(stage.chapter)}-{stage.episode.toString().padStart(2, '0')}
			<Translation
				zh={stage.difficulty}
				en={{ 普通: 'Normal', 厄险: 'Hard' }[stage.difficulty] ?? stage.difficulty}
			/>
		</span>
		<span class="text-ms font-normal">{tr(episode.title)}</span>

		<span class="text-ms font-light text-gray-500 ml-auto">
			<span>{episode.year}/{episode.date.replace('.', '/')}</span>
			<span class="ml-2">{episode.time}</span>
		</span>
	</h3>
</section>

<table class="table w-full">
	<thead>
		<tr>
			<th>{tr({ zh: '关卡', en: 'Stage' })}</th>
			<th class="sortable" use:sorter.th={'samples'}>
				<button>{tr({ zh: '样本数', en: 'Samples' })}</button>
			</th>
			<th class="sortable" use:sorter.th={'drops'}>
				<button>{tr({ zh: '掉落数', en: 'Drops' })}</button>
			</th>
			<th class="sortable" use:sorter.th={'expectDropRate'}>
				<button>{tr({ zh: '掉落率', en: 'Drop Rate' })}</button>
			</th>
			<th class="sortable" use:sorter.th={'expectItemCost'}>
				<button>{tr({ zh: '单件期望活性', en: 'Cost per Item' })}</button>
			</th>
		</tr>
	</thead>
	<tbody>
		{#each sorted as stat (stat.material.id)}
			<tr>
				<td>
					<a href={resolve(`/drop/material/${stat.material.id}`)} class="flex items-center gap-1">
						{tr(stat.material.name)}
						<span class="icon-[ri--link-m] text-gray-400 [:hover>&]:text-gray-600"></span>
					</a>
				</td>
				<td>{stat.samples}</td>
				<td>{stat.drops}</td>
				<td>{(stat.expectDropRate * 100).toFixed(2)}%</td>
				<td>{stat.expectItemCost.toFixed(2)}</td>
			</tr>
		{:else}
			<tr>
				<td colspan="5" class="text-center text-gray-500 py-4">
					{tr({ zh: '无数据', en: 'No Data' })}
				</td>
			</tr>
		{/each}
	</tbody>
</table>
