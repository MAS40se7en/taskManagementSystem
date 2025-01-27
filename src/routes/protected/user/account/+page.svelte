<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';
	import { createThemeSwitcher, Theme } from 'svelte-theme-select';
	import ThemeSwitch from '$lib/components/ThemeSwitch.svelte';
	import Modal from '$lib/components/Modal.svelte';

	createThemeSwitcher();

	type User = {
		name: string;
		image: string;
		email: string;
		isVerified: boolean;
		id: any;
		upgraded: boolean;
	};

	let user: User | null = null;
	let taskCount = 0;
	let relatedProjectCount = 0;
	let errorMessage = '';
	let displayModal = false;
	let completedProjectCount = 0;
	let completedTaskCount = 0;

	let loading = true;

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
				errorMessage = data.errorMessage;

				if (!user) {
					alert('Unauthorized access');
					goto('/auth/login');
				}

				loading = false;

				if (!user?.isVerified) {
					alert('Please verify your email to use the application');
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
	<div class="flex justify-center items-center">
		<button on:click={toggleModal}>
			{#if user?.image}
				<img src={user?.image} alt="profile" class="w-36 h-36 rounded-full" />
			{:else}
				<Icon
					icon="mingcute:user-3-line"
					class="w-36 h-36 opacity-60 rounded-full px-1 bg-[#D9D9D9] dark:bg-[#252525]"
				/>
			{/if}
		</button>
	</div>
	<div class="mx-10 text-center w-auto">
		{#if loading}
			<div class="bg-gray-200/50 dark:bg-gray-200/10 h-8 w-32 rounded-full"></div>
		{:else}
			<h1 class="font-bold text-2xl text-wrap">{user?.name}</h1>
		{/if}
	</div>
</div>
{#if errorMessage}
	<div class="bg-red-500 text-white p-2 rounded-xl mb-4">{errorMessage}</div>
{/if}

<Modal {displayModal} onClose={() => (displayModal = false)}>
		{#if user?.image}
			<img src={user?.image} alt="profile" class="rounded-xl" />
		{:else}
			<Icon
				icon="mingcute:user-3-line"
				class="w-96 h-96 border-4 text-white border-white rounded-full px-1 bg-[#D9D9D9] dark:bg-[#252525]"
			/>
		{/if}
		<div
			class="bg-[#e6e6e6] dark:bg-[#252525] rounded-full flex gap-5 justify-center px-3 items-center w-fit mx-auto border-black/30"
		>
			<a href="/protected/user/account/edit/image" class="">
				<Icon icon="lucide:square-pen" class="w-7 h-7" />
			</a>
		</div>
</Modal>

<div class="grid grid-cols-2 w-4/5 mx-auto text-center mb-4">
	<h1 class="font-semibold">Tasks</h1>
	<h1 class="font-semibold">Projects</h1>
	{#if loading}
		<Icon icon="eos-icons:loading" width="24" height="24" class="mx-auto text-[#E1CA7D]" />
	{:else}
		<p class="text-[#E1CA7D]">{taskCount}</p>
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

<div
	class="flex flex-col w-4/5 bg-gray-100 dark:bg-[#252525] dark:text-white mx-auto gap-3 py-4 rounded-2xl"
>
	<a href="/protected/user/account/associates" class="px-3 active:text-black/20 transition"
		>Associations</a
	>
	<hr class="border-t-1 border-black/30" />
	<div class="mx-auto flex w-full pl-3 h-7 pr-5 justify-between items-center">
		<p>Theme</p>
		<ThemeSwitch />
		<Theme />
	</div>
	<hr class="border-t-1 border-black/30" />
	<a href="/protected/user/account/edit" class="px-3 active:text-black/20 transition"
		>Edit Profile</a
	>
	
	{#if !user?.upgraded}
	<hr class="border-t-1 border-black/30" />
	<a href="/protected/upgrade" class="flex justify-between px-2 active:text-black/20 transition"
	>
	<p>Upgrade to TaskFocused<span class="text-[#c9b46f]">+</span></p>
	<Icon icon="mingcute:plus-fill" class="w-7 h-7 text-[#E1CA7D]" /></a
>
	{/if}
</div>
<div class="w-full flex flex-col gap-3 justify-center py-4">
	<button on:click={logout} class="text-lg text-red-500 active:text-red-200 transition">
		Logout
	</button>
</div>

<div class="w-4/5 flex flex-col mx-auto py-4 mb-20 rounded-2xl bg-gray-100 dark:bg-[#252525]">
	<a href="/protected/user/account/settings" class="px-3 active:text-black/20 transition"
		>Settings</a
	>
</div>
