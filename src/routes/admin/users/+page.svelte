<script lang="ts">
	import { page } from "$app/stores";
	import Icon from "@iconify/svelte";
	import { onMount } from "svelte";

    let users: any[] = [];
    let errorMessage = '';

    onMount(async () => {
        try {
            const response = await fetch('/admin/users/');
            if (response.ok) {
                const data = await response.json();
                users = data.users || [];
            } else {
                errorMessage = "Failed to fetch users.";
            }
        } catch (error) {
            errorMessage = "An error occurred while fetching data.";
        }
    });
</script>

<div class="h-screen">
    <div class="w-5/6 mx-auto py-10 h-fit">
        <h1 class="text-4xl font-bold">All Users</h1>
        <div class="mt-4 mx-auto min-h-32 overflow-auto bg-[#D9D9D9] dark:bg-[#252525] rounded-lg">
            <table class="w-full">
                <thead class="h-10 border-b-2 bg-[#D9D9D9] dark:bg-[#474747] dark:border-[#727272] border-[#c0c0c0] text-nowrap sticky top-0 z-10">
                    <tr class="text-center">
                        <td class="px-2 items-center min-w-12">id</td>
                        <td class="px-2 items-center min-w-12">image</td>
                        <td class="px-2 items-center min-w-12">full name</td>
                        <td class="px-2 items-center min-w-12">email address</td>
                        <td class="px-2 items-center min-w-12">tasks</td>
                        <td class="px-2 items-center min-w-12">projects</td>
                    </tr>
                </thead>
                <tbody class="dark:bg-[#1f1f1f] bg-[#414141] text-white text-center">
                    {#each users as user, index}
                    <tr class="border-b-2 border-black/20 text-wrap mb-2">
                        <td class="border-r-2 border-white/30 px-2">{index + 1}</td> <!-- Incremented ID -->
                        <td class="border-r-2 border-white/30 px-2 py-2 flex justify-center">
                             {#if user.image}
                                <img src={user.image} alt="Profile pic" class="w-7 h-7 rounded-full" />
                                {:else}
                                <Icon icon="mingcute:user-3-line" class="w-7 h-7 border-2 rounded-full border-white p-1" />
                             {/if}
                        </td>
                        <td class="border-r-2 border-white/30 px-2 text-nowrap text-start"><a href={`/admin/users/${user.id}`}>{user.name}</a></td>
                        <td class="border-r-2 border-white/30 px-2">{user.email}</td>
                        <td class="border-r-2 border-white/30 px-2">{user._count.createdTasks || 0}</td>
                        <td class="border-r-2 border-white/30 px-2">{user.projectsRelated || 0}</td>
                    </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>
</div>

<style>
    .overflow-auto {
        height: 800px;
    }
</style>