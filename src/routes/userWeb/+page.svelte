<script lang="ts">
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";

    let user: any;
    let isMobile: boolean;

    onMount(async () => {
        try {
            const response = await fetch('/userWeb');

            const data = await response.json();

            if (response.ok) {
                user = data.user;
                isMobile = data.isMobile
                if (!isMobile && user.role === 'admin') {
                    goto('/admin');
                } else if (isMobile && user.role === 'admin') {
                    goto('/mobile-admin');
                } else if (isMobile && user.role === 'user') {
                    goto('/protected');
                }
            }
        } catch (error) {
            console.error(error);
        }
    })

    async function logout() {
		const response = await fetch('/userWeb', {
			method: 'POST'
		});

		if (response.ok) {
			// Redirect to login page after logout
			goto('/');
		} else {
			console.error('Logout failed');
		}
	}
</script>
<div class="w-4/5 mx-auto h-screen place-content-center">
    <p class="font-extrabold text-wrap text-4xl">The web version of the application is only available for admins for now! <br> <span class="text-lg">If you were approved to be an admin please contact support.</span></p>


<div class="w-full flex bottom-0 left-0 right-0 absolute gap-3 justify-center py-4">
	<button on:click={logout} class="text-lg bg-red-600 text-white font-semibold rounded-full py-3 w-2/5 active:bg-red-800 transition">
		Logout
	</button>
</div>
</div>