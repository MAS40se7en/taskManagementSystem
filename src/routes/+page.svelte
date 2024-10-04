<script lang="ts">
import type { PageData } from './$types';

import { onMount } from "svelte";

    let tasks: any[] = [];

    onMount(async () => {
        const res = await fetch('/tasks');
        tasks = await res.json();
    });

    function formData(dateString: string | number | Date) {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    }
</script>

<div class="overflow-auto mb-20 h-screen">
    <ul class="w-4/5 mx-auto py-5">
        {#each tasks as task}
            <li class="px-4 py-3 bg-amber-200 rounded-3xl mb-4">
                <div class="my-3 flex justify-between">
                    <a href="/tasks" class="font-semibold">{task.title}</a>
                    <h1 class="text-sm font-light">{formData(task.createdAt)}</h1>
                </div>
                <div class="my-3">
                    <p>{task.description}</p>
                </div>
                {#if task.imageUrl}
                    <img src={task.imageUrl} alt="Task Pic">
                {/if}
            </li>
        {/each}
    </ul>
</div>