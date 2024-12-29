<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation'; // Used for programmatic navigation
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	type Message = {
		id: number;
		content: string;
		senderId: string;
		conversationId: number;
		sender: {
			id: string;
			name: string;
			image: string;
		};
	};

	type ConversationWithMessages = {
		id: number;
		createdAt: Date;
		updatedAt: Date;
		participants: {
			id: string;
			name: string;
			image: string;
		}[];
		messages: Message[];
	};

	let conversation: ConversationWithMessages | null = $state(null);
	let loggedInUserId: string = $state('');
	let error: string = '';
	let content = $state('');
	let user: any;

	const conversationId = $page.params.id;

	// Function to fetch the conversation data
	async function fetchData() {
		try {
			const res = await fetch(`/protected/messages/convo/${conversationId}`);
			if (!res.ok) {
				const errMessage = await res.text();
				throw new Error(`Failed to fetch conversation: ${errMessage}`);
			}

			const data = await res.json();
			conversation = data.conversation;
			loggedInUserId = data.user.id;
			user = data.user;

			if (!user) {
				alert('unauthorized access');
				goto('/auth/login');
			}

			if (!user?.isVerified) {
				alert('please verify your email to use the application');

				const url = new URL(`/auth/register/verify-email/`, window.location.origin);
				url.searchParams.append('userId', user?.id);

				goto(url.toString());
			}
		} catch (error) {
			console.error('Error fetching conversation:', error);
		}
	}

	// Fetch data on component mount
	onMount(() => {
		fetchData();
	});

	async function sendMessage() {
		if (!content.trim()) return;

		try {
			const response = await fetch(`/protected/messages/convo/${conversationId}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ conversationId, content })
			});

			if (!response.ok) {
				const errMessage = await response.text();
				throw new Error(`Failed to send message: ${errMessage}`);
			}

			const { newMessage } = await response.json(); // Ensure correct destructuring
			console.log('New message:', newMessage); // Check the structure

			if (conversation) {
				// Update the conversation object to include the new message
				conversation = {
					...conversation,
					messages: [
						...conversation.messages,
						{
							id: newMessage.id,
							content: newMessage.content,
							senderId: newMessage.senderId,
							conversationId: newMessage.conversationId,
							sender: {
								id: newMessage.sender.id,
								name: newMessage.sender.name,
								image: newMessage.sender.image
							}
						}
					]
				};
				content = ''; // Clear the input after sending
			}
		} catch (error) {
			console.error('Error sending message: ', error);
		}
	}

	// Function to handle the button click and navigate to the project creation page
	function createProject() {
		if (!conversation || !loggedInUserId) return;

		// Extract participant IDs from the conversation
		const participantIds = conversation.participants.map((p) => p.id);

		// Create the URL with query parameters
		const url = new URL(
			`/protected/messages/convo/${conversationId}/createProject`,
			window.location.origin
		);
		url.searchParams.append('loggedInUserId', loggedInUserId);

		console.log('Navigating to URL:', url.toString());

		// Navigate to the project creation page
		goto(url.toString());
	}

	async function goBack() {
		if (conversation?.messages.length === 0) {
			try {
				const response = await fetch(`/protected/messages/convo/${conversationId}`, {
					method: 'DELETE',
					headers: {
						'Content-Type': 'application/json'
					}
				});

				const data = await response.json();

				if (response.ok) {
					goto(`/protected/messages`);
				}
			} catch (error) {
				console.error('Error deleting conversation:', error);
			}
		}
		window.history.back();
	}
</script>

{#if error}
	<p class="text-red-500 py-4">{error}</p>
{:else if conversation}
	<div
		class="fixed w-full flex justify-between top-0 z-10 px-10 bg-white py-8 dark:bg-black shadow-md dark:shadow-white/10"
	>
		<a href="/protected/messages" class="py-2 px-3">
			<Icon icon="fluent:ios-arrow-24-filled" class="w-7 h-7" />
		</a>
		<div class="flex items-center overflow-x-scroll">
			{#if conversation.participants.length > 2}
		{#each conversation.participants as participant}
			<div class="flex items-center">
				{#if participant.id !== loggedInUserId}
					<div class="flex gap-1 items-center">
						<p class="font-semibold text-lg flex items-center justify-end">
							{participant.name},
						</p>
					</div>
				{/if}
			</div>
		{/each}
			{:else}
			{#each conversation.participants as participant}
			<div class="flex items-center">
				{#if participant.id !== loggedInUserId}
					<div class="flex gap-3 items-center">
						{#if participant.image}
							<img src={participant.image} class="w-7 h-7 rounded-full" alt={participant.name} />
						{:else}
							<Icon
								icon="mingcute:user-3-line"
								class="w-7 h-7 border-2 text-white border-white rounded-full px-1 bg-[#D9D9D9] dark:bg-[#252525]"
							/>
						{/if}

						<p class="font-semibold text-lg flex items-center justify-end">
							{participant.name}
						</p>
					</div>
				{/if}
			</div>
		{/each}
		{/if}
		</div>
		
		<div class="flex items-center">
			<a href="/protected/messages/convo/{conversationId}/manage">
				<Icon icon="mage:dots" class=" w-7 h-7" />
			</a>
		</div>
		
	</div>
{/if}

<div class="relative">
	{#if conversation}
		<div class="flex flex-col py-3 h-screen mt-28 w-full mx-auto overflow-auto">
			{#each conversation.messages as message}
				{#if message.senderId === loggedInUserId}
					<div class="py-2 flex justify-end px-4">
						<p class="bg-gray-100 dark:bg-stone-700 w-1/2 max-w-3/4 break-words whitespace-normal rounded-xl pl-2 pr-3 py-2">
							{message.content}
						</p>
					</div>
				{:else}
					<div class="px-3 py-2">

						<p class="bg-amber-200 dark:bg-amber-800 w-3/5 rounded-xl break-words whitespace-normal pl-2 pr-3 py-2">
							{message.content}
						</p>
					</div>
				{/if}
			{/each}
		</div>
	{:else}
		<div class="dots-loader w-4/5 mx-auto h-screen flex place-content-center">
			<div class="dot bg-black dark:bg-amber-500"></div>
			<div class="dot bg-amber-200 dark:bg-black dark:ring-2 dark:ring-amber-500"></div>
			<div class="dot bg-black dark:bg-amber-500"></div>
		</div>
	{/if}
</div>
<div
	class="h-20 bg-gray-200 dark:bg-stone-900 w-full flex justify-center gap-2 items-center bottom-0 fixed"
>
	<input
		type="text"
		placeholder="Send Message"
		bind:value={content}
		class="bg-white dark:bg-stone-700 px-3 outline-none h-14 w-2/3 rounded-full"
	/>
	<div class="flex gap-2">
		<button onclick={sendMessage}><Icon icon="iconamoon:send-light" class="w-8 h-8" /></button>
		<button onclick={createProject}
			><Icon icon="fluent:document-one-page-add-20-regular" class="w-8 h-8" /></button
		>
	</div>
</div>


<style>
	.dots-loader {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.dot {
		width: 10px;
		height: 10px;
		margin: 5px;
		border-radius: 50%;
		animation: bounce 1.2s infinite ease-in-out;
	}

	.dot:nth-child(2) {
		animation-delay: -0.1s;
	}

	.dot:nth-child(3) {
		animation-delay: -0.2s;
	}

	@keyframes bounce {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-15px);
		}
	}
</style>