<script lang="ts">
	import { onMount } from 'svelte';

	let users: any[] = []; // Initialize as an empty array
	let errorMessage = '';

	onMount(async () => {
		try {
			const response = await fetch('/protected/messages/convo/addConvo'); // Replace with the actual path
			if (response.ok) {
				const data = await response.json();
				users = data.users || []; // Ensure it defaults to an empty array if undefined
			} else {
				errorMessage = 'Failed to fetch users.';
			}
		} catch (error) {
			errorMessage = 'An error occurred while fetching data.';
		}
	});
</script>

<div class="w-5/6 mx-auto h-screen">
	<div class="bg-gray-200 py-2 px-3 rounded-3xl">
		<p class="px-2 mb-2">Search for a user to start a conversation with</p>
		<input type="text" class="h-12 rounded-2xl w-full px-2 mb-1" placeholder="user name" />
	</div>

	<div class="my-4">
		{#if users.length > 0}
			<div class="flex flex-col gap-1">
				{#each users as user}
                    <div class="border-b-2 items-center py-3">
                        <button class="flex gap-4 items-center">
                            <img src={user.image} alt="profile" class="rounded-full w-12 border-2 border-black/20">
                            <h1 class="font-semibold">{user.name}</h1>
                        </button>
                    </div>
                {/each}
			</div>
		{:else}
			<p>Enter a user name to see available new associates</p>
		{/if}
	</div>
</div>
