<script lang="ts">
	import { OverlayScrollbarsComponent } from 'overlayscrollbars-svelte';
	import * as v from 'valibot';

	import { asset } from '$app/paths';
	import { page } from '$app/state';

	import { validate } from '$lib/template/validate.svelte';

	import { doImport } from './import';
	import { ImportUrlScheme, QUERY_SUMMON_URL_BASE } from './validation';

	let importUrl = $state('');
	let importFull = $state(false);

	const handleImport = async (event: Event) => {
		event.preventDefault();
		const count = await doImport(importUrl, importFull);
		alert(`导入完成，新增 ${count} 条记录`);
	};

	let selectedPlatform = $state('macOS');
</script>

<OverlayScrollbarsComponent
	defer
	class="w-full h-full os-toplevel"
	options={{ scrollbars: { autoHide: 'scroll' } }}
>
	<h3 class="font-medium text-ml text-gray-600 p-3 text-center">导入征集记录</h3>

	<!-- <div class="h-2.5 border-y border-gray-300 bg-stripe"></div> -->

	<form onsubmit={handleImport}>
		<label class="block border-y border-gray-300">
			<p class="sr-only">导入地址</p>
			<textarea
				name="url"
				rows="3"
				class="block w-full text-sm border-0 ring-0 bg-transparent resize-none break-all"
				placeholder={`${QUERY_SUMMON_URL_BASE}?userId=...`}
				bind:value={importUrl}
				use:validate={v.message(ImportUrlScheme, '地址无效')}
				autocomplete="off"
				// I have no clue why 1password show username suggestions here
				data-1p-ignore
			></textarea>
		</label>

		<div class="flex flex-row items-center justify-between gap-2 pl-2">
			<label class="flex items-center gap-1.25">
				<input
					type="checkbox"
					name="full"
					class="checkbox text-slate-500 not-checked:bg-transparent"
					bind:checked={importFull}
				/>
				<span class="text-sm text-gray-700">全量导入</span>
			</label>

			<button class="btn btn-inlay border-l">确认</button>
		</div>
	</form>

	<div class="h-2.5 border-y border-gray-300 bg-stripe"></div>

	<section class="flex flex-row items-stretch text-ms p-1 gap-1 text-gray-500">
		{#each ['macOS', 'Windows', 'iOS', 'Android'] as platform (platform)}
			<button
				class="py-1 flex-1 cursor-pointer rounded-xs ring-inset ring-gray-200"
				class:ring-1={selectedPlatform === platform}
				class:bg-white={selectedPlatform === platform}
				onclick={() => (selectedPlatform = platform)}
			>
				{platform}
			</button>
		{/each}
	</section>

	<section class="p-3 text-ms text-gray-600 border-t border-gray-300 space-y-2">
		{#if selectedPlatform === 'macOS'}
			<p class="font-medium">
				该方式适用于从 App Store 或用 PlayCover 安装的游戏。Android 模拟器请使用适用于 Android
				平台的方式。
			</p>
			<p>在终端内运行以下命令：</p>
			<div class="bg-gray-400/10 rounded py-2 px-3 text-sm">
				<pre class="whitespace-normal break-all">curl -fsSL {page.url.origin}{asset('/summon/macos.sh')} | bash</pre>
			</div>
		{:else if selectedPlatform === 'Windows'}
			<p>
				参见：<a
					href="https://www.timekeeper.top/auto_import.html"
					target="_blank"
					rel="external noopener noreferrer"
					class="text-link"
				>https://www.timekeeper.top/auto_import.html</a>
			</p>
		{:else}
			<p>
				参见：<a
					href="https://mp.weixin.qq.com/s/bKMB42_hl8uLgWxUvLVQtQ"
					target="_blank"
					rel="external noopener noreferrer"
					class="text-link"
				>https://mp.weixin.qq.com/s/bKMB42_hl8uLgWxUvLVQtQ</a>
			</p>
		{/if}

		<p>
			游戏生成的征集回顾地址很快就会过期失效。如果在导入时提示地址无效，请退出征集界面或重启游戏，然后重新打开征集回顾，并立刻尝试获取地址与导入。
		</p>
	</section>
</OverlayScrollbarsComponent>
