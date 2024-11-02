<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from '@iconify/svelte';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { stringify } from 'postcss';

	type User = {
		name: string;
		image: string;
		email: string;
	};

	let user: User | null = null;
	let taskCount = 0;
	let relatedProjectCount = 0;
	let errorMessage = '';
	let displayModal = false;

	onMount(async () => {
		try {
			const response = await fetch('/protected/user/account');
			if (response.ok) {
				const data = await response.json();
				taskCount = data.taskCount;
				relatedProjectCount = data.relatedProjectCount;
				user = data.user;
			} else {
				errorMessage = 'Failed to load data';
			}
		} catch (error) {
			errorMessage = 'Error Fetching profile data';
		}
	});

	function toggleModal() {
		displayModal = !displayModal;
		console.log(displayModal);
	}

	async function logout() {
		const response = await fetch('/protected/user/account', {
			method: 'POST'
		});

		if (response.ok) {
			// Redirect to login page after logout
			goto('/');
		} else {
			console.error('Logout failed');
		}
	}
</script>

<div class="w-fit rounded-full mt-12 flex flex-col gap-3 mx-auto my-8">
	<div class="">
    <button on:click={toggleModal}>
		{#if user?.image}
			
        <img src={user?.image} alt="profile" class="w-48 h-48 rounded-full" />
      
		{:else}
			<Icon icon="mingcute:user-3-line" class="w-32 h-32 border-4 border-black rounded-full px-1" />
		{/if}
	  </button>
  </div>
  <div class="mx-10 text-center">
    <h1 class="font-bold text-4xl text-wrap">{user?.name}</h1>
  </div>
</div>

{#if displayModal}
	<div
		class="fixed inset-0 flex flex-col gap-4 items-center justify-center bg-black bg-opacity-70 z-20"
		role="dialog"
		aria-modal="true"
	>
	{#if user?.image}
			
	<img src={user?.image} alt="profile" class="w-96 h-96 rounded-full" />
  
	{:else}
		<Icon icon="mingcute:user-3-line" class="w-96 h-96 border-4 text-white border-white rounded-full px-1" />
	{/if}
  <div class="bg-gray-100 rounded-full flex gap-5 justify-center px-3 items-center w-fit mx-auto bg-opacity-70 border-black/30">
    <button on:click={toggleModal} class="text-red-600 text-3xl">&times</button>
		<a href="/protected/user/account/edit/image" class="">
			<Icon icon="lucide:square-pen" class="w-7 h-7" />
		</a>
	</div>
</div>
{/if}

<div class="grid grid-cols-2 w-4/5 mx-auto text-center mb-4">
	<h1 class="font-semibold">Tasks</h1>
	<h1 class="font-semibold">Projects</h1>
	<p class="text-[#E1CA7D]">{taskCount}</p>
	<p class="text-[#E1CA7D]">{relatedProjectCount}</p>
</div>

<div class="flex flex-col w-4/5 bg-gray-200 mx-auto gap-3 py-4 rounded-2xl">
	<a href="/protected/user/account/associates" class="px-3 active:text-black/20 transition">Associations</a>
	<hr class="border-t-1 border-black/30" />
	<a href="/protected/user/account/theme" class="px-3 active:text-black/20 transition">Theme</a>
	<hr class="border-t-1 border-black/30" />
	<a href="/protected/user/account/edit" class="px-3 active:text-black/20 transition">Edit Profile</a>
</div>
<div class="w-full flex justify-center py-4">
	<button on:click={logout} class="text-lg text-red-500 active:text-red-200 transition">
		Logout
	</button>
</div>

<div class="w-4/5 flex flex-col mx-auto py-4 mb-20 rounded-2xl bg-gray-200">
	<a href="/user/account/settings" class="px-3 active:text-black/20 transition">Settings</a>
</div>
