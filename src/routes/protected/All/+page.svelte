<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import TasksProjects from '$lib/components/TasksProjects.svelte';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	let items: any[] = [];
	let errorMessage = '';

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
				// Combine projects and tasks
				const projects = data.projects.map((project: any) => ({ ...project, type: 'Project' }));
				const tasks = data.tasks.map((task: any) => ({ ...task, type: 'Task' }));

				// Combine and shuffle items
				items = shuffle([...projects, ...tasks]);
			} else {
				errorMessage = 'Failed to fetch projects and tasks';
			}
		} catch (error) {
			errorMessage = 'An error occurred while fetching data.';
		}
	});
</script>

<div class="mx-auto h-screen px-2 bg-gray-50 dark:bg-black">
	{#if items.length > 0}
		<ul class="flex flex-col w-full mx-auto gap-4 rounded-2xl py-4">
			{#each items as item}
				<li
					class="relative py-2 w-full rounded-xl min-h-32 mx-auto shadow-md
                        {item.type === 'Project' && 'bg-[#e9e9e9] dark:bg-[#c2c2c2] dark:text-black text-black'}
                                    {item.type === 'Task' && item.urgency === 'important' && 'bg-[#5d52ff] dark:bg-[#373097] text-white'}
						            {item.type === 'Task' && item.urgency === 'urgent' && 'bg-[#ad1aad] dark:bg-[#8b278b] text-white'}
						            {item.type === 'Task' && item.urgency === 'very urgent' && 'bg-[#b62b2b] dark:bg-[#aa2929] text-white'}
						            {item.type === 'Task' && item.urgency === 'normal' && 'bg-[#c2c477] dark:bg-[#9d9e5f] dark:text-white text-black'}
                    "
				>
					<a
						href={item.type === 'Project'
							? `/protected/projects/${item.id}`
							: `/protected/tasks/${item.id}`}
						class="text-lg px-3 font-semibold">{item.title}</a
					>
					{#if item.type === 'Project'}
						<p class="text-sm px-3">Starts at: {new Date(item.startsAt).toLocaleDateString()}</p>
						<p class="text-sm px-3">Ends at: {new Date(item.endsAt).toLocaleDateString()}</p>
						<div class="flex justify-end bottom-0 absolute w-full px-3 py-2">
							<p class="border-2 border-black w-fit py-1 px-2 rounded-full text-xs opacity-50">
								Project
							</p>
						</div>
					{:else if item.type === 'Task' && item.completed}
						<p class="text-sm bg-green-500 w-fit px-3 ml-4 mt-2 text-white rounded-xl h-fit py-2">
							completed
						</p>
						<div class="flex justify-end bottom-0 absolute w-full px-3 py-2">
							<p class="border-2 border-black w-fit py-1 px-2 rounded-full text-xs">Task</p>
						</div>
					{:else}
						<p class="text-sm px-3">Created on: {new Date(item.deadline).toLocaleDateString()}</p>
						<div class="flex justify-end bottom-0 absolute w-full px-3 py-2">
							<p class="border-2 border-black w-fit py-1 px-2 rounded-full text-xs">Task</p>
						</div>
					{/if}
					{#if item.completed}
						<div
							class="absolute backdrop-blur-sm right-0 top-0 rounded-r-2xl items-center justify-center bg-opacity-60 z-20
                                    {item.type === 'Project' && 'bg-white/30 dark:text-white text-black'}
                                    {item.type === 'Task' && item.urgency === 'important' && 'bg-[#5d52ff]/10 dark:bg-[#433ab6]/30 text-white'}
						            {item.type === 'Task' && item.urgency === 'urgent' && 'bg-[#ad1aad]/10 dark:bg-[#b934b9]/30 text-white'}
						            {item.type === 'Task' && item.urgency === 'very urgent' && 'bg-[#b62b2b]/10 dark:bg-[#c02e2e]/30 text-white'}
						            {item.type === 'Task' && item.urgency === 'normal' &&'bg-[#fcff4c]/10 dark:bg-[#c3c530]/30 dark:text-white text-black'}"
						>
							<p><Icon icon="typcn:tick-outline" class="w-32 h-32" /></p>
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	{:else}
	<div class="text-center ">
		<p>No projects or tasks related to you were found.</p>
	</div>
	{/if}

	{#if errorMessage}
	<div class="text-center ">
		<p class="text-red-500 mt-4">{errorMessage}</p>
	</div>
	{/if}
</div>
