<script lang="ts">
	import Navbar from "$lib/components/Navbar.svelte";
	import { onMount } from "svelte";

	let tasks: any[] = [];

	onMount(async () => {
		const res = await fetch('/protected');
		tasks = await res.json();
	});

	function formData(dateString: string | number | Date) {
		const date = new Date(dateString);
		return date.toISOString().split('T')[0];
	}
</script>

<div class="w-4/5 mx-auto">
	<ul class="px-2 py-2 flex flex-col gap-4">
		{#if tasks.length > 0}
			<!-- First Task Displayed Differently -->
			<li class="bg-amber-300 px-4 py-5 min-h-40 rounded-2xl">
				<div class="flex justify-between">
					<a href="/tasks/{tasks[0].id}" class="text-xl font-semibold">{tasks[0].title}</a>
					<p class="text-xs pt-1 font-semibold opacity-60">{new Date(tasks[0].createdAt).toLocaleDateString()}</p>
				</div>
				<div class="px-2">
					<p>{tasks[0].description}</p>
				</div>
				{#if tasks[0].imageUrl}
					<img src={tasks[0].imageUrl} alt="Task Pic" class="rounded-xl">
				{/if}
			</li>

			<!-- Rest of the tasks in a 2x2 grid -->
			<div class="grid grid-cols-2 gap-4">
				{#each tasks.slice(1) as task}
					<li class="bg-amber-200 px-3 py-3 min-h-32 rounded-2xl">
						<div class="flex justify-between">
							<a href="/tasks/{task.id}" class="text-lg font-semibold">{task.title}</a>
							<p class="text-xs pt-1 font-semibold opacity-60">{new Date(task.createdAt).toLocaleDateString()}</p>
						</div>
						<div class="px-2">
							<p>{task.description}</p>
						</div>
						{#if task.imageUrl}
							<img src={task.imageUrl} alt="Task Pic" class="rounded-xl">
						{/if}
					</li>
				{/each}
			</div>
		{/if}
	</ul>
</div>
