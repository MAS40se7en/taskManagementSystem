<<<<<<< HEAD
<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	let user: { id: any; name: string; isVerified: boolean; associations: { id: string; name: string; image: string }[] } | null =
		null;

	let errorMessage = '';

	onMount(async () => {
		try {
			const response = await fetch('/protected/user/account/associates');
			const data = await response.json();

			if (response.ok) {
				user = data.user;
				console.log(user);
			} else {
				errorMessage = data.message;
			}

			if (!user) {
			    alert('unauthorized access');
                goto('/auth/login');
		    }

			if (!user?.isVerified) {
					alert('please verify your email to use the application');

					const url = new URL(`/auth/register/verify-email/`, window.location.origin);
					url.searchParams.append('userId', user?.id);

					goto(url.toString());
				}
		} catch (error) {
			console.error('Failed to fetch user data:', error);
		}
	});

	function goBack() {
		window.history.back(); // Navigates to the previous URL in the history stack
	}
</script>

<div class="bg-white dark:bg-black">
	<div class="flex gap-1 text-center py-7 px-10 shadow-lg border-b-2 border-black bg-gray-500/20">
		<button on:click|preventDefault={goBack} class="py-2">
			<Icon icon="fluent:ios-arrow-24-filled" class="w-7 h-7" />
		</button>
		<h1 class="text-2xl font-semibold text-nowrap">
			Your
			<span class="text-3xl font-bolds"> Associations </span>
		</h1>
	</div>
	<div class="h-fit py-3 px-5">
		{#if user?.associations && user.associations.length > 0}
			<ul>
				{#each user.associations as associate}
					<li class="px-3 py-3 border-b-2 border-black/40">
						<a href={`/protected/user/${associate.id}`} class="flex gap-2 items-center">
							<img
								src={associate.image}
								alt={associate.name}
								class="h-12 w-12 object-cover rounded-full"
							/>
							<span class="text-lg">{associate.name}</span>
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<p>No associations found.</p>
		{/if}
	</div>
</div>
=======
<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	let user: { id: any; name: string; isVerified: boolean; associations: { id: string; name: string; image: string }[] } | null =
		null;

	let errorMessage = '';

	onMount(async () => {
		try {
			const response = await fetch('/protected/user/account/associates');
			const data = await response.json();

			if (response.ok) {
				user = data.user;
				console.log(user);
			} else {
				errorMessage = data.message;
			}

			if (!user) {
			    alert('unauthorized access');
                goto('/auth/login');
		    }

			if (!user?.isVerified) {
					alert('please verify your email to use the application');

					const url = new URL(`/auth/register/verify-email/`, window.location.origin);
					url.searchParams.append('userId', user?.id);

					goto(url.toString());
				}
		} catch (error) {
			console.error('Failed to fetch user data:', error);
		}
	});

	function goBack() {
		window.history.back(); // Navigates to the previous URL in the history stack
	}
</script>

<div class="bg-white dark:bg-black">
	<div class="flex gap-1 text-center py-7 px-10 shadow-lg border-b-2 border-black bg-gray-500/20">
		<button on:click|preventDefault={goBack} class="py-2">
			<Icon icon="fluent:ios-arrow-24-filled" class="w-7 h-7" />
		</button>
		<h1 class="text-2xl font-semibold text-nowrap">
			Your
			<span class="text-3xl font-bolds"> Associations </span>
		</h1>
	</div>
	<div class="h-fit py-3 px-5">
		{#if user?.associations && user.associations.length > 0}
			<ul>
				{#each user.associations as associate}
					<li class="px-3 py-3 border-b-2 border-black/40">
						<a href={`/protected/user/${associate.id}`} class="flex gap-2 items-center">
							<img
								src={associate.image}
								alt={associate.name}
								class="h-12 w-12 object-cover rounded-full"
							/>
							<span class="text-lg">{associate.name}</span>
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<p>No associations found.</p>
		{/if}
	</div>
</div>
>>>>>>> 2689b32a279db71525fba4df4c3d46aae9075f8c
