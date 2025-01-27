<script lang="ts">
	import Icon from '@iconify/svelte';
	import { goto } from '$app/navigation';
	import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
	import { onMount } from 'svelte';

	let loading = false;
	let errorMessage = '';
	let isMobile: boolean;
	let user: any;
	let session: any;

	onMount(async () => {
		try {
			const response = await fetch('/');

			const data = await response.json();

			if (response.ok) {
				isMobile = data.isMobile;
				user = data.user;
				session = data.session;

				if (user && session) {
					goto('/protected');
				}
			} else {
				errorMessage = data.message;
			}
		} catch (error) {
			errorMessage = 'error loading data';
		}
	});

	async function signInWithGoogle() {
		loading = true;
		try {
			const result = await FirebaseAuthentication.signInWithGoogle({
				scopes: [
					'https://www.googleapis.com/auth/calendar',
					'https://www.googleapis.com/auth/calendar.events'
				],
				customParameters: [
					{ key: 'access_type', value: 'offline' },
					{ key: 'prompt', value: 'consent' }
				]
			});

			const response = await fetch('/api/oauth', {
				method: 'POST',
				body: JSON.stringify({ user: result.user, accessToken: result.credential?.accessToken })
			});

			if (response.ok) {
				loading = false;
				goto('/protected');
			} else {
				loading = false;
			}
		} catch (error) {
			loading = false;
			console.error(error);
		}
	}
</script>

{#if loading}
	<div
		class="w-full top-0 right-0 left-0 bottom-0 absolute rounded-3xl backdrop-blur-sm z-50 flex flex-col place-items-center justify-center"
	>
		<Icon icon="line-md:loading-twotone-loop" class="w-24 h-24 dark:text-white" />
		<p class="text-xl font-semibold">Loading your data from google!</p>
	</div>
{/if}

<div class="text-center py-20 dark:bg-black h-screen dark:text-white">
	<div>
		<h1 class="text-3xl font-bold">TaskFocused</h1>
	</div>

	<div class="pt-20 px-7">
		<p>You are not signed in yet, <br /> Sign in with an existing account or create a new one</p>
	</div>
	{#if errorMessage}
		<div class="w-full flex justify-center items-center">
			<p class="bg-red-500 px-3 py-2 rounded-lg">{errorMessage}</p>
		</div>
	{/if}
	<div class="flex flex-col gap-3 py-20 bottom-0 absolute w-full">
		<div
			class="grid grid-rows-1 grid-cols-2 w-4/6 items-center mx-auto rounded-3xl h-14 dark:bg-[#151515] bg-[#D9D9D9]"
		>
			<a href="/auth/login" class="px-2 py-2 font-bold active:border-r-2"> Sign in </a>
			<a href="/auth/register" class="px-2 py-2 font-bold active:border-l-2"> Register </a>
		</div>
		{#if isMobile}
			<p>or</p>
			<button
				on:click={signInWithGoogle}
				class="dark:bg-[#252525] bg-[#eeeded] border-2 border-[#D9D9D9] flex items-center gap-3 w-4/6 mx-auto justify-center py-3 px-3 rounded-2xl"
			>
				<Icon icon="devicon:google" class="w-6 h-6" />
				<h1 class="font-semibold text-lg">Login with google!</h1>
			</button>
		{/if}
	</div>
</div>
