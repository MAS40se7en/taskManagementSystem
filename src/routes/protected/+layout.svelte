<script lang="ts">
	import { page } from '$app/stores';
	import Navbar from '$lib/components/Navbar.svelte';
	import Icon from '@iconify/svelte';

	let touchStartY = 0;
	let loading = false;
	let pullDownDistance = 0;
	let isPulling = false;
	let refreshing = false;
	const pullThreshold = 10; // Adjust this threshold for showing the indicator
	const refreshThreshold = 80; // Threshold for triggering refresh

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
</script>

<!-- Refresh indicator -->
<div
	class="fixed left-0 right-0 top-0 font-extrabold -translate-y-20 text-7xl bg-white w-fit mx-auto text-black text-center transition-all duration-300 ease-in-out transform"
	class:opacity-0={!refreshing}
	class:opacity-100={refreshing}
	class:hidden={$page.url.pathname === '/protected/create' || $page.url.pathname.startsWith('/protected/messages/convo/')}
>
	<h1>Refresh</h1>
</div>

<!-- Page header for different routes -->
{#if $page.url.pathname === '/protected'}
	<div 
		class="px-10 mt-8 py-5 flex justify-between sticky top-0 z-10 bg-white w-full"
		on:touchstart={handleTouchStart}
		on:touchmove={handleTouchMove}
		on:touchend={handleTouchEnd}>
		<h1 class="text-4xl font-bold mb-5">ALERTS</h1>
		<a href="/protected/messages" class="py-2 px-3">
			<Icon icon="ant-design:message-outlined" class="w-7 h-7"/>
		</a>
	</div>
{:else if $page.url.pathname === '/protected/All'}
	<div 
		class="mt-8 py-5 px-10 flex justify-between sticky top-0 z-10 bg-white w-full"
		on:touchstart={handleTouchStart}
		on:touchmove={handleTouchMove}
		on:touchend={handleTouchEnd}>
		<h1 class="text-4xl font-bold mb-5">RELATED</h1>
		<a href="/protected/messages" class="py-2">
			<Icon icon="ant-design:message-outlined" class="w-7 h-7 mr-3"/>
		</a>
	</div>

{/if}

<div class="z-10 top-0">
	<!-- Loading state -->
	{#if loading}
		<div class="dots-loader w-4/5 mx-auto h-screen flex place-content-center">
			<div class="dot bg-black"></div>
			<div class="dot bg-amber-200"></div>
			<div class="dot bg-black"></div>
		</div>
	{:else}
		<!-- Main content -->
		<main class="h-screen">
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
