<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	let project: {
		title: any;
		startsAt: any;
		endsAt: any;
		completed: any;
		createdBy: any;
		description: any;
		users: any;
		createdAt: any;
		tasks: Array<{
			id: any;
			title: string;
			description: string;
			completed: boolean;
			deadline: any;
			imageUrl: any;
			instructions: any;
			urgency: any;
			startsAt: any;
			endsAt: any;
		}>;
	} | null = null;

	const projectId = $page.params.id;
	let loading = true;
	let errorMessage = '';
	let message = '';
	let type = 'Project';
	let loadingDelete = false;
	let loadingTaskCompletion = false;
	let deleteTaskMessage = '';
	let displayDeleteModal = false;
    let user: any;

	function toggleDeleteModal() {
		displayDeleteModal = !displayDeleteModal;
	}

	async function fetchData() {
		try {
			const response = await fetch(`/admin/projects/${projectId}`);
			const data = await response.json();

			if (response.ok) {
				loading = false;
				project = data.project;
                user = data.user;
				console.log(project);
			} else {
				loading = false;
				errorMessage = data.message;
			}
		} catch (error) {
			loading = false;
			errorMessage = 'error loading the project';
		}
	}

	console.log(projectId);

	onMount(async () => {
		await fetchData();
	});

	async function deleteproject(projectId: any) {
		loadingDelete = true;

		try {
			const response = await fetch(`/admin/projects/${projectId}`, {
				method: 'DELETE',
				body: JSON.stringify({ projectId })
			});

			const data = await response.json();

			if (response.ok) {
				loadingDelete = false;
				message = data.message;
				goto('/admin');
			} else {
				loadingDelete = false;
				errorMessage = data.message;
			}
		} catch (error) {
			errorMessage = 'Could not delete the item';
		}
	}

	async function removeTask(taskId: any) {
		try {
			const response = await fetch(`/admin/tasks/${taskId}`, {
				method: 'DELETE',
				body: JSON.stringify({ taskId })
			});

			const data = await response.json();

			if (response.ok) {
				if (project) {
					project.tasks = project.tasks.filter((task) => task.id !== taskId);
				}
                displayDeleteModal = false;
				deleteTaskMessage = data.message;
				setTimeout(() => {
					deleteTaskMessage = '';
				}, 3000);
			} else {
				errorMessage = data.message;
			}
		} catch (error) {
			console.error(error);
			errorMessage = 'Could not delete Task!';
		}
	}

	async function toggleTaskCompletion(taskId: string) {
		loadingTaskCompletion = true;
		try {
			const response = await fetch(`/admin/tasks/${taskId}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ taskId })
			});

			if (response.ok) {
				await fetchData();
				loadingTaskCompletion = false;
			}
		} catch (error) {
			console.error('Error toggling task completion:', error);
		}
	}

    const truncateMessage = (message: string, length: number) => {
		return message.length > length ? message.slice(0, length) + '...' : message;
	};

    async function setComplete() {
		try {
			const response = await fetch(`/protected/projects/${projectId}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ tasks: project?.tasks })
			});

			const data = await response.json();

			if (response.ok) {
				await fetchData();
			} else {
				errorMessage = data.message;
			}

			console.log('Project marked as complete');
		} catch (error) {
			console.error('Error setting project completion:', error);
		}
	}
</script>

<div class="dark:bg-black p-10">
	<div class="lg:w-4/5 md:w-5/6 mx-auto flex flex-col gap-10">
		{#if loading}
			<div class="flex justify-between items-center">
				<div class="h-10 w-20 dark:bg-[#161616] bg-[#adadad] rounded-full"></div>
				<div class="h-6 w-36 dark:bg-[#161616] bg-[#adadad] rounded-full"></div>
			</div>
			<div class="h-96 w-full dark:bg-[#161616] bg-[#adadad] rounded-3xl"></div>
		{:else}
			<div>
				<div class="flex justify-between items-center">
					<h1 class="text-4xl font-bold">{project?.title}</h1>
					<p class="font-semibold">
						<span class="text-xs">created at: </span>{new Date(
							project?.createdAt
						).toLocaleDateString()}
					</p>
				</div>
			</div>
			<div class="flex flex-col bg-[#D9D9D9] dark:bg-[#252525] py-5 rounded-3xl">
				<div class="flex justify-center mb-5">
					<a href="/admin/users/{project?.createdBy?.id}" class="opacity-70 hover:opacity-100"
						><span class="text-xs">created by: </span>{project?.createdBy?.name}</a
					>
				</div>
				<div class="flex justify-between">
					<div class="px-5 w-3/5">
						<h1 class="text-xl font-semibold">Description</h1>
						<p class="px-3 py-3 w-full text-wrap">{project?.description}</p>
					</div>
                    <div class="px-8 w-3/5">
                        <div class="flex justify-between">
                            <h1 class="text-lg font-semibold">Assigned to</h1>
                                <a href={`/admin/projects/${projectId}/edit-users`}>
                                    <Icon
                                        icon="bxs:edit"
                                        class="text-[#d4be76] w-7 mr-3 text-2xl rounded-full content-center h-fit"
                                    />
                                </a>
                        </div>
                        <ul
                            class="border-2 border-[#ffe48d] dark:border-[#9b8b57] px-3 py-2 my-2 flex flex-col gap-2 max-h-36 rounded-2xl overflow-auto"
                        >
                            {#if project?.users && project.users.length > 0}
                                {#each project.users as participant}
                                    <li>
                                        <a
                                            href={participant.id === project?.createdBy.id
                                                ? '/protected/user/account'
                                                : `/protected/user/${participant.id}`}
                                            class="flex items-center gap-3"
                                        >
                                            {#if participant.image}
                                                <img src={participant.image} alt="" class="w-8 h-8 rounded-full" />
                                            {:else}
                                                <Icon
                                                    icon="mingcute:user-3-line"
                                                    class="w-8 h-8 border-2 border-black rounded-full px-1 bg-[#D9D9D9] dark:bg-[#252525]"
                                                />
                                            {/if}
                                            <h1>{participant.name}</h1>
                                        </a>
                                    </li>
                                {/each}
                            {:else}
                                <li class="text-sm p-2 text-[#494949]">No participants assigned to this project.</li>
                            {/if}
                        </ul>
                    </div>
				</div>
				<div class="flex flex-col items-center px-10 w-full pt-5">
					{#if project?.completed}
						<p class="bg-green-500 px-5 text-white rounded-lg">completed</p>
					{:else if project?.startsAt && project?.endsAt}
						<div class="grid grid-cols-2 gap-2 text-sm py-5">
							<h1 class="text-center font-semibold">Starts At</h1>
							<h1 class="text-center font-semibold">Ends At</h1>
							<p class="bg-green-600 text-white py-1 px-2 rounded-lg text-center">
								{new Date(project?.startsAt).toLocaleDateString()}
							</p>
							<p class="bg-red-600 dark:bg-red-800 text-white py-1 px-2 rounded-lg text-center">
								{new Date(project?.endsAt).toLocaleDateString()}
							</p>
						</div>
					{/if}
				</div>
			</div>
			<div class="w-3/5 mx-auto flex justify-center items-center gap-10">
				<div><h1 class="text-2xl font-semibold">Actions</h1></div>
				<div class="flex gap-5 justify-center py-5 items-center">
                    {#if project?.completed}
						<p
							class="w-full border-2 text-green-500 border-green-500 text-center rounded-2xl px-4 py-2"
						>
							Project is Complete!
						</p>
					{:else}
						<button
							on:click={setComplete}
							class="w-full bg-green-500 active:bg-green-600 dark:bg-green-700 dark:active:bg-green-800 text-white rounded-2xl px-4 py-2"
							>Set Complete</button
						>
					{/if}
					<a
						href="/admin/{type}-edit-{projectId}"
						class="text-white bg-blue-400 hover:bg-blue-500 active:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 dark:active:bg-blue-800 px-5 py-2 rounded-full"
						>Edit</a
					>
					<button
						on:click={() => deleteproject(projectId)}
						class="text-white bg-red-500 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800 px-5 py-2 rounded-full"
						>Delete</button
					>
				</div>
			</div>

            <div class="px-5">
                <div class="flex justify-between items-center">
                    <h1 class="font-semibold text-xl">Tasks</h1>
                    {#if !project?.completed}
                        <a
                            href="/admin/projects/projectTasks-{projectId}"
                            class="py-1 px-2 border-2 rounded-xl bg-green-400 dark:bg-green-600 font-sembold text-sm"
                        >
                            Add tasks
                        </a>
                    {/if}
                </div>

                <div class="px-3 py-3 flex justify-between">
                    {#if project?.tasks && project.tasks.length > 0}
                        <div class="relative max-h-96 overflow-y-auto w-full">
                            {#if deleteTaskMessage}
                                <div
                                    class="absolute top-0 left-1/2 transform -translate-x-1/2 mt-5 bg-green-500 text-white py-2 px-4 rounded shadow-lg text-center transition duration-300 ease-in-out"
                                    in:fade
                                    out:fade
                                >
                                    {deleteTaskMessage}
                                </div>
                            {/if}
                            {#if errorMessage}
                                <div
                                    class="absolute top-0 left-1/2 transform -translate-x-1/2 mt-5 bg-red-500 text-white py-2 px-4 rounded shadow-lg text-center transition duration-300 ease-in-out"
                                    in:fade
                                    out:fade
                                >
                                    {errorMessage}
                                </div>
                            {/if}
                            {#each project.tasks as task}
                                <div
                                    class="px-3 mb-2 relative w-full py-3 min-h-24 rounded-lg shadow-md dark:bg-[#202020] overflow-y-auto"
                                >
                                    <div class="flex justify-between">
                                        <div class="flex items-center gap-2">
                                            <div
                                                class="w-4 h-4 rounded-full {task.urgency === 'important' &&
                                                    'bg-[#5d52ff] dark:bg-[#373097] text-white'}
                                    {task.urgency === 'urgent' && 'bg-[#ad1aad] dark:bg-[#8b278b] text-white'}
                                    {task.urgency === 'very urgent' && 'bg-[#b62b2b] dark:bg-[#aa2929] text-white'}
                                    {task.urgency === 'normal' && 'bg-[#c2c477] dark:bg-[#9d9e5f] dark:text-white text-black'}"
                                            ></div>
                                            <a href={`/admin/tasks/${task.id}`} class="font-semibold text-sm"
                                                >{truncateMessage(task.title, 14)}</a
                                            >
                                        </div>

                                        <div class="flex gap-2">
                                            {#if loadingTaskCompletion}
                                                <Icon
                                                    icon="line-md:loading-twotone-loop"
                                                    class="w-8 h-8 text-green-300 dark:text-green-600"
                                                />
                                            {:else}
                                                <button on:click={() => toggleTaskCompletion(task.id)} class="">
                                                    <Icon
                                                        icon="typcn:tick"
                                                        class="w-8 h-8 rounded-full 
                                        {task.completed ? 'bg-green-500 text-white' : 'border-2 border-[#e0ca81]'}"
                                                    />
                                                </button>
                                            {/if}
                                            <button on:click={toggleDeleteModal} class="">
                                                <Icon icon="mdi:trash" class="w-8 h-8 text-red-500 dark:text-red-600" />
                                            </button>
                                        </div>
                                    </div>

                                    {#if displayDeleteModal}
                                        <div
                                            class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-20"
                                            role="dialog"
                                            aria-modal="true"
                                        >
                                            <div
                                                class="bg-white dark:bg-[#303030] rounded-3xl px-4 pb-2 pt-4 w-3/4 bottom-0"
                                            >
                                                <h2 class="text-lg font-semibold mb-4 px-3">
                                                    Are you sure you want to delete task: {task.title}?
                                                </h2>
                                                <button
                                                    on:click={() => removeTask(task.id)}
                                                    class="block w-full bg-red-500 text-white rounded-2xl mt-4 px-4 py-2 mb-2"
                                                    >Yes delete Task</button
                                                >
                                                <button
                                                    on:click={() => (displayDeleteModal = false)}
                                                    class="block w-full text-red-500 rounded-2xl px-4 py-2 mb-2"
                                                    >Back</button
                                                >
                                            </div>
                                        </div>
                                    {/if}

                                    {#if task.startsAt && task.endsAt}
                                        <div
                                            class="flex justify-between mt-2 text-sm bottom-2 absolute right-0 left-0 px-5"
                                        >
                                            <div>
                                                <span>Starts At:</span>
                                                <span class="font-light"
                                                    >{new Date(task.startsAt).toLocaleDateString()}</span
                                                >
                                            </div>
                                            <div>
                                                <span>Ends At:</span>
                                                <span class="font-light"
                                                    >{new Date(task.endsAt).toLocaleDateString()}</span
                                                >
                                            </div>
                                        </div>
                                    {:else if task.deadline}
                                        <div class="text-right bottom-2 text-sm absolute right-2">
                                            <span>Deadline:</span>
                                            <span class="text-red-600 text-sm font-light">
                                                {new Date(task.deadline).toLocaleDateString()}
                                            </span>
                                        </div>
                                    {/if}
                                </div>
                            {/each}
                        </div>
                    {:else}
                        <p>No tasks available for this project.</p>
                    {/if}
                </div>
            </div>
		{/if}
	</div>
</div>
