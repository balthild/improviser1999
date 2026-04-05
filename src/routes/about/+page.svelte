<script lang="ts"></script>

{#snippet external(url: string)}
	<a href={url} target="_blank" rel="external noopener noreferrer" class="text-link">{url}</a>
{/snippet}

<section class="p-6 space-y-3">
	<h2 class="text-xl font-bold mb-5">关于</h2>

	<p>
		本项目是以 GNU Affero General Public License v3.0
		许可协议发表的自由软件，您可以在此处获取它的源代码副本：
	</p>

	<ul class="space-y-2 list-disc ml-3.75">
		<li>
			GitHub Repository
			<br />
			{@render external('https://github.com/balthild/improviser1999')}
		</li>
	</ul>

	<hr class="my-5 border-gray-300" />

	<p>本项目还使用或展示了来自以下项目的数据或资源文件，它们的许可协议请参阅各自的项目页面：</p>

	<ul class="space-y-2 list-disc ml-3.75">
		<li>
			Reverse1999 Assets
			<br />
			{@render external('https://github.com/myssal/Reverse-1999-CN-Asset')}
		</li>
		<li>
			必要的记录 by 伴春风而归
			<br />
			{@render external('https://www.kdocs.cn/l/cd5MWeCl5bKw')}
		</li>
		<li>
			Closure[REVERSE1999][""]++
			<br />
			{@render external('https://cpp.orz.tools/reverse1999')}
		</li>
		<li>
			重返未来 1999 中文维基
			<br />
			{@render external('https://res1999.huijiwiki.com')}
		</li>
		<li>
			Reverse: 1999 Wiki
			<br />
			{@render external('https://reverse1999.fandom.com')}
		</li>
	</ul>

	<hr class="my-5 border-gray-300" />

	<h3 class="font-semibold">这个项目为什么叫「流浪即兴曲」？</h3>
	<p>因为是一时兴起做的，所以是「即兴曲」。</p>
</section>
