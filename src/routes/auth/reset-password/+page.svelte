<script lang="ts">
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	let token = '';
	let password = '';
	let confirmPassword = '';
	let errorMessage = '';
	let successMessage = '';
	let passwordError = '';
	let showPassword = false;
	let showConfirmPassword = false;

	let user: any;

	onMount(async () => {
		const response = await fetch('/auth/reset-password');
		const data = await response.json();
		if (response.ok) {
			token = data.existToken;
			user = data.user;
			console.log(token);
			console.log(user);
		}
	});

	async function updatePassword() {
		passwordError = '';
		errorMessage = '';
		if (password.length < 8) {
			passwordError = 'Password must be at least 8 characters long!';
			password = '';
			confirmPassword = '';
			return;
		} else if (!/[A-Z]/.test(password)) {
			passwordError = 'Password must contain at least one uppercase letter!';
			password = '';
			confirmPassword = '';
			return;
		} else if (!/[0-9]/.test(password)) {
			passwordError = 'Password must contain at least one number!';
			password = '';
			confirmPassword = '';
			return;
		}

		if (password !== confirmPassword) {
			errorMessage = 'please make sure your password and password confirmation match';
			return;
		}

		if (!password || !confirmPassword) {
			errorMessage = 'Please fill in all the fields';
			return;
		}

		if (!token) {
			errorMessage = 'Invalid or expired token';
			return;
		}

		console.log('error: ', errorMessage);

		try {
			const response = await fetch('/auth/reset-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ user, token, password })
			});

			const data = await response.json();

			if (response.ok) {
				successMessage = data.message || 'Password has been updated successfully.';
				password = '';
				confirmPassword = '';
				errorMessage = '';

				alert(successMessage);
			} else {
				errorMessage = data.message || 'Failed to update password';
			}
		} catch (error) {
			console.error(error);
			errorMessage = 'An error occurred while updating your password';
			alert(errorMessage);
		}
	}
</script>

<div class="flex flex-col gap-5 bottom-24 fixed">
	<div class="px-6 py-7 flex items-center">
		<h1 class="text-4xl font-bold">Reset your Password</h1>
	</div>

	{#if successMessage.length > 0}
    <div class="bg-red-400 text-white py-2 px-3 rounded-2xl">
        {successMessage}
    </div>
	{:else if token}
		<div
			class="px-2 py-3 w-5/6 mx-auto border-2 border-green-200 rounded-xl bg-green-100 dark:border-green-500 dark:bg-green-400"
		>
			<p class="opacity-70">
				Make sure the password contains:<br />
				- one capital letter<br />
				- one special character<br />
				- one number<br />
				- at least 8 characters<br />
			</p>
		</div>
		<div class="px-5 flex flex-col gap-2">
			<label for="password" class="font-semibold">New Password</label>
			<div class="relative">
				{#if showPassword}
					<input
						type="text"
						bind:value={password}
						class="bg-[#D9D9D9] dark:bg-[#252525] px-2 py-2 rounded-lg w-full"
					/>
				{:else}
					<input
						type="password"
						bind:value={password}
						class="bg-[#D9D9D9] dark:bg-[#252525] px-2 py-2 rounded-lg w-full"
					/>
				{/if}
				<button
					type="button"
					on:click={() => (showPassword = !showPassword)}
					class="absolute right-3 top-2 text-gray-500"
					aria-label="Toggle Password Visibility"
				>
					{#if showPassword}
                    <Icon icon="fluent:eye-32-filled" class="w-6 h-6" />
					{:else}
                    <Icon icon="fluent:eye-off-20-filled" class="w-6 h-6" />
					{/if}
				</button>
			</div>
		</div>
		<div class="px-5 flex flex-col gap-2">
			<label for="confirmPassword" class="font-semibold">Confirm Password</label>
			<div class="relative">
				{#if showConfirmPassword}
					<input
						type="text"
						bind:value={confirmPassword}
						class="bg-[#D9D9D9] dark:bg-[#252525] px-2 py-2 rounded-lg w-full"
					/>
				{:else}
					<input
						type="password"
						bind:value={confirmPassword}
						class="bg-[#D9D9D9] dark:bg-[#252525] px-2 py-2 rounded-lg w-full"
					/>
				{/if}
				<button
					type="button"
					on:click={() => (showConfirmPassword = !showConfirmPassword)}
					class="absolute right-3 top-2 text-gray-500"
					aria-label="Toggle Password Visibility"
				>
					{#if showConfirmPassword}
                    <Icon icon="fluent:eye-32-filled" class="w-6 h-6" />
					{:else}
                    <Icon icon="fluent:eye-off-20-filled" class="w-6 h-6" />
					{/if}
				</button>
			</div>
		</div>
		{#if passwordError.length > 0}
			<div class="bg-red-500 w-4/6 mx-auto px-2 py-2 rounded-lg">
				<p class="text-white font-semibold">{passwordError}</p>
			</div>
		{/if}
		{#if errorMessage}
        <div class="bg-red-400 text-white py-2 px-3 rounded-2xl">
            {errorMessage}
        </div>
		{/if}
		<div class="flex justify-end px-5">
			<button
				on:click={updatePassword}
				class="bg-blue-400 px-4 py-2 rounded-xl font-semibold text-white">Reset Password</button
			>
		</div>
	{:else}
		<div class="px-2 py-2 w-4/6 mx-auto flex justify-center bg-red-500 rounded-lg">
			<p class="text-white font-semibold">Could not validate your token or token has expired</p>
		</div>
	{/if}
</div>
