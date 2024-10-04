<script lang="ts">
	import Icon from "@iconify/svelte";
    import TasksProjects from "$lib/components/TasksProjects.svelte";
import { onMount } from "svelte";

    let items: any[] = [];
    let errorMessage = '';

    function shuffle(array: any[]) {
        for (let i = array.length -1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    onMount(async () => {
        try {
            const response = await fetch('/admin');
            if (response.ok) {
                const data = await response.json();
                // Combine projects and tasks
                const projects = data.projects.map((project: any) => ({ ...project, type: 'Project' }));
                const tasks = data.tasks.map((task: any) => ({ ...task, type: 'Task' }));
                
                // Combine and shuffle items
                items = shuffle([...projects, ...tasks]);
            } else {
                errorMessage = "Failed to fetch projects and tasks";
            }
        } catch (error) {
            errorMessage = "An error occurred while fetching data.";
        }
    })
</script>
<div class="h-screen">

    <div class="w-5/6 mx-auto py-10 h-fit">
        <h1 class="text-4xl font-bold">All Projects and Tasks</h1>
        <div class="mt-4 mx-auto min-h-32 overflow-auto bg-gray-300 rounded-lg">
            <table class="w-full">
                <thead class="border-b-2 bg-white border-black text-nowrap sticky top-0 z-10">
                    <tr class="text-center">
                        <td>item title</td>
                        <td>item type</td>
                        <td>start date</td>
                        <td>deadline</td>
                        <td>created at</td>
                        <td>actions</td>
                    </tr>
                </thead>
                <tbody class="bg-amber-700 text-white">
                    {#if items.length > 0}
                        {#each items as item}
                            <tr class="border-b-2 border-black/20 text-wrap">
                                <td class="border-r-2 border-white/30 px-2 font-bold hover:underline">
                                    <a href={item.type === 'Project' ? `/projects/${item.id}` : `/tasks/${item.id}`}>
                                        {item.title}
                                    </a>
                                </td>
                                <td class="border-r-2 border-white/30 px-2">{item.type}</td>
                                {#if item.type === 'Project'}
                                    <td class="border-r-2 border-white/30 px-2">{new Date(item.startsAt).toLocaleDateString()}</td>
                                    <td class="border-r-2 border-white/30 px-2">{new Date(item.endsAt).toLocaleDateString()}</td>
                                    {:else}
                                        <td class="border-r-2 border-white/30 px-2">___</td>
                                        <td class="border-r-2 border-white/30 px-2">___</td>
                                {/if}
                                <td class="border-r-2 border-white/30 px-2">{new Date(item.createdAt).toLocaleDateString()}</td>
                                <td class="px-2 text-nowrap text-center py-2">
                                    <button class="py-1 px-2 mr-5 bg-green-500 rounded-lg w-20 hover:bg-green-700">Edit</button>
                                    <button class="py-1 px-2 bg-red-500 rounded-lg w-20 hover:bg-red-700">Delete</button>
                                </td>
                            </tr>
                        {/each}
                    {/if}
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