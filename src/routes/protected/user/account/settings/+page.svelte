<script lang="ts">
	import { goto } from "$app/navigation";
	import Icon from "@iconify/svelte";
	import { onMount } from "svelte";

    let user: any;

    let errorMessage = '';

    onMount(async () => {
        const response = await fetch('/protected/user/account/settings');
        if (response.ok) {
            const data = await response.json();
            user = data.user;
            errorMessage = data.message;

            if (!user) {
			    alert('unauthorized access');
                goto('/auth/login');
		    }

            if (!user.isVerified) {
                alert('Please verify your email address to delete your account.');
                goto('/auth/register/verify-email');
            }
        } else {
            alert('Failed to fetch user data:'+ response.status);
            return;
        }
    })

    async function deleteAccount(user: { id: any; }) {
        try {
            const response = await fetch('/protected/user/account/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: user.id })
            });

            if (response.ok) {
                alert('Account deleted successfully!');
                goto('/auth/login');
            } else {
                alert('Failed to delete account:'+ response.status);
            }
        } catch (error) {
            alert('Failed to delete account');
        }
    }

    function goBack() {
		window.history.back();
	}
</script>

<div class="flex flex-col gap-5 fixed">
	<div class="px-6 py-7 flex items-center">
		<button on:click|preventDefault={goBack} class="py-2 px-3">
			<Icon icon="fluent:ios-arrow-24-filled" class="w-7 h-7" />
		</button>
		<h1 class="text-4xl font-bold">Settings</h1>
	</div>

	<div class="px-10">
		<p class="opacity-70 font-light">
			Please click the button below if you intend to delete your account!
		</p>
		<button class="w-full my-3 bg-red-700 py-3 rounded-full font-semibold" on:click={() => deleteAccount(user.id)}>Delete Account!</button>
	</div>
</div>
