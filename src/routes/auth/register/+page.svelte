<script lang="ts">
	import { goto } from "$app/navigation";
    import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

    let name = '';
    let email = '';
    let password = '';
    let passwordConfirmation = '';
    let emailError = '';
    let passwordError = '';
    let nameError = '';
    let errorMessage = '';
    let passwordConfirmationError = '';

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
            goto('/protected/user/account/');
        } else {
			const error = await response.json();
			errorMessage = error.message || 'Registration failed';
		}
    }
</script>

<div class="grid grid-cols-2 gap-2 h-fit bottom-0 scroll-container items-end fixed">
    <div class="w-4/5 col-span-2 mx-10 content-to-move mb-20">
    <h1 class="w-3/4 font-bold text-4xl mb-5">Create a new Account!</h1>
    {#if errorMessage}
        <div class="bg-red-400 text-white py-2 px-3 rounded-2xl">
            {errorMessage}
        </div>
    {/if}
    <div class="mb-3">
        <h1 class="font-bold text-lg mx-1 my-1">Name</h1> 
        <input bind:value={name} class="bg-black/15 focus:outline-black/40 w-full rounded-lg h-10" type="email" name="email">
        {#if nameError}
            <p class="text-red-500">{nameError}</p>
        {/if}
    </div>
        <div class="mb-3">
           <h1 class="font-bold text-lg mx-1 my-1">Email</h1>
            <input bind:value={email} class="bg-black/15 focus:outline-black/40 w-full rounded-lg h-10" type="email" name="email">
            {#if emailError}
                <p class="text-red-500">{emailError}</p>
            {/if}
        </div>
        <div class="mb-3">
            <h1 class="font-bold text-lg mx-1 my-1">Password</h1>
            <input bind:value={password} class="bg-black/15 focus:outline-black/40 w-full rounded-lg h-10" type="password" name="password">
            {#if passwordError}
                <p class="text-red-500">{passwordError}</p>
            {/if}
        </div>
        <div class="mb-3">
            <h1 class="font-bold text-lg mx-1 my-1">Confirm Password</h1>
            <input bind:value={passwordConfirmation} class="bg-black/15 focus:outline-black/40 w-full rounded-lg h-10" type="password">
            {#if errorMessage} <!-- Conditionally render the error message -->
                <p class="text-red-500">{passwordConfirmationError}</p>
            {/if}
        </div>
    <div class="w-fit mx-auto">
        <button class="font-bold w-40 mx-14 rounded-lg h-9 bg-green-300" on:click={register}>Register</button>
    </div>
        <div class="flex flex-col items-center gap-5 mt-5">
            <a href="/auth/login" class="text-center text-green-700">Sign-in with an existing Account!</a>
        </div>
    </div>
</div>

<style>
    .scroll-container {
      max-height: 100vh; /* Ensures it fits within the viewport */
      overflow-y: auto; /* Enables vertical scrolling */
    }

    .content-to-move {
    padding: 20px; /* Add some padding for spacing */
  }

  </style>