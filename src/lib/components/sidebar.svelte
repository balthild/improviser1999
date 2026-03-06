<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { computePosition, flip, offset, shift } from '@floating-ui/dom';
	import { onMount } from 'svelte';

	let nav: HTMLElement;

	onMount(() => {
		const tooltips: HTMLElement[] = [];

		for (const link of nav.querySelectorAll<HTMLAnchorElement>('a[data-tooltip]')) {
			const tooltip = document.createElement('div');
			tooltip.role = 'tooltip';
			tooltip.textContent = link.dataset.tooltip!;
			tooltip.className = 'tooltip';
			document.body.appendChild(tooltip);

			tooltips.push(tooltip);

			link.addEventListener('mouseenter', async () => {
				tooltip.style.display = 'block';

				let { x, y } = await computePosition(link, tooltip, {
					placement: 'right',
					middleware: [flip(), offset(4), shift({ padding: 4 })],
				});

				Object.assign(tooltip.style, {
					left: `${x}px`,
					top: `${y}px`,
				});
			});

			link.addEventListener('mouseleave', () => {
				tooltip.style.display = 'none';
			});
		}

		return () => {
			tooltips.forEach((tooltip) => tooltip.remove());
		};
	});
</script>

<aside class="w-50 shrink-0 overflow-visible border-r border-gray-300 relative">
	<div class="size-1.75 rotate-45 absolute -right-1 -top-1 z-999 bg-white border border-gray-300"></div>

	<nav class="min-h-full overflow-y-auto" bind:this={nav}>
		<div class="nav-group" class:active={page.url.pathname === '/'}>
			<a href={resolve('/')} class="nav-title">
				<span class="icon-[ri--home-9-line]"></span>
				<span class="text-sm ml-1.5">首页</span>
			</a>
		</div>

		<details name="nav" class="nav-group" open={page.url.pathname.startsWith('/stage')}>
			<summary class="nav-title">
				<span class="icon-[ri--map-2-line]"></span>
				<span class="text-sm ml-1.5">关卡统计</span>
				<span class="nav-caret"></span>
			</summary>
			<ul>
				<li class:active={page.url.pathname === '/stage/chapter-1'}>
					<a href={resolve('/stage/chapter-1')}>第一章</a>
				</li>
				<li class:active={page.url.pathname === '/stage/chapter-2'}>
					<a href={resolve('/stage/chapter-2')}>第二章</a>
				</li>
				<li class:active={page.url.pathname === '/stage/chapter-3'}>
					<a href={resolve('/stage/chapter-3')}>第三章</a>
				</li>
				<li class:active={page.url.pathname === '/stage/chapter-4'}>
					<a href={resolve('/stage/chapter-4')}>第四章</a>
				</li>
			</ul>
		</details>

		<details name="nav" class="nav-group" open={page.url.pathname.startsWith('/material')}>
			<summary class="nav-title">
				<span class="icon-[ri--shapes-line]"></span>
				<span class="text-sm ml-1.5">素材统计</span>
				<span class="nav-caret"></span>
			</summary>
			<ul>
				<li class:active={page.url.pathname === '/material'}>
					<a href={resolve('/material')}>全部</a>
				</li>
				<li class:active={page.url.pathname === '/material/category-1'}>
					<a href={resolve('/material/category-1')} data-tooltip="颤颤之齿 · 液化战栗 · 啮咬盒">齿类</a>
				</li>
				<li class:active={page.url.pathname === '/material/category-2'}>
					<a href={resolve('/material/category-2')} data-tooltip="苦盐簇 · 精磨苦盐 · 盐封曼德拉">盐类</a>
				</li>
				<li class:active={page.url.pathname === '/material/category-3'}>
					<a href={resolve('/material/category-3')} data-tooltip="破碎骨片 · 未知种根骨 · 双头形骨架">骨类</a>
				</li>
				<li class:active={page.url.pathname === '/material/category-4'}>
					<a href={resolve('/material/category-4')} data-tooltip="银矿原石 · 粗糙银锭 · 祝圣秘银">银类</a>
				</li>
				<li class:active={page.url.pathname === '/material/category-5'}>
					<a href={resolve('/material/category-5')} data-tooltip="清扫咒 · 幸运咒语 · 百灵百验鸟">咒类</a>
				</li>
				<li class:active={page.url.pathname === '/material/category-6'}>
					<a href={resolve('/material/category-6')}>金材料</a>
				</li>
			</ul>
		</details>
	</nav>
</aside>

<style lang="postcss">
	@reference '$lib/style.css';

	.nav-group {
		@apply text-gray-600;
		@apply border-b border-gray-200;

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
			@apply border-transparent;
			@apply transition-[background-color,border-color,border-width];

			&:hover {
				@apply text-gray-700;
				@apply bg-gray-900/2;
			}

			[open] & {
				@apply bg-gray-900/2;
				@apply border-b border-gray-200;
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

	.nav-group.active .nav-title, .nav-group ul li.active {
		@apply text-gray-700;
		@apply bg-gray-900/4;
	}
</style>
