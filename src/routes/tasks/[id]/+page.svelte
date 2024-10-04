<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let task: { title: any; imageUrl: any; description: any; deadline: any; } | null = null;
	const taskId = $page.params.id;

    // Fetch data function
  async function fetchData() {
    try {
      const res = await fetch(`/tasks/${taskId}`);
      if (!res.ok) throw new Error(`Failed to fetch task details: ${res.status} ${res.statusText}`);
      
      task = await res.json();
      console.log('Task details:', task);
    } catch (error) {
      console.error('Error fetching task:', error);
    }
  }

  // Fetch data on component mount
  onMount(() => {
    fetchData();
  });


	async function deleteTask() {
		const response = await fetch(`/tasks/${taskId}`, {
			method: 'DELETE'
		});

		if (response.ok) {
			console.log('Task deleted successfully');
			goto('/');
		} else {
			console.error('Failed to delete task:', response.status, await response.text());
		}
	}
</script>

<div class="mb-20 h-screen">
	<div class="px-5 py-10 items-center justify-center">
		<div class="flex justify-between">
			<h1 class="text-black text-xl font-bold">{task?.title}</h1>
			<button on:click={deleteTask} class="bg-red-600 px-2 py-1 text-white rounded-xl"
				>Delete</button
			>
		</div>
		<div class="py-3 px-2">
			<p class="text-black text-sm font-light">{task?.description}</p>
		</div>
		<div class="flex items-center justify-center py-5">
			<img src={task?.imageUrl} alt="" class="max-w-72 rounded-xl" />
		</div>
	</div>
</div>