<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	import { tooltip } from '$lib/components/parts/tooltip.svelte';
	import { tr } from '$lib/i18n.svelte';

	const pathname = $derived(page.url.pathname);
</script>

<aside class="w-50 shrink-0 overflow-visible border-r border-gray-300 relative">
	<div class="scrap -right-1 -top-1"></div>

	<nav class="min-h-full overflow-y-auto">
		<div class="nav-group" class:active={pathname === '/'}>
			<a href={resolve('/')} class="nav-title">
				<span class="icon-[ri--home-9-line]"></span>
				<span class="text-sm ml-1.5">
					{tr({ zh: '首页', en: 'Home' })}
				</span>
			</a>
		</div>

		<div class="nav-group" class:active={pathname === '/summon'}>
			<a href={resolve('/summon')} class="nav-title">
				<span class="icon-[ri--suitcase-line]"></span>
				<span class="text-sm ml-1.5">
					{tr({ zh: '征集记录', en: 'Summon History' })}
				</span>
			</a>
		</div>

		<details name="nav" class="nav-group" open={pathname.startsWith('/drop')}>
			<summary class="nav-title">
				<span class="icon-[ri--shapes-line]"></span>
				<span class="text-sm ml-1.5">
					{tr({ zh: '掉落统计', en: 'Drop Statistics' })}
				</span>
				<span class="nav-caret"></span>
			</summary>
			<ul>
				<li class:active={pathname.startsWith('/drop/material')}>
					<a href={resolve('/drop/material')}>
						{tr({ zh: '按物品', en: 'By Item' })}
					</a>
				</li>
				<li class:active={pathname.startsWith('/drop/stage')}>
					<a href={resolve('/drop/stage')}>
						{tr({ zh: '按关卡', en: 'By Stage' })}
					</a>
				</li>
				<li class:active={pathname === '/drop/submit'}>
					<a href={resolve('/drop/submit')} use:tooltip={'开发中'}>
						{tr({ zh: '上报', en: 'Submit' })}
					</a>
				</li>
			</ul>
		</details>

		<div class="nav-group" class:active={pathname === '/about'}>
			<a href={resolve('/about')} class="nav-title">
				<span class="icon-[ri--information-line]"></span>
				<span class="text-sm ml-1.5">
					{tr({ zh: '关于', en: 'About' })}
				</span>
			</a>
		</div>
	</nav>
</aside>

<style lang="postcss">
	@reference '$lib/styles/index.css';

	@layer components {
		.nav-group {
			@apply text-gray-600;
			@apply border-b border-gray-300/60;

			&::details-content {
				@apply grid grid-rows-[0fr];
				@apply opacity-0;
				@apply overflow-hidden;
				@apply transition-[content-visibility,grid-template-rows,opacity,padding];
				@apply transition-discrete duration-300;
			}

			&[open]::details-content {
				@apply py-1;
				@apply grid-rows-[1fr];
				@apply opacity-100;

				/*
				Not sure why I added this. Removing it seems to have no adverse effects to the transition. It causes a layout shift when the page is loaded.

				@starting-style {
					@apply grid-rows-[0fr];
				}
				*/
			}

			.nav-title {
				@apply flex items-center;
				@apply pl-4 pr-3 py-1.75;
				@apply font-medium;
				@apply cursor-pointer a11y-ring;
				@apply border-gray-200;
				@apply transition-[background-color,border-width];
				@apply duration-[150ms,250ms];
				@apply ease-[ease-in-out,step-end];

				&:hover {
					@apply text-gray-700;
					@apply bg-gray-900/2;
				}

				[open] & {
					@apply bg-gray-900/2;
					@apply border-b;
					@apply ease-[ease-in-out,step-start];
				}

				.nav-caret {
					@apply text-base;
					@apply ml-auto;
					@apply icon-[ri--arrow-right-s-line];
					@apply transition-transform;

					[open] & {
						@apply rotate-90;
					}
				}
			}

			ul {
				/* needed for ::details-content transition */
				@apply min-h-0;

				li {
					@apply text-sm;
					@apply transition-colors;

					&:hover {
						@apply bg-gray-900/2;
					}

					a {
						@apply block;
						@apply px-4 py-1;
						@apply a11y-ring;
					}
				}
			}
		}

		.nav-group.active .nav-title {
			@apply text-gray-700;
			@apply bg-stripe;
		}

		.nav-group ul li.active {
			@apply text-gray-700;
			@apply bg-gray-900/4;
		}
	}
</style>
