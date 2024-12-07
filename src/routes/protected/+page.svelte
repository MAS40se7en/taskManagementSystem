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
			tasks.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
		} else if (sortOption === 'title') {
			tasks.sort((a, b) => a.title.localeCompare(b.title));
		}
	}
</script>

<div class="mx-auto relative dark:bg-black overflow-auto">
	{#if errorMessage}
		<div class="w-4/6 bg-red-600 px-3 py-2">
			<p class="text-white font-semibold">
				{errorMessage}
			</p>
		</div>
	{/if}
	<ul class="px-2 py-2 flex w-full flex-col gap-4">
		{#if tasks.length > 0}
			<div class="flex flex-col gap-3 justify-center">
				{#each tasks as task}
					<li class="pb-5 border-b-2 border-b-[#252525]">
						<div class="flex justify-between items-center gap-2 my-2 mx-3">
							<div class="flex gap-2 items-center justify-center">
								<a
									href={task.createdBy.id === user.id
										? '/protected/user/account'
										: `/protected/user/${task.createdBy.id}`}
									class="flex gap-2 items-center justify-center"
								>
									{#if task.createdBy.image}
										<img src={task.createdBy.image} alt="User Pic" class="rounded-full w-10 h-10" />
									{:else}
										<Icon
											icon="mingcute:user-3-line"
											class="w-10 h-10 border-4 border-black rounded-full px-1"
										/>
									{/if}
									<p class="text-lg font-semibold">
										{task.createdBy.id === user.id ? 'You' : task.createdBy.name}
									</p>
								</a>
							</div>
							<p class="text-xs w-fit p-2 h-fit font-semibold opacity-60">
								{new Date(task.createdAt).toLocaleDateString()}
							</p>
						</div>
						<div
							class="px-5 py-4 mt-2 min-h-48 rounded-xl relative shadow-md
						{task.urgency === 'important' && 'bg-[#5d52ff] dark:bg-[#373097] text-white'}
						{task.urgency === 'urgent' && 'bg-[#ad1aad] dark:bg-[#8b278b] text-white'}
						{task.urgency === 'very urgent' && 'bg-[#b62b2b] dark:bg-[#aa2929] text-white'}
						{task.urgency === 'normal' && 'bg-[#c2c477] dark:bg-[#9d9e5f] dark:text-white text-black'}"
						>
							<div class="flex justify-between">
								<a href="/protected/tasks/{task.id}" class="text-lg font-semibold">{task.title}</a>
							</div>
							<p
								class="absolute bottom-2 right-2 text-sm font-semibold w-fit p-2 h-fit border-2 rounded-xl border-[#cf3737] opacity-60"
							>
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
