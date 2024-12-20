<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	let user: {
		id: any;
		name: string;
		isVerified: boolean;
		associations: { id: string; name: string; image: string }[];
	} | null = null;

	let errorMessage = '';
	let loading = true;

	onMount(async () => {
		try {
			const response = await fetch('/protected/user/account/associates');
			const data = await response.json();

			if (response.ok) {
				user = data.user;
				console.log(user);
				loading = false;
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

<div class="bg-gray-50 h-screen dark:bg-black">
	
	<div class="flex gap-1 text-center py-7 px-10 bg-white dark:bg-black dark:shadow-md dark:shadow-white/10">
		<a href="/protected/user/account" class="py-2">
			<Icon icon="fluent:ios-arrow-24-filled" class="w-7 h-7" />
		</a>
		<h1 class="text-2xl font-semibold text-nowrap">
			Your
			<span class="text-3xl font-bolds">Associations </span>
		</h1>
	</div>
	<div class="h-fit py-3 px-5 ">
		{#if loading}
		<div class="flex flex-col gap-4 px-3 py-3">
			<div class="h-16 flex gap-3 items-center">
				<div class="bg-gray-200/70 dark:bg-gray-200/30 h-12 w-12 rounded-full"></div>
				<div class="bg-gray-200/70 dark:bg-gray-200/30 h-5 w-64 rounded-full"></div>
			</div>
			<div class="h-16 flex gap-3 items-center">
				<div class="bg-gray-200/70 dark:bg-gray-200/30 h-12 w-12 rounded-full"></div>
				<div class="bg-gray-200/70 dark:bg-gray-200/30 h-5 w-64 rounded-full"></div>
			</div>
			<div class="h-16 flex gap-3 items-center">
				<div class="bg-gray-200/70 dark:bg-gray-200/30 h-12 w-12 rounded-full"></div>
				<div class="bg-gray-200/70 dark:bg-gray-200/30 h-5 w-64 rounded-full"></div>
			</div>
			<div class="h-16 flex gap-3 items-center">
				<div class="bg-gray-200/70 dark:bg-gray-200/30 h-12 w-12 rounded-full"></div>
				<div class="bg-gray-200/70 dark:bg-gray-200/30 h-5 w-64 rounded-full"></div>
			</div>
			<div class="h-16 flex gap-3 items-center">
				<div class="bg-gray-200/70 dark:bg-gray-200/30 h-12 w-12 rounded-full"></div>
				<div class="bg-gray-200/70 dark:bg-gray-200/30 h-5 w-64 rounded-full"></div>
			</div>
			<div class="h-16 flex gap-3 items-center">
				<div class="bg-gray-200/70 dark:bg-gray-200/30 h-12 w-12 rounded-full"></div>
				<div class="bg-gray-200/70 dark:bg-gray-200/30 h-5 w-64 rounded-full"></div>
			</div>
			<div class="h-16 flex gap-3 items-center">
				<div class="bg-gray-200/70 dark:bg-gray-200/30 h-12 w-12 rounded-full"></div>
				<div class="bg-gray-200/70 dark:bg-gray-200/30 h-5 w-64 rounded-full"></div>
			</div>
			<div class="h-16 flex gap-3 items-center">
				<div class="bg-gray-200/70 dark:bg-gray-200/30 h-12 w-12 rounded-full"></div>
				<div class="bg-gray-200/70 dark:bg-gray-200/30 h-5 w-64 rounded-full"></div>
			</div>
		</div>
		{:else}
		{#if user?.associations && user.associations.length > 0}
			<ul>
				{#each user.associations as associate}
					<li class="px-3 py-3">
						<a href={`/protected/user/${associate.id}`} class="flex gap-2 items-center">
							{#if associate.image}
								<img
									src={associate.image}
									alt={associate.name}
									class="h-12 w-12 object-cover rounded-full"
								/>
							{:else}
								<Icon
									icon="mingcute:user-3-line"
									class="w-12 h-12 border-2 text-white border-white rounded-full px-1 bg-[#D9D9D9] dark:bg-[#252525]"
								/>
							{/if}

							<span class="text-lg">{associate.name}</span>
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<p>No associations found.</p>
		{/if}
	{/if}
		
	</div>
</div>
