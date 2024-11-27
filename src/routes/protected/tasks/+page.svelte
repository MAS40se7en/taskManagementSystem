<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	let tasks: any[] = [];
	let user;

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
				alert('unauthorized access');
				goto('/auth/login');
			}

			if (!user?.isVerified) {
				alert('please verify your email to use the application');

				const url = new URL(`/auth/register/verify-email/`, window.location.origin);
				url.searchParams.append('userId', user?.id);

				goto(url.toString());
			}
			console.log(tasks);
		} else {
			errorMessage = data.message;
			console.error(errorMessage);
		}
	});
</script>

<div class="mx-auto h-screen px-2 bg-gray-50 dark:bg-black">
	<ul class="px-2 py-2 w-full flex flex-col gap-4 text-white">
		{#if tasks.length > 0}
			{#each tasks as task}
				<li
					class="px-3 relative py-3 min-h-32 rounded-xl shadow-md
					{task.urgency === 'important' && 'bg-[#5d52ff] dark:bg-[#373097] text-white'}
					{task.urgency === 'urgent' && 'bg-[#ad1aad] dark:bg-[#8b278b] text-white'}
					{task.urgency === 'very urgent' && 'bg-[#b62b2b] dark:bg-[#aa2929] text-white'}
					{task.urgency === 'normal' && 'bg-[#c2c477] dark:bg-[#9d9e5f] dark:text-white text-black'}"
				>
					<div class="flex justify-between">
						<a href="/protected/tasks/{task.id}" class="text-xl font-semibold">{task.title}</a>						
					</div>
					<div class="px-2">
						<p>Urgency: {task.urgency}</p>
					</div>
					<div class="bottom-2 left-2 absolute">
						{#if task.startsAt && task.endsAt}
						<p class="text-sm px-3">Starts at: {new Date(task.startsAt).toLocaleDateString()}</p>
						<p class="text-sm px-3">Ends at: {new Date(task.endsAt).toLocaleDateString()}</p>
						{:else if task.deadline && !task.startsAt}
						<p class="text-sm px-3">Deadline: {new Date(task.deadline).toLocaleDateString()}</p>
						{/if}
					</div>
					{#if task.completed}
						<div
							class="absolute backdrop-blur-sm right-0 top-0 h-full rounded-r-2xl items-center justify-center bg-opacity-60 z-20
									{task.urgency === 'important' && 'bg-[#5d52ff]/10 dark:bg-[#433ab6]/30 text-white'}
					{task.urgency === 'urgent' && 'bg-[#ad1aad]/10 dark:bg-[#b934b9]/30 text-white'}
					{task.urgency === 'very urgent' && 'bg-[#b62b2b]/10 dark:bg-[#c02e2e]/30 text-white'}
					{task.urgency === 'normal' && 'bg-[#dadd87] dark:bg-[#bbbd71] dark:text-white text-black'}
						"
						>
							<p><Icon icon="typcn:tick-outline" class="w-32 h-32" /></p>
						</div>
					{/if}
				</li>
			{/each}
		{/if}
	</ul>
</div>

<style>
	.tick {
		backdrop-filter: blur(3px);
	}
</style>
