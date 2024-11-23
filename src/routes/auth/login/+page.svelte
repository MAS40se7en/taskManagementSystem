<script>
	import { goto } from "$app/navigation";

	let email = '';
	let password = '';
	let errorMessage = '';

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	async function signIn() {
		errorMessage = '';

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

		const result = await response.json();

		if (response.ok) {
			if (result.mobile) {
				goto('/protected/mobile-admin');
			} else if (result.redirect) {
				goto(result.redirect);
			} else {
				goto('/protected/');
			}
		} else {
			console.error(result.message);
		}
	}
</script>

<div class="grid grid-cols-2 gap-2 h-screen bottom-0 scroll-container items-end fixed dark:bg-black dark:text-white">
	<div class="w-4/5 col-span-2 mx-10 content-to-move mb-32">
		<h1 class="w-3/4 font-bold text-4xl mb-5">Login with Your account</h1>
		{#if errorMessage}
			<div class="bg-red-500 text-white rounded-2xl py-2 px-3">
				{errorMessage}
			</div>
		{/if}
		<div class="mb-3">
			<h1 class="font-bold text-lg mx-1 my-1">Email</h1>
			<input
				bind:value={email}
				class="bg-black/15 focus:outline-black/40 w-full rounded-lg h-10 dark:bg-stone-700/40"
				type="email"
				name="email"
			/>
		</div>
		<div class="mb-3">
			<h1 class="font-bold text-lg mx-1 my-1">Password</h1>
			<input
				bind:value={password}
				class="bg-black/15 focus:outline-black/40 w-full rounded-lg h-10 dark:bg-stone-700/40"
				type="password"
				name="password"
			/>
		</div>
		<div class="w-fit mx-auto">
		<button class="font-bold w-40 rounded-lg h-9 bg-green-300 dark:bg-green-600 my-2" on:click={signIn}>
			Login
		</button>
		</div>
		<div class="flex flex-col items-center gap-5">
			<a href="/auth/forgot-password" class="text-blue-400 text-center">Forgot Password?</a>
			<a href="/auth/register" class="text-center text-green-700">Create An Account!</a>
		</div>
	</div>
</div>

<style>
	.scroll-container {
		max-height: 100vh; /* Ensures it fits within the viewport */
		overflow-y: auto; /* Enables vertical scrolling */
	}

	.content-to-move {
		padding: 20px; /* Add some padding for spacing */
	}
</style>
