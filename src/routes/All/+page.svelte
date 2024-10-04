<script lang="ts">
	import Navbar from "$lib/components/Navbar.svelte";
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
            const response = await fetch('/All');
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


    <TasksProjects />
    <div class="w-5/6 mx-auto h-screen">
        {#if items.length > 0}
            <ul class="flex flex-col px-3 gap-4 bg-gray-50 rounded-2xl py-4">
                {#each items as item}
                    <li class="bg-amber-200 relative py-2 w-full rounded-2xl min-h-32 mx-auto">
                        <h1 class="text-lg px-3 font-semibold">{item.title}</h1>
                        {#if item.type === 'Project'}
                            <p class="text-sm px-3">Starts at: {new Date(item.startsAt).toLocaleDateString()}</p>
                            <p class="text-sm px-3">Ends at: {new Date(item.endsAt).toLocaleDateString()}</p>
                            <div class="flex justify-end bottom-0 absolute w-full px-3 py-2">
                                <p class="border-2 border-black w-fit py-1 px-2 rounded-full text-xs opacity-50">Project</p>
                            </div>
                        {:else}
                            <p class="text-sm px-3">Created on: {new Date(item.createdAt).toLocaleDateString()}</p>
                            <div class="flex justify-end bottom-0 absolute w-full px-3 py-2">
                                <p class="border-2 border-black w-fit py-1 px-2 rounded-full text-xs opacity-50">Task</p>
                            </div>
                        {/if}
                    </li>
                {/each}
            </ul>
            {:else}
            <p>No projects or tasks related to you were found.</p>
        {/if}

        {#if errorMessage}
        <p class="text-red-500 mt-4">{errorMessage}</p>
    {/if}
    </div>
