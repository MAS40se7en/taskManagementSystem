<script lang="ts">
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	let tasks: any[] = [];
	let user;

	onMount(async () => {
		const res = await fetch('/protected/tasks', {
			method: 'GET',
		});
		const data = await res.json();
		console.log(data);

		tasks = data.tasks;
		console.log(tasks);
	});
</script>

<div class="mx-auto h-screen px-2 bg-gray-50 dark:bg-black">
	<ul class="px-2 py-2 w-full flex flex-col gap-4 text-white">
		{#if tasks.length > 0}
			{#each tasks as task}
				<li
					class="px-3 relative py-3 min-h-32 rounded-xl shadow-md
					{task.urgency === 'important' && 'bg-[#5d52ff] dark:bg-[#373097] text-white'}
					{task.urgency === 'urgent' && 'bg-[#ad1aad] dark:bg-[#8b278b] text-white'}
					{task.urgency === 'very urgent' && 'bg-[#b62b2b] dark:bg-[#aa2929] text-white'}
					{task.urgency === 'normal' && 'bg-[#c2c477] dark:bg-[#9d9e5f] dark:text-white text-black'}"
				>
					<div class="flex justify-between">
						<a href="/protected/tasks/{task.id}" class="text-xl font-semibold">{task.title}</a>

						<p class="text-sm px-3">{new Date(task.deadline).toLocaleDateString()}</p>
					</div>
					<div class="px-2">
						<p>{task.description}</p>
					</div>
					{#if task.imageUrl}
						<img src={task.imageUrl} alt="Task Pic" class="rounded-xl" />
					{/if}
					{#if task.completed}
						<div
							class="absolute backdrop-blur-sm right-0 top-0 h-full rounded-r-2xl items-center justify-center bg-opacity-60 z-20
									{task.urgency === 'important' && 'bg-[#5d52ff]/10 dark:bg-[#433ab6]/30 text-white'}
					{task.urgency === 'urgent' && 'bg-[#ad1aad]/10 dark:bg-[#b934b9]/30 text-white'}
					{task.urgency === 'very urgent' && 'bg-[#b62b2b]/10 dark:bg-[#c02e2e]/30 text-white'}
					{task.urgency === 'normal' &&'bg-[#dadd87] dark:bg-[#bbbd71] dark:text-white text-black'}
						"
						>
							<p><Icon icon="typcn:tick-outline" class="w-32 h-32" /></p>
						</div>
					{/if}
				</li>
			{/each}

		{/if}
	</ul>
</div>

<style>
	.tick {
		backdrop-filter: blur(3px);
	}
</style>
