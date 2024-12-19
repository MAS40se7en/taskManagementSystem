<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	let tasks: any[] = [];
	let user;
	let loading = true;

	let errorMessage = '';

	onMount(async () => {
		const response = await fetch('/protected/tasks', {
			method: 'GET'
		});
		const data = await response.json();
		console.log(data);

		if (response.ok) {
			tasks = data.tasks;
			user = data.user;

			if (!user) {
				alert('Unauthorized access');
				goto('/auth/login');
			}

			if (!user?.isVerified) {
				alert('Please verify your email to use the application');

				const url = new URL(`/auth/register/verify-email/`, window.location.origin);
				url.searchParams.append('userId', user?.id);

				goto(url.toString());
			}

			loading = false;
			console.log(tasks);
		} else {
			errorMessage = data.message;
			console.error(errorMessage);
		}
	});
</script>

<div class="mx-auto h-screen px-4 py-6 bg-gray-100 dark:bg-[#151515]">
	{#if loading}
	<ul class="flex flex-col gap-5">
		<li>
			<div class="h-32 w-full bg-gray-300/50 dark:bg-gray-300/10 rounded-lg"/>
		</li>
		<li>
			<div class="h-32 w-full bg-gray-300/50 dark:bg-gray-300/10 rounded-lg"/>
		</li>
		<li>
			<div class="h-32 w-full bg-gray-300/50 dark:bg-gray-300/10 rounded-lg"/>
		</li>
		<li>
			<div class="h-32 w-full bg-gray-300/50 dark:bg-gray-300/10 rounded-lg"/>
		</li>
	</ul>
	{:else}
	<ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
		{#if tasks.length > 0}
			{#each tasks as task}
				<li
					class="p-4 bg-white dark:bg-[#202020] rounded-lg shadow hover:shadow-lg transition relative"
				>
					<div class="flex items-center gap-4 {task.completed ? 'z-20 absolute top-0 bottom-0' : ''}">
						<div
							class="w-6 h-6 rounded-full flex-shrink-0
								{task.urgency === 'important' && 'bg-indigo-500'}
								{task.urgency === 'urgent' && 'bg-purple-600'}
								{task.urgency === 'very urgent' && 'bg-red-600'}
								{task.urgency === 'normal' && 'bg-yellow-500'}"
						></div>
						<div class="flex-1">
							<a
								href="/protected/tasks/{task.id}"
								class="text-lg font-semibold text-gray-800 dark:text-gray-100 hover:underline
									{task.completed ? 'text-sm' : ''}
								"
							>
								{task.title}
							</a>
							{#if task.project}
								<a
									href="/protected/projects/{task.project.id}"
									class="block text-sm text-gray-500 dark:text-gray-400"
								>
									{task.project.title}
								</a>
							{/if}
						</div>
					</div>
					<div class="mt-3 text-sm text-gray-600 dark:text-gray-300">
						<p class="capitalize">
							<strong>Urgency:</strong> {task.urgency}
						</p>
					</div>
					<div class="mt-2 text-xs text-gray-500 dark:text-gray-400">
						{#if task.completed}
							<span class="inline-block px-2 py-1 bg-green-500 text-white rounded-lg">
								Completed
							</span>
						{:else if task.startsAt && task.endsAt}
							<p>Start: {new Date(task.startsAt).toLocaleDateString()}</p>
							<p>End: {new Date(task.endsAt).toLocaleDateString()}</p>
						{:else if task.deadline}
							<p>Deadline: {new Date(task.deadline).toLocaleDateString()}</p>
						{/if}
					</div>
					{#if task.completed}
						<div
							class="absolute inset-0 bg-green-500/20 backdrop-blur-md rounded-lg flex items-center justify-end pr-10 z-10"
						>
							<Icon icon="typcn:tick-outline" class="w-12 h-12 text-green-600 righ-5" />
						</div>
					{/if}
				</li>
			{/each}
		{:else}
			<div class="col-span-full flex justify-center items-center">
				<p class="text-lg font-medium text-gray-500 dark:text-gray-400">
					No tasks assigned to you yet.
				</p>
			</div>
		{/if}
	</ul>
	{/if}
</div>
