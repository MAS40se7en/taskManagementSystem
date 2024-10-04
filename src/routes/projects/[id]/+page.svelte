<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	let project: {
		title: any;
		startsAt: any;
		endsAt: any;
		createdBy: any;
		description: any;
		tasks: Array<{ 
			title: string;
			description: string; 
			deadline: any; 
			imageUrl: any; 
			instructions: any; 
		}>;
	} | null = null;
	let displayModal = false;

	const projectId = $page.params.id;

	// Fetch data function
	async function fetchData() {
		try {
			const res = await fetch(`/projects/${projectId}`);
			if (!res.ok)
				throw new Error(`Failed to fetch project details: ${res.status} ${res.statusText}`);

			project = await res.json();
			console.log('project details:', project);
		} catch (error) {
			console.error('Error fetching project:', error);
		}
	}

	// Fetch data on component mount
	onMount(() => {
		fetchData();
	});

	async function deleteproject() {
		const response = await fetch(`/projects/${projectId}`, {
			method: 'DELETE'
		});

		if (response.ok) {
			console.log('project deleted successfully');
			goto('/');
		} else {
			console.error('Failed to delete project:', response.status, await response.text());
		}
	}

	function toggleModal() {
		displayModal = !displayModal; // Toggle the modal visibility
		console.log(displayModal);
	}
</script>

<div class="pb-28 h-screen">
	<div class="flex justify-between items-center px-10 pt-12 pb-4 top-0 sticky z-10 bg-white">
		<a href="/projects" class="py-2 px-3">
			<Icon icon="fluent:ios-arrow-24-filled" class="w-7 h-7" />
		</a>
		<div class="flex items-center">
		<h1 class="text-2xl font-bold mr-2">{project?.title}</h1>
		<button  on:click={toggleModal}>
			<Icon icon="mage:dots" class=" w-7 h-7" />
		</button>
		
	</div>

	{#if displayModal}
		<div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-20"
		role="dialog"
		aria-modal="true"
		on:click={() => displayModal = false}>
			<div class="bg-white rounded-3xl px-4 pb-2 pt-4 w-3/4 bottom-0" on:click|stopPropagation tabindex="0">
				<h2 class="text-lg font-semibold mb-4 px-3">Options</h2>
				<div class="px-3 flex flex-col">
					<a href="/projects/{projectId}/edit">Edit Project</a>
				</div>
				<button on:click={deleteproject} class="block w-full bg-red-500 text-white rounded-2xl mt-4 px-4 py-2 mb-2">Delete Project</button>
			</div>
		</div>
	{/if}

	</div>
	<div class="py-10 items-center justify-center">
		<div class="px-8 flex flex-col gap-3">
			<h1 class="text-lg font-semibold">Description</h1>
			<p class="px-3">{project?.description}</p>
		</div>
		<div class="py-2 px-8">
			<h1 class="text-lg font-semibold">Created by</h1>
			<h1 class="px-3">{project?.createdBy?.name}</h1>
		</div>
		<div class="py-2 px-8">
			<h1 class="text-lg font-semibold">Assigned to</h1>
			<h1 class="px-3">USERS</h1>
		</div>
		<div class="grid grid-cols-2 gap-2 px-16 text-xs py-5 shadow-xl">
			<h1 class="text-center font-semibold">Starts At</h1>
			<h1 class="text-center font-semibold">Ends At</h1>
			<p class="bg-green-600 text-white py-1 px-2 rounded-lg text-center">
				{new Date(project?.startsAt).toLocaleDateString()}
			</p>
			<p class="bg-red-600 text-white py-1 px-2 rounded-lg text-center">
				{new Date(project?.endsAt).toLocaleDateString()}
			</p>
		</div>
		<div class="mt-4 px-8 py-4 mb-3 bg-gray-100 w-full">
			<div class="flex justify-between py-5 sticky">
				<h2 class="text-lg font-bold">Tasks:</h2>
				<a
					href="/create/projectTasks-{projectId}"
					class="py-1 px-2 border-2 rounded-xl border-green-400 text-green-600">Add tasks</a
				>
			</div>
			{#if project?.tasks && project.tasks.length > 0}
				<div class="h-screen px-5">
					{#each project.tasks as task}
						<div class="text-gray-700 bg-amber-200 px-3 py-2 mb-3 rounded-2xl">
							<h1 class="font-semibold mb-3">{task.title}</h1>
							<div class="flex justify-end">
								<p>{new Date(task.deadline).toLocaleDateString()}</p>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<p>No tasks available for this project.</p>
			{/if}
		</div>
	</div>
</div>
