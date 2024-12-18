<script lang="ts">
	import Icon from "@iconify/svelte";
	import { loadStripe } from "@stripe/stripe-js";

    const PRICE_ID = "price_1QX2gMIDjNlab52vPNOTs5se";

    async function upgrade() {
        const PUBLIC_STRIPE_KEY = "pk_test_51QX2FtIDjNlab52vwqgc4Z32xomqy4MEYCsIzbQT1kvOg4T7cIv1evU4s8oMObXG6xcNS7eaGdP7AZCGsV0H5R8z00x0Rdqebj"
        const stripe = await loadStripe(PUBLIC_STRIPE_KEY);

        console.log(stripe);
        
        try {
            const response = await fetch("/api/upgrade", {
                method: 'POST',
                headers: {
                    "Content-Type": "application-json"
                },
                body: JSON.stringify({
                    priceId: PRICE_ID,
                    mode: 'subscription',
                })
            });

            const { sessionId } = await response.json();

            await stripe?.redirectToCheckout({ sessionId });
        } catch(error) {
            console.error(error)
        }
    }

    function goBack() {
		window.history.back(); // Navigates to the previous URL in the history stack
	}
</script>

<main class="px-5 py-10">
    <container class="overflow-y-auto">
        <div class="flex justify-between items-center px-3">
            <button on:click|preventDefault={goBack} class="py-2" aria-label="Go back">
                <Icon icon="fluent:ios-arrow-24-filled" class="w-7 h-7" />
            </button>
            <div class="flex justify-end mb-4">
                <h1 class="text-3xl font-bold text-end">Upgrade to <span class="text-[#E1CA7D] shadow-md px-5 py-1 flex items-center rounded-xl">Task<span class="text-black dark:text-white">Focused</span>+</span></h1>
            </div>
        </div>

        <div class="px-3 my-5">
            <p>Upgrade to access features only available for the Plus users</p>
        </div>

        <div class="min-h-96 border-4 relative border-gray-100 dark:border-[#252525] shadow-md rounded-3xl px-4 py-2">
            <h1 class="font-bold text-xl w-4/6 mt-2">
                This Subscription Includes:
            </h1>
            <ol class="text-[#c5b16e] text-lg font-semibold w-3/4">
                <li><span class="text-black dark:text-white">-</span> More Projects to create</li>
                <li><span class="text-black dark:text-white">-</span> Use audio for your task instructions</li>
                <li><span class="text-black dark:text-white">-</span> Add images to your tasks</li>
                <li><span class="text-black dark:text-white">-</span> More Tasks in you projects</li>
            </ol>
            
            <div class="bottom-3 right-3 absolute flex items-center">
                <p class="pr-3 font-semibold mt-3">Price:</p>
                <p class="text-4xl font-bold flex">3.99<span><Icon icon="fa:euro" class="w-5 h-5" /></span></p>
                <p class="flex flex-col jsutify-end mt-3">/month</p>
            </div>
        </div>

        <div class="flex flex-col items-center justify-center my-4">
            <button on:click={upgrade} class="px-5 py-2 text-xl rounded-full bg-[#E1CA7D] font-semibold text-white">Subscribe</button>
            <div class="flex my-2">
                <p class="text-[#635bff]">with</p>
                <Icon icon="logos:stripe" class="w-14 h-14" />
            </div>
        </div>
    </container>
</main>