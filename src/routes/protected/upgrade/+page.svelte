<script lang="ts">
	import { Browser } from '@capacitor/browser';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let Stripe: any, PaymentSheetEventsEnum: { Completed: any; Failed: any; Canceled: any; Loaded?: any; FailedToLoad?: any; };
	let ephemeralKey: any, customerId: any, paymentIntent: any;
	let message = '';
	let loadingSheet = false;

	onMount(async () => {
		// Dynamic import for Stripe
		const stripeModule = await import('@capacitor-community/stripe');
		Stripe = stripeModule.Stripe;
		PaymentSheetEventsEnum = stripeModule.PaymentSheetEventsEnum;

		Stripe.initialize({
    		publishableKey: `${import.meta.env.VITE_PUBLIC_STRIPE_KEY}`,
  		});

		// Add event listeners for PaymentSheet events
		Stripe.addListener(PaymentSheetEventsEnum.Completed, () => {
			console.log('Payment completed');
			goto('/protected/upgrade/checkout/success');
		});

		Stripe.addListener(PaymentSheetEventsEnum.Failed, () => {
			console.log('Payment failed');
			goto('/protected/upgrade/checkout/failure');
		});

		Stripe.addListener(PaymentSheetEventsEnum.Canceled, () => {
			console.log('Payment canceled');
			goto('/protected/upgrade/checkout/failure');
		});
	});

	async function upgrade() {
		try {
			/*const response = await fetch('/api/stripe', {
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

			await Browser.open({ url: checkoutUrl });*/

			const response = await fetch('/api/stripe', {
				method: 'POST',
				headers: {
					"Content-Type": "application/json"
				}
			});

			if (!response.ok) {
				const error = await response.json();
				console.error('API Error:', error);
				return;
			}

			const data = await response.json();
			console.log('Server Response:', data);

			ephemeralKey = data.ephemeralKey;
			customerId = data.customerId;
			paymentIntent = data.paymentIntent;

			if (ephemeralKey && customerId && paymentIntent) {
				console.log('paymentIntent:', paymentIntent); // Should be a string
            	console.log('ephemeralKey:', ephemeralKey);
            	console.log('customerId:', customerId);
			
				await Stripe.createPaymentSheet({
        			paymentIntentClientSecret: paymentIntent,
            		customerId: customerId,
            		customerEphemeralKeySecret: ephemeralKey,
        		});

				const { paymentResult } = await Stripe.presentPaymentSheet();
				console.log(paymentResult)
			} else {
				console.error('Missing required Stripe parameters:', {
					ephemeralKey,
					customerId,
					paymentIntent
				});
			}
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
