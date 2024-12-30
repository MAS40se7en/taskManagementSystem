<script lang="ts">
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	let errorMessage = '';
	let loadingDelete = false;
	let message = '';
	let loading = true;
	let tasks: any;

	async function fetchData() {
		try {
			const response = await fetch('/admin/tasks');
			if (response.ok) {
				loading = false;
				const data = await response.json();
				tasks = data.tasks;
				console.log(tasks);
			} else {
				errorMessage = 'Failed to fetch projects and tasks';
			}
		} catch (error) {
			errorMessage = 'An error occurred while fetching data.';
		}
	}

	onMount(async () => {
		await fetchData();
	});

	async function deleteTask(taskId: any) {
		loadingDelete = true;

		try {
			const response = await fetch('/admin/tasks', {
				method: 'POST',
				body: JSON.stringify({ taskId })
			});

			const data = await response.json();

			if (response.ok) {
				await fetchData();
				loadingDelete = false;
				message = data.message;
			} else {
				loadingDelete = false;
				errorMessage = data.message;
			}
		} catch (error) {
			errorMessage = 'Could not delete the item';
		}
	}
</script>

<div class="h-screen">
	<div class="w-5/6 mx-auto py-10 h-fit">
		<h1 class="text-4xl font-bold">All Tasks</h1>
		<div class="mt-4 mx-auto min-h-32 overflow-auto bg-[#D9D9D9] dark:bg-[#252525] rounded-lg">
			<table class="w-full">
				<thead
					class="border-b-2 bg-[#D9D9D9] dark:bg-[#474747] dark:border-[#727272] border-[#c0c0c0] text-nowrap sticky top-0 z-10"
				>
					<tr class="text-center">
						<td>item title</td>
						<td>start date</td>
						<td>deadline</td>
						<td>created at</td>
						<td>actions</td>
					</tr>
				</thead>
				<tbody class="dark:bg-[#1f1f1f] bg-[#1a1a1a] text-white relative">
					{#if tasks}
						{#each tasks as task}
							<tr class="border-b-2 border-black/20 text-wrap mb-2">
								<td class="border-r-2 border-white/30 px-2 font-bold hover:underline">
									<a href="/admin/tasks/{task.id}">
										{task.title}
									</a>
								</td>
								{#if task.startsAt}
									<td class="border-r-2 border-white/30 px-2"
										>{new Date(task.startsAt).toLocaleDateString()}</td
									>
									<td class="border-r-2 border-white/30 px-2"
										>{new Date(task.endsAt).toLocaleDateString()}</td
									>
								{:else if task.deadline}
									<td class="border-r-2 border-white/30 px-2">___</td>
									<td class="border-r-2 border-white/30 px-2"
										>{new Date(task.deadline).toLocaleDateString()}</td
									>
								{/if}
								<td class="border-r-2 border-white/30 px-2"
									>{new Date(task.createdAt).toLocaleDateString()}</td
								>

								<td class="px-2 flex gap-2 text-center py-2 justify-center">
									<a
										href="/admin/item-edit"
										class="py-1 px-2 bg-blue-500 dark:bg-blue-600 rounded-lg w-20 hover:bg-blue-700"
										>Edit</a
									>
									{#if loadingDelete}
										<Icon
											icon="line-md:loading-twotone-loop"
											class="w-8 h-8 text-red-500 dark:text-red-700"
										/>
									{:else}
										<button
											on:click={() => deleteTask(task.id)}
											class="py-1 px-2 bg-red-500 dark:bg-red-600 rounded-lg w-20 hover:bg-red-800"
											>Delete</button
										>
									{/if}
								</td>
							</tr>
						{/each}
                        {:else if loading}
                            <div class="left-0 right-0 absolute items-center">
                                <Icon icon="eos-icons:loading" class="mx-auto text-[#E1CA7D] w-24 h-24" />
                            </div>
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>

<style>
	.overflow-auto {
		height: 800px;
	}
</style>