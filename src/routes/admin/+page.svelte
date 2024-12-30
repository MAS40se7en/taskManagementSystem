<script lang="ts">
	import Icon from "@iconify/svelte";
    import { onMount } from "svelte";

    let items: any[] = [];
    let errorMessage = '';
    let loadingDelete = false;
    let message = '';
    let loading = true;

    function shuffle(array: any[]) {
        for (let i = array.length -1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    async function fetchData() {
        try {
            const response = await fetch('/admin');
            if (response.ok) {
                const data = await response.json();
                const projects = data.projects.map((project: any) => ({ ...project, type: 'Project' }));
                const tasks = data.tasks.map((task: any) => ({ ...task, type: 'Task' }));
                
                items = shuffle([...projects, ...tasks]);
            } else {
                errorMessage = "Failed to fetch projects and tasks";
            }
        } catch (error) {
            errorMessage = "An error occurred while fetching data.";
        }
    }

    onMount(async () => {
        await fetchData();
    });

    async function deleteItem(itemId: any, itemType: any) {
        loadingDelete = true;

        try {
            const response = await fetch('/admin', {
                method: 'POST',
                body: JSON.stringify({ itemId, itemType })
            });

            const data = await response.json();

            if (response.ok) {
                await fetchData();
                loadingDelete = false;
                message = data.message;
            } else {
                loadingDelete = false;
                errorMessage = data.message;
            }
        } catch (error) {
            errorMessage = 'Could not delete the item'
        }
    }
</script>

<div class="h-screen">
    <div class="w-5/6 mx-auto py-10 h-fit">
        <h1 class="text-4xl font-bold">All Projects and Tasks</h1>
        <div class="mt-4 mx-auto min-h-32 overflow-auto bg-[#D9D9D9] dark:bg-[#252525] rounded-lg">
            <table class="w-full">
                <thead class="border-b-2 bg-[#D9D9D9] dark:bg-[#474747] dark:border-[#727272] border-[#c0c0c0] text-nowrap sticky top-0 z-10">
                    <tr class="text-center">
                        <td>item title</td>
                        <td>item type</td>
                        <td>start date</td>
                        <td>deadline</td>
                        <td>created at</td>
                        <td>actions</td>
                    </tr>
                </thead>
                <tbody class="dark:bg-[#1f1f1f] bg-[#1a1a1a] text-white text-center">
                    {#if items.length > 0}
                        {#each items as item}
                            <tr class="border-b-2 border-black/20 text-wrap  mb-2">
                                <td class="border-r-2 border-white/30 text-start px-2 font-bold hover:underline">
                                    <a href={item.type === 'Project' ? `/admin/projects/${item.id}` : `/admin/tasks/${item.id}`}>
                                        {item.title}
                                    </a>
                                </td>
                                <td class="border-r-2 border-white/30 px-2">{item.type}</td>
                                {#if item.type === 'Project' && item.startsAt && item.endsAt}
                                    <td class="border-r-2 border-white/30 px-2">{new Date(item.startsAt).toLocaleDateString()}</td>
                                    <td class="border-r-2 border-white/30 px-2">{new Date(item.endsAt).toLocaleDateString()}</td>
                                    {:else if item.type === 'Project' && !item.startsAt && !item.endsAt}
                                    <td class="border-r-2 border-white/30 px-2">___</td>
                                    <td class="border-r-2 border-white/30 px-2">___</td>
                                {/if}
                                {#if item.type === 'Task' && item.startsAt}
                                    <td class="border-r-2 border-white/30 px-2">{new Date(item.startsAt).toLocaleDateString()}</td>
                                    <td class="border-r-2 border-white/30 px-2">{new Date(item.endsAt).toLocaleDateString()}</td>
                                    {:else if item.type === 'Task' && item.deadline}
                                    <td class="border-r-2 border-white/30 px-2">___</td>
                                    <td class="border-r-2 border-white/30 px-2">{new Date(item.deadline).toLocaleDateString()}</td>
                                {/if}
                                <td class="border-r-2 border-white/30 px-2">{new Date(item.createdAt).toLocaleDateString()}</td>

                                <td class="px-2 flex text-center gap-2 py-2">
                                    <a href="/admin/{item.type}-edit-{item.id}" class="py-1 px-2 bg-blue-500 dark:bg-blue-600 rounded-lg w-20 hover:bg-blue-600 dark:hover:bg-blue-700">Edit</a>
                                    {#if loadingDelete}
                                    <Icon icon="line-md:loading-twotone-loop" class="w-8 h-8 text-red-500 dark:text-red-700" />
                                        {:else}
                                        <button on:click={() => deleteItem(item.id, item.type)} class="py-1 px-2 bg-red-500 dark:bg-red-600 rounded-lg w-20 hover:bg-red-800">Delete</button>
                                    {/if}
                                </td>
                            </tr>
                        {/each}
                        {:else if loading}
                            <div class="left-0 right-0 absolute items-center">
                                <Icon icon="eos-icons:loading" class="mx-auto text-[#E1CA7D] w-24 h-24" />
                            </div>
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