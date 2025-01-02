<script lang="ts">
	import { Browser } from '@capacitor/browser';
	import Icon from '@iconify/svelte';

	async function upgrade() {
		try {
			const response = await fetch('/api/stripe', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					mode: 'subscription'
				})
			});

			const { checkoutUrl } = await response.json();

			if (!checkoutUrl) {
				throw new Error('Failed to fetch stripe checkout URL');
			}

			console.log('checkout url', checkoutUrl);

			await Browser.open({ url: checkoutUrl });
		} catch (error) {
			console.error(error);
		}
	}

	function goBack() {
		window.history.back();
	}
</script>

<main class="px-5 py-10">
	<container class="overflow-y-auto">
		<div class="flex justify-between items-center px-3">
			<button on:click|preventDefault={goBack} class="py-2" aria-label="Go back">
				<Icon icon="fluent:ios-arrow-24-filled" class="w-7 h-7" />
			</button>
			<div class="flex justify-end mb-4">
				<h1 class="text-3xl font-bold text-end">
					Upgrade to <span class="text-[#E1CA7D] shadow-md px-5 py-1 flex items-center rounded-xl"
						>Task<span class="text-black dark:text-white">Focused</span>+</span
					>
				</h1>
			</div>
		</div>

		<div class="px-3 my-5">
			<p>Upgrade to access features only available for the Plus users</p>
		</div>

		<div
			class="min-h-96 border-4 relative border-gray-100 dark:border-[#252525] shadow-md rounded-3xl px-4 py-2"
		>
			<h1 class="font-bold text-xl w-4/6 mt-2">This Subscription Includes:</h1>
			<ol class="text-[#c5b16e] text-lg font-semibold w-3/4">
				<li><span class="text-black dark:text-white">-</span> More Projects to create</li>
				<li>
					<span class="text-black dark:text-white">-</span> Use audio for your task instructions
				</li>
				<li><span class="text-black dark:text-white">-</span> Add images to your tasks</li>
				<li><span class="text-black dark:text-white">-</span> More Tasks in your projects</li>
			</ol>

			<div class="bottom-3 right-3 absolute flex items-center">
				<p class="pr-3 font-semibold mt-3">Price:</p>
				<p class="text-4xl font-bold flex">
					3.99<span><Icon icon="fa:euro" class="w-5 h-5" /></span>
				</p>
				<p class="flex flex-col jsutify-end mt-3">/month</p>
			</div>
		</div>

		<div class="flex flex-col items-center justify-center my-4">
			<button
				on:click={upgrade}
				class="px-5 py-2 text-xl rounded-full bg-[#E1CA7D] font-semibold text-white"
				>Subscribe</button
			>
			<div class="flex my-2">
				<p class="text-[#635bff]">with</p>
				<Icon icon="logos:stripe" class="w-14 h-14" />
			</div>
		</div>
	</container>
</main>
