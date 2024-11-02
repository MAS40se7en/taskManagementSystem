<script lang="ts">
	import { page } from '$app/stores';
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

    let relatedProjectCount = 0;
    let relatedTaskCount = 0;
    let completedTaskCount = 0;
    let completedProjectCount = 0;

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


			console.log(user);
		} catch (error) {
			console.error('There has been a problem with your fetch operation:', error);
		}
	});

    function goBack() {
		window.history.back(); // Navigates to the previous URL in the history stack
	}
</script>

<button on:click|preventDefault={goBack} class="py-2 px-3 mt-5 ml-8">
    <Icon icon="fluent:ios-arrow-24-filled" class="w-7 h-7" />
</button>

<div class="w-fit rounded-full place-items-center mt-12 flex flex-col gap-3 mx-auto my-8">
	{#if user?.image}
		<img src={user?.image} alt="profile" class="w-48 h-48 rounded-full" />
	{:else}
		<Icon icon="mingcute:user-3-line" class="w-32 h-32 border-4 border-black rounded-full px-1" />
	{/if}
	<div class="mx-10 text-center">
		<h1 class="font-bold text-4xl text-wrap">{user?.name}</h1>
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
    <button class="bg-blue-500/60 font-semibold px-5 py-3 rounded-full">Start a conversation?</button>
    <button class="bg-red-600/60 px-5 py-3 rounded-full text-white font-semibold">Remove from associations?</button>
</div>