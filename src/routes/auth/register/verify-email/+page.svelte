<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	let verificationCode = '';
	let errorMessage = '';
	let userId = '';
	let previousUrl: string = '';
	let emailSent = true;
	let isMobile: boolean;
	let user: any;
	let submitting = false;
	let sendingEmail = false;

	onMount(async () => {
		previousUrl = document.referrer;

		setTimeout(() => {
			emailSent = false;
		}, 12000);
		console.log('previous url: ', previousUrl);
		userId = new URLSearchParams(window.location.search).get('userId') || '';
		console.log('userID: ', userId);
	});

	async function verifyEmail() {
		submitting = true;

		if (verificationCode.length > 8) {
			errorMessage = "Verification code can't be longer than 8 characters";
		}

		try {
			const response = await fetch('/auth/register/verify-email', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ userId, verificationCode })
			});

			const data = await response.json();

			if (response.ok) {
				errorMessage = '';
				user = data.user;
				isMobile = data.isMobile;
				alert('Email verified successfully!');
				if (isMobile) {
				if (user.role === 'admin') {
					goto('/mobile-admin');
				} else {
					goto('/protected')
				}
			} else {
				if (user.role === 'admin') {
					goto('/admin')
				} else {
					goto('/userWeb')
				}
			}
				submitting = false;
			}
		} catch (error) {
			submitting = false;
			errorMessage = 'Failed to verify email';
			console.error('Failed to verify email: ', error);
			return;
		}
	}

	async function sendEmail() {
		sendingEmail = true;

		const response = await fetch('/auth/register/verify-email/sendEmail', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ userId })
		});

		if (response.ok) {
			emailSent = true;
			sendingEmail = false;
			alert('Verification code has been sent to your email!');

			setTimeout(() => {
				emailSent = false;
			}, 120000);
		} else {
			sendingEmail = false;
			errorMessage = 'Failed to send verification code';
		}
	}

	async function logout() {
		const response = await fetch('/protected/user/account', {
			method: 'POST',
			body: JSON.stringify({ userId })
		});

		if (response.ok) {
			// Redirect to login page after logout
			goto('/');
		} else {
			console.error('Logout failed');
		}
	}
</script>

<div class="dark:bg-black px-5 py-10 dark:text-white h-screen">
	<div class="px-3 py-2">
		<h1 class="text-3xl font-bold">Verify your email Addres</h1>
		{#if emailSent}
			<p class="text-sm mt-5">
				We have sent you an email containing your verification code, please use that to verify your
				email addres!
			</p>
		{:else}
			<p>to get the verification code please press this</p>
			{#if sendingEmail}
				<Icon
					icon="line-md:loading-twotone-loop"
					class="w-14 h-14 text-blue-400 dark:text-blue-600"
				/>
			{:else}
				<button
					on:click={sendEmail}
					class="mx-auto w-4/6 text-center bg-blue-400 dark:bg-blue-600 text-white shadow-md my-2 py-2 rounded-lg"
					>Send Verification Code</button
				>
			{/if}
		{/if}

		<div class="py-12 flex flex-col gap-5 justify-center">
			<input
				type="text"
				class="bg-[#D9D9D9] dark:bg-[#252525] h-12 rounded-xl px-2"
				bind:value={verificationCode}
			/>
			<div class="flex justify-center gap-5">
				{#if submitting}
					<Icon
						icon="line-md:loading-twotone-loop"
						class="w-10 h-10 text-green-200 dark:text-green-500"
					/>
				{:else}
					<button
						on:click={verifyEmail}
						class="bg-green-200 dark:bg-green-500 px-5 py-2 rounded-full w-fit">Submit</button
					>
				{/if}

				<button on:click={logout} class="text-red-500">Log out</button>
			</div>
		</div>
	</div>
</div>
