<!-- Modal.svelte -->
<script lang="ts">
	interface Props {
		displayModal: boolean;
		onClose: () => void;
		children?: import('svelte').Snippet;
	}

	let { displayModal, onClose, children }: Props = $props();
</script>

{#if displayModal}
	<div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-20">
		<div class="bg-white dark:bg-[#252525] rounded-3xl pb-2 pt-4 w-3/4 px-5">
			{@render children?.()}
			<button onclick={onClose} class="block w-full text-red-500 rounded-2xl px-4 py-2">Close</button>
		</div>
	</div>
{/if}
