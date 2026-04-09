<script lang="ts">
	import '$lib/styles/index.css';

	import { computePosition, offset, shift } from '@floating-ui/dom';
	import { OverlayScrollbarsComponent } from 'overlayscrollbars-svelte';
	import { on } from 'svelte/events';

	import favicon from '$lib/assets/favicon.svg';
	import Sidebar from '$lib/components/sidebar.svelte';
	import { getLanguage, languages, setLanguage, tr } from '$lib/i18n.svelte';
	import type { Language } from '$lib/i18n.svelte';
	import { expand } from '$lib/template/expand.svelte';

	import type { Snapshot } from './$types';

	let { children } = $props();

	let languageButton: HTMLButtonElement;
	let languageDropdown: HTMLDialogElement;

	const toggleLanguagePicker = async (event: MouseEvent) => {
		languageDropdown.showModal();

		const button = event.currentTarget as HTMLButtonElement;
		const { x, y } = await computePosition(button, languageDropdown, {
			placement: 'bottom-end',
			middleware: [offset(2), shift({ padding: 4 })],
		});

		languageDropdown.style.left = `${x}px`;
		languageDropdown.style.top = `${y}px`;
	};

	const pickLanguage = (language: Language) => {
		setLanguage(language);
		languageDropdown.close();
	};

	$effect(() => {
		document.documentElement.lang = getLanguage();
	});

	let messageDialog: HTMLDialogElement;
	let messageText = $state('');

	$effect(() => {
		return on(window, 'message-dialog', (event) => {
			messageText = event.detail;
			messageDialog.showModal();
		});
	});

	let container: OverlayScrollbarsComponent | null;

	export const snapshot: Snapshot<number> = {
		capture: () => {
			const elements = container?.osInstance()?.elements();
			return elements?.viewport.scrollTop ?? 0;
		},
		restore: (value) => {
			const elements = container?.osInstance()?.elements();
			requestAnimationFrame(() => elements?.viewport.scrollTo({ top: value }));
		},
	};
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>{tr({ zh: '流浪即兴曲', en: 'The Wandering Improviser' })}</title>
</svelte:head>

<dialog closedby="none" class="dialog w-120 h-fit" bind:this={messageDialog}>
	<section class="px-5 py-4">
		<p class="text-ms text-gray-600">{messageText}</p>
	</section>
	<footer class="border-t border-gray-300 flex justify-end">
		<button class="btn btn-inlay border-l" onclick={() => messageDialog.close()}>
			{tr({ zh: '确认', en: 'OK' })}
		</button>
	</footer>
</dialog>

<div class="flex h-screen flex-col overflow-hidden">
	<header class="shrink-0 border-b border-gray-300 bg-gray-900/6">
		<div class="h-12 w-full max-w-wl flex items-center gap-2 px-4 text-gray-600">
			<span class="text-xl text-blue-700 icon-[ri--instance-line]"></span>
			<h1 class="font-bold text-ml">
				{tr({ zh: '流浪即兴曲', en: 'The Wandering Improviser' })}
			</h1>

			<span class="flex-1"></span>

			<button
				class="btn p-1.5 size-8 rounded hover:bg-gray-400/20"
				onclick={toggleLanguagePicker}
				aria-label={tr({ zh: '选择语言', en: 'Select Language' })}
				aria-haspopup="listbox"
				aria-expanded="false"
				bind:this={languageButton}
			>
				<span class="text-xl icon-[ri--translate]"></span>
			</button>

			<dialog
				closedby="any"
				class="dropdown p-1 flex flex-col open:visible backdrop:bg-transparent"
				role="listbox"
				bind:this={languageDropdown}
				use:expand={() => languageButton}
			>
				{#each Object.entries(languages) as [lang, name] (lang)}
					<button
						class="btn py-1.25 text-left hover:bg-gray-400/20"
						onclick={() => pickLanguage(lang as Language)}
					>
						{name}
					</button>
				{/each}
			</dialog>
		</div>
	</header>

	<main class="flex flex-1 min-h-0 w-full max-w-wl relative border-gray-400/50 wl:border-r wl:border-dashed">
		<div class="scrap -right-1 -top-1 hidden wl:block"></div>

		<Sidebar />

		<OverlayScrollbarsComponent
			defer
			class="h-full flex-1 os-toplevel-y"
			options={{ scrollbars: { autoHide: 'scroll' } }}
			bind:this={container}
		>
			{@render children()}
		</OverlayScrollbarsComponent>
	</main>
</div>
