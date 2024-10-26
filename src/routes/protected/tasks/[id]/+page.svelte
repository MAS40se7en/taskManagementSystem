<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	let task: {
		title: any;
		imageUrl: any;
		description: any;
		deadline: any;
		instructions: any;
		createdBy: { id: string; name: string };
	} | null = null;
	let displayModal = false;

	let user: {
		id: string;
		name: string;
	} | null = null;

	const taskId = $page.params.id;

	// Fetch data function
	async function fetchData() {
		try {
			const res = await fetch(`/protected/tasks/${taskId}`);
			if (!res.ok) throw new Error(`Failed to fetch task details: ${res.status} ${res.statusText}`);

			const data = await res.json();
			task = data.task;
			user = data.user;
			console.log('Task details:', task);
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

		if (response.ok) {
			console.log('Task deleted successfully');
			goto('/');
		} else {
			console.error('Failed to delete task:', response.status, await response.text());
		}
	}

	function toggleModal() {
		displayModal = !displayModal;
		console.log(displayModal);
	}

	//async function toggleTaskCompletion(taskId: number, isCompleted: boolean) {
	//	try {
	//		await fetch(`/protected/tasks/${taskId}`, {
	//			method: 'POST',
	//			headers: {
	//				'Content-Type': 'application/json'
	//			},
	//			body: JSON.stringify({ completed: !isCompleted })
	//		});
//
	//		fetchData();
	//	} catch (error) {
	//		console.error('Error toggling task completion:', error);
	//	}
	//}
</script>

<div class="mb-20 h-screen">
	<div class="flex justify-between items-center px-10 pt-12 pb-4 top-0 sticky z-10 bg-white">
		<a href="/protected/tasks" class="py-2 px-3">
			<Icon icon="fluent:ios-arrow-24-filled" class="w-7 h-7" />
		</a>
		<div class="flex items-center">
			<h1 class="text-2xl font-bold mr-2">{task?.title}</h1>
			<button on:click={toggleModal}>
				<Icon icon="mage:dots" class=" w-7 h-7" />
			</button>
		</div>

		{#if displayModal}
			<div
				class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-20"
				role="dialog"
				aria-modal="true"
				on:click={() => (displayModal = false)}
			>
				<div
					class="bg-white rounded-3xl px-4 pb-2 pt-4 w-3/4 bottom-0"
					on:click|stopPropagation
					tabindex="0"
				>
					<h2 class="text-lg font-semibold mb-4 px-3">Options</h2>
					<div class="px-3 flex flex-col">
						<a href="/tasks/{taskId}/edit">Edit Task</a>
					</div>
					<button
						on:click={deleteTask}
						class="block w-full text-red-500 rounded-2xl mt-4 px-4 py-2 mb-2">Delete Task</button
					>
				</div>
			</div>
		{/if}
	</div>
	<div class="py-10 items-center justify-center">
		<div class="px-2 flex items-center justify-center py-5">
			{#if task?.imageUrl}
				<img src={task?.imageUrl} alt="" class="max-w-72 rounded-xl" />
			{:else}
				<div class="bg-gray-200 h-20 w-5/6 rounded-2xl gap-4 flex justify-center items-center">
					<Icon icon="carbon:no-image" class="w-8 h-8" />
					{#if task?.createdBy.id === user?.id}
						<button class="bg-gray-300 py-1 px-2 rounded-lg">Add Image</button>
					{/if}
				</div>
			{/if}
		</div>
		<div class="py-3">
			<div class="px-10 flex flex-col gap-3">
				<h1 class="text-lg font-semibold">Description</h1>
				<p class="px-3">{task?.description}</p>
			</div>
			<div class="flex flex-col items-end px-10 w-full py-5">
				<p class="font-semibold text-sm">deadline</p>
				<p class="bg-red-500 px-5 text-white rounded-lg">{new Date(task?.deadline).toLocaleDateString()}</p>
			</div>
			<div class="bg-gray-100 h-screen">
				{#if task?.instructions && task?.instructions.length > 0}
					<h1 class="font-bold text-xl px-10 py-5">Instructions</h1>
					<p class="px-6 py-3 rounded-xl bg-gray-200 w-5/6 mx-auto">{task?.instructions}</p>
				{/if}
			</div>
		</div>
		
	</div>
</div>
