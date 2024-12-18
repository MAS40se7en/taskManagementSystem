<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	let tasks: any[] = [];
	let sortOption = 'deadline';
	let user: any;
	let errorMessage = '';

	onMount(async () => {
		const response = await fetch('/protected');
		const data = await response.json();

		if (response.ok) {
			tasks = data.tasks;
			user = data.user;

			if (!user) {
				alert('Unauthorized access');
				goto('/auth/login');
			}
		} else {
			errorMessage = data.message;
		}

		if (!user?.isVerified) {
			alert('Please verify your email to use the application');
			const url = new URL(`/auth/register/verify-email/`, window.location.origin);
			url.searchParams.append('userId', user.id);
			goto(url.toString());
		}
		sortTasks();
	});

	function sortTasks() {
    console.log('Sorting by:', sortOption);
    if (sortOption === 'deadline') {
        tasks = [...tasks.sort((a, b) => {
            const aDeadline = a.deadline || a.endsAt;
            const bDeadline = b.deadline || b.endsAt;
            console.log(`Comparing: ${aDeadline} vs ${bDeadline}`);
            return new Date(aDeadline).getTime() - new Date(bDeadline).getTime();
        })];
    } else if (sortOption === 'title') {
        tasks = [...tasks.sort((a, b) => a.title.localeCompare(b.title))];
    } else if (sortOption === 'urgency(low first)') {
		const urgencyOrder: any = {
			'normal': 1,
			'important': 2,
			'urgent': 3,
			'very urgent': 4
		};
		tasks = [...tasks.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency])];
	} else if (sortOption === 'urgency(high first)') {
		const urgencyOrder: any = {
			'normal': 4,
			'important': 3,
			'urgent': 2,
			'very urgent': 1
		};
		tasks = [...tasks.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency])];
	}

    console.log('Sorted tasks:', tasks);
}

</script>

<div class="container mx-auto px-4 py-6">
	<!-- Error Message -->
	{#if errorMessage}
		<div class="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
			<p>{errorMessage}</p>
		</div>
	{/if}

	<!-- Sorting Options -->
	<div class="flex justify-end items-center mb-4 bg-white dark:bg-black z-10">
		<label for="sort" class="text-sm mr-2">Sort by:</label>
		<select
			id="sort"
			bind:value={sortOption}
			class="px-2 py-1 rounded-lg text-sm bg-gray-200 dark:bg-[#252525] dark:text-white"
			on:change={sortTasks}
		>
			<option value="deadline">Deadline</option>
			<option value="title">Title</option>
			<option value="urgency(low first)">Urgency(low first)</option>
			<option value="urgency(high first)">Urgency(high first)</option>
		</select>
	</div>
	

	<!-- Tasks List -->
	<ul class="grid grid-cols-1 gap-4">
		{#if tasks.length > 0}
			{#each tasks as task}
				<li class="dark:bg-[#151515] rounded-lg shadow-lg p-4 relative">
					<!-- Urgency Tag -->
					<div
						class="absolute top-4 right-4 px-2 py-1 text-xs font-semibold rounded-full
						{task.urgency === 'important' && 'bg-blue-500 text-white'}
						{task.urgency === 'urgent' && 'bg-purple-500 text-white'}
						{task.urgency === 'very urgent' && 'bg-red-500 text-white'}
						{task.urgency === 'normal' && 'bg-yellow-500 text-black'}"
					>
						{task.urgency}
					</div>

					<!-- Task Details -->
					<div class="mb-2">
						<a href="/protected/tasks/{task.id}" class="text-lg font-semibold hover:underline">
							{task.title}
						</a>
					</div>
					<p class="text-sm text-gray-600 dark:text-gray-300 mb-2">{task.description}</p>

					<!-- Task Dates -->
					{#if task.startsAt && task.endsAt}
						<div class="flex justify-between mt-2">
							<div>
								<span class="font-semibold text-xs">Starts At:</span>
								<span class="text-xs bg-green-600 px-2 py-1 text-white rounded-md">{new Date(task.startsAt).toLocaleDateString()}</span>
							</div>
							<div>
								<span class="font-semibold text-sm">Ends At:</span>
								<span class="text-xs bg-red-600 text-white px-2 py-1 rounded-md">{new Date(task.endsAt).toLocaleDateString()}</span>
							</div>
						</div>
					{:else if task.deadline}
						<div class="text-right">
							<span class="font-semibold">Deadline:</span>
							<span class="bg-red-600 px-2 py-1 text-white rounded-md text-xs">
								{new Date(task.deadline).toLocaleDateString()}
							</span>
						</div>
					{/if}
				</li>
			{/each}
		{:else}
			<div class="text-center text-gray-500">No tasks related to you!</div>
		{/if}
	</ul>
</div>
