<script lang="ts">
	import { goto } from "$app/navigation";
	import Icon from "@iconify/svelte";

	let email = '';
	let password = '';
	let errorMessage = '';
	let submitting = false;
	let isMobile: any;
	let user: any;

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	async function signIn() {
		errorMessage = '';
		submitting = true;

		if (!emailRegex.test(email)) {
			errorMessage = "Invalid email address!";
			return;
		}

		if (password.length < 8) {
			errorMessage = "Password must be at least 8 characters long!";
			return;
		}

		const formData = new FormData();
		formData.append('email', email);
		formData.append('password', password);

		const response = await fetch('/auth/login', {
			method: 'POST',
			body: formData
		});

		const data = await response.json();

		if (response.ok) {
			user = data.user;
			isMobile = data.isMobile;
			if (isMobile && user.role === 'admin') {
				goto('/mobile-admin');
			} else if (isMobile && user.role === 'user') {
				goto('/protected');
			} else if (!isMobile && user.role === 'user') {
				goto('/userWeb');
			} else if (user.role === 'admin' && !isMobile) {
				goto('/admin')
			}
			submitting = false;
		} else {
			submitting = false;
			errorMessage = data.message;
			console.error(data.message);
		}
	}
</script>


<div class="dark:bg-black h-screen">
	<div class="py-7 px-5">
		<a href="/" class="flex gap-1 items-center"><Icon icon="fluent:ios-arrow-24-filled" class="w-7 h-7" /><h1 class="text-lg">Home</h1></a>
	</div>
	<div class="w-4/5 mx-10">
		<h1 class="w-3/4 font-bold text-4xl mb-5">Sign in!</h1>
		{#if errorMessage}
			<div class="bg-red-500 text-white rounded-2xl py-2 px-3">
				{errorMessage}
			</div>
		{/if}
		<div class="mb-3">
			<h1 class="font-bold text-lg mx-1 my-1">Email</h1>
			<input
				bind:value={email}
				class="bg-black/15 px-2 focus:outline-black/40 w-full rounded-lg h-10 dark:bg-stone-700/40"
				type="email"
				name="email"
			/>
		</div>
		<div class="mb-3">
			<h1 class="font-bold text-lg mx-1 my-1">Password</h1>
			<input
				bind:value={password}
				class="bg-black/15 px-2 focus:outline-black/40 w-full rounded-lg h-10 dark:bg-stone-700/40"
				type="password"
				name="password"
			/>
		</div>
		<div class="w-fit mx-auto">
		{#if submitting}
		<Icon icon="line-md:loading-twotone-loop" class="w-10 h-10 text-green-300 dark:text-green-600" />
		{:else}
		<button class="font-bold w-40 rounded-lg h-9 bg-green-300 dark:bg-green-600 active:bg-green-500 dark:active:bg-green-800 my-2" on:click={signIn}>
			Login
		</button>
		{/if}
		</div>
		<div class="flex flex-col items-center gap-5">
			<a href="/auth/forgot-password" class="text-blue-400 text-center">Forgot Password?</a>
			<a href="/auth/register" class="text-center text-green-700">Create An Account!</a>
		</div>
	</div>
</div>