<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { el } from '@faker-js/faker';
	import Icon from '@iconify/svelte';
	import type { JsonArray } from '@prisma/client/runtime/library';
	import { onMount } from 'svelte';

	let user: {
		name: string;
		email: string;
		image: string;
		projects: any[];
		associations: any[];
	};

	type Project = {
		id: number;
		title: string;
		description: string;
		completed: boolean;
		createdAt: string;
		startsAt: Date;
		endsAt: Date;
	};

	let relatedProjectCount = 0;
	let relatedTaskCount = 0;
	let completedTaskCount = 0;
	let completedProjectCount = 0;
	let conversation: any;
	let sharedProjects: Project[] = [];

	const userId = $page.params.id;

	onMount(async () => {
		try {
			const response = await fetch(`/protected/user/${userId}/`);
			const data = await response.json();

			if (!response.ok) {
				console.error('Network response was not ok');
				return;
			}

			console.log(data);

			user = data.userProfile;
			relatedProjectCount = data.relatedProjectCount;
			relatedTaskCount = data.relatedTaskCount;
			completedTaskCount = data.completedTaskCount;
			completedProjectCount = data.completedProjectCount;
			conversation = data.possibleConvo;
			sharedProjects = data.sharedProjects;

			console.log(user);
		} catch (error) {
			console.error('There has been a problem with your fetch operation:', error);
		}
	});

	async function createConvo() {
		try {
			const response = await fetch(`/protected/user/${userId}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			});
			const data = await response.json();

			if (response.ok) {
				console.log(data);
				console.log('Convo created successfully');
				// Redirect to the convo page
				const conversationId = data.conversationId;
				goto(`/protected/messages/convo/${conversationId}`);
			}
		} catch (error) {
			console.error('There has been a problem with your fetch operation:', error);
		}
	}

	async function removeUser() {
		try {
			const response = await fetch(`/protected/user/${userId}`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' }
			});

			const data = await response.json();

			if (response.ok) {
				console.log(data);
				console.log('User removed successfully');
				goto(`/protected/user/account/associates`);
			}
		} catch (error) {
			console.error('There has been a problem with your fetch operation:', error);
		}
	}

	function goBack() {
		window.history.back(); // Navigates to the previous URL in the history stack
	}
</script>

<div class="shadow-md pb-5">
	<div class="top-0 bg-white dark:bg-black">
		<button on:click|preventDefault={goBack} class="py-2 px-3 mt-5 ml-8">
			<Icon icon="fluent:ios-arrow-24-filled" class="w-7 h-7" />
		</button>

		<div class="w-fit rounded-full place-items-center mt-12 flex flex-col gap-3 mx-auto my-8">
			{#if user?.image}
				<img src={user?.image} alt="profile" class="w-48 h-48 rounded-full" />
			{:else}
				<Icon
					icon="mingcute:user-3-line"
					class="w-32 h-32 border-4 border-black rounded-full px-1"
				/>
			{/if}
			<div class="mx-10 text-center">
				<h1 class="font-bold text-4xl text-wrap">{user?.name}</h1>
			</div>
		</div>
	</div>

	<div class="grid grid-cols-2 w-4/5 mx-auto text-center">
		<h1 class="font-semibold">Tasks</h1>
		<h1 class="font-semibold">Projects</h1>
		<p class="text-[#c9b46f]">{relatedTaskCount}</p>
		<p class="text-[#c9b46f]">{relatedProjectCount}</p>
	</div>

	<div class="grid grid-cols-2 w-4/5 mx-auto text-center mb-4">
		<h1 class="font-semibold text-nowrap col-span-2 border-b-2 border-t-2">Completed</h1>
		<p class="text-[#c9b46f]">{completedTaskCount}</p>
		<p class="text-[#c9b46f]">{completedProjectCount}</p>
	</div>

	<div class="w-fit mx-auto flex flex-col gap-3">
		{#if !conversation}
			<button
				on:click={createConvo}
				class="dark:bg-blue-500/60 text-white bg-blue-500/80 font-semibold px-5 py-3 rounded-full"
				>Start a conversation?</button
			>
		{:else}
			<button
				on:click={() => goto(`/protected/messages/convo/${conversation.id}`)}
				class="dark:bg-blue-500/60 text-white bg-blue-500/80 font-semibold px-5 py-3 rounded-full"
				>View conversation</button
			>
		{/if}
		<button
			on:click={removeUser}
			class="bg-red-600/60 px-5 py-3 rounded-full text-white font-semibold"
			>Remove from association?</button
		>
	</div>
</div>

<div class="bg-[#D9D9D9] dark:bg-[#151515] p-5 h-screen -mb-10">
	<h2 class="text-xl font-bold mb-4">Shared Projects</h2>
	{#if Array.isArray(sharedProjects)}
		<ul class="space-y-4">
			{#each sharedProjects as project}
				<li class="bg-white dark:bg-[#252525] relative rounded-xl shadow-md p-4 min-h-32">
					<a href={`/protected/projects/${project.id}`} class="font-semibold text-lg"
						>{project.title}</a
					>
					<p class="text-gray-600">{project.description}</p>
					<p
						class="absolute bottom-2 right-2 text-red-700 text-sm font-semibold w-fit h-fit rounded-xl opacity-60"
					>
						{new Date(project.startsAt).toLocaleDateString()}
					</p>
				</li>
			{/each}
		</ul>
	{/if}
</div>
