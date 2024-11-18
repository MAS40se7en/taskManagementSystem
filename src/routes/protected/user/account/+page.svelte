<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from '@iconify/svelte';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { stringify } from 'postcss';
	import { createThemeSwitcher, Theme } from 'svelte-theme-select';
	import ThemeSwitch from '$lib/components/ThemeSwitch.svelte';

	createThemeSwitcher();

	type User = {
		name: string;
		image: string;
		email: string;
		isVerified: boolean;
		id: any;
	};

	let user: User | null = null;
	let taskCount = 0;
	let relatedProjectCount = 0;
	let errorMessage = '';
	let displayModal = false;
	let completedProjectCount = 0;
	let completedTaskCount = 0;

	onMount(async () => {
		try {
			const response = await fetch('/protected/user/account');
			if (response.ok) {
				const data = await response.json();
				taskCount = data.taskCount;
				relatedProjectCount = data.relatedProjectCount;
				user = data.user;
				completedProjectCount = data.completedProjectCount;
				completedTaskCount = data.completedTaskCount;

				if (!user?.isVerified) {
					alert('please verify your email to use the application');

					const url = new URL(`/auth/register/verify-email/`, window.location.origin);
					url.searchParams.append('userId', user?.id);

					goto(url.toString());
				}
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

<div
	class="w-fit rounded-full mt-12 flex flex-col gap-3 mx-auto my-8 dark:bg-black dark:text-white"
>
	<div class="">
		{#if errorMessage}
			<div class="bg-red-500 text-white p-2 rounded-xl mb-4">{errorMessage}</div>
		{/if}
		<button on:click={toggleModal}>
			{#if user?.image}
				<img src={user?.image} alt="profile" class="w-48 h-48 rounded-full" />
			{:else}
				<Icon
					icon="mingcute:user-3-line"
					class="w-48 h-48 border-4 border-black rounded-full px-1"
				/>
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
			<img src={user?.image} alt="profile" class="w-5/6 rounded-xl" />
		{:else}
			<Icon
				icon="mingcute:user-3-line"
				class="w-96 h-96 border-4 text-white border-white rounded-full px-1"
			/>
		{/if}
		<div
			class="bg-[#D9D9D9] dark:bg-[#252525] rounded-full flex gap-5 justify-center px-3 items-center w-fit mx-auto bg-opacity-70 border-black/30"
		>
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

<div class="grid grid-cols-2 w-4/5 mx-auto text-center mb-4">
	<h1 class="font-semibold text-nowrap col-span-2 border-b-2 border-t-2">Completed</h1>
	<p class="text-[#c9b46f]">{completedTaskCount}</p>
	<p class="text-[#c9b46f]">{completedProjectCount}</p>
</div>

<div
	class="flex flex-col w-4/5 bg-[#D9D9D9] dark:bg-[#252525] dark:text-white mx-auto gap-3 py-4 rounded-2xl"
>
	<a href="/protected/user/account/associates" class="px-3 active:text-black/20 transition"
		>Associations</a
	>
	<hr class="border-t-1 border-black/30" />
	<div class="mx-auto flex w-full pl-3 pr-5 justify-between gap-3 items-center">
		<p>Theme</p>
		<ThemeSwitch />
		<Theme />
	</div>
	<hr class="border-t-1 border-black/30" />
	<a href="/protected/user/account/edit" class="px-3 active:text-black/20 transition"
		>Edit Profile</a
	>
</div>
<div class="w-full flex flex-col gap-3 justify-center py-4">
	<button on:click={logout} class="text-lg text-red-500 active:text-red-200 transition">
		Logout
	</button>
</div>

<div class="w-4/5 flex flex-col mx-auto py-4 mb-20 rounded-2xl bg-[#D9D9D9] dark:bg-[#252525]">
	<a href="/protected/user/account/settings" class="px-3 active:text-black/20 transition">Settings</a>
</div>
