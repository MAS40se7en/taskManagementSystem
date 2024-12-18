<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	let projects: any[] = [];
	let user;

	let errorMessage = '';

	onMount(async () => {
		const response = await fetch('/protected/projects');
		const data = await response.json();

		if (response.ok) {
			projects = data.projects;
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
			console.log(projects);
		} else {
			errorMessage = data.message;
		}
	});

	console.log(user);
</script>

<div class="mx-auto h-screen px-2 bg-gray-100 dark:bg-[#151515]">
	{#if projects.length > 0}
		<ul class="px-2 py-2 w-full flex flex-col gap-4">
			{#each projects as project}
				<li
					class="bg-white dark:bg-[#202020] relative shadow-md px-5 py-3 min-h-32 max-h-48 rounded-lg dark:text-white text-black"
				>
					<div class="flex justify-between items-center {project.completed ? 'z-20 absolute top-0 bottom-0' : ''}">
						<a href={`/protected/projects/${project.id}`} class="font-semibold text-lg"
							>{project.title}</a
						>
						<div class="flex text-[#c9b46f] px-2 items-center">
							<Icon icon="mingcute:user-3-line" class="w-5 h-5" />
							<p>{project.userCount}</p>
						</div>
					</div>

					<p class="text-sm text-gray-600 dark:text-gray-300 mb-2 overflow-hidden">{project.description}</p>

					<div class="flex justify-between text-xs mt-2 absolute bottom-2 right-0 left-0 px-5">
						<div>
							<span class="font-semibold">Starts At:</span>
							<span>{new Date(project.startsAt).toLocaleDateString()}</span>
						</div>
						<div>
							<span class="font-semibold">Ends At:</span>
							<span>{new Date(project.endsAt).toLocaleDateString()}</span>
						</div>
					</div>
					{#if project.completed}
						<div
							class="absolute inset-0 bg-green-500/20 backdrop-blur-md rounded-lg flex items-center justify-end pr-10 z-10"
						>
							<Icon icon="typcn:tick-outline" class="w-12 h-12 text-green-600 righ-5" />
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	{:else}
		<div class="flex justify-center">No Projects related to you</div>
	{/if}
</div>
