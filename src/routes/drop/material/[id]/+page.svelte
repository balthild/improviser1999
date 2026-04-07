<script lang="ts">
	import { compareVersions } from 'compare-versions';
	import type { Action } from 'svelte/action';
	import { on } from 'svelte/events';

	import { resolve } from '$app/paths';

	import Rarity from '$lib/components/rarity.svelte';
	import { parseLevelReportKey } from '$lib/data';
	import { tr } from '$lib/i18n.svelte';
	import type { MaterialId, StageId } from '$lib/types/primitive';

	let { params, data } = $props();

	const material = $derived(data.materials[params.id as unknown as MaterialId]);

	const stageIdByName = $derived.by(() => {
		const stages: Record<string, StageId> = {};
		for (const [id, stage] of Object.entries(data.stages)) {
			const name = `${stage.chapter}-${stage.episode}${stage.difficulty}`;
			stages[name] = Number(id) as unknown as StageId;
		}

		return stages;
	});

	interface StageStat {
		id: StageId;
		name: string;
		chapter: number;
		episode: number;
		difficulty: string;
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

			const drops = report.drops[params.id as unknown as MaterialId];
			if (!drops) continue;

			const expectDropRate = drops / report.count;
			const expectItemCost = report.cost / expectDropRate;

			const version = stats[parsed.stage]?.version ?? '0';
			if (compareVersions(parsed.version, version) < 0) {
				continue;
			}

			stats[parsed.stage] = {
				id: stageIdByName[parsed.stage],
				name: parsed.stage,
				chapter: parsed.chapter,
				episode: parsed.episode,
				difficulty: parsed.difficulty,
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

<section class="px-4 pb-2 pt-16 border-b border-gray-300">
	<h3>
		<span class="text-2xl font-medium">{material.name}</span>
		<Rarity rarity={material.rarity} class="text-ms font-normal ml-2" />
	</h3>
</section>

<table class="table w-full">
	<thead>
		<tr>
			<th>{tr({ zh: '关卡', en: 'Stage' })}</th>
			<th class="sortable" use:sorting={'cost'}>
				<span>{tr({ zh: '活性', en: 'Cell Activity' })}</span>
			</th>
			<th class="sortable" use:sorting={'samples'}>
				<span>{tr({ zh: '样本数', en: 'Samples' })}</span>
			</th>
			<th class="sortable" use:sorting={'drops'}>
				<span>{tr({ zh: '掉落数', en: 'Drops' })}</span>
			</th>
			<th class="sortable" use:sorting={'expectDropRate'}>
				<span>{tr({ zh: '掉落率', en: 'Drop Rate' })}</span>
			</th>
			<th class="sortable" use:sorting={'expectItemCost'}>
				<span>{tr({ zh: '单件期望活性', en: 'Expected Cell Activity per Item' })}</span>
			</th>
		</tr>
	</thead>
	<tbody>
		{#each sorted as stat (stat.name)}
			<tr>
				<td>
					<a href={resolve(`/drop/stage/${stat.id}`)} class="inline-flex items-center gap-1">
						<span>{stat.chapter}-{stat.episode}</span>
						<span class:text-red-800={stat.difficulty === '厄险'}>{stat.difficulty}</span>
						<span class="icon-[ri--link-m] text-gray-400 [:hover>&]:text-gray-600"></span>
					</a>
				</td>
				<td>{stat.cost}</td>
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
