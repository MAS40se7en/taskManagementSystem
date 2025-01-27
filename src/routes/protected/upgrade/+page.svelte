<script lang="ts">
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let Stripe: any,
		PaymentSheetEventsEnum: {
			Completed: any;
			Failed: any;
			Canceled: any;
			Loaded?: any;
			FailedToLoad?: any;
		};
	let invoiceUrl: any;
	let message = '';
	let loadingSheet = false;
	let user: any;
	let loading = false;

	onMount(async () => {
		// Dynamic import for Stripe
		const stripeModule = await import('@capacitor-community/stripe');
		Stripe = stripeModule.Stripe;
		PaymentSheetEventsEnum = stripeModule.PaymentSheetEventsEnum;

		Stripe.initialize({
			publishableKey: `${import.meta.env.VITE_PUBLIC_STRIPE_KEY}`
		});
	});

	async function openSheet() {
		loadingSheet = true;

		try {
			const response = await fetch('/api/stripe', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ amount: 399, currency: 'eur' })
			});

			const data = await response.json();

			if (response.ok) {
				user = data.user;
				invoiceUrl = data.invoiceUrl;

				await Stripe.createPaymentSheet({
					paymentIntentClientSecret: data.paymentIntent,
					merchantDisplayName: 'TaskFocused+'
				});

				const { paymentResult } = await Stripe.presentPaymentSheet();

				if (paymentResult === PaymentSheetEventsEnum.Completed) {
					loadingSheet = false;
					await update(user.email, invoiceUrl);
				} else {
					loadingSheet = false;
					goto('/protected/upgrade/checkout/failure');
				}
			}
		} catch (error) {
			console.error('Payment failed:', error);
		} finally {
			loadingSheet = false;
		}
	}

	async function update(userEmail: any, invoiceUrl: any) {
		loading = true;
		try {
			const response = await fetch('/api/stripe/update', {
				method: 'POST',
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ userEmail, invoiceUrl })
			});

			const data = await response.json();

			if (response.ok) {
				loading = false;
				message = data.message;
				goto('/protected/upgrade/checkout/success')
			}
		} catch (error) {
			console.error(error);
			message = 'error updating your data, please contact support';
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
				on:click={openSheet}
				class="px-5 py-2 text-xl rounded-full bg-[#E1CA7D] active:bg-[#b6a365] font-semibold text-white"
				>Subscribe</button
			>
			<div class="flex my-2">
				<p class="text-[#635bff]">with</p>
				<Icon icon="logos:stripe" class="w-14 h-14" />
			</div>
		</div>
	</container>
</main>
