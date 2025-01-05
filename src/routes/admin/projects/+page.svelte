<script lang="ts">
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	let errorMessage = '';
	let loadingDelete = false;
	let message = '';
	let loading = true;
    let type = 'Project';

	let projects: any;

	async function fetchData() {
		try {
			const response = await fetch('/admin/projects');
			if (response.ok) {
				loading = false;
				const data = await response.json();
				projects = data.projects;
			} else {
				errorMessage = 'Failed to fetch projects and projects';
			}
		} catch (error) {
			errorMessage = 'An error occurred while fetching data.';
		}
	}

	onMount(async () => {
		await fetchData();
	});

	async function deleteProject(projectId: any) {
		loadingDelete = true;

		try {
			const response = await fetch('/admin/projects', {
				method: 'DELETE',
				body: JSON.stringify({ projectId })
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
		<h1 class="text-4xl font-bold">All Projects</h1>
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
				<tbody class="dark:bg-[#1f1f1f] bg-[#414141] text-white relative text-center">
					{#if projects}
						{#each projects as project}
							<tr class="border-b-2 border-black/20 text-wrap mb-2">
								<td class="border-r-2 border-white/30 px-2 text-start font-bold hover:underline">
									<a href="/admin/projects/{project.id}">
										{project.title}
									</a>
								</td>
									<td class="border-r-2 border-white/30 px-2"
										>{new Date(project.startsAt).toLocaleDateString()}</td
									>
									<td class="border-r-2 border-white/30 px-2"
										>{new Date(project.endsAt).toLocaleDateString()}</td
									>
								<td class="border-r-2 border-white/30 px-2"
									>{new Date(project.createdAt).toLocaleDateString()}</td
								>

								<td class="px-2 flex justify-center text-center py-2">
									<a
										href="/admin/{type}-edit-{project.id}"
										class="py-1 px-2 mr-5 bg-blue-500 dark:bg-blue-600 rounded-lg w-20 hover:bg-blue-700"
										>Edit</a
									>
									{#if loadingDelete}
										<Icon
											icon="line-md:loading-twotone-loop"
											class="w-8 h-8 text-red-500 dark:text-red-700"
										/>
									{:else}
										<button
											on:click={() => deleteProject(project.id)}
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