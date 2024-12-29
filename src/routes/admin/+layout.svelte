<script>

	import AdminNav from "$lib/components/AdminNav.svelte";
	/** @type {{children?: import('svelte').Snippet}} */
	let { children } = $props();

</script>

<AdminNav />
{@render children?.()}