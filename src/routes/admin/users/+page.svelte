<script lang="ts">
	import Icon from "@iconify/svelte";
	import { onMount } from "svelte";

    let users: any[] = []; // Initialize as an empty array
    let errorMessage = '';

    onMount(async () => {
        try {
            const response = await fetch('/admin/users'); // Replace with the actual path
            if (response.ok) {
                const data = await response.json();
                users = data.users || []; // Ensure it defaults to an empty array if undefined
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
        <div class="mt-4 mx-auto min-h-32 overflow-auto bg-gray-300 rounded-lg">
            <table class="w-full">
                <thead class="border-b-2 bg-white border-black text-nowrap sticky top-0 z-10">
                    <tr class="text-center">
                        <td class="px-2 items-center">id</td>
                        <td class="px-2 items-center">image</td>
                        <td class="px-2 items-center">full name</td>
                        <td class="px-2 items-center">email address</td>
                        <td class="px-2 items-center">tasks created</td>
                        <td class="px-2 items-center">projects related</td>
                    </tr>
                </thead>
                <tbody class="bg-amber-700 text-white">
                    {#each users as user, index}
                    <tr class="border-b-2 border-black/20 text-wrap">
                        <td class="border-r-2 border-white/30 px-2">{index + 1}</td> <!-- Incremented ID -->
                        <td class="border-r-2 border-white/30 px-2 py-2 flex justify-center">
                            <!-- Replace with actual profile image URL or component -->
                             {#if user.image}
                                <img src={user.image} alt="Profile pic" class="w-7 h-7 rounded-full" />
                                {:else}
                                <Icon icon="mingcute:user-3-line" class="w-7 h-7 border-2 rounded-full border-white p-1" />
                             {/if}
                        </td>
                        <td class="border-r-2 border-white/30 px-2 text-nowrap">{user.name}</td>
                        <td class="border-r-2 border-white/30 px-2">{user.email}</td>
                        <td class="border-r-2 border-white/30 px-2">{user.createdTasks || 0}</td>
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