<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	let task: {
		title: any;
		description: any;
		deadline?: any;
		startsAt?: any;
		endsAt?: any;
		instructions: {
			type: 'audio' | 'text';
			path?: string;
			content?: string;
		} | null;
		urgency: any;
		completed: any;
		createdBy: { id: string; name: string };
	} | null = null;
	let displayModal = false;

	let user: {
		id: any;
		name: string;
		isVerified: boolean;
	} | null = null;

	const taskId = $page.params.id;

	let errorMessage = '';

	// Fetch data function
	async function fetchData() {
		try {
			const response = await fetch(`/protected/tasks/${taskId}`);

			const data = await response.json();

			if (response.ok) {
				task = data.task;
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
				console.log('Task details:', task);
				console.log(task?.instructions);
			} else {
				errorMessage = data.message;
			}
		} catch (error) {
			console.error('Error fetching task:', error);
		}
	}

	// Fetch data on component mount
	onMount(() => {
		fetchData();
	});

	async function deleteTask() {
		const response = await fetch(`/protected/tasks/${taskId}`, {
			method: 'DELETE'
		});

		const data = await response.json();

		if (response.ok) {
			console.log('Task deleted successfully');
			goto('/');
		} else {
			errorMessage = data.message;
			console.error('Failed to delete task:', response.status, await response.text());
		}
	}

	function toggleModal() {
		displayModal = !displayModal;
		console.log(displayModal);
	}

	function goBack() {
		window.history.back(); // Navigates to the previous URL in the history stack
	}

	async function toggleTaskCompletion(taskId: string) {
		try {
			const response = await fetch(`/protected/tasks/${taskId}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ taskId })
			});

			const data = await response.json();

			if (response.ok) {
				await fetchData();
			} else {
				errorMessage = data.message;
			}
		} catch (error) {
			console.error('Error toggling task completion:', error);
		}
	}
</script>

<div
	class="flex justify-between w-full items-center pl-10 pt-12 pb-4 top-0 sticky z-10 rounded-b-3xl
			{task?.urgency === 'important' && 'bg-[#5d52ff] dark:bg-[#373097] text-white'}
			{task?.urgency === 'urgent' && 'bg-[#ad1aad] dark:bg-[#8b278b] text-white'}
			{task?.urgency === 'very urgent' && 'bg-[#b62b2b] dark:bg-[#aa2929] text-white'}
			{task?.urgency === 'normal' && 'bg-[#76fc9e] dark:bg-[#29a74f] dark:text-white text-black'}"
>
	<button on:click|preventDefault={goBack} class="py-2 px-3">
		<Icon icon="fluent:ios-arrow-24-filled" class="w-7 h-7" />
	</button>
	<div class="flex items-center w-full px-5 py-2 rounded-l-3xl justify-between">
		<h1 class="text-2xl font-bold mr-2">{task?.title}</h1>
		<button on:click={toggleModal}>
			<Icon icon="mage:dots" class=" w-7 h-7" />
		</button>
	</div>
</div>

{#if errorMessage}
	<div class="w-4/6 bg-red-600 px-3 py-2 mx-auto rounded-lg my-2">
		<p class="text-white font-semibold">
			{errorMessage}
		</p>
	</div>
{/if}

<div>
	{#if displayModal}
		<div
			class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-20"
			role="dialog"
			aria-modal="true"
		>
			<div class="bg-white rounded-3xl px-4 pb-2 pt-4 w-3/4 bottom-0">
				<div class="mb-4 px-3 flex justify-between">
					<h2 class="text-lg font-semibold">Options</h2>
					<p
						class="{task?.urgency === 'important' && 'bg-[#5d52ff]  text-white'}
									{task?.urgency === 'urgent' && 'bg-[#ad1aad]  text-white'}
									{task?.urgency === 'very urgent' && 'bg-[#ff1717]  text-white'}
									{task?.urgency === 'normal' && 'bg-[#76fc9e] text-black'}
									text-sm px-2 py-1 rounded-full"
					>
						{task?.urgency}
					</p>
				</div>
				<div class="px-3 flex flex-col">
					<a href="/tasks/{taskId}/edit">Edit Task</a>
				</div>
				<button
					on:click={() => toggleTaskCompletion(taskId)}
					disabled={task?.completed}
					class="block w-full rounded-2xl mt-4 px-4 py-2 mb-2
								{task?.completed ? 'bg-transparent border-green-600' : 'bg-green-600 text-white'}"
				>
					{task?.completed ? 'This task is completed' : 'Mark as Complete'}
				</button>
				{#if task?.createdBy.id == user?.id}
					<button
						on:click={deleteTask}
						class="block w-full bg-red-500 text-white rounded-2xl mt-4 px-4 py-2 mb-2"
						>Delete Task</button
					>
				{/if}

				<button
					on:click={() => (displayModal = false)}
					class="block w-full text-red-500 rounded-2xl px-4 py-2 mb-2">Close</button
				>
			</div>
		</div>
	{/if}
</div>
<div class="items-center">
	<div class="py-3">
		<div class="px-10 flex flex-col gap-3">
			<h1 class="text-lg font-semibold">Description</h1>
			<p class="px-3">{task?.description}</p>
		</div>
		<div class="flex flex-col items-end px-10 w-full py-5">
			{#if task?.completed}
				<p class="bg-green-500 px-5 text-white rounded-lg">completed</p>
			{:else}
			{#if task?.startsAt && task?.endsAt}
			<div class="grid grid-cols-2 gap-2 text-sm py-5">
				<h1 class="text-center font-semibold">Starts At</h1>
				<h1 class="text-center font-semibold">Ends At</h1>
				<p class="bg-green-600 text-white py-1 px-2 rounded-lg text-center">
					{new Date(task?.startsAt).toLocaleDateString()}
				</p>
				<p class="bg-red-600 dark:bg-red-800 text-white py-1 px-2 rounded-lg text-center">
					{new Date(task?.endsAt).toLocaleDateString()}
				</p>
			</div>
			{:else if !task?.startsAt && task?.deadline}
			<div class="flex flex-col justify-center text-sm place-items-center">
				<h1 class="font-semibold">Deadline</h1>
				<p class="bg-red-600 dark:bg-red-800 py-1 px-2 rounded-lg text-center text-white">{new Date(task?.deadline).toLocaleDateString()}</p>
			</div>
			{/if}
			{/if}
		</div>
		<div class="bg-gray-100 dark:bg-[#151515] h-screen">
			{#if task?.instructions}
				<h1 class="font-bold text-xl px-10 py-5">Instructions</h1>
				{#if task.instructions.type == 'audio'}
					<div
						class="flex gap-3 items-center mt-3 rounded-full mx-auto w-fit justify-center border-2"
					>
						<audio controls>
							<source src={task?.instructions.path} type="audio/wav" />
							Your browser does not support the audio element.
						</audio>
					</div>
				{:else if task?.instructions.type == 'text'}
					<div class="flex gap-3 items-center mt-3 pb-4 px-14">
						<p>{task?.instructions.content}</p>
					</div>
				{/if}
			{/if}
		</div>
	</div>
</div>
