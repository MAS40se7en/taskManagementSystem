<script lang="ts">
	import { page } from "$app/stores";

	export let displayModal: boolean;
	export let onClose: () => void;

	function modalClose(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onClose();
		}
	}
</script>

{#if displayModal}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div on:click={modalClose} class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-20">
		<div class="bg-white dark:bg-[#252525] {$page.url.pathname === '/protected/create' || $page.url.pathname === '/protected/user/account' || $page.url.pathname === '/protected/user/[id]' ? 'w-4/5 rounded-xl' : 'rounded-2xl pb-2 pt-4 w-3/4 px-5'}">
			<slot />
		</div>
	</div>
{/if}
