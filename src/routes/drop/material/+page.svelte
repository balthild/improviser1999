<script lang="ts">
	import { resolve } from '$app/paths';

	import Rarity from '$lib/components/rarity.svelte';
	import type { MaterialId } from '$lib/types/primitive';

	const { data } = $props();

	const shifts: Record<number, string> = {
		110501: '0 -0.05rem', // 清扫咒
		110702: '0.15rem 0', // 不休轮
		111002: '-0.1rem -0.1rem', // 金爪灵摆
		111012: '0.1rem 0.2rem', // 砂金甲虫
	};
</script>

{#snippet item(id: number)}
	{@const material = data.materials[id as unknown as MaterialId]}

	<a
		href={resolve(`/drop/material/${id}`)}
		class="btn btn-inlay flex items-center gap-1 p-2"
	>
		<img
			src={`https://cdn.jsdelivr.net/gh/myssal/Reverse-1999-CN-Asset/singlebg/propitem/prop/${id}.png`}
			alt={material.name}
			class="w-16 -ml-0.5 -mb-1.5"
			style:translate={shifts[id] ?? '0'}
		/>
		<div class="text-left">
			<p class="font-medium mt-1">{material.name}</p>
			<p><Rarity rarity={material.rarity} /></p>
		</div>
	</a>
{/snippet}

{#snippet empty()}
	<div></div>
{/snippet}

<section class="materials mb-4">
	<!-- 颤颤之齿 液化战栗 啮咬盒 床下怪物 -->
	{@render item(110101)}
	{@render item(110102)}
	{@render item(110103)}
	{@render item(110104)}
	<!-- 苦盐簇 精磨苦盐 盐封曼德拉 不腐猴爪 -->
	{@render item(110201)}
	{@render item(110202)}
	{@render item(110203)}
	{@render item(110204)}
	<!-- 破碎骨片 未知种根骨 双头形骨架 幼龙骨标本 -->
	{@render item(110301)}
	{@render item(110302)}
	{@render item(110303)}
	{@render item(110304)}
	<!-- 银矿原石 粗糙银锭 祝圣秘银 银光子弹 -->
	{@render item(110401)}
	{@render item(110402)}
	{@render item(110403)}
	{@render item(110404)}
	<!-- 清扫咒 幸运咒语 百灵百验鸟 狂人絮语 -->
	{@render item(110501)}
	{@render item(110502)}
	{@render item(110503)}
	{@render item(110504)}
	<!-- 干蝉翼 翼造门匙 -->
	{@render empty()}
	{@render item(110602)}
	{@render item(110603)}
	{@render empty()}
	<!-- 不休轮 弯曲鹅颈 -->
	{@render empty()}
	{@render item(110702)}
	{@render item(110703)}
	{@render empty()}
	<!-- 狐儿尾 金草焚香 -->
	{@render empty()}
	{@render item(110802)}
	{@render item(110803)}
	{@render empty()}
	<!-- 辉石原矿 红漆泥板 -->
	{@render empty()}
	{@render item(110902)}
	{@render item(110903)}
	{@render empty()}
	<!-- 罗马金币 金爪灵摆 -->
	{@render empty()}
	{@render item(111001)}
	{@render item(111002)}
	{@render empty()}
	<!-- 砂金甲虫 -->
	{@render empty()}
	{@render empty()}
	{@render item(111012)}
	{@render empty()}
	<!-- 锐利尖针 真心彩蛋 -->
	{@render empty()}
	{@render item(111102)}
	{@render item(111103)}
	{@render empty()}
</section>

<style lang="postcss">
	@reference '$lib/styles/index.css';

	.materials {
		@apply grid grid-cols-4;
		@apply bg-stripe;

		> .btn-inlay {
			@apply bg-noise bg-gray-50;
			@apply hover:bg-white;
		}

		> * {
			@apply border-r border-b border-gray-300;

			&:nth-child(4n) {
				@apply border-r-0;
			}
		}
	}
</style>
