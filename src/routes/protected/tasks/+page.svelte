<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import { onMount } from 'svelte';

	let tasks: any[] = [];
	let user;

	onMount(async () => {
        const res = await fetch('/protected/tasks');
        tasks = await res.json();
    });

	function formData(dateString: string | number | Date) {
		const date = new Date(dateString);
		return date.toISOString().split('T')[0];
	}
</script>

<div class="w-4/5 mx-auto">
	<ul class="px-2 py-2 flex flex-col gap-4 text-white">
		{#if tasks.length > 0}
			{#each tasks as task}
				<li class="px-3 py-3 min-h-32 rounded-2xl
					{task.urgency === "important" && "bg-[#5d52ff]"}
					{task.urgency === "urgent" && "bg-[#ad1aad]"}
					{task.urgency === "very urgent" && "bg-[#ff1717]"}
					{task.urgency === "normal" && "bg-[#76fc9e] text-black"}
						">
					<div class="flex justify-between">
						<a href="/protected/tasks/{task.id}" class="text-xl font-semibold">{task.title}</a>
						<p class="text-xs pt-1 font-semibold opacity-60">
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
		{:else}
			<div>
				<p>No Tasks have been created by or for you</p>
			</div>
		{/if}
	</ul>
</div>
