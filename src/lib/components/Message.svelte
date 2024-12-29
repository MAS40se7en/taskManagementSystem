<script lang="ts">
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	let unseenCount: any = $state();
	let loading = false;

	onMount(async () => {

		try {
            loading = true;

			const response = await fetch('/api/messages');

			const data = await response.json();
			if (response.ok) {
				unseenCount = data.unreadCount;
				console.log(data);
                console.log(unseenCount)
				loading = false;
			} else {
				console.error('Failed to fetch unread messages:', data.message);
			}
		} catch (error) {
			console.error(error);
		}
	});
</script>

<a href="/protected/messages" class="flex">
	<Icon icon="ant-design:message-outlined" class="w-7 h-7" />
    {#if unseenCount > 0}
    <span class="text-sm text-[#c9b46f]">
        {unseenCount}
    </span>
    {/if}
</a>
