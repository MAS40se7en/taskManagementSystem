<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Modal from '$lib/components/Modal.svelte';
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
		project: {
			title: string;
			description: string;
		};
	} | null = null;
	let displayModal = false;

	let user: any;

	const taskId = $page.params.id;

	let errorMessage = '';
	let message = '';
	let calendarData: any;
	let loading = false;
	let calendarLoad = false;

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
				console.log(user);
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

	async function addToGoogleCalendar() {
		calendarLoad = true;
		try {
			const response = await fetch('/api/addToGoogleCalendar', {
				method: 'POST',
				body: JSON.stringify({ task, user })
			});

			const data = await response.json();

			if (response.ok) {
				console.log(data);
				message = data.message;
				calendarData = data.event;

				setTimeout(() => {
					message = '';
				}, 10000);

				calendarLoad = false;
			}
		} catch (error) {
			console.error(error);
		}
	}
</script>

<div
	class="flex justify-between w-full items-center pl-10 pt-12 pb-4 sticky z-10 px-10 dark:text-white
			{task?.urgency === 'important' && 'bg-blue-500 dark:bg-blue-700 text-white'}
			{task?.urgency === 'urgent' && 'bg-purple-500 dark:bg-purple-700 text-white'}
			{task?.urgency === 'very urgent' && 'bg-red-500 dark:bg-red-700 text-white'}
			{task?.urgency === 'normal' && 'bg-yellow-500 dark:bg-yellow-700 text-black'}
			"
>
	<button on:click|preventDefault={goBack} class="py-2" aria-label="Go back">
		<Icon icon="fluent:ios-arrow-24-filled" class="w-7 h-7" />
	</button>
	<div class="flex lg:flex-row lg:items-center">
		<h1 class="text-2xl font-bold mr-2">{task?.title}</h1>
		<button class="lg:ml-auto" on:click={toggleModal}>
			<Icon icon="mage:dots" class="w-7 h-7" />
		</button>
	</div>
</div>

{#if errorMessage}
	<div class="fixed top-0 left-0 right-0 bg-red-600 text-white py-2 px-4 text-center z-30">
		<p>{errorMessage}</p>
	</div>
{/if}

<Modal {displayModal} onClose={() => (displayModal = false)}>
	<div class="bg-white dark:bg-[#252525] rounded-3xl pb-2 pt-4 bottom-0">
		<div class="mb-4 px-3 flex justify-between">
			<h2 class="text-lg font-semibold">Options</h2>
			<p
				class="{task?.urgency === 'important' && 'bg-blue-500 text-white'}
						{task?.urgency === 'urgent' && 'bg-purple-500 text-white'}
						{task?.urgency === 'very urgent' && 'bg-red-500 text-white'}
						{task?.urgency === 'normal' && 'bg-yellow-500 text-black'}
							text-sm px-2 py-1 rounded-full"
			>
				{task?.urgency}
			</p>
		</div>
		{#if !task?.completed}
			<div class="flex flex-col">
				<a
					href="/protected/tasks/{taskId}/edit"
					class="bg-blue-400 dark:bg-blue-600 font-semibold text-center rounded-2xl text-white mt-4 px-4 py-2"
					>Edit Task</a
				>
			</div>
		{/if}
		<button
			on:click={() => toggleTaskCompletion(taskId)}
			disabled={task?.completed}
			class="block w-full rounded-2xl mt-4 px-4 py-2 mb-2
						{task?.completed ? 'bg-transparent border-green-600' : 'bg-green-600 dark:bg-green-800 text-white'}"
		>
			{task?.completed ? 'This task is completed' : 'Mark as Complete'}
		</button>
		{#if task?.createdBy.id == user?.id}
			<button
				on:click={deleteTask}
				class="block w-full bg-red-500 dark:bg-red-700 text-white rounded-2xl mt-4 px-4 py-2 mb-2"
				>Delete Task</button
			>
			{#if loading}
				<div class="flex items-center justify-center">
					<p>Loading...</p>
				</div>
			{/if}
		{/if}
	</div></Modal
>
<div class="items-center">
	<div class="py-3">
		<div class="px-10 flex flex-col gap-3">
			<p class="px-3">{task?.description}</p>
		</div>
		{#if task?.project}
			<div class="py-2 px-8 flex justify-end">
				<div class="flex flex-col opacity-70">
					<h1 class="text-xs font-semibold text-end">Project</h1>
					<h1 class="text-end">{task?.project?.title}</h1>
				</div>
			</div>
		{/if}

		<div class="py-2 px-8 flex justify-end">
			<div class="flex flex-col opacity-70">
				<h1 class="text-xs font-semibold text-end">Created by</h1>
				<h1 class="text-end">{task?.createdBy?.name}</h1>
			</div>
		</div>
		<div class="flex flex-col items-center px-10 w-full py-5">
			{#if task?.completed}
				<p class="bg-green-500 px-5 text-white rounded-lg">completed</p>
			{:else if task?.startsAt && task?.endsAt}
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
					<p class="bg-red-600 dark:bg-red-800 py-1 px-5 rounded-lg text-center text-white">
						{new Date(task?.deadline).toLocaleDateString()}
					</p>
				</div>
			{/if}
		</div>
		{#if user?.googleId}
			<div class="flex flex-col gap-1 items-center justify-center mb-2">
				<button
					on:click={addToGoogleCalendar}
					class="dark:bg-[#252525] dark:border-[#323232] flex items-center justify-center gap-3 w-4/6 border-2 rounded-xl py-3 px-3"
				>
					<Icon icon="devicon:google" class="w-6 h-6" />
					<h1 class="font-semibold text-xs">Add to Google Calendar</h1>
				</button>
				{#if message}
					<div class="dark:bg-[#252525] dark:border-[#323232] px-3 py-2 rounded-xl flex flex-col">
						<p class="text-black text-sm">{message}</p>
						<a href={calendarData.htmlLink} class="font-semibold text-sm">View Calendar</a>
					</div>
				{/if}
			</div>
		{/if}
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
