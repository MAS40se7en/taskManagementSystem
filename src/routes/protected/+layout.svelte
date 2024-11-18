<script lang="ts">
	import { page } from '$app/stores';
	import Navbar from '$lib/components/Navbar.svelte';
	import TasksProjects from '$lib/components/TasksProjects.svelte';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';
	import { PushNotifications, type ActionPerformed, type PushNotificationSchema, type Token } from '@capacitor/push-notifications'
	import { goto } from '$app/navigation';
	import { createThemeSwitcher, Theme } from 'svelte-theme-select';

	createThemeSwitcher();

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
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	// Fetch data with loading indicator
	async function fetchData() {
		loading = true;
		try {
			await delay(2000); // Simulate delay for fetching
			console.log('Data refreshed');
		} finally {
			loading = false;
		}
	}

	onMount(async () => {
		fetchData();
		pushNotifications();

		try {
			const response = await fetch('/protected');

			if (response.ok) {
				const data = await response.json();
                console.log('Data fetched: ', data);
				user = data.user;
			} else {
				console.error('Failed to fetch data: ', response.statusText);
				goto('/auth/login');
			}
		} catch (error) {
			alert('could not retrieve user data');
		}
	});

	function pushNotifications() {
		console.log('Initializing HomePage');

		PushNotifications.requestPermissions().then((result) => {
			if (result.receive === 'granted') {
				PushNotifications.register();
			} else {
				console.error('Permissions not granted for Push Notifications');
			}
		});

		PushNotifications.addListener('registration', (token: Token) => {
			console.log('Push Notifications successful: '+ token.value);
		});

		PushNotifications.addListener('registrationError', (error: any) => {
			console.log('Error on registration: ', JSON.stringify(error));
		});

		PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
			console.log('Push received: ', JSON.stringify(notification));
		});

		PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
			console.log('Push action performed: ', JSON.stringify(notification));
		});
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

	async function registerPushNotifications() {
		let permStatus = await PushNotifications.checkPermissions();
		alert(JSON.stringify(permStatus));

		if (permStatus.receive !== 'granted') {
			alert('User denied permissions!');
		} else {
			try {
				await PushNotifications.register();
			} catch (error) {
				alert(JSON.stringify(error));
			}
		}
	}

	async function getDeliveredNotifications() {
		const notificationList = await PushNotifications.getDeliveredNotifications();
		alert('delivered notifications: '+ JSON.stringify(notificationList));
	}
</script>

<Theme />

<!-- Refresh indicator -->
<div
	class="dark:bg-black z-50 dark:text-white  w-full fixed left-0 right-0 top-0 font-extrabold -translate-y-16 text-7xl text-black text-center transition-all duration-300 ease-in-out transform"
	class:hidden={$page.url.pathname === '/protected/create' || $page.url.pathname.startsWith('/protected/messages/convo/')}
>
	<h1
	class="dark:bg-black"
	class:opacity-0={!refreshing}
	class:opacity-100={refreshing}
	>Refresh</h1>
</div>

<!-- Page header for different routes -->
{#if $page.url.pathname === '/protected'}
	<div 
		class="dark:bg-black dark:text-white px-10 mt-8 py-5 flex justify-between sticky top-0 z-40 bg-white w-full"
		on:touchstart={handleTouchStart}
		on:touchmove={handleTouchMove}
		on:touchend={handleTouchEnd}>
		<h1 class="text-4xl font-bold mb-5">ALERTS</h1>
		<div class="flex justify-between">
			<a href="/protected/calendar" class="py-2 px-3">
				<Icon icon="radix-icons:calendar" class="w-7 h-7" />
			</a>
			<a href="/protected/messages" class="py-2 px-3">
				<Icon icon="ant-design:message-outlined" class="w-7 h-7"/>
			</a>
		</div>
		
	</div>
{:else if $page.url.pathname === '/protected/All' || $page.url.pathname === '/protected/projects' || $page.url.pathname === '/protected/tasks'}
	<div 
		class="dark:bg-black dark:text-white mt-8 py-5 px-10 sticky top-0 z-40 bg-white w-full"
		on:touchstart={handleTouchStart}
		on:touchmove={handleTouchMove}
		on:touchend={handleTouchEnd}>
		<div class=" flex justify-between">
			<h1 class="text-4xl font-bold mb-5"><a href="/protected/All">RELATED</a></h1>
			<div class="flex justify-between">
			<a href="/protected/calendar" class="py-2 px-3">
				<Icon icon="radix-icons:calendar" class="w-7 h-7" />
			</a>
			<a href="/protected/messages" class="py-2 px-3">
				<Icon icon="ant-design:message-outlined" class="w-7 h-7"/>
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
