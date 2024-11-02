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

<div class="w-5/6 mx-auto relative">

	<ul class="px-2 py-2 flex flex-col gap-4">
		{#if tasks.length > 0}
			<li
				class="py-5 min-h-64 rounded-3xl
				{tasks[0].urgency === 'important' && 'bg-[#5d52ff] text-white'}
				{tasks[0].urgency === 'urgent' && 'bg-[#ad1aad] text-white'}
				{tasks[0].urgency === 'very urgent' && 'bg-[#ff1717] text-white'}
				{tasks[0].urgency === 'normal' && 'bg-[#76fc9e] text-black'}"
			>
				<div class="flex justify-between px-4 pb-2 w-full border-b-2 border-[#50482c]">
					<a href="/protected/tasks/{tasks[0].id}" class="text-xl font-semibold">{tasks[0].title}</a
					>
					<p
						class="text-xs p-2 h-fit border-2 rounded-xl border-[#50482c] font-semibold opacity-60"
					>
						{new Date(tasks[0].createdAt).toLocaleDateString()}
					</p>
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
						{task.urgency === 'important' && 'bg-[#5d52ff] text-white'}
						{task.urgency === 'urgent' && 'bg-[#ad1aad] text-white'}
						{task.urgency === 'very urgent' && 'bg-[#ff1717] text-white'}
						{task.urgency === 'normal' && 'bg-[#76fc9e] text-black'}"
					>
						<div>
							<a href="/protected/tasks/{task.id}" class="text-lg font-semibold">{task.title}</a>
							<p
								class="text-xs my-2 w-fit p-2 h-fit border-2 rounded-xl border-[#50482c] font-semibold opacity-60"
							>
								{new Date(task.createdAt).toLocaleDateString()}
							</p>
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
