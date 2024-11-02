<script lang="ts">
	import { onMount } from 'svelte';
	import { json } from '@sveltejs/kit';
	import Icon from '@iconify/svelte';
	import { goto } from '$app/navigation';

	export let conversations: {
		id: number;
		participants: { id: string; name: string; email: string; image: string }[];
		messages: { id: number; content: string; sentAt: string; senderId: string }[];
	}[] = [];

	let searchQuery = '';
	let users: any[] = [];
	let selectedUser: string | null = null;

	export let error: string = '';
	export let loggedInUserId: string = '';

	async function fetchUsers() {
		const response = await fetch('/protected/projects/create');
		if (response.ok) {
			const data = await response.json();
			users = data.allUsers;
		} else {
			console.error('Failed to fetch users');
		}

		console.log('Users: ', users);
	}

	onMount(async () => {
		try {
			const response = await fetch('/protected/messages');
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
	};

	function goBack() {
		window.history.back(); // Navigates to the previous URL in the history stack
	}

	async function createConversation(userId: string) {
		try {
			const response = await fetch('/protected/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ selectedUser: userId }),
            });

			console.log('user id:', userId);
			console.log('response:', response);
			console.log('selected user:', selectedUser);

			if (response.ok) {
				const data = await response.json();
				const conversationId = data.id;
				console.log('Conversation created: ', data);
				goto(`/protected/messages/convo/${conversationId}`);
			} else {
				console.error('Failed to create conversation');
			}
		} catch (error) {
			console.error('Error creating conversation: ', error);
		}
	}
</script>

<div class="pt-12 pb-3 sticky top-0 bg-white w-full">
	<div class="px-10 flex justify-between">
		<button on:click|preventDefault={goBack} class="py-2 px-3">
			<Icon icon="fluent:ios-arrow-24-filled" class="w-7 h-7" />
		</button>
		<div class="flex flex-col">
			<h1 class="text-4xl font-bold">Messages</h1>
		</div>
	</div>
	<div class="mx-auto py-2 rounded-3xl mt-5 w-5/6">
		<div class="flex gap-4 items-center">
			<input
				type="text"
				class="border-2 w-full h-12 rounded-xl px-2"
				placeholder="Search..."
				bind:value={searchQuery}
				on:input={fetchUsers}
			/>
		</div>
		
		
		{#if searchQuery.length > 0}
					<ul class="bg-gray-100 mt-2 rounded-lg z-50 fixed w-5/6 max-h-60 overflow-y-auto">
						{#each users.filter((user) => user.name
								.toLowerCase()
								.includes(searchQuery.toLowerCase())) as user (user.id)}
							<li class="px-3 py-2 flex justify-between items-center">
								<button
									class="flex w-full gap-3"
									on:click={() => createConversation(user.id)}	
								>
									<img src={user.image} alt="" class="w-8 border-2 border-black rounded-full" />
									<p>{user.name}</p>
								</button>
							</li>
						{/each}
					</ul>
				{/if}
	</div>
</div>

<div class="mx-auto h-screen">
	{#if error}
		<p class="text-red-500 py-4">{error}</p>
	{:else if conversations.length > 0}
		<ul class="flex flex-col gap-4 bg-gray-50">
			{#each conversations as conversation}
				<li class="border-b-2 border-black/20 py-3 px-8">
					{#each conversation.participants as participant}
						{#if participant.id !== loggedInUserId}
							<div>
								<a href="/protected/messages/convo/{conversation.id}" class="flex items-center gap-3">
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
