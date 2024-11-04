<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import { onMount } from 'svelte';

	let tasks: any[] = [];
	let sortOption = 'deadline';
	let user: any;

	// Fetch tasks and apply the default sort on mount
	onMount(async () => {
		const res = await fetch('/protected');
		const data = await res.json();
		console.log(data);

		tasks = data.tasks;
		user = data.user
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

<div class="mx-auto relative dark:bg-black overflow-auto">
	<ul class="px-2 py-2 flex w-full flex-col gap-4">
		{#if tasks.length > 0}
			<div class="flex flex-col gap-3 justify-center">
				{#each tasks as task}
					<li class="pb-5 border-b-2 border-b-[#252525]">
					    <div class="flex justify-between items-center gap-2 my-2 mx-3">
							<div class="flex gap-2 items-center justify-center">
								<a href={task.createdBy.id === user.id ? '/protected/user/account' : `/protected/user/${task.createdBy.id}`} class="flex gap-2 items-center justify-center">
									<img src={task.createdBy.image} alt="User Pic" class="rounded-full w-10 h-10" />
                            	<p class="text-lg font-semibold">{task.createdBy.id === user.id ? 'You' : task.createdBy.name}</p>
								</a>
							</div>
							<p class="text-xs w-fit p-2 h-fit font-semibold opacity-60">{new Date(task.createdAt).toLocaleDateString()}</p>
                        </div>
						<div class="px-5 py-4 mt-2 min-h-64 rounded-xl relative shadow-md
						{task.urgency === 'important' && 'bg-[#5d52ff] dark:bg-[#373097] text-white'}
						{task.urgency === 'urgent' && 'bg-[#ad1aad] dark:bg-[#8b278b] text-white'}
						{task.urgency === 'very urgent' && 'bg-[#b62b2b] dark:bg-[#aa2929] text-white'}
						{task.urgency === 'normal' && 'bg-[#c2c477] dark:bg-[#9d9e5f] dark:text-white text-black'}"
						>
						<div class="flex justify-between">
							<a href="/protected/tasks/{task.id}" class="text-lg font-semibold">{task.title}</a>
						</div>
						<p class="absolute bottom-2 right-2 text-sm font-semibold w-fit p-2 h-fit border-2 rounded-xl border-[#cf3737] opacity-60">
							{new Date(task.deadline).toLocaleDateString()}
						</p>
						<div class="px-2">
							<p>{task.description}</p>
						</div>
						{#if task.imageUrl}
							<img src={task.imageUrl} alt="Task Pic" class="rounded-xl" />
						{/if}
						</div>
					</li>
				{/each}
			</div>
			{:else}
			<div class="text-center">
				<p>No tasks related to you!</p>
			</div>
		{/if}
	</ul>
</div>
