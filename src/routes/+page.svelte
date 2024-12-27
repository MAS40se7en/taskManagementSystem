<script lang="ts">
	import Icon from '@iconify/svelte';
	import { Browser } from '@capacitor/browser';
	import { App, type URLOpenListenerEvent } from '@capacitor/app';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { getRedirectResult, GoogleAuthProvider, signInWithPopup, signInWithRedirect } from 'firebase/auth';
	import { auth, googleAuthProvider } from '$lib/firebase';

	//async function handleGoogleSignIn() {
	//	Browser.open({ url: 'https://task-management-system-steel.vercel.app/api/google' });
	//}
//
//
	//onMount(() => {
	//	App.addListener('appUrlOpen', (event) => {
    //const url = new URL(event.url);
//
    //if (url.protocol === 'myapp:' && url.host === 'auth') {
    //    const code = url.searchParams.get('code');
    //    const state = url.searchParams.get('state');
//
    //    if (code && state) {
    //        // Send the code and state to your backend for token exchange
    //        fetch('https://task-management-system-steel.vercel.app/api/google/callback', {
    //            method: 'POST',
    //            headers: {
    //                'Content-Type': 'application/json'
    //            },
    //            body: JSON.stringify({ code, state })
    //        })
    //        .then((response) => {
    //            if (response.ok) {
    //                // Handle successful authentication
    //            } else {
    //                // Handle error
    //            }
    //        });
    //    }
    //}
//});
	//})

	//async function handleGoogleSignIn() {
	//	try {
    //    const response = await signInWithPopup(auth, googleAuthProvider);
	//		const user = response.user;
	//		const credential = GoogleAuthProvider.credentialFromResult(response);
	//		const token = credential?.accessToken;
	//		console.log('credential token: ', token);
	//		const rt = user.refreshToken;
	//		console.log('refresh token: ', user.refreshToken);
//
	//		const result = await fetch('/api/oauth', {
	//			method: 'POST',
	//			body: JSON.stringify({ response, accessToken: token,  refreshToken: rt})
	//		});
//
	//		const data = await result.json();
//
	//		if (result.ok) {
	//			goto('/protected')
	//		}
//
    //} catch (error) {
    //    console.error(error);
    //}
	//}

	onMount(() => {
		handleRedirectResult();
	});

	async function handleGoogleSignIn() {
	try {
		await signInWithRedirect(auth, googleAuthProvider); // Initiates the redirect
	} catch (error) {
		console.error("Error during Google sign-in redirect:", error);
	}
}

async function handleRedirectResult() {
	try {
		const response = await getRedirectResult(auth);

		if (response) {
			// Extract user and tokens
			const user = response.user;
			const credential = GoogleAuthProvider.credentialFromResult(response);
			const token = credential?.accessToken;
			const rt = user.refreshToken;

			console.log("Access token:", token);
			console.log("Refresh token:", rt);

			// Send data to your API
			const result = await fetch("/api/oauth", {
				method: "POST",
				body: JSON.stringify({ accessToken: token, refreshToken: rt }),
				headers: { "Content-Type": "application/json" },
			});

			const data = await result.json();

			if (result.ok) {
				goto("/protected");
			}
		}
	} catch (error) {
		console.error("Error during redirect result handling:", error);
	}
}
</script>

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
