<script lang="ts">
	import { preventDefault } from 'svelte/legacy';

	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	let users: any[] = $state([]);
	let selectedUsers: any[] = $state([]);
	let searchQuery = $state('');
	let project: any = $state();
	let errorMessage = '';
	let isSubmitting = $state(false);
	let user: any;
	let loading = $state(true);

	const projectId = $page.params.id;

	onMount(async () => {
		const response = await fetch(`/protected/projects/${projectId}/edit-users`, {
			method: 'GET'
		});

		if (response.ok) {
			const data = await response.json();
			console.log(data);
			project = data.project;
			user = data.user;
			loading = false;
			if (!user?.isVerified) {
				alert('please verify your email to use the application');

				const url = new URL(`/auth/register/verify-email/`, window.location.origin);
				url.searchParams.append('userId', user?.id);

				goto(url.toString());
			}
			if (project.users.length > 0) {
				selectedUsers = project.users.map((user: any) => user);
				console.log(selectedUsers);
			}
		}
	});

	async function fetchUsers() {
		const response = await fetch(`/protected/projects/${projectId}/edit-users`, {
			method: 'GET'
		});
		if (response.ok) {
			const data = await response.json();
			users = data.allUsers;
		} else {
			console.error('Failed to fetch users');
		}

		console.log('Users: ', users);
	}

	function addUser(user: any) {
		if (!selectedUsers.includes(user)) {
			selectedUsers = [...selectedUsers, user];
		}
		searchQuery = '';
	}

	async function removeUser(user: any) {
		selectedUsers = selectedUsers.filter((u) => u !== user);

		if (project && project.users) {
			project.users = project.users.filter((u: any) => u !== user);
		}

		try {
			const response = await fetch(`/protected/projects/${projectId}/edit-users/remove-user`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					deletedUserId: user.id
				})
			});

			if (response.ok) {
				console.log('User deleted successfully');
				return new Response(JSON.stringify({ message: 'User deleted successfully' }), {
					status: 200
				});
			}
		} catch (error) {
			errorMessage = 'Failed to remove user from the project';
			console.error('Failed to remove user from the project', error);
		}
	}

	async function submitUsers() {
		errorMessage = '';
		isSubmitting = true;

		const selectedUserIds = selectedUsers.map((user) => user.id);

		try {
			const response = await fetch(`/protected/projects/${projectId}/edit-users`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					selectedUserIds
				})
			});

			if (response.ok) [goto(`/protected/projects/${projectId}/`)];
		} catch (error) {
			errorMessage = 'Failed to add users to the project';
			console.error('Failed to add users to the project', error);
		}
	}

	function goBack() {
		window.history.back();
	}
</script>

<div class="bg-[#D9D9D9] h-screen dark:bg-[#252525] dark:text-white">
	{#if loading}
	<div>
		<div class="h-28 w-full pl-10 pr-10 pt-12 pb-4 flex justify-between">
			<a href="/protected/All" class="py-2" aria-label="Go back">
				<Icon icon="fluent:ios-arrow-24-filled" class="w-7 h-7" />
			</a>
			<div class="h-10 bg-gray-200/70 dark:bg-gray-200/30 w-24 rounded-full"></div>
		</div>
		<div class="px-10 py-5 h-48 flex flex-col gap-2">
			<div class="rounded-full w-32 bg-gray-200/50 dark:bg-gray-200/10 h-6"></div>
			<div class="rounded-full w-64 bg-gray-200/50 dark:bg-gray-200/10 h-8"></div>

		</div>
		<div class="flex flex-col gap-4 px-3">
			<div class="h-16 flex gap-3 items-center">
				<div class="bg-gray-200 dark:bg-gray-200/30 h-12 w-12 rounded-full"></div>
				<div class="bg-gray-200 dark:bg-gray-200/30 h-5 w-64 rounded-full"></div>
			</div>
			<div class="h-16 flex gap-3 items-center">
				<div class="bg-gray-200 dark:bg-gray-200/30 h-12 w-12 rounded-full"></div>
				<div class="bg-gray-200 dark:bg-gray-200/30 h-5 w-64 rounded-full"></div>
			</div>
			<div class="h-16 flex gap-3 items-center">
				<div class="bg-gray-200 dark:bg-gray-200/30 h-12 w-12 rounded-full"></div>
				<div class="bg-gray-200 dark:bg-gray-200/30 h-5 w-64 rounded-full"></div>
			</div>
			<div class="h-16 flex gap-3 items-center">
				<div class="bg-gray-200 dark:bg-gray-200/30 h-12 w-12 rounded-full"></div>
				<div class="bg-gray-200 dark:bg-gray-200/30 h-5 w-64 rounded-full"></div>
			</div>
			<div class="h-16 flex gap-3 items-center">
				<div class="bg-gray-200 dark:bg-gray-200/30 h-12 w-12 rounded-full"></div>
				<div class="bg-gray-200 dark:bg-gray-200/30 h-5 w-64 rounded-full"></div>
			</div>
			<div class="h-16 flex gap-3 items-center">
				<div class="bg-gray-200 dark:bg-gray-200/30 h-12 w-12 rounded-full"></div>
				<div class="bg-gray-200 dark:bg-gray-200/30 h-5 w-64 rounded-full"></div>
			</div>
			<div class="h-16 flex gap-3 items-center">
				<div class="bg-gray-200 dark:bg-gray-200/30 h-12 w-12 rounded-full"></div>
				<div class="bg-gray-200 dark:bg-gray-200/30 h-5 w-64 rounded-full"></div>
			</div>
			<div class="h-16 flex gap-3 items-center">
				<div class="bg-gray-200 dark:bg-gray-200/30 h-12 w-12 rounded-full"></div>
				<div class="bg-gray-200 dark:bg-gray-200/30 h-5 w-64 rounded-full"></div>
			</div>
		</div>
	</div>
	
	{:else}
	<div
		class="flex justify-between items-center px-10 pt-12 pb-4 top-0 sticky z-10
	{project?.completed
			? 'bg-green-500 text-white rounded-b-3xl dark:bg-green-600'
			: 'bg-white dark:bg-black'}"
	>
		<button onclick={preventDefault(goBack)} class="py-2 px-3">
			<Icon icon="fluent:ios-arrow-24-filled" class="w-7 h-7" />
		</button>
		<div class="flex items-center">
			<h1 class="text-2xl font-bold mr-2">{project?.title}</h1>
		</div>
	</div>

	<div class="px-5 py-5 bg-white dark:bg-black">
		<h1 class="font-semibold">Participants</h1>
		<input
			type="text"
			placeholder="Search for users..."
			bind:value={searchQuery}
			oninput={fetchUsers}
			class="px-2 py-2 w-full rounded-xl mt-2 border-2 border-black dark:bg-[#151515]"
		/>

		{#if searchQuery.length > 0}
			<ul class="bg-gray-100 dark:bg-stone-700 mt-2 rounded-lg max-h-60 overflow-y-auto">
				{#each users.filter((user) => user.name
						.toLowerCase()
						.includes(searchQuery.toLowerCase())) as user (user.id)}
					<li class="px-3 py-2 flex justify-between items-center">
						<button onclick={() => addUser(user)} class="flex w-full gap-3 items-center">
							{#if user.image}
								<img src={user.image} alt="" class="w-8 rounded-full" />
							{:else}
								<Icon
									icon="mingcute:user-3-line"
									class="w-8 h-8 border-4 border-black rounded-full px-1"
								/>
							{/if}
							<p>{user.name}</p>
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
	{#if selectedUsers.length > 0}
		<div class="mt-3">
			<ul class="px-10 py-2 my-2 rounded-2xl overflow-auto">
				{#each selectedUsers as user}
					<li class="px-2 py-2 flex justify-between">
						<div class="flex gap-3 items-center">
							{#if user.image}
								<img src={user.image} alt="" class="w-8 rounded-full" />
							{:else}
								<Icon
									icon="mingcute:user-3-line"
									class="w-8 h-8 border-4 border-black rounded-full px-1"
								/>
							{/if}
							<p>{user.name}</p>
						</div>
						<button onclick={() => removeUser(user)} class="text-red-500 font-bold text-2xl">
							&times
						</button>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
	<div class="text-center">
		<button class="py-2 px-4 bg-green-600 text-white rounded-full mt-5" onclick={submitUsers}>
			{isSubmitting ? 'Submitting' : 'Save Users'}
		</button>
	</div>
	{/if}
</div>
