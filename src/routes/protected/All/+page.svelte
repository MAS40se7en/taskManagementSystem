<script lang="ts">
	import { goto } from '$app/navigation';
	import Navbar from '$lib/components/Navbar.svelte';
	import { onMount } from 'svelte';
	import Icon from '@iconify/svelte';

	let items: any[] = [];
	let user: any;
	let errorMessage = '';
	let loading = true;


	function shuffle(array: any[]) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}

	onMount(async () => {
		try {
			const response = await fetch('/protected/All');
			if (response.ok) {
				const data = await response.json();
				user = data.user;
				const projects = data.projects.map((project: any) => ({
					...project,
					type: 'Project',
					createdAt: project.createdAt || project.dateCreated || new Date().toISOString(),
				}));
				const tasks = data.tasks.map((task: any) => ({
					...task,
					type: 'Task',
					createdAt: task.createdAt || task.dateCreated || new Date().toISOString(),
				}));

				if (!user) {
					alert('Unauthorized access');
					goto('/auth/login');
				}

				if (!user?.isVerified) {
					alert('Please verify your email to use the application');
					const url = new URL(
						`/auth/register/verify-email/`,
						window.location.origin
					);
					url.searchParams.append('userId', user?.id);
					goto(url.toString());
				}

				items = [...projects, ...tasks].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA; // Descending order
});



				loading = false;
			} else {
				errorMessage = 'Failed to fetch projects and tasks';
			}
		} catch (error) {
			errorMessage = 'An error occurred while fetching data.';
		}


	});


</script>

<div class="mx-auto h-screen px-4 bg-gray-50 dark:bg-[#151515]">
	{#if loading}
		<ul class="flex flex-col gap-5 pt-3">
			<li>
				<div class="h-32 w-full bg-gray-300/50 dark:bg-gray-300/10 rounded-lg" />
			</li>
			<li>
				<div class="h-32 w-full bg-gray-300/50 dark:bg-gray-300/10 rounded-lg" />
			</li>
			<li>
				<div class="h-32 w-full bg-gray-300/50 dark:bg-gray-300/10 rounded-lg" />
			</li>
			<li>
				<div class="h-32 w-full bg-gray-300/50 dark:bg-gray-300/10 rounded-lg" />
			</li>
		</ul>
	{:else}
		{#if items.length > 0}
			<ul class="flex flex-col gap-4 py-6">
				{#each items as item}
					<li
						class="relative min-h-24 flex flex-col bg-white dark:bg-[#202020] rounded-lg shadow-md overflow-hidden"
					>
						<div
							class="flex items-center gap-3 px-4 py-3 {item.completed
								? 'z-20 absolute top-0 bottom-0'
								: ''}"
						>
							{#if item.type === 'Task'}
								<span
									class="h-3 w-3 rounded-full
						{item.urgency === 'important' && 'bg-blue-500'}
						{item.urgency === 'urgent' && 'bg-purple-500'}
						{item.urgency === 'very urgent' && 'bg-red-500'}
						{item.urgency === 'normal' && 'bg-yellow-500'}"
								></span>
							{/if}
							<div class="flex gap-1 flex-col">
								<a
									href={item.type === 'Project'
										? `/protected/projects/${item.id}`
										: `/protected/tasks/${item.id}`}
									class="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:underline
								{item.completed ? 'text-sm' : ''}
							"
								>
									{item.title}
								</a>
								{#if item.type === 'Task' && item.project}
									<a href="/protected/projects/{item.project.id}" class="text-sm opacity-30"
										>{item.project.title}</a
									>
								{/if}
							</div>
						</div>

						<div class="px-4 pb-3 text-sm text-gray-600 dark:text-gray-400">
							{#if item.type === 'Project'}
								<p>Starts at: {new Date(item.startsAt).toLocaleDateString()}</p>
								<p>Ends at: {new Date(item.endsAt).toLocaleDateString()}</p>
							{:else if item.type === 'Task'}
								{#if item.startsAt && item.endsAt}
									<p>Starts at: {new Date(item.startsAt).toLocaleDateString()}</p>
									<p>Ends at: {new Date(item.endsAt).toLocaleDateString()}</p>
								{:else if item.deadline}
									<p>Deadline: {new Date(item.deadline).toLocaleDateString()}</p>
								{/if}
								{#if item.completed}
									<span
										class="mt-2 inline-block bg-green-500 text-white text-xs py-1 px-2 rounded-full"
									>
										Completed
									</span>
								{/if}
							{/if}
						</div>

						<div class="absolute bottom-3 right-4">
							<span
								class="text-xs px-3 py-1 border rounded-full
							{item.type === 'Project' && 'border-gray-400 text-gray-500'}
							{item.type === 'Task' && 'border-blue-400 text-blue-500'}"
							>
								{item.type}
							</span>
						</div>

						{#if item.completed}
							<div
								class="absolute inset-0 bg-green-500/20 backdrop-blur-md rounded-lg flex items-center justify-end pr-10 z-10"
							>
								<Icon icon="typcn:tick-outline" class="w-12 h-12 text-green-600 righ-5" />
							</div>
						{/if}
					</li>
				{/each}
			</ul>
		{:else}
			<div class="flex justify-center items-center h-full text-gray-500">
				<p>No projects or tasks related to you were found.</p>
			</div>
		{/if}

		{#if errorMessage}
			<div class="text-center mt-4 text-red-500">
				<p>{errorMessage}</p>
			</div>
		{/if}
	{/if}
</div>
