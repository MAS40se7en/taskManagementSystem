<script lang="ts">
	import Icon from '@iconify/svelte';
	import { Browser } from '@capacitor/browser';
	import { App, type URLOpenListenerEvent } from '@capacitor/app';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import {
		getRedirectResult,
		GoogleAuthProvider,
		signInWithPopup,
		signInWithRedirect
	} from 'firebase/auth';
	import { auth, googleAuthProvider } from '$lib/firebase';

	let googleLoading = false;

	//	async function handleGoogleSignIn() {
	//		Browser.open({ url: 'https://task-management-system-steel.vercel.app/api/google' });
	//	}
	//
	//
	//	onMount(() => {
	//		App.addListener('appUrlOpen', (event) => {
	//    const url = new URL(event.url);
	//
	//    if (url.protocol === 'myapp:' && url.host === 'auth') {
	//        const code = url.searchParams.get('code');
	//        const state = url.searchParams.get('state');
	//
	//        if (code && state) {
	//            // Send the code and state to your backend for token exchange
	//            fetch('https://task-management-system-steel.vercel.app/api/google/callback', {
	//                method: 'POST',
	//                headers: {
	//                    'Content-Type': 'application/json'
	//                },
	//                body: JSON.stringify({ code, state })
	//            })
	//            .then((response) => {
	//                if (response.ok) {
	//                    // Handle successful authentication
	//                } else {
	//                    // Handle error
	//                }
	//            });
	//        }
	//    }
	//})
	//	})

	async function handleGoogleSignIn() {
		googleLoading = true;
		try {
			const response = await signInWithPopup(auth, googleAuthProvider);

			// Extract user and credentials
			const user = response.user;
			const credential = GoogleAuthProvider.credentialFromResult(response);
			const token = credential?.accessToken;
			const refreshToken = user.refreshToken;

			// Send tokens to your backend for further processing
			const result = await fetch('/api/oauth', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ response, accessToken: token, refreshToken })
			});

			// Process the server's response
			if (result.ok) {
				googleLoading = false;
				goto('/protected'); // Redirect to a protected route
			} else {
				console.error('Server error:', await result.text());
			}
		} catch (error) {
			// Log errors for debugging
			console.error('Error during Google sign-in:', error);
		}
	}
</script>

{#if googleLoading}
	<div class="w-full top-0 right-0 left-0 bottom-0 absolute rounded-3xl backdrop-blur-sm z-50 flex place-items-center justify-center">
		<Icon icon="line-md:loading-twotone-loop" class="w-24 h-24" />
	</div>
{/if}

<div class="text-center py-20 dark:bg-black h-screen dark:text-white">
	<h1 class="text-3xl font-bold">TASK MANAGEMENT SYSTEM</h1>

	<div class="pt-20 px-7">
		<p>You are not signed in yet, <br /> Sign in with an existing account or create a new one</p>
	</div>
	<div class="flex flex-col gap-3 py-20 bottom-0 absolute w-full">
		<div class="grid grid-rows-1 grid-cols-2 w-4/6 items-center mx-auto border-2 rounded-2xl h-12">
			<a href="/auth/login" class="px-2 py-2 font-bold border-r"> Sign in </a>
			<a href="/auth/register" class="px-2 py-2 font-bold border-l"> Register </a>
		</div>
		<p>or</p>

		<button
			on:click={handleGoogleSignIn}
			class="flex items-center gap-3 border-2 w-4/6 mx-auto justify-center dark:border-2 py-3 px-3 rounded-2xl"
		>
			<Icon icon="devicon:google" class="w-6 h-6" />
			<h1 class="font-semibold">Login with google!</h1>
		</button>
	</div>
</div>
