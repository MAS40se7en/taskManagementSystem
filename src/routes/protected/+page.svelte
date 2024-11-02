<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import { onMount } from 'svelte';

	let tasks: any[] = [];
	let sortOption = 'deadline';

	// Fetch tasks and apply the default sort on mount
	onMount(async () => {
		const res = await fetch('/protected');
		tasks = await res.json();
		sortTasks();
	});

	// Sort tasks based on current sorting preference
	function sortTasks() {
		if (sortOption === 'deadline') {
			tasks.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
		} else if (sortOption === 'title') {
			tasks.sort((a, b) => a.title.localeCompare(b.title));
		}
	}
</script>

<div class="mx-auto relative dark:bg-black">
	<ul class="px-2 py-2 flex w-full flex-col gap-4">
		{#if tasks.length > 0}
			<li
				class="py-5 min-h-64 rounded-3xl
				{tasks[0].urgency === 'important' && 'bg-[#443cbd] dark:bg-[#373097] text-white'}
				{tasks[0].urgency === 'urgent' && 'bg-[#ad1aad] dark:bg-[#8b278b] text-white'}
				{tasks[0].urgency === 'very urgent' && 'bg-[#ff1717] dark:bg-[#aa2929] text-white'}
				{tasks[0].urgency === 'normal' && 'bg-[#76fc9e] dark:bg-[#29a74f] dark:text-white text-black'}"
			>
				<div class="flex justify-between px-4 pb-2 w-full border-b-2 border-[#50482c]">
					<a href="/protected/tasks/{tasks[0].id}" class="text-xl font-semibold">{tasks[0].title}</a
					>

					<p
						class="text-xs p-2 h-fit border-2 rounded-xl border-[#cf3737] font-semibold opacity-60"
					>
						{new Date(tasks[0].deadline).toLocaleDateString()}
					</p>
					<div class="flex justify-end bottom-0 absolute w-full px-3 py-2">
						<p class="border-2 border-black w-fit py-1 px-2 rounded-full text-xs">Task</p>
					</div>
				</div>
				<div class="py-3 px-6">
					<p>{tasks[0].description}</p>
				</div>
				{#if tasks[0].imageUrl}
					<img src={tasks[0].imageUrl} alt="Task Pic" class="rounded-xl" />
				{/if}
			</li>

			<div class="grid grid-cols-2 gap-1">
				{#each tasks.slice(1) as task}
					<li
						class="px-3 py-3 min-h-32 rounded-3xl
						{task.urgency === 'important' && 'bg-[#5d52ff] dark:bg-[#373097] text-white'}
						{task.urgency === 'urgent' && 'bg-[#ad1aad] dark:bg-[#8b278b] text-white'}
						{task.urgency === 'very urgent' && 'bg-[#b62b2b] dark:bg-[#aa2929] text-white'}
						{task.urgency === 'normal' && 'bg-[#76fc9e] dark:bg-[#29a74f] dark:text-white text-black'}"
					>
						<div>
							<a href="/protected/tasks/{task.id}" class="text-lg font-semibold">{task.title}</a>
							<p class="text-sm px-3">Created on: {new Date(task.deadline).toLocaleDateString()}</p>
							<div class="flex justify-end bottom-0 absolute w-full px-3 py-2">
								<p class="border-2 border-black w-fit py-1 px-2 rounded-full text-xs">Task</p>
							</div>
						</div>
						<div class="px-2">
							<p>{task.description}</p>
						</div>
						{#if task.imageUrl}
							<img src={task.imageUrl} alt="Task Pic" class="rounded-xl" />
						{/if}
					</li>
				{/each}
			</div>
		{/if}
	</ul>
</div>
