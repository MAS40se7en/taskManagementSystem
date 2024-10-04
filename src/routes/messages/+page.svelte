<script lang="ts">
	import { onMount } from 'svelte';
	import { json } from '@sveltejs/kit';
	import Icon from '@iconify/svelte';

	export let conversations: {
		id: number;
		participants: { id: string; name: string; email: string; image: string }[];
		messages: { id: number; content: string; sentAt: string; senderId: string }[];
	}[] = [];

	export let error: string = '';
	export let loggedInUserId: string = '';

	onMount(async () => {
		try {
			const response = await fetch('/messages');
			console.log('Response status:', response.status);
			if (response.ok) {
				const data = await response.json();
				console.log('Data:', data);
				conversations = data.conversations;
				loggedInUserId = data.loggedInUserId;
			} else {
				error = 'Failed to load conversations.';
			}
		} catch (error) {
			console.error('Error fetching conversations: ', error);
			error = 'An error occurred while fetching conversations.';
		}
		console.log('Logged-in User ID:', loggedInUserId);
		console.log('Conversations:', conversations);
	});

    const truncateMessage = (message: string, length: number) => {
        return message.length > length ? message.slice(0, length) + '...' : message;
    }
</script>


<div class="px-10 py-12 flex justify-between sticky top-0 bg-white w-full">
	<a href="/" class="py-2 px-3"
		><Icon icon="fluent:ios-arrow-24-filled" class="w-7 h-7" /></a
	>
	<div class="flex flex-col">
		<h1 class="text-4xl font-bold">Messages</h1>
	</div>
</div>

<div class="w-5/6 mx-auto h-screen">
	<div class="flex gap-4 px-3 py-2 rounded-3xl bg-gray-200 items-center">
		<div>
			<input type="text" class="border-2 w-full h-12 rounded-2xl px-2" placeholder="Search...">
		</div>
		<p class="text-end">
			<a href="/messages/convo/addConvo"><Icon icon="ion:create-outline" class="w-8 h-8" /></a>
		</p>
	</div>
	{#if error}
		<p class="text-red-500 py-4">{error}</p>
	{:else if conversations.length > 0}
		<ul class="flex flex-col gap-4">
			{#each conversations as conversation}
				<li class="border-b-2 border-black/20 py-5 px-2">
					{#each conversation.participants as participant}
						{#if participant.id !== loggedInUserId}
							<div>
                                <a href="/messages/convo/{conversation.id}" class="flex items-center gap-3">
								<img
									src={participant.image}
									alt={participant.name}
									width="40"
									height="40"
									class="rounded-full border-2 border-black/30"
								/>
								<div>
									<span class="font-semibold">{participant.name}</span>
									{#if conversation.messages.length > 0}
										<!-- Check if there are messages -->
										{#each conversation.messages as message, index}
											{#if index === conversation.messages.length - 1}
												<!-- Only get the latest message -->
												<p class="mt-1 text-sm w-full opacity-50">
													{#if message.senderId === loggedInUserId}
														You: {truncateMessage(message.content, 25)}
													{:else}
														{truncateMessage(message.content, 25)}
													{/if}
												</p>
											{/if}
										{/each}
									{/if}
								</div>
                            </a>
							</div>
						{/if}
					{/each}
				</li>
			{/each}
		</ul>
	{:else}
		<p class="py-4">No messages shared yet</p>
	{/if}
</div>
