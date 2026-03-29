<script lang="ts">
	import * as v from 'valibot';

	import { validate } from '$lib/template/validate.svelte';

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
</script>

<section class="mb-3 flex flex-row justify-between items-center">
	<h2 class="text-xl font-medium">征集记录</h2>
	<button class="btn" popovertarget={`popover-import-${uniqueId}`}>
		导入
	</button>
</section>

<form
	id={`popover-import-${uniqueId}`}
	class="mb-3 p-2 border border-gray-300 w-80 rounded-sm mt-2 shadow"
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
		<button class="btn">确认</button>
	</div>
</form>
