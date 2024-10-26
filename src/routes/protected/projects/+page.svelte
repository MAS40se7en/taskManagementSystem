<script lang="ts">
	import Navbar from "$lib/components/Navbar.svelte";
	import { onMount } from "svelte";

    let projects: any[] = [];
    let user;

    onMount(async () => {
        const res = await fetch('/protected/projects');
        projects = await res.json();
    });

    console.log(user)


</script>

<div class="w-4/5 mx-auto h-screen">
    <ul class="px-2 py-2 flex flex-col gap-4 ">
        {#each projects as project}
            <li class="bg-amber-200 px-3 py-3 min-h-fit rounded-2xl">
                <div class="flex justify-between">
                    <a href="/protected/projects/{project.id}" class="text-xl font-semibold">{project.title}</a>
                    <p class="text-xs pt-1 font-semibold opacity-60">{new Date(project.createdAt).toLocaleDateString()}</p>
                </div>
                <div class="flex justify-between px-10 text-xs">
                    <p class="text-green-600">{new Date(project.startsAt).toLocaleDateString()}</p>
                    <p class="text-red-600">{new Date(project.endsAt).toLocaleDateString()}</p>
                </div>
            </li>
        {/each}
    </ul>
</div>