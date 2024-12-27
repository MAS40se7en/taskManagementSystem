<script lang="ts">
	import { goto } from "$app/navigation";
	import Icon from "@iconify/svelte";
	import { onMount } from "svelte";

    let code, state;
    let loading = true;

    onMount(async () => {
        const urlParams = new URLSearchParams(window.location.search);
        code = urlParams.get('code');
        state = urlParams.get('state');

        try {
            const response = await fetch('/api/google/callback', {
                method: 'POST',
                body: JSON.stringify({
                    code,
                    state,
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok) {
                loading = false;
                goto('/protected');
            } else {
                console.error('Authenticatiopn failed: ', data.error);
            }
        } catch(error) {
            console.error('Error handling authentication: ', error);
        }
    })
</script>

{#if loading}
	<div class="w-full top-0 right-0 left-0 bottom-0 absolute rounded-3xl backdrop-blur-sm z-50 flex flex-col place-items-center justify-center">
		<Icon icon="line-md:loading-twotone-loop" class="w-24 h-24" />
        <p class="text-xl font-semibold">Loading your data from google!</p>
	</div>
{/if}