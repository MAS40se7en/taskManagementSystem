<script lang="ts">
	import Icon from '@iconify/svelte';
	import { Browser } from '@capacitor/browser';
	import { App, type URLOpenListenerEvent } from '@capacitor/app';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	async function handleGoogleSignIn() {
		Browser.open({ url: 'https://task-management-system-steel.vercel.app/api/google' });
	}


	onMount(() => {
		App.addListener('appUrlOpen', function (event: URLOpenListenerEvent) {
			console.log('app listener started')
			const slug = event.url.split('.app').pop();

			if (slug) {
				Browser.close()
				goto(slug);
			}
		});
	})
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
