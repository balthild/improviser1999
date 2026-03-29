<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	import { tooltip } from '$lib/template/tooltip.svelte';

	const pathname = $derived(page.url.pathname);
</script>

<aside class="w-50 shrink-0 overflow-visible border-r border-gray-300 relative">
	<div class="scrap -right-1 -top-1"></div>

	<nav class="min-h-full overflow-y-auto">
		<div class="nav-group" class:active={pathname === '/'}>
			<a href={resolve('/')} class="nav-title">
				<span class="icon-[ri--home-9-line]"></span>
				<span class="text-sm ml-1.5">首页</span>
			</a>
		</div>

		<div class="nav-group" class:active={pathname === '/summon'}>
			<a href={resolve('/summon')} class="nav-title">
				<span class="icon-[ri--suitcase-line]"></span>
				<span class="text-sm ml-1.5">征集记录</span>
			</a>
		</div>

		<details name="nav" class="nav-group" open={pathname.startsWith('/stats')}>
			<summary class="nav-title">
				<span class="icon-[ri--shapes-line]"></span>
				<span class="text-sm ml-1.5">掉落统计</span>
				<span class="nav-caret"></span>
			</summary>
			<ul>
				<li class:active={pathname === '/stats/material'}>
					<a href={resolve('/stats/material')} use:tooltip={'开发中'}>按物品</a>
				</li>
				<li class:active={pathname === '/stats/stage'}>
					<a href={resolve('/stats/stage')} use:tooltip={'开发中'}>按关卡</a>
				</li>
				<li class:active={pathname === '/stats/submit'}>
					<a href={resolve('/stats/submit')} use:tooltip={'开发中'}>上报</a>
				</li>
			</ul>
		</details>
	</nav>
</aside>

<style lang="postcss">
	@reference '$lib/styles/index.css';

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

			@starting-style {
				@apply grid-rows-[0fr];
			}
		}

		.nav-title {
			@apply flex items-center;
			@apply pl-4 pr-3 py-1.75;
			@apply font-medium;
			@apply cursor-pointer;
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
</style>
