<<<<<<< HEAD
<script lang="ts">
	import { goto } from '$app/navigation';
	import Navbar from '$lib/components/Navbar.svelte';
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

<div class="mx-auto h-screen px-2 bg-gray-50 dark:bg-black">
	<ul class="px-2 py-2 w-full flex flex-col gap-4">
		{#each projects as project}
			<li class="bg-[#e9e9e9] dark:bg-[#c2c2c2] relative shadow-md flex flex-col justify-between px-3 py-3 min-h-24 rounded-xl dark:text-black text-black">
				<div class="flex justify-between">
					<a href="/protected/projects/{project.id}" class="text-xl font-semibold"
						>{project.title}</a
					>
					<p class="text-xs pt-1 font-semibold opacity-60">
						{new Date(project.createdAt).toLocaleDateString()}
					</p>
				</div>
                <div class="px-2 py-3">
                    <p>{project.description}</p>
                </div>
				<div class="flex justify-between px-10 text-xs">
					<p class="text-green-600 dark:text-green-800 font-semibold">{new Date(project.startsAt).toLocaleDateString()}</p>
					<p class="text-red-600 dark:text-red-800 font-semibold">{new Date(project.endsAt).toLocaleDateString()}</p>
				</div>
				{#if project.completed}
					<div
						class="tick backdrop-blur-sm absolute bg-white/30 dark:text-white right-0 top-0 place-items-center min-w-32 h-full rounded-r-2xl justify-center bg-opacity-60 z-20"
					>
						<p><Icon icon="typcn:tick-outline" class="w-32 h-32" /></p>
					</div>
				{/if}
			</li>
		{/each}
	</ul>
</div>


=======
<script lang="ts">
	import { goto } from '$app/navigation';
	import Navbar from '$lib/components/Navbar.svelte';
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

<div class="mx-auto h-screen px-2 bg-gray-50 dark:bg-black">
	<ul class="px-2 py-2 w-full flex flex-col gap-4">
		{#each projects as project}
			<li class="bg-[#e9e9e9] dark:bg-[#c2c2c2] relative shadow-md flex flex-col justify-between px-3 py-3 min-h-24 rounded-xl dark:text-black text-black">
				<div class="flex justify-between">
					<a href="/protected/projects/{project.id}" class="text-xl font-semibold"
						>{project.title}</a
					>
					<p class="text-xs pt-1 font-semibold opacity-60">
						{new Date(project.createdAt).toLocaleDateString()}
					</p>
				</div>
                <div class="px-2 py-3">
                    <p>{project.description}</p>
                </div>
				<div class="flex justify-between px-10 text-xs">
					<p class="text-green-600 dark:text-green-800 font-semibold">{new Date(project.startsAt).toLocaleDateString()}</p>
					<p class="text-red-600 dark:text-red-800 font-semibold">{new Date(project.endsAt).toLocaleDateString()}</p>
				</div>
				{#if project.completed}
					<div
						class="tick backdrop-blur-sm absolute bg-white/30 dark:text-white right-0 top-0 place-items-center min-w-32 h-full rounded-r-2xl justify-center bg-opacity-60 z-20"
					>
						<p><Icon icon="typcn:tick-outline" class="w-32 h-32" /></p>
					</div>
				{/if}
			</li>
		{/each}
	</ul>
</div>


>>>>>>> 2689b32a279db71525fba4df4c3d46aae9075f8c
