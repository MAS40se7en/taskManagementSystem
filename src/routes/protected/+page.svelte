<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	let tasks: any[] = [];
	let sortOption = 'deadline';
	let user: any;

	let errorMessage = '';

	// Fetch tasks and apply the default sort on mount
	onMount(async () => {
		const response = await fetch('/protected');
		const data = await response.json();
		console.log(data);

		if (response.ok) {
			tasks = data.tasks;
			user = data.user;

			if (!user) {
				alert('unauthorized access');
				goto('/auth/login');
			}
		} else {
			errorMessage = data.message;
		}

		if (!user.isVerified) {
			alert('please verify your email to use the application');

			const url = new URL(`/auth/register/verify-email/`, window.location.origin);
			url.searchParams.append('userId', user.id);

			goto(url.toString());
		}
		sortTasks();
	});

	// Sort tasks based on current sorting preference
	function sortTasks() {
		if (sortOption === 'deadline') {
			tasks.sort((a, b) => new Date(a.deadline ? a.deadline : a.endsAt).getTime() - new Date(b.deadline ? b.deadline : b.endsAt).getTime());
		} else if (sortOption === 'title') {
			tasks.sort((a, b) => a.title.localeCompare(b.title));
		}
	}
</script>

<div class="mx-auto relative dark:bg-black overflow-y-scroll">
	{#if errorMessage}
		<div class="w-4/6 bg-red-600 px-3 py-2">
			<p class="text-white font-semibold">
				{errorMessage}
			</p>
		</div>
	{/if}
	<ul class="px-2 py-2 flex w-full flex-col">
		{#if tasks.length > 0}
			<div class="flex flex-col justify-center">
				{#each tasks as task}
					<li class="pb-5 border-b-2 border-b-[#252525]">
						<div
							class="px-3 py-4 mt-2 min-h-36 rounded-xl relative shadow-md
						"
						>
							<div class="flex items-center gap-3">
								
								<div
									class="h-3 w-3 rounded-full {task.urgency === 'important' &&
										'bg-[#5d52ff] dark:bg-[#373097] text-white'}
						{task.urgency === 'urgent' && 'bg-[#ad1aad] dark:bg-[#8b278b] text-white'}
						{task.urgency === 'very urgent' && 'bg-[#b62b2b] dark:bg-[#aa2929] text-white'}
						{task.urgency === 'normal' && 'bg-[#c2c477] dark:bg-[#9d9e5f] dark:text-white text-black'}"
								></div>
								<div class="flex flex-col">
								<a href="/protected/tasks/{task.id}" class="font-semibold">{task.title}</a>
							
								<a
									href={task.createdBy.id === user.id
										? '/protected/user/account'
										: `/protected/user/${task.createdBy.id}`}
									class="flex gap-1 items-center"
								>
									{#if task.createdBy.image}
										<img src={task.createdBy.image} alt="User Pic" class="rounded-full w-3 h-3" />
									{:else}
										<Icon
											icon="mingcute:user-3-line"
											class="w-5 h-5 border-black rounded-full px-1"
										/>
									{/if}
									<p class="text-xs font-light">
										{task.createdBy.id === user.id ? 'You' : task.createdBy.name}
									</p>
									<p class="text-xs w-fit h-fit font-light opacity-60">
										- {new Date(task.createdAt).toLocaleDateString()}
									</p>
								</a>
							</div>
							</div>
							{#if task?.startsAt && task?.endsAt}
								<div class="grid grid-cols-2 gap-1 text-xs absolute bottom-2 right-2">
									<h1 class="text-center font-semibold">Starts At</h1>
									<h1 class="text-center font-semibold">Ends At</h1>
									<p class="bg-green-600 text-white py-1 px-2 rounded-lg text-center">
										{new Date(task?.startsAt).toLocaleDateString()}
									</p>
									<p class="bg-red-600 dark:bg-red-800 text-white py-1 px-2 rounded-lg text-center">
										{new Date(task?.endsAt).toLocaleDateString()}
									</p>
								</div>
							{:else if !task?.startsAt && task?.deadline}
								<div
									class="flex flex-col gap-1 justify-center text-xs place-items-center absolute bottom-2 right-2"
								>
									<h1 class="font-semibold">Deadline</h1>
									<p class="bg-red-600 dark:bg-red-800 py-1 px-2 rounded-lg text-center text-white">
										{new Date(task?.deadline).toLocaleDateString()}
									</p>
								</div>
							{/if}
							<div class="px-2 py-2">
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
