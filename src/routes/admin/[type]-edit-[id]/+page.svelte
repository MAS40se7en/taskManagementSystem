<script lang="ts">
	import { page } from "$app/stores";
	import { onMount } from "svelte";

    const type = $page.params.type;
    const itemId = $page.params.id;

    let user: any;
    let item: any;
    let message = '';
    let errorMessage = '';
    let loading = true;

    let title = '';
	let description = '';
	let startsAt = '';
	let urgency = 'normal';
	let endsAt = '';
	let deadline = '';
	let instructionsText = '';
	let isPeriod = false;
	let instructions: { type: 'text' | 'audio'; content?: string; path?: string } | null = null;

    onMount(async () => {
        try {
            const response = await fetch(`/admin/${type}-edit-${itemId}`);

            const data = await response.json();

            if (response.ok) {
                loading = false;
                user = data.user;
                if (type === 'Project') {
                    item = data.project;
                    title = item.title;
                    description = item.description;
                    startsAt = item.startsAt;
                    endsAt = item.endsAts;
                } else {
                    item = data.task;
                    title = item.title;
                    description = item.description;
                    deadline = item.deadline || null;
                    startsAt = item.startsAt || null;
                    endsAt = item.endsAt || null;
                    instructions = item.instructions || null;
                    urgency = item.urgency;

                }
                message = data.message;
                console.log(item)
            } else {
                loading = false;
                errorMessage = data.message;
            }
        } catch (error) {
            loading = false;
            errorMessage = 'error retrieving data';
        }
    });
</script>

<div class="w-1/2 mx-auto py-10 relative overflow-auto">
    <div>
        <h1 class="text-2xl font-bold">Edit {type === 'Project' ? 'Project' : 'Task'}</h1>
    </div>

    <div class="px-10 py-5">
        <div>
            <h1 class="font-semibold mb-2 text-lg">Title</h1>
            <input type="text" bind:value={title} class="dark:bg-[#202020] mb-4 bg-[#D9D9D9] px-2 py-2 rounded-lg w-64">
        </div>
        <div>
            <h1 class="font-semibold mb-2 text-lg">Desciption</h1>
            <textarea bind:value={description} class="dark:bg-[#202020] mb-4 h-44 w-80 bg-[#D9D9D9] px-2 py-2 rounded-lg"></textarea>
        </div>
        {#if type === "Task"}
        <div class="pb-4 items-center">
            <div class="flex gap-20 items-center">
                <h1 class="font-semibold text-lg">{isPeriod ? 'Specify a Period' : 'Deadline'}</h1>
                <div>
                    <label>
                        <input class="appearance-none" type="checkbox" bind:checked={isPeriod} />
                        <span class={isPeriod ? 'font-semibold bg-blue-500 px-4 py-1 rounded-full text-white' : 'px-4 py-1 border-2 border-blue-700 text-blue-700 rounded-full'}>
                            Use Period
                        </span>
                    </label>
                </div>
            </div>
            {#if isPeriod}
                <div class="w-3/5">
                    <div class="grid grid-cols-2 items-start mx-auto gap-x-4 text-center py-2">
                        <p>start</p>
                        <p>end</p>
                        <input
                            id="startsAt"
                            type="date"
                            class="bg-gray-200 px-2 py-2 rounded-xl border-2 border-black dark:bg-[#151515]"
                            bind:value={startsAt}
                        />
                        <input
                            id="endsAt"
                            type="date"
                            class="bg-gray-200 px-2 py-2 rounded-xl border-2 border-black dark:bg-[#151515]"
                            bind:value={endsAt}
                        />
                    </div>
                </div>
            {:else}
                <input
                    type="date"
                    class="bg-gray-200 px-2 py-2 rounded-xl mt-2 border-2 border-black dark:bg-[#151515]"
                    bind:value={deadline}
                />
            {/if}
        </div>

        <div>
            <div class="flex justify-between w-3/5">
                <h1 class="font-semibold">Instructions</h1>
            </div>
                <textarea
                    class="border-2 border-black px-2 py-2 w-80 rounded-xl mt-2 h-44 dark:bg-[#151515]"
                    bind:value={instructionsText}
                    placeholder="Enter instructions..."
                ></textarea>
        </div>
        
        <div>
            <h1 class="font-semibold">Urgency</h1>
            <select
                bind:value={urgency}
                class="w-2/5 py-2 px-2 mt-2 border-2 border-black rounded-xl dark:bg-[#151515]"
            >
                <option value="normal">Normal</option>
                <option value="important">Important</option>
                <option value="urgent">Urgent</option>
                <option value="very urgent">Very Urgent</option>
            </select>
        </div>
        {:else if type === 'Project'}
        <div class="pb-4 w-3/5">
            <h1 class="font-semibold">Project Start Date</h1>
            <input
                type="date"
                bind:value={startsAt}
                class="border-2 border-black px-2 py-2 w-full rounded-xl mt-2 dark:bg-[#151515]"
            />
        </div>
        <div class="pb-4 w-3/5">
            <h1 class="font-semibold">Project End Date</h1>
            <input
                type="date"
                bind:value={endsAt}
                class="border-2 border-black px-2 py-2 w-full rounded-xl mt-2 dark:bg-[#151515]"
            />
        </div>
        {/if}
    </div>

    <div>
        <button class="bottom-4 right-16 absolute px-7 py-2 bg-green-500 dark:bg-green-700 rounded-full hover:bg-green-600 dark:hover:bg-green-800 text-white">Save</button>
    </div>
</div>