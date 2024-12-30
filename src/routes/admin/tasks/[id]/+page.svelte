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
		imagePath?: any;
		instructions: {
			type: 'audio' | 'text';
			path?: string;
			content?: string;
		} | null;
		urgency: any;
		completed: any;
		createdAt: any;
		createdBy: { id: string; name: string };
		project: {
			id: any;
			title: string;
		};
	} | null = null;

	const taskId = $page.params.id;
	let loading = true;
	let errorMessage = '';
	let message = '';
	let type = 'Task';
	let loadingDelete = false;
	let loadingTaskCompletion = false;

	async function fetchData() {
		try {
			const response = await fetch(`/admin/tasks/${taskId}`);
			const data = await response.json();

			if (response.ok) {
				loading = false;
				task = data.task;
				console.log(task);
			} else {
				loading = false;
				errorMessage = data.message;
			}
		} catch (error) {
			loading = false;
			errorMessage = 'error loading the task';
		}
	}

	console.log(taskId);

	onMount(async () => {
		await fetchData();
	});

	async function deleteTask(taskId: any) {
		loadingDelete = true;

		try {
			const response = await fetch(`/admin/tasks/${taskId}`, {
				method: 'DELETE',
				body: JSON.stringify({ taskId })
			});

			const data = await response.json();

			if (response.ok) {
				loadingDelete = false;
				message = data.message;
				goto('/admin');
			} else {
				loadingDelete = false;
				errorMessage = data.message;
			}
		} catch (error) {
			errorMessage = 'Could not delete the item';
		}
	}

	async function toggleTaskCompletion(taskId: string) {
		loadingTaskCompletion = true;
		try {
			const response = await fetch(`/admin/tasks/${taskId}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ taskId })
			});

			const data = await response.json();

			if (response.ok) {
				await fetchData();
				loadingTaskCompletion = false;
			} else {
				errorMessage = data.message;
			}
		} catch (error) {
			console.error('Error toggling task completion:', error);
		}
	}
</script>

<div class="dark:bg-black p-10">
	<div class="lg:w-4/5 md:5/6 mx-auto flex flex-col gap-10">
		{#if loading}
			<div class="flex justify-between items-center">
				<div class="h-10 w-20 dark:bg-[#161616] bg-[#adadad] rounded-full"></div>
				<div class="h-6 w-36 dark:bg-[#161616] bg-[#adadad] rounded-full"></div>
			</div>
			<div class="h-96 w-full dark:bg-[#161616] bg-[#adadad] rounded-3xl"></div>
		{:else}
			<div>
				<div class="flex justify-between items-center">
					<h1 class="text-4xl font-bold">{task?.title}</h1>
					<p class="font-semibold">
						<span class="text-xs">created at: </span>{new Date(
							task?.createdAt
						).toLocaleDateString()}
					</p>
				</div>
			</div>
			<div class="flex flex-col bg-[#D9D9D9] dark:bg-[#252525] py-5 rounded-3xl">
				<div class="flex justify-center gap-5 mb-5">
					<a href="/admin/users/{task?.createdBy?.id}" class="opacity-70 hover:opacity-100"
						><span class="text-xs">created by: </span>{task?.createdBy?.name}</a
					>
					<a href="/admin/projects/{task?.project?.id}" class="opacity-70 hover:opacity-100"
						><span class="text-xs">related project: </span>{task?.project?.title}</a
					>
				</div>
				<div class="flex justify-between">
					<div class="px-5 w-3/5">
						<h1 class="text-xl font-semibold">Description</h1>
						<p class="px-3 py-3 w-full text-wrap">{task?.description}</p>
					</div>
					<div class="px-5 w-3/5">
						<h1 class="font-semibold text-xl">Instructions</h1>
						<div
							class="px-3 py-3 flex {task?.instructions?.type === 'audio'
								? 'flex-col gap-4'
								: 'justify-between'}"
						>
							<p class="font-semibold">
								<span class="text-xs font-normal">type: </span>{task?.instructions?.type}
							</p>
							{#if task?.instructions?.type === 'text'}
								<div class="w-3/5">
									<p class="text-sm font-semibold">Content:</p>
									<p class="text-wrap font-normal">
										{task?.instructions?.content}
									</p>
								</div>
							{:else}
								<div
									class="flex gap-3 items-center mt-3 rounded-full mx-auto w-fit justify-center border-2"
								>
									<audio controls>
										<source src={task?.instructions?.path} type="audio/wav" />
										Your browser does not support the audio element.
									</audio>
								</div>
							{/if}
						</div>
					</div>
				</div>
				<div class="flex flex-col items-center px-10 w-full pt-5">
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
			</div>
			<div class="w-3/5 mx-auto">
				<div><h1 class="text-2xl font-semibold">Actions</h1></div>
				<div class="flex gap-5 justify-center py-5">
					{#if loadingTaskCompletion}
						<div class="flex justify-center">
							<Icon
								icon="line-md:loading-twotone-loop"
								class="w-8 h-8 my-2 text-green-300 dark:text-green-600"
							/>
						</div>
					{:else}
						<button
							on:click={() => toggleTaskCompletion(taskId)}
							class="rounded-full px-5
						{task?.completed
								? 'bg-transparent border-green-600 border-2'
								: 'bg-green-500 dark:bg-green-700 dark:active:bg-green-800 active:bg-green-600 text-white'}"
						>
							{task?.completed ? 'This task is completed' : 'Mark as Complete'}
						</button>
					{/if}
					<a
						href="/admin/{type}-edit-{taskId}"
						class="text-white text-center bg-blue-400 hover:bg-blue-500 active:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 dark:active:bg-blue-800 px-5 py-2 rounded-full"
						>Edit</a
					>
					<button
						on:click={() => deleteTask(taskId)}
						class="text-white bg-red-500 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800 px-5 py-2 rounded-full"
						>Delete</button
					>
				</div>
			</div>
		{/if}
	</div>
</div>
