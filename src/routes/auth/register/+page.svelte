<script lang="ts">
	import { goto } from "$app/navigation";
	import Icon from "@iconify/svelte";

    let name = '';
    let email = '';
    let password = '';
    let passwordConfirmation = '';
    let emailError = '';
    let passwordError = '';
    let nameError = '';
    let errorMessage = '';
    let passwordConfirmationError = '';
    let isSubmitting = false;
    let showPasswordInstructions = false;

    function validateEmail() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            emailError = "Please enter a valid email address!";
        } else {
            emailError = '';
        }
    }

    function validatePassword() {
        if (password.length < 8) {
            passwordError = "Password must be at least 8 characters long!";
        } else if (!/[A-Z]/.test(password)) {
            passwordError = "Password must contain at least one uppercase letter!";
        } else if (!/[0-9]/.test(password)) {
            passwordError = "Password must contain at least one number!";
        } else {
            passwordError = '';
        }
    }

    async function register() {
        errorMessage = '';
        isSubmitting = true;
        validateEmail();
        validatePassword();

        if (!name) {
            nameError = "A name is required";
        }

        if (password !== passwordConfirmation) {
            passwordConfirmationError = "Passwords do not match!";
            return;
        }
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);

        const response = await fetch('/auth/register', {
            method: 'POST',
            body: formData
        });

        console.log('response: ', response);

        if (response.ok) {
            const data = await response.json();
            console.log('Data: ', data);

            const user = data.user

            const url = new URL(`/auth/register/verify-email/`, window.location.origin);
            url.searchParams.append('userId', user.id);

            goto(url.toString());
            isSubmitting = false;
        } else {
			const error = await response.json();
            isSubmitting = false;
			errorMessage = error.message || 'Registration failed';
		}
    }

    function togglePassInfo() {
        showPasswordInstructions = !showPasswordInstructions
    }
</script>


<div class="dark:bg-black h-screen">
    <div class="py-7 px-5">
        <a href="/" class="flex gap-1 items-center"><Icon icon="fluent:ios-arrow-24-filled" class="w-7 h-7" /><h1 class="text-lg">Home</h1></a>
    </div>

    <div class="w-4/5 mx-10">
    <h1 class="w-3/4 font-bold text-4xl mb-5">Sign up!</h1>
    {#if errorMessage}
        <div class="bg-red-400 text-white py-2 px-3 rounded-2xl">
            {errorMessage}
        </div>
    {/if}
    <div class="mb-3">
        <h1 class="font-bold text-lg mx-1 my-1">Name</h1> 
        <input bind:value={name} class="bg-black/15 px-2 focus:outline-black/40 w-full rounded-lg h-10 dark:bg-stone-700/40 dark:text-white" type="email" name="email">
        {#if nameError}
            <p class="text-red-500">{nameError}</p>
        {/if}
    </div>
        <div class="mb-3">
           <h1 class="font-bold text-lg mx-1 my-1">Email</h1>
            <input bind:value={email} class="bg-black/15 px-2 focus:outline-black/40 w-full rounded-lg h-10 dark:bg-stone-700/40 dark:text-white" type="email" name="email">
            {#if emailError}
                <p class="text-red-500">{emailError}</p>
            {/if}
        </div>
        <div class="mb-3">
            <h1 class="font-bold text-lg mx-1 my-1">Password</h1>
            <div class="relative">
                <div class="relative">

                        <input
                            type="password"
                            bind:value={password}
                            class="bg-black/15 focus:outline-black/40 px-2 w-full rounded-lg h-10 dark:bg-stone-700/40 dark:text-white"
                        />
                </div>       
                <button class="-right-7 absolute top-2" on:click={togglePassInfo}>
                    <Icon icon="material-symbols:info-rounded" width="24" height="24" />
                </button> 
            </div>
                
            {#if passwordError}
                <p class="text-red-500">{passwordError}</p>
            {/if}
            {#if showPasswordInstructions}
            <div
			class="mt-3 px-2 py-3 w-5/6 mx-auto border-2 border-green-200 rounded-xl bg-green-100/50 dark:border-green-700 dark:bg-green-600/30"
		>
			<p class="opacity-70">
				Make sure the password contains:<br />
				- one capital letter<br />
				- one special character<br />
				- one number<br />
				- at least 8 characters<br />
			</p>
		</div>
            {/if}
        </div>
        <div class="mb-3">
            <h1 class="font-bold text-lg mx-1 my-1">Confirm Password</h1>
            <div class="relative">
					<input
						type="password"
						bind:value={passwordConfirmation}
						class="bg-black/15 focus:outline-black/40 px-2 w-full rounded-lg h-10 dark:bg-stone-700/40 dark:text-white"
					/>
			</div>
            {#if errorMessage} <!-- Conditionally render the error message -->
                <p class="text-red-500">{passwordConfirmationError}</p>
            {/if}
        </div>
    <div class="mx-auto flex justify-center">
        {#if isSubmitting}
		<Icon icon="line-md:loading-twotone-loop" class="w-10 h-10 text-green-300 dark:text-green-600" />
		{:else}
		<button class="font-bold w-40 rounded-lg h-9 bg-green-300 dark:bg-green-600 active:bg-green-500 dark:active:bg-green-800 my-2" on:click={register}>
			Register
		</button>
		{/if}
    </div>
        <div class="flex flex-col items-center gap-5 mt-5">
            <a href="/auth/login" class="text-center text-green-700">Sign in with an existing Account!</a>
        </div>
    </div>
</div>