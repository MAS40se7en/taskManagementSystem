<script lang="ts">
	import { page } from '$app/stores';
	import Navbar from '$lib/components/Navbar.svelte';
	import TasksProjects from '$lib/components/TasksProjects.svelte';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import {
		PushNotifications,
		type ActionPerformed,
		type PushNotificationSchema,
		type Token
	} from '@capacitor/push-notifications';
	import { Capacitor } from '@capacitor/core';


	let touchStartY = 0;
	let loading = true;
	let pullDownDistance = 0;
	let isPulling = false;
	let refreshing = false;
	const pullThreshold = 10; // Adjust this threshold for showing the indicator
	const refreshThreshold = 80; // Threshold for triggering refresh

	let user: any;

	

	// Simulate delay for data fetching
	function delay(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	// Fetch data with loading indicator
	async function fetchData() {
		loading = true;
		try {
			await delay(1000); // Simulate delay for fetching
			console.log('Data refreshed');
		} finally {
			loading = false;
		}
	}

	onMount(async () => {
		fetchData();
		

		try {
			const response = await fetch('/protected');

			if (response.ok) {
				const data = await response.json();
				console.log('Data fetched: ', data);
				user = data.user;
				console.log(user?.upgraded);
				if (user?.role === 'admin') {
					goto('/mobile-admin');
				}

				pushNotifications(user);
			} else {
				console.error('Failed to fetch data: ', response.statusText);
				goto('/auth/login');
			}
		} catch (error) {
			alert('could not retrieve user data');
		}
	});

	export async function pushNotifications(user: any) {
		if (Capacitor.getPlatform() === 'web') {
			console.warn('PushNotifications plugin is not supported on the web platform.');
			return;
		}

		console.log('Initializing Push Notifications');

		document.addEventListener('deviceready', async () => {
    console.log('Device ready!');

    // Request permissions only after ensuring Firebase is initialized
    const result = await PushNotifications.requestPermissions();
    if (result.receive === 'granted') {
        PushNotifications.register();
    } else {
        console.log('Notification permission denied');
    }
});

		PushNotifications.addListener('registration', async (token: Token) => {
			console.log('Push Notifications successful: ' + token.value);
			saveToken(user, token.value);
		});

		PushNotifications.addListener('registrationError', (error: any) => {
			console.error('Error on registration: ', JSON.stringify(error));
		});

		PushNotifications.addListener(
			'pushNotificationReceived',
			(notification: PushNotificationSchema) => {
				console.log('Push received: ', JSON.stringify(notification));
	});

		PushNotifications.addListener(
			'pushNotificationActionPerformed',
			(notification: ActionPerformed) => {
				console.log('Push action performed: ', JSON.stringify(notification));
			}
		);
	}

	async function saveToken(user: any, token: any) {
		const response = await fetch('/api/saveFcmToken', {
			method: 'POST',
			body: JSON.stringify({ user, token })
		});

		const data = await response.json();

		if (response.ok) {
			console.log('token saved');
		}
	}

	async function sendTaskNotification() {
		const response = await fetch('/protected/api/sendTaskNotification', {
			method: 'POST',
			body: JSON.stringify({ user })
		});

		const data = await response.json();

		if (response.ok) {
			console.log('notification sent successfully!');
		} else {
			console.log('notification not sent');
		}
	}

	// Touch start handler
	function handleTouchStart(event: TouchEvent) {
		if (window.scrollY === 0 && !$page.url.pathname.includes('/protected/create')) {
			touchStartY = event.touches[0].clientY;
			isPulling = true;
		}
	}

	// Touch move handler to detect pulling down
	function handleTouchMove(event: TouchEvent) {
		if (isPulling) {
			const currentY = event.touches[0].clientY;
			pullDownDistance = currentY - touchStartY;

			if (pullDownDistance > 0) {
				// Apply translation for the pull-down effect
				document.body.style.transform = `translateY(${Math.min(pullDownDistance, refreshThreshold)}px)`;
				document.body.style.transition = 'transform 0.3s ease';

				// Show refresh indicator if the pull-down distance exceeds threshold
				refreshing = pullDownDistance > pullThreshold;
			} else {
				resetPull();
			}
		}
	}

	// Touch end handler to trigger refresh if the pull threshold is exceeded
	function handleTouchEnd() {
		if (isPulling && pullDownDistance > refreshThreshold) {
			refreshPage();
		} else {
			resetPull();
		}
		refreshing = false;
		isPulling = false;
	}

	// Refresh page by fetching data
	async function refreshPage() {
		resetPull();
		await fetchData();
		refreshing = false; // Hide the refresh indicator after fetching
	}

	// Reset the pull state
	function resetPull() {
		pullDownDistance = 0;
		document.body.style.transform = 'translateY(0px)';
		refreshing = false; // Hide the indicator when resetting
	}
</script>

<!-- Refresh indicator -->

<div
	class="dark:bg-black dark:text-white w-full -z-10 fixed left-0 right-0 top-0 font-extrabold text-7xl text-black text-center transition-all duration-300 ease-in-out transform
			{refreshing ? 'z-50 -translate-y-16' : '-translate-y-10'}"
	class:hidden={$page.url.pathname === '/protected/create' ||
		$page.url.pathname === '/protected/user/account/associates' ||
		$page.url.pathname.startsWith('/protected/messages/convo/') ||
		$page.url.pathname === '/protected/upgrade'}
>
	<h1 class="dark:bg-black" class:opacity-0={!refreshing} class:opacity-100={refreshing}>
		Refresh
	</h1>
</div>

<!-- Page header for different routes -->
{#if $page.url.pathname === '/protected'}
	<div
		class="dark:bg-black dark:text-white px-10 py-4 flex justify-between items-center sticky top-0 z-40 bg-white w-full"
		on:touchstart={handleTouchStart}
		on:touchmove={handleTouchMove}
		on:touchend={handleTouchEnd}
	>
		<h1 class="text-3xl font-bold">ALERTS</h1>
		<div class="flex justify-between items-center gap-2">
			<a href="/protected/calendar">
				<Icon icon="radix-icons:calendar" class="w-7 h-7" />
			</a>
			<a href="/protected/messages">
				<Icon icon="ant-design:message-outlined" class="w-7 h-7" />
			</a>
		</div>
	</div>
	<!--<button on:click={sendTaskNotification} class="text-white"> send notification </button>-->
{:else if $page.url.pathname === '/protected/All' || $page.url.pathname === '/protected/projects' || $page.url.pathname === '/protected/tasks'}
	<div
		class="dark:bg-black dark:text-white py-4 px-10 sticky top-0 z-40 bg-white w-full"
		on:touchstart={handleTouchStart}
		on:touchmove={handleTouchMove}
		on:touchend={handleTouchEnd}
	>
		<div class=" flex justify-between items-center">
			<h1 class="text-3xl font-bold"><a href="/protected/All">RELATED</a></h1>
			<div class="flex justify-between items-center gap-2">
				<a href="/protected/calendar">
					<Icon icon="radix-icons:calendar" class="w-7 h-7" />
				</a>
				<a href="/protected/messages">
					<Icon icon="ant-design:message-outlined" class="w-7 h-7" />
				</a>
			</div>
		</div>
		<TasksProjects />
	</div>
{/if}

<div class="z-10 top-0 dark:bg-black dark:text-white">
	<!-- Loading state -->
	{#if loading}
		<div class="dots-loader w-4/5 mx-auto h-screen flex place-content-center">
			<div class="dot bg-black dark:bg-amber-500"></div>
			<div class="dot bg-amber-200 dark:bg-black dark:ring-2 dark:ring-amber-500"></div>
			<div class="dot bg-black dark:bg-amber-500"></div>
		</div>
	{:else}
		<!-- Main content -->
		<main class="h-screen dark:bg-black">
			<slot />
		</main>
	{/if}
	<!-- Fixed bottom navbar -->
	<div class="bottom-0 sticky z-50 w-full">
		<Navbar />
	</div>
</div>

<style>
	main {
		padding-bottom: 80px; /* Reserve space for the fixed navbar to avoid overlap */
		overflow-y: scroll;
	}

	.dots-loader {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.dot {
		width: 10px;
		height: 10px;
		margin: 5px;
		border-radius: 50%;
		animation: bounce 1.2s infinite ease-in-out;
	}

	.dot:nth-child(2) {
		animation-delay: -0.1s;
	}

	.dot:nth-child(3) {
		animation-delay: -0.2s;
	}

	@keyframes bounce {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-15px);
		}
	}
</style>
