<script lang="ts">
	import Icon from '@iconify/svelte';

	let email = '';
	let isSubmitting = false;
	let successMessage = '';
	let errorMessage = '';

	async function sendEmail() {
		let successMessage = '';
		let errorMessage = '';
		isSubmitting = true;

		const response = await fetch('/auth/forgot-password', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ email })
		});

		const data = await response.json();

		if (response.ok) {
			successMessage = data.message;
			isSubmitting = false;
		} else {
			errorMessage = data.message;
			isSubmitting = false;
		}
	}

	function goBack() {
		window.history.back(); // Navigates to the previous URL in the history stack
	}
</script>

<div class="px-8 py-5 flex gap-4">
	<button on:click|preventDefault={goBack} class="py-2 px-3 mt-5 ml-3">
		<Icon icon="fluent:ios-arrow-24-filled" class="w-7 h-7" />
	</button>
	<p class="font-bold text-3xl">did you forget your password?</p>
</div>

<div class="px-10 flex flex-col gap-4 justify-center mt-10">
	<p class="opacity-70">
		provide your email address, so we can send you a link to reset your password
	</p>
	{#if errorMessage.length > 0}
		<div class="bg-red-400 text-white font-bold rounded-lg px-2 py-2">
			{errorMessage}
		</div>
	{/if}
	<input type="email" bind:value={email} class="bg-[#D9D9D9] px-2 py-2 rounded-lg" />
	{#if successMessage.length > 0}
		<div class="bg-green-400 text-white font-bold rounded-lg px-2 py-2">
			{successMessage}
		</div>
	{/if}
	<button on:click={sendEmail} class="bg-blue-400 px-4 py-2 rounded-xl font-semibold text-white">
		Send Email
	</button>
</div>
