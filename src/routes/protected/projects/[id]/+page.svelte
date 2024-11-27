<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	let project: {
		title: any;
		startsAt: any;
		endsAt: any;
		completed: any;
		createdBy: any;
		description: any;
		users: any;
		tasks: Array<{
			id: any;
			title: string;
			description: string;
			completed: boolean;
			deadline: any;
			imageUrl: any;
			instructions: any;
			urgency: any;
		}>;
	} | null = null;
	let user: any;
	let displayModal = false;

	let errorMessage = '';

	const projectId = $page.params.id;

	// Fetch data function
	async function fetchData() {
		try {
			const res = await fetch(`/protected/projects/${projectId}`);
			if (!res.ok)
				throw new Error(`Failed to fetch project details: ${res.status} ${res.statusText}`);

			const data = await res.json();
			project = data.project;
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
			console.log('project details:', project);
		} catch (error) {
			console.error('Error fetching project:', error);
		}
	}

	// Fetch data on component mount
	onMount(() => {
		fetchData();
	});

	async function setComplete() {
		try {
			const response = await fetch(`/protected/projects/${projectId}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			const data = await response.json();

			if (response.ok) {
				await fetchData();

				displayModal = false;
			} else {
				errorMessage = data.message;
			}

			console.log('Project marked as complete');
		} catch (error) {
			console.error('Error setting project completion:', error);
		}
	}

	async function deleteproject() {
		const response = await fetch(`/protected/projects/${projectId}`, {
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

	async function toggleTaskCompletion(taskId: string) {
		try {
			const response = await fetch(`/protected/tasks/${taskId}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ taskId })
			});

			if (response.ok) {
				await fetchData();
			}
		} catch (error) {
			console.error('Error toggling task completion:', error);
		}
	}

	function goBack() {
		window.history.back(); // Navigates to the previous URL in the history stack
	}
</script>

<div class="h-screen dark:bg-black">
	<div
		class="flex justify-between items-center px-10 pt-12 pb-4 top-0 sticky z-10
	{project?.completed
			? 'bg-green-500 text-white rounded-b-3xl dark:bg-green-600'
			: 'bg-white dark:bg-black'}"
	>
		<button on:click|preventDefault={goBack} class="py-2 px-3">
			<Icon icon="fluent:ios-arrow-24-filled" class="w-7 h-7" />
		</button>
		<div class="flex items-center">
			<h1 class="text-2xl font-bold mr-2">{project?.title}</h1>
			{#if project?.createdBy.id === user?.id}
				<button on:click={toggleModal}>
					<Icon icon="mage:dots" class=" w-7 h-7" />
				</button>
			{/if}
		</div>

		{#if displayModal}
			<div
				class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-20"
				role="dialog"
				aria-modal="true"
			>
				<div class="bg-white text-black rounded-3xl px-4 pb-2 pt-4 w-3/4 bottom-0">
					<h2 class="text-lg font-semibold mb-4 px-3">Options</h2>
					<div class="px-3 flex flex-col">
						<a href="/projects/{projectId}/edit" class="font-light">Edit Project</a>
					</div>
					{#if project?.completed}
						<p
							class="block w-full border-2 text-green-500 border-green-500 text-center rounded-2xl mt-4 px-4 py-2 mb-2"
						>
							Project is Complete!
						</p>
					{:else}
						<button
							on:click={setComplete}
							class="block w-full bg-green-500 text-white rounded-2xl mt-4 px-4 py-2 mb-2"
							>Set Project as Complete</button
						>
					{/if}

					<button
						on:click={deleteproject}
						class="block w-full bg-red-500 text-white rounded-2xl mt-4 px-4 py-2 mb-2"
						>Delete Task</button
					>
					<button
						on:click={() => (displayModal = false)}
						class="block w-full text-red-500 rounded-2xl px-4 py-2 mb-2">Close</button
					>
				</div>
			</div>
		{/if}
	</div>

	<div class="py-10 items-center justify-center">
		{#if errorMessage}
			<div class="w-4/6 bg-red-600 mx-auto px-3 py-2 rounded-xl">
				<p class="text-white font-semibold">
					{errorMessage}
				</p>
			</div>
		{/if}

		<div class="px-8 flex flex-col gap-3">
			<h1 class="text-lg font-semibold">Description</h1>
			<p class="px-3">{project?.description}</p>
		</div>
		<div class="py-2 px-8">
			<h1 class="text-lg font-semibold">Created by</h1>
			<h1 class="px-3">{project?.createdBy?.name}</h1>
		</div>
		<div class="py-2 px-8">
			<div class="flex justify-between">
				<h1 class="text-lg font-semibold">Assigned to</h1>
				{#if !project?.completed && project?.createdBy?.id === user?.id}
					<a href={`/protected/projects/${projectId}/edit-users`}>
						<Icon
							icon="bxs:edit"
							class="text-[#d4be76] w-7 mr-3 text-2xl rounded-full content-center h-fit"
						/>
					</a>
				{/if}
			</div>
			<ul
				class="border-2 border-[#ffe48d] dark:border-[#9b8b57] px-3 py-2 my-2 flex flex-col gap-2 max-h-36 rounded-2xl overflow-auto"
			>
				{#if project?.users && project.users.length > 0}
					{#each project.users as user}
						<li>
							<a href={`/protected/users/${user.id}`} class="flex items-center gap-3">
								{#if user.image}
									<img src={user.image} alt="" class="w-8 rounded-full" />
								{:else}
									<Icon
										icon="mingcute:user-3-line"
										class="w-8 h-8 border-4 border-black rounded-full px-1"
									/>
								{/if}
								<h1>{user.name}</h1>
							</a>
						</li>
					{/each}
				{:else}
					<li class="text-sm p-2 text-red-500">No participants assigned to this project.</li>
				{/if}
			</ul>
		</div>

		<div class="grid grid-cols-2 gap-2 px-16 text-xs py-5">
			<h1 class="text-center font-semibold">Starts At</h1>
			<h1 class="text-center font-semibold">Ends At</h1>
			<p class="bg-green-600 text-white py-1 px-2 rounded-lg text-center">
				{new Date(project?.startsAt).toLocaleDateString()}
			</p>
			<p class="bg-red-600 dark:bg-red-800 text-white py-1 px-2 rounded-lg text-center">
				{new Date(project?.endsAt).toLocaleDateString()}
			</p>
		</div>
		<div class="mt-4 px-8 py-4 h-screen bg-gray-100 dark:bg-[#151515] w-full">
			<div class="flex justify-between py-5 sticky">
				<h2 class="text-lg font-bold">Tasks:</h2>
				{#if !project?.completed && project?.createdBy.id === user?.id}
					<a
						href="/protected/create/projectTasks-{projectId}"
						class="py-1 px-2 border-2 rounded-xl border-green-400 dark:border-green-600 text-green-600"
					>
						Add tasks
					</a>
				{/if}
			</div>
			{#if project?.tasks && project.tasks.length > 0}
				<div class="h-screen px-5">
					{#each project.tasks as task}
						<div
							class="px-3 py-2 mb-3 rounded-xl shadow-md
							{task.urgency === 'important' && 'bg-[#5d52ff] dark:bg-[#373097] text-white'}
							{task.urgency === 'urgent' && 'bg-[#ad1aad] dark:bg-[#8b278b] text-white'}
							{task.urgency === 'very urgent' && 'bg-[#b62b2b] dark:bg-[#aa2929] text-white'}
							{task.urgency === 'normal' && 'bg-[#c2c477] dark:bg-[#9d9e5f] dark:text-white text-black'}
						"
						>
							<div class="flex justify-between">
								<a href={`/protected/tasks/${task.id}`} class="font-semibold mb-3">{task.title}</a>
								<p>{new Date(task.deadline).toLocaleDateString()}</p>
							</div>
							<div class="text-center py-2">
								<button
									on:click={() => toggleTaskCompletion(task.id)}
									class="w-full py-2 rounded-2xl font-semibold {task.completed
										? 'border-2 border-[#e0ca81]'
										: 'bg-green-500 text-white border-2 border-[#ffe591]'}"
								>
									{task.completed ? 'This task is completed' : 'Mark as complete'}
								</button>
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
