<script lang="ts">
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";

    let code, state, storedState, codeVerifier;

    onMount(async () => {
        const urlParams = new URLSearchParams(window.location.search);
        code = urlParams.get('code');
        state = urlParams.get('state');
        ///storedState = urlParams.get('savedState');
        ///codeVerifier = urlParams.get('codeVerifier');
///
        ///console.log(code, state, storedState, codeVerifier);

        try {
            const response = await fetch('/api/google/callback', {
                method: 'POST',
                body: JSON.stringify({
                    code,
                    state,
                //    storedState,
                //    codeVerifier
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok) {
                goto('/protected');
            } else {
                console.error('Authenticatiopn failed: ', data.error);
            }
        } catch(error) {
            console.error('Error handling authentication: ', error);
        }
    })
</script>