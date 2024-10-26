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
            const response = await fetch('/protected/All');
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


    <div class="mx-auto h-screen bg-gray-50">
        {#if items.length > 0}
            <ul class="flex flex-col w-5/6 mx-auto gap-4 rounded-2xl py-4 text-white">
                {#each items as item}
                    <li class="relative py-2 w-full rounded-2xl min-h-32 mx-auto
                        {item.type === 'Project' && 'bg-[#fcdd76] text-black'}
                        {item.type === 'Task' && item.urgency === "important" && "bg-[#5d52ff]"}
						{item.type === 'Task' && item.urgency === "urgent" && "bg-[#ad1aad]"}
						{item.type === 'Task' && item.urgency === "very urgent" && "bg-[#ff1717]"}
						{item.type === 'Task' && item.urgency === "normal" && "bg-[#76fc9e] text-black"}
                    ">
                        <a href={item.type === 'Project' ? `/protected/projects/${item.id}` : `/protected/tasks/${item.id}`} class="text-lg px-3 font-semibold">{item.title}</a>
                        {#if item.type === 'Project'}
                            <p class="text-sm px-3">Starts at: {new Date(item.startsAt).toLocaleDateString()}</p>
                            <p class="text-sm px-3">Ends at: {new Date(item.endsAt).toLocaleDateString()}</p>
                            <div class="flex justify-end bottom-0 absolute w-full px-3 py-2">
                                <p class="border-2 border-black w-fit py-1 px-2 rounded-full text-xs opacity-50">Project</p>
                            </div>
                        {:else}
                            <p class="text-sm px-3">Created on: {new Date(item.createdAt).toLocaleDateString()}</p>
                            <div class="flex justify-end bottom-0 absolute w-full px-3 py-2">
                                <p class="border-2 border-black w-fit py-1 px-2 rounded-full text-xs">Task</p>
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
