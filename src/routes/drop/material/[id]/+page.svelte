<script lang="ts">
	import { compareVersions } from 'compare-versions';

	import { resolve } from '$app/paths';

	import { createSorter } from '$lib/components/parts/sorting.svelte';
	import Rarity from '$lib/components/rarity.svelte';
	import Translation from '$lib/components/translation.svelte';
	import { commonStageKey, parseLevelReportKey } from '$lib/data';
	import { tr } from '$lib/i18n.svelte';
	import type { Stage } from '$lib/types/dataset';
	import type { CommonStageKey, MaterialId, StageId } from '$lib/types/primitive';
	import { keyBy, percent } from '$lib/utils';

	let { params, data } = $props();

	const material = $derived(data.materials[params.id as unknown as MaterialId]);

	const stages: Record<CommonStageKey, Stage> = $derived(
		keyBy(Object.values(data.stages), (stage) =>
			commonStageKey(stage.chapter, stage.episode, stage.difficulty),
		),
	);

	interface StageStat {
		id: StageId;
		stage: Stage;
		version: string;
		cost: number;
		samples: number;
		drops: number;
		expectDropRate: number;
		expectItemCost: number;
	}

	const stats = $derived.by(() => {
		const stats: Record<string, StageStat> = {};

		for (const [key, report] of Object.entries(data.drops.data.levelReport)) {
			const parsed = parseLevelReportKey(key);
			if (!parsed) {
				console.warn(`Unexpected key: ${key}`);
				continue;
			}

			const version = stats[parsed.stage]?.version ?? '0';
			if (compareVersions(parsed.version, version) < 0) {
				continue;
			}

			const stage = stages[parsed.stage];
			if (!stage) {
				console.warn(`Unknown stage: ${parsed.stage}`);
				continue;
			}

			const drops = report.drops[params.id as unknown as MaterialId];
			if (!drops) continue;

			const expectDropRate = drops / report.count;
			const expectItemCost = report.cost / expectDropRate;

			stats[parsed.stage] = {
				id: stage.id,
				stage,
				version: parsed.version,
				cost: report.cost,
				samples: report.count,
				drops,
				expectDropRate,
				expectItemCost,
			};
		}

		return Object.values(stats);
	});

	type SortKey = 'expectItemCost' | 'expectDropRate' | 'cost' | 'samples' | 'drops';
	const sorter = createSorter<SortKey>('expectItemCost');
	const sorted = $derived(sorter.sort(stats));
</script>

<section class="px-4 pb-2 pt-16 border-b border-gray-300">
	<h3>
		<span class="text-2xl font-medium">{tr(material.name)}</span>
		<Rarity rarity={material.rarity} class="text-ms font-normal ml-2" />
	</h3>
</section>

<table class="table w-full">
	<thead>
		<tr>
			<th>{tr({ zh: '关卡', en: 'Stage' })}</th>
			<th class="sortable" use:sorter.th={'cost'}>
				<button>{tr({ zh: '活性', en: 'CellAct' })}</button>
			</th>
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
				<button>{tr({ zh: '单件期望活性', en: 'CellAct per Item' })}</button>
			</th>
		</tr>
	</thead>
	<tbody>
		{#each sorted as stat (stat.id)}
			<tr>
				<td>
					<a href={resolve(`/drop/stage/${stat.id}`)} class="flex items-center gap-1">
						<span>{stat.stage.chapter}-{stat.stage.episode}</span>
						<span class:text-red-800={stat.stage.difficulty === '厄险'}>
							<Translation
								zh={{ 普通: '故事', 厄险: '厄险' }[stat.stage.difficulty] ?? stat.stage.difficulty}
								en={{ 普通: 'Story', 厄险: 'Hard' }[stat.stage.difficulty] ?? stat.stage.difficulty}
							/>
						</span>
						<span class="icon-[ri--link-m] text-gray-400 [:hover>&]:text-gray-600"></span>
					</a>
				</td>
				<td>{stat.cost}</td>
				<td>{stat.samples}</td>
				<td>{stat.drops}</td>
				<td>{percent(stat.expectDropRate)}</td>
				<td>{stat.expectItemCost.toFixed(2)}</td>
			</tr>
		{:else}
			<tr>
				<td colspan="6" class="text-center text-gray-500 py-4">
					{tr({ zh: '无数据', en: 'No Data' })}
				</td>
			</tr>
		{/each}
	</tbody>
</table>
