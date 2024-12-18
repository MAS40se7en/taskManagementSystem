<!-- Modal.svelte -->
<script lang="ts">
	export let displayModal: boolean;
	export let onClose: () => void;
</script>

{#if displayModal}
	<div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-20">
		<div class="bg-white dark:bg-[#252525] rounded-3xl pb-2 pt-4 w-3/4 px-5">
			<slot />
			<button on:click={onClose} class="block w-full text-red-500 rounded-2xl px-4 py-2">Close</button>
		</div>
	</div>
{/if}
