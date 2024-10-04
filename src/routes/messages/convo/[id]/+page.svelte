<script lang="ts">
	import { page } from '$app/stores';
	import Icon from '@iconify/svelte';
	import type { Conversation } from '@prisma/client';
	import { onMount, afterUpdate } from 'svelte';

	let conversation: Conversation | null = null;
	let loggedInUserId: string = '';
	let error: string = '';
	let messagesContainer: HTMLDivElement | null = null; // Reference to the messages container

	const conversationId = $page.params.id;

	// Function to fetch the conversation data
	async function fetchData() {
		try {
			const res = await fetch(`/messages/convo/${conversationId}`);
			if (!res.ok) {
				const errMessage = await res.text();
				throw new Error(`Failed to fetch conversation: ${errMessage}`);
			}

			const data = await res.json();
			conversation = data.conversation;
			loggedInUserId = data.loggedInUserId;
		} catch (error) {
			console.error('Error fetching conversation:', error);
		}
	}

	// Scroll to the bottom of the messages
	function scrollToBottom() {
		if (messagesContainer) {
			messagesContainer.scrollTop = messagesContainer.scrollHeight;
		}
	}

	// Fetch data on component mount
	onMount(() => {
		fetchData();
	});

	// After each update (new messages, etc.), scroll to the bottom
	afterUpdate(() => {
		if (conversation) {
			scrollToBottom();
		}
	});
</script>


	{#if error}
		<p class="text-red-500 py-4">{error}</p>
	{:else if conversation}
		<!-- Conversation Header -->
		<div class="fixed w-full top-0 z-10 px-10 bg-white py-8 border-b-2 border-black">
			{#each conversation.participants as participant}
				<div class="flex justify-between items-center">
					{#if participant.id !== loggedInUserId}
						<a href="/" class="py-2 px-3">
							<Icon icon="fluent:ios-arrow-24-filled" class="w-7 h-7" />
						</a>
						<div class="flex gap-3 items-center">
							<img src={participant.image} class="w-12 border-2 border-black rounded-full" alt={participant.name} />
							<p class="font-semibold text-2xl w-48 flex items-center justify-between">
                                {participant.name}
                                <span><a href="/messages/convo/[id]/manage"><Icon icon="mage:dots" class="text-black" /></a></span>
                            </p>
						</div>
					{/if}
				</div>
			{/each}
		</div>
    {/if}

        <!-- Page structure -->
<div class="h-screen">
    {#if conversation}
		<!-- Messages Container -->
		<div
			class="flex flex-col py-3 h-screen mt-28 mb-28 w-5/6 mx-auto overflow-y-auto"
			bind:this={messagesContainer}
		>
			{#each conversation.messages as message}
				{#if message.senderId === loggedInUserId}
					<div class="px-3 py-2 flex justify-end">
						<p class="bg-gray-100 w-3/5 rounded-xl pl-2 pr-3 py-2">{message.content}</p>
					</div>
				{:else}
					<div class="px-3 py-2">
						<p class="bg-amber-200 w-3/5 rounded-xl pl-2 pr-3 py-2">{message.content}</p>
					</div>
				{/if}
			{/each}
		</div>
	{:else}
		<p>Loading...</p>
	{/if}
</div>
