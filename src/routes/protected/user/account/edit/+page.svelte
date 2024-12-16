<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

    type User = {
        id: string;
        name: string;
        email: string;
		password: string;
        isVerified: boolean;
}

	let user: User | null = null;

    let name: any;
	let email: any;
	let errorMessage = '';

	onMount(async () => {
		const response = await fetch('/protected/user/account/edit');

		const data = await response.json();

		if (response.ok) {
			user = data.user;
			name = user?.name;
			email = user?.email;

			if (!user) {
			    alert('unauthorized access');
                goto('/auth/login');
		    }

            console.log(data);
		} else {
			errorMessage = data.message;
		}

		if (!user?.isVerified) {
			alert('please verify your email to use the application');

            if (user?.id) {
                const url = new URL(`/auth/register/verify-email/`, window.location.origin);
                url.searchParams.append('userId', user?.id);
                goto(url.toString());
            } else {
                errorMessage = 'Failed to get your information';
            }
		}
	});

    async function sendPasswordResetEmail(id: any) {
        try {
            const response = await fetch('/protected/user/account/edit/sendPasswordEmail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: id }),
        	});

			const data = await response.json();

        if (response.ok) {
            alert('Password reset email sent successfully');
        } else {
            errorMessage = data.message;
        }
        } catch (error) {
            errorMessage = 'Failed to send password reset email';
        }

    }

	async function updateProfile() {
		try {
			const response = await fetch('/protected/user/account/edit',  {
				method: 'POST',
				body: JSON.stringify({ name, email })
			});

			if (response.ok) {
				alert('Profile updated successfully');
                goto('/protected/user/account');
			} else {
				errorMessage = 'Failed to update your profile';
			}
		} catch (error) {
			errorMessage = 'Failed to update your profile';
		}
	}

	function goBack() {
		window.history.back(); // Navigates to the previous URL in the history stack
	}
</script>

<div class="flex flex-col gap-5 bottom-28 fixed">
	<div class="px-6 py-7 flex items-center">
		<button on:click|preventDefault={goBack} class="py-2 px-3">
			<Icon icon="fluent:ios-arrow-24-filled" class="w-7 h-7" />
		</button>
		<h1 class="text-4xl font-bold">Edit your information!</h1>
	</div>
	<div class="px-5 flex flex-col gap-2">
		<label for="name" class="font-semibold">Name</label>
		<input
			type="text"
			bind:value={name}
			class="dark:bg-[#252525] bg-[#D9D9D9] px-2 py-2 rounded-lg"
		/>
	</div>
	<div class="px-5 flex flex-col gap-2">
		<label for="email" class="font-semibold">Email</label>
		<input
			type="email"
			bind:value={email}
			class="dark:bg-[#252525] bg-[#D9D9D9] px-2 py-2 rounded-lg"
		/>
	</div>
    <div class="flex justify-end px-6">
		<button class="bg-green-500 dark:bg-green-700 px-5 text-white py-1 rounded-lg font-semibold text-xl"
			on:click={updateProfile}>Save</button
		>
	</div>
    <div class="px-14">
        <hr>
    </div>
	<div class="px-5 flex flex-col gap-2">
		<label for="password" class="font-semibold">Password</label>
		<p class="text-sm opacity-60">
            to {user?.password ? "reset the" : "add a"} password please click the button below to receive a confirmation email
        </p>
        <div class="flex justify-end">
			{#if user?.password}
			<button on:click={() => sendPasswordResetEmail(user?.id)} class="bg-blue-400 px-4 py-2 rounded-xl font-semibold text-white">Reset Password</button>
			{:else}
			<button on:click={() => sendPasswordResetEmail(user?.id)} class="bg-blue-400 px-4 py-2 rounded-xl font-semibold text-white">Add a Password</button>

			{/if}
        </div>
	</div>
</div>
