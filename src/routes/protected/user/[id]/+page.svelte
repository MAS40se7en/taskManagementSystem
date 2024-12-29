<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Icon from '@iconify/svelte';
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
		userCount: any;
	};

	let relatedProjectCount = 0;
	let relatedTaskCount = 0;
	let completedTaskCount = 0;
	let completedProjectCount = 0;
	let conversation: any;
	let sharedProjects: Project[] = [];

	let errorMessage = '';
	let loading = true;

	const userId = $page.params.id;

	onMount(async () => {
		try {
			const response = await fetch(`/protected/user/${userId}/`);
			const data = await response.json();

			if (response.ok) {
				console.log(data);

				user = data.userProfile;
				relatedProjectCount = data.relatedProjectCount;
				relatedTaskCount = data.relatedTaskCount;
				completedTaskCount = data.completedTaskCount;
				completedProjectCount = data.completedProjectCount;
				conversation = data.possibleConvo;
				sharedProjects = data.sharedProjects;

				console.log(user);
				loading = false;

				if (!user) {
					alert('unauthorized access');
					goto('/auth/login');
				}
			} else {
				errorMessage = data.message;
			}
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
			} else {
				errorMessage = data.message;
                console.error(errorMessage);
			}
		} catch (error) {
			console.error('There has been a problem with your fetch operation:', error);
		}
	}

	function goBack() {
		window.history.back(); // Navigates to the previous URL in the history stack
	}
</script>

<div class="shadow-md pb-5 px-5 pt-10">
	{#if errorMessage}
	<div class="bg-red-600 w-4/6 px-3 py-2 mx-auto rounded-lg">
		<p class="text-white font-semibold">
			{errorMessage}
		</p>
	</div>
	{/if}
	
	<div class="top-0 bg-white dark:bg-black">
		<a href="/protected/user/account" class="py-2 mt-5">
			<Icon icon="fluent:ios-arrow-24-filled" class="w-7 h-7" />
		</a>

		<div class="w-fit rounded-full place-items-center mt-12 flex flex-col gap-3 mx-auto my-8">
			{#if user?.image}
				<img src={user?.image} alt="profile" class="w-48 h-48 rounded-full" />
			{:else}
				<Icon
					icon="mingcute:user-3-line"
					class="w-32 h-32 border-4 border-black rounded-full px-1"
				/>
			{/if}
			{#if loading}
		<Icon icon="eos-icons:loading" width="24" height="24" class="mx-auto" />
		{:else}
		<h1 class="font-bold text-2xl text-wrap">{user?.name}</h1>
		{/if}
		</div>
	</div>

	<div class="grid grid-cols-2 w-4/5 mx-auto text-center mb-4">
		<h1 class="font-semibold">Tasks</h1>
		<h1 class="font-semibold">Projects</h1>
		{#if loading}
		<Icon icon="eos-icons:loading" width="24" height="24" class="mx-auto text-[#E1CA7D]" />
		{:else}
		<p class="text-[#E1CA7D]">{relatedTaskCount}</p>
		{/if}
		
		{#if loading}
		<Icon icon="eos-icons:loading" width="24" height="24" class="mx-auto text-[#E1CA7D]" />
		{:else}
		<p class="text-[#E1CA7D]">{relatedProjectCount}</p>
		{/if}
		
	</div>
	
	<div class="grid grid-cols-2 w-4/5 mx-auto text-center mb-4">
		<h1 class="font-semibold text-nowrap col-span-2 border-b-2 border-t-2">Completed</h1>
		{#if loading}
		<Icon icon="eos-icons:loading" width="24" height="24" class="mx-auto text-[#E1CA7D]" />
		{:else}
		<p class="text-[#c9b46f]">{completedTaskCount}</p>
		{/if}
		
		{#if loading}
		<Icon icon="eos-icons:loading" width="24" height="24" class="mx-auto text-[#E1CA7D]" />
		{:else}
		<p class="text-[#c9b46f]">{completedProjectCount}</p>
		{/if}
		
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
	{#if loading}
	<ul class="flex flex-col gap-5 py-3">
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
	{#if Array.isArray(sharedProjects)}
		<ul class="space-y-4">
			{#each sharedProjects as project}
				<li class="bg-white dark:bg-[#202020] relative rounded-xl shadow-md p-4 min-h-28">
					<div class="flex justify-between items-center">
						<a href={`/protected/projects/${project.id}`} class="font-semibold text-lg"
						>{project.title}</a
					>
					<div class="flex text-[#c9b46f] px-2 items-center">
						<Icon
					icon="mingcute:user-3-line"
					class="w-5 h-5"
				/>
				<p>{project.userCount}</p>
					</div>
					</div>
					<p class="text-sm">{project.description}</p>
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
				</li>
			{/each}
		</ul>
	{/if}
	{/if}
</div>