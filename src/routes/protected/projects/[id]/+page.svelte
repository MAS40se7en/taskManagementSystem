<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Modal from '$lib/components/Modal.svelte';
	import { Browser } from '@capacitor/browser';
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
		googleCalendar: any;
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
	let user: any;
	let displayModal = false;

	let errorMessage = '';
	let deleteTaskMessage = '';
	let loading = true;
	let loadingDelete = false;
	let loadingTaskCompletion: { [taskId: string]: boolean } = {};
	let activeTaskIdForModal: string | null = null;

	let message = '';
	let calendarData: any;
	let link: any;

	const projectId = $page.params.id;

	// Fetch data function
	async function fetchData() {
		try {
			const res = await fetch(`/protected/projects/${projectId}`);
			if (!res.ok)
				throw new Error(`Failed to fetch project details: ${res.status} ${res.statusText}`);

			const data = await res.json();
			project = data.project;
			user = data.user;
			loading = false;

			if (!user) {
				alert('unauthorized access');
				goto('/auth/login');
			}

			if (!user?.isVerified) {
				alert('please verify your email to use the application');

				const url = new URL(`/auth/register/verify-email/`, window.location.origin);
				url.searchParams.append('userId', user?.id);

				goto(url.toString());
			}
			console.log('project details:', project);
		} catch (error) {
			console.error('Error fetching project:', error);
		}
	}

	// Fetch data on component mount
	onMount(() => {
		fetchData();
	});

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

				displayModal = false;
			} else {
				errorMessage = data.message;
			}

			console.log('Project marked as complete');
		} catch (error) {
			console.error('Error setting project completion:', error);
		}
	}

	async function deleteproject() {
		loadingDelete = true;
		const response = await fetch(`/protected/projects/${projectId}`, {
			method: 'DELETE'
		});

		if (response.ok) {
			loadingDelete = false;
			goto('/protected/All');
		} else {
			loadingDelete = false;
			console.error('Failed to delete project:', response.status, await response.text());
		}
	}

	function toggleModal() {
		displayModal = !displayModal; // Toggle the modal visibility
		console.log(displayModal);
	}

	function toggleDeleteModal(taskId: string) {
		activeTaskIdForModal = activeTaskIdForModal === taskId ? null : taskId;
	}

	async function toggleTaskCompletion(taskId: string) {
		loadingTaskCompletion[taskId] = true;
		try {
			const response = await fetch(`/protected/tasks/${taskId}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ taskId })
			});

			if (response.ok) {
				await fetchData();
			}
		} catch (error) {
			console.error('Error toggling task completion:', error);
		} finally {
			loadingTaskCompletion[taskId] = false;
		}
	}

	async function addToGoogleCalendar() {
		try {
			const response = await fetch('/api/addEventsToGoogleCalendar', {
				method: 'POST',
				body: JSON.stringify({ tasks: project?.tasks, user })
			});

			const data = await response.json();

			if (response.ok) {
				message = data.message;
				calendarData = data.event;

				link = calendarData.htmlLink;
				if (response.ok) {
					alert(`Task added to your Google Calendar! View it here: ${data.event.htmlLink}`);
				}
			}
		} catch (error) {
			console.error(error);
		}
	}

	async function openGoogleCalendar(link: string) {
		if (!link) {
			errorMessage = 'No google calendar event link provided';
		}

		try {
			await Browser.open({ url: link });
		} catch (error) {
			errorMessage = 'error opening the browser';
		}
	}

	async function removeTask(taskId: any) {
		try {
			const response = await fetch(`/protected/projects/${projectId}/removeTask`, {
				method: 'DELETE',
				body: JSON.stringify({ taskId })
			});

			const data = await response.json();

			if (response.ok) {
				if (project) {
					project.tasks = project.tasks.filter((task) => task.id !== taskId);
				}
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
</script>

{#if loading}
	<div>
		<div class="h-28 w-full bg-gray-200/50 dark:bg-gray-200/10 px-10 py-4 flex justify-between">
			<a href="/protected/All" class="py-2" aria-label="Go back">
				<Icon icon="fluent:ios-arrow-24-filled" class="w-7 h-7" />
			</a>
			<div class="h-10 bg-gray-200/70 dark:bg-gray-200/30 w-24 rounded-full"></div>
		</div>
		<div class="px-10 py-5 h-48 flex flex-col gap-2">
			<div class="rounded-full w-64 bg-gray-200/50 dark:bg-gray-200/10 h-6"></div>
			<div class="rounded-full w-48 bg-gray-200/50 dark:bg-gray-200/10 h-6"></div>
			<div class="rounded-full w-48 bg-gray-200/50 dark:bg-gray-200/10 h-6"></div>
			<div class="rounded-full w-48 bg-gray-200/50 dark:bg-gray-200/10 h-6"></div>
			<div class="flex flex-col items-end gap-2">
				<div class="rounded-full w-32 bg-gray-200/10 h-5"></div>
				<div class="rounded-full w-24 bg-gray-200/10 h-5"></div>
			</div>
		</div>
		<div class="px-10 flex flex-col gap-2">
			<div class="rounded-full w-32 bg-gray-200/10 h-7"></div>
			<div class="rounded-2xl w-full bg-gray-200/10 h-14"></div>
		</div>
	</div>
{:else}
	<div class="h-screen dark:bg-black">
		<div
			class="flex justify-between items-center px-10 py-4 top-0 sticky z-10
	{project?.completed ? 'bg-green-500 text-white dark:bg-green-600' : 'bg-white dark:bg-black'}"
		>
			<a href="/protected/All" class="py-2">
				<Icon icon="fluent:ios-arrow-24-filled" class="w-7 h-7" />
			</a>
			<div class="flex items-center">
				<h1 class="text-2xl font-bold mr-2">{project?.title}</h1>
				{#if project?.createdBy.id === user?.id}
					<button on:click={toggleModal}>
						<Icon icon="mage:dots" class=" w-7 h-7" />
					</button>
				{/if}
			</div>

			<Modal {displayModal} onClose={() => (displayModal = false)}>
				<div class="bg-white dark:bg-[#252525] rounded-3xl pb-2 pt-4 bottom-0">
					<h2 class="text-lg font-semibold mb-4 px-3">Options</h2>
					{#if !project?.completed}
						<div class="flex flex-col">
							<a
								href="/protected/projects/{projectId}/edit"
								class="bg-blue-400 dark:bg-blue-600 active:bg-blue-600 dark:active:bg-blue-800 font-semibold text-center rounded-2xl text-white mt-4 px-4 py-2"
								>Edit Project</a
							>
						</div>
					{/if}
					{#if project?.completed}
						<p
							class="block w-full border-2 text-green-500 border-green-500 text-center rounded-2xl mt-4 px-4 py-2 mb-2"
						>
							Project is Complete!
						</p>
					{:else}
						<button
							on:click={setComplete}
							class="block w-full bg-green-500 active:bg-green-600 dark:bg-green-700 dark:active:bg-green-800 text-white rounded-2xl mt-4 px-4 py-2 mb-2"
							>Set Project as Complete</button
						>
					{/if}

					{#if project?.createdBy.id == user?.id}
						{#if loadingDelete}
							<div class="flex items-center justify-center">
								<Icon
									icon="line-md:loading-twotone-loop"
									class="w-10 h-10 text-red-500 dark:text-red-700"
								/>
							</div>
						{:else}
							<button
								on:click={deleteproject}
								class="block w-full bg-red-500 dark:bg-red-700 active:bg-red-600 dark:active:bg-red-800 text-white rounded-2xl mt-4 px-4 py-2 mb-2"
								>Delete Project</button
							>
						{/if}
					{/if}
				</div>
			</Modal>
		</div>

		<div class="py-4 items-center justify-center">
			{#if errorMessage}
				<div class="w-4/6 bg-red-600 mx-auto px-3 py-2 rounded-xl">
					<p class="text-white font-semibold">
						{errorMessage}
					</p>
				</div>
			{/if}

			<div class="px-8 flex flex-col gap-3">
				<p class="text-lg font-semibold">Description</p>
				<p class="px-3">{project?.description}</p>
			</div>
			<div class="py-2 px-8 flex justify-end">
				<div class="flex flex-col opacity-70">
					<h1 class="text-xs font-semibold">Created by</h1>
					<h1 class="text-end">{project?.createdBy?.name}</h1>
				</div>
			</div>
			<div class="py-2 px-8 mt-5">
				<div class="flex justify-between">
					<h1 class="text-lg font-semibold">Assigned to</h1>
					{#if !project?.completed && project?.createdBy?.id === user?.id}
						<a href={`/protected/projects/${projectId}/edit-users`}>
							<Icon
								icon="bxs:edit"
								class="text-[#d4be76] w-7 mr-3 text-2xl rounded-full content-center h-fit"
							/>
						</a>
					{/if}
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
						<li class="text-sm p-2 text-[#D9D9D9] dark:text-[#494949]">
							No participants assigned to this project.
						</li>
					{/if}
				</ul>
			</div>

			{#if user?.googleId}
				<div class="flex flex-col gap-1 items-center justify-center mb-4">
					{#if project?.googleCalendar}
						<div class="text-xs flex flex-col items-center gap-2">
							<p>Tasks were added to your google calendar!</p>
							<button
								class="border px-4 py-1 rounded-full font-semibold text-sm w-fit"
								on:click={() => openGoogleCalendar(link)}
							>
								View Calendar
							</button>
						</div>
						<div
							class="absolute bottom-28 z-50 border dark:bg-[#252525] dark:border-[#323232] bg-[#bebebe] border-[#969696] opacity-50 px-3 py-2 rounded-full flex flex-col"
						>
							<p class="text-sm">{message}Events Created Successfully!</p>
						</div>
					{:else}
						<button
							on:click={addToGoogleCalendar}
							class="dark:bg-[#252525] dark:border-[#323232] flex items-center justify-center gap-3 w-4/6 border-2 rounded-xl py-3"
						>
							<Icon icon="devicon:google" class="w-6 h-6" />
							<h1 class="font-semibold text-md">Add to Google Calendar</h1>
						</button>
					{/if}
				</div>
			{/if}

			<div class="grid grid-cols-2 gap-2 px-16 text-xs py-5">
				<h1 class="text-center font-semibold">Starts At</h1>
				<h1 class="text-center font-semibold">Ends At</h1>
				<p class="bg-green-600 text-white py-1 px-2 rounded-lg text-center">
					{new Date(project?.startsAt).toLocaleDateString()}
				</p>
				<p class="bg-red-600 dark:bg-red-800 text-white py-1 px-2 rounded-lg text-center">
					{new Date(project?.endsAt).toLocaleDateString()}
				</p>
			</div>

			<div class="mt-4 px-8 py-4 h-screen bg-gray-100 dark:bg-[#151515] w-full">
				<div class="flex justify-between py-5 sticky">
					<h2 class="text-lg font-bold">Tasks:</h2>
					{#if !project?.completed && project?.createdBy.id === user?.id}
						<a
							href="/protected/create/projectTasks-{projectId}"
							class="py-1 px-2 border-2 rounded-xl border-green-400 dark:border-green-600 text-green-600"
						>
							Add tasks
						</a>
					{/if}
				</div>
				{#if project?.tasks && project.tasks.length > 0}
					<div class="h-screen relative">
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
							<div class="px-3 mb-2 relative py-3 min-h-24 rounded-lg shadow-md dark:bg-[#202020]">
								<div class="flex justify-between">
									<div class="flex items-center gap-2">
										<div
											class="w-4 h-4 rounded-full {task.urgency === 'important' &&
												'bg-[#5d52ff] dark:bg-[#373097] text-white'}
											{task.urgency === 'urgent' && 'bg-[#ad1aad] dark:bg-[#8b278b] text-white'}
											{task.urgency === 'very urgent' && 'bg-[#b62b2b] dark:bg-[#aa2929] text-white'}
											{task.urgency === 'normal' && 'bg-[#c2c477] dark:bg-[#9d9e5f] dark:text-white text-black'}"
										></div>
										<a href={`/protected/tasks/${task.id}`} class="font-semibold">{task.title}</a>
									</div>

									<div class="flex gap-2">
										{#if loadingTaskCompletion[task.id]}
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
										<button on:click={() => toggleDeleteModal(task.id)} class="">
											<Icon icon="mdi:trash" class="w-8 h-8 text-red-500 dark:text-red-600" />
										</button>
									</div>
								</div>

								{#if activeTaskIdForModal === task.id}
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
												on:click={() => toggleDeleteModal(task.id)}
												class="block w-full text-red-500 rounded-2xl px-4 py-2 mb-2">No</button
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
											<span class="font-light">{new Date(task.startsAt).toLocaleDateString()}</span>
										</div>
										<div>
											<span>Ends At:</span>
											<span class="font-light">{new Date(task.endsAt).toLocaleDateString()}</span>
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
	</div>
{/if}
