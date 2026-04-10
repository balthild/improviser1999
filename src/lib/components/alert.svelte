<script lang="ts">
	import { on } from 'svelte/events';

	import { tr } from '$lib/i18n.svelte';

	let dialog: HTMLDialogElement;

	$effect(() => {
		if (queue.length > 0 && !dialog.open) {
			dialog.showModal();
		}
	});

	$effect(() => {
		return on(dialog, 'close', () => {
			const { resolve } = queue.shift()!;
			resolve();
		});
	});
</script>

<script lang="ts" module>
	interface Alert {
		message: string;
		resolve: () => void;
	}

	export const queue: Alert[] = $state([]);

	export function alert(message: string) {
		const { promise, resolve } = Promise.withResolvers<void>();
		queue.push({ message, resolve });
		return promise;
	}
</script>

<dialog closedby="none" class="dialog w-120 h-fit" bind:this={dialog}>
	<section class="px-5 py-4">
		<p class="text-ms text-gray-600">{queue[0]?.message}</p>
	</section>
	<footer class="border-t border-gray-300 flex justify-end">
		<button class="btn btn-inlay border-l" onclick={() => dialog.close()}>
			{tr({ zh: '确认', en: 'OK' })}
		</button>
	</footer>
</dialog>
