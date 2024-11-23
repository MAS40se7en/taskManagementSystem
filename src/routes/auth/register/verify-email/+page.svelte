<script lang="ts">
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";

    let verificationCode = '';
    let errorMessage = '';
    let userId = '';
    let previousUrl: string = '';
    let emailSent = false;

    onMount(async () => {
        previousUrl = document.referrer;

        if (previousUrl.includes('/auth/register/')) {
            emailSent = true;
        }
        console.log('previous url: ', previousUrl);
        userId = new URLSearchParams(window.location.search).get('userId') || '';
        console.log('userID: ', userId);
    });

	async function verifyEmail() {
        if (verificationCode.length > 8) {
            errorMessage = "Verification code can't be longer than 8 characters";
        }

        try {
            const response = await fetch('/auth/register/verify-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, verificationCode }),
            });

            if (response.ok) {
                errorMessage = '';
                alert('Email verified successfully!');
                goto('/protected/user/account');
            }
        } catch (error) {
            errorMessage = 'Failed to verify email';
            console.error('Failed to verify email: ', error);
            return;
        }
    }

    async function sendEmail() {
        const response = await fetch('/auth/register/verify-email/sendEmail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }),
        });

        if (response.ok) {
            emailSent = true;
            alert('Verification code has been sent to your email!');

            setTimeout(() => {
                emailSent = false;

            }, 120000)
        } else {
            errorMessage = 'Failed to send verification code';
        }
    }
</script>

<div class="dark:bg-black px-5 py-10 dark:text-white h-screen">
    <div class="px-3 py-2">
        <h1 class="text-3xl font-bold">Verify your email Addres</h1>
        {#if emailSent}
            <p class="text-sm mt-5">We have sent you an email containing your verification code, please use that to verify your email addres!</p>
            {:else}
                <p>to get the verification code please press this</p>
                <button on:click={sendEmail} class="mx-auto w-4/6 text-center bg-blue-600 text-white shadow-md my-2 py-2 rounded-lg">Send Verification Code</button>
        {/if}
        <div class="bottom-0 fixed py-12 flex flex-col gap-5 justify-center">
            <input type="text" class="bg-[#D9D9D9] dark:bg-[#252525] h-12 rounded-xl px-2" bind:value={verificationCode}>
            <button on:click={verifyEmail} class="bg-green-200 dark:bg-green-500 mx-auto px-4 py-2 rounded-xl w-fit">Submit</button>
        </div>
    </div>
</div>