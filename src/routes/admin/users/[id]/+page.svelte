<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	type User = {
		name: string;
		image: string;
		email: string;
		isVerified: boolean;
		upgraded: boolean;
		googleId: string;
		createdTasks: any;
		createdProjects: any;
		_count: any;
		role: string;
		id: any;
	};

	let user: User | null = null;
	let taskCount = 0;
	let relatedProjectCount = 0;
	let errorMessage = '';
	let completedProjectCount = 0;
	let completedTaskCount = 0;
    let message = '';

	let loading = true;
	let loadingDelete = false;

    const userId = $page.params.id;
	onMount(async () => {
		try {
			const response = await fetch(`/admin/users/${userId}`);

			const data = await response.json();

			if (response.ok) {
				taskCount = data.taskCount;
				relatedProjectCount = data.relatedProjectCount;
				user = data.user;
				console.log(user);
				completedProjectCount = data.completedProjectCount;
				completedTaskCount = data.completedTaskCount;
				message = data.message;
				loading = false;
			} else {
                errorMessage = data.message;
            }
		} catch (error) {
			errorMessage = 'error getting your data';
		}
	});

    async function deleteUser() {
		loadingDelete = true;
        try {
            const response = await fetch(`/admin/users/${userId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (response.ok) {
                message = data.message;
				loadingDelete = false;
                goto('/admin/users')
            } else {
				loadingDelete = false;
                errorMessage = data.message;
            }
        } catch (error) {
			loadingDelete = false;
            errorMessage = 'error deleting user';
        }
    }
</script>

<div class="px-10 pt-28">
	<div class="flex justify-between items-center mx-auto w-4/5">
		{#if loading}
			<div class="flex gap-7 items-center">
				<div class="bg-[#e2e2e2] dark:bg-[#151515] w-52 h-52 rounded-full"></div>
				<div class="flex flex-col gap-2">
					<div class="bg-[#e2e2e2] dark:bg-[#151515] h-12 w-28 rounded-full"></div>
					<div class="bg-[#e2e2e2] dark:bg-[#151515] h-7 w-32 rounded-full"></div>
					<div class="bg-[#e2e2e2] dark:bg-[#151515] h-7 w-24 rounded-full"></div>
					<div class="bg-[#e2e2e2] dark:bg-[#151515] h-7 w-20 rounded-full"></div>
				</div>
			</div>
			<div class="bg-[#e2e2e2] dark:bg-[#151515] h-7 w-48 rounded-full"></div>
		{:else}
			<div class="flex gap-7 items-center">
				<div>
					{#if user?.image}
						<img src={user?.image} alt="profile" class="w-52 h-52 min-w-52 min-h-52 rounded-full" />
					{:else}
						<Icon
							icon="mingcute:user-3-line"
							class="w-52 h-52 opacity-60 rounded-full px-1 bg-[#D9D9D9] dark:bg-[#252525]"
						/>
					{/if}
				</div>
				<div>
					<h1 class="text-2xl font-semibold">{user?.name}</h1>
					<h1>{user?.email}</h1>
					<h1>Role: {user?.role}</h1>
					<h1>
						Verified: <span class={user?.isVerified ? 'text-green-500' : 'text-red-500'}
							>{user?.isVerified ? 'Yes' : 'No'}</span
						>
					</h1>
				</div>
			</div>
			<div class="flex flex-col items-center">
				<div>
                    <p>
                        Upgraded: <span class={user?.upgraded ? 'text-[#E1CA7D]' : ''}
                            >{user?.upgraded ? 'Yes' : 'No'}</span
                        >
                    </p>
                    <div class="flex justify-end mb-4">
                        <h1 class="text-3xl font-bold text-end {user?.upgraded ? '' : 'opacity-50'}">
                            <span class="text-[#E1CA7D] shadow-md px-5 py-1 flex items-center rounded-xl"
                                >Task<span class="text-black dark:text-white">Focused</span>+</span
                            >
                        </h1>
                    </div>
                </div>
                {#if loadingDelete}
				<Icon icon="line-md:loading-twotone-loop" class="w-8 h-8 text-red-500 dark:text-red-700" />
					{:else}
					<div>
						<button on:click={deleteUser} class="text-red-500 font-semibold hover:text-red-600 dark:hover:text-red-800 dark:text-red-700 border-2 border-red-500 dark:border-red-700 px-5 py-2 rounded-full">Delete User</button>
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<div class="grid grid-cols-2 gap-10 pt-20 w-4/5 mx-auto">
		<div class="flex gap-4 items-center bg-[#D9D9D9] dark:bg-[#252525] rounded-3xl px-10 py-6">
			<div class="w-32 min-w-32 h-auto rounded-full border-8 text-center border-[#E1CA7D]">
				<p class="text-[80px]">
					{#if loading}
						<Icon icon="eos-icons:loading" class="mx-auto text-[#E1CA7D] w-28 h-28" />
					{:else}
						{taskCount}
					{/if}
				</p>
			</div>
			<div>
				<p class="font-semibold">Created Tasks</p>
			</div>
		</div>
		<div class="flex flex-col gap-3 bg-[#D9D9D9] dark:bg-[#252525] rounded-3xl px-10 py-6">
			<div class="flex gap-4 items-center">
				<div class="w-16 min-w-16 h-auto rounded-full border-8 text-center border-[#E1CA7D]">
					<p class="text-[34px]">
						{#if loading}
							<Icon icon="eos-icons:loading" class="mx-auto text-[#E1CA7D] w-12 h-12" />
						{:else}
							{user?._count.createdProjects}
						{/if}
					</p>
				</div>
				<div>
					<p class="font-semibold">Created Projects</p>
				</div>
			</div>
			<div class="flex gap-4 items-center">
				<div class="w-16 min-w-16 h-auto rounded-full border-8 text-center border-[#E1CA7D]">
					<p class="text-[34px]">
						{#if loading}
							<Icon icon="eos-icons:loading" class="mx-auto text-[#E1CA7D] w-12 h-12" />
						{:else}
							{relatedProjectCount}
						{/if}
					</p>
				</div>
				<div>
					<p class="font-semibold">Related Projects</p>
				</div>
			</div>
		</div>
		<div class="flex gap-4 items-center bg-[#D9D9D9] dark:bg-[#252525] rounded-3xl px-10 py-6">
			<div class="w-32 min-w-32 h-auto rounded-full border-8 text-center border-[#E1CA7D]">
				<p class="text-[80px]">{#if loading}
                    <Icon icon="eos-icons:loading" class="mx-auto text-[#E1CA7D] w-28 h-28" />
                {:else}
                    {completedTaskCount}
                {/if}</p>
			</div>
			<div>
				<p class="font-semibold">Completed Tasks</p>
			</div>
		</div>
		<div class="flex gap-4 items-center bg-[#D9D9D9] dark:bg-[#252525] rounded-3xl px-10 py-6">
			<div class="w-32 min-w-32 h-auto rounded-full border-8 text-center border-[#E1CA7D]">
				<p class="text-[80px]">{#if loading}
                    <Icon icon="eos-icons:loading" class="mx-auto text-[#E1CA7D] w-28 h-28" />
                {:else}
                    {completedProjectCount}
                {/if}</p>
			</div>
			<div>
				<p class="font-semibold">Completed Projects</p>
			</div>
		</div>
	</div>

	<div class="grid grid-cols-2 gap-3 py-20 w-5/6 mx-auto">
		<h1 class="flex justify-center text-3xl font-semibold">Tasks</h1>
		<h1 class="flex justify-center text-3xl font-semibold">Projects</h1>
		<div class="mt-4 mx-auto min-h-32 overflow-auto bg-[#D9D9D9] dark:bg-[#252525] rounded-lg">
			<table>
				<thead
					class="border-b-2 bg-[#D9D9D9] dark:bg-[#474747] dark:border-[#727272] border-[#c0c0c0] text-nowrap sticky top-0 z-10"
				>
					<tr>
						<td class="px-3 py-1">Id</td>
						<td class="px-3 py-1">Title</td>
						<td class="px-3 py-1">Description</td>
					</tr>
				</thead>
				<tbody class="dark:bg-[#1f1f1f] bg-[#3f3f3f] text-white text-center">
					{#if user?.createdTasks}
						{#each user?.createdTasks as task}
							<tr>
								<td class="border-r-2 border-white/30 px-2">{task.id}</td>
								<td class="text-start border-r-2 border-white/30 px-2"
									><a href="/admin/tasks/{task.id}" class="hover:underline-offset-1 hover:underline"
										>{task.title}</a
									></td
								>
								<td class="text-start border-r-2 border-white/30 px-2">{task.description}</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
		<div class="mt-4 mx-auto min-h-32 overflow-auto bg-[#D9D9D9] dark:bg-[#252525] rounded-lg">
			<table>
				<thead
					class="border-b-2 bg-[#D9D9D9] dark:bg-[#474747] dark:border-[#727272] border-[#c0c0c0] text-nowrap sticky top-0 z-10"
				>
					<tr>
						<td class="px-3 py-1">Id</td>
						<td class="px-3 py-1">Title</td>
						<td class="px-3 py-1">Description</td>
					</tr>
				</thead>
				<tbody class="dark:bg-[#1f1f1f] bg-[#414141] text-white text-center">
					{#if user?.createdProjects}
						{#each user?.createdProjects as project}
							<tr>
								<td class="border-r-2 border-white/30 px-2">{project.id}</td>
								<td class="text-start border-r-2 border-white/30 px-2"
									><a
										href="/admin/projects/{project.id}"
										class="hover:underline-offset-1 hover:underline">{project.title}</a
									></td
								>
								<td class="text-start border-r-2 border-white/30 px-2">{project.description}</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>
