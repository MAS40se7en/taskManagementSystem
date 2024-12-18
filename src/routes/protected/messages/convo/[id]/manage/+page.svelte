<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import Icon from "@iconify/svelte";
	import { onMount } from "svelte";

    type ConversationWithMessages = {
		id: number;
		createdAt: Date;
		updatedAt: Date;
		participants: {
			id: string;
			name: string;
			image: string;
		}[];
	};

    let conversation: ConversationWithMessages | null = null;
	let selectedUsers: any[] = [];
	let searchQuery = '';
	let errorMessage = '';
	let isSubmitting = false;
	let user: any;

    const convoId = $page.params.id;

    onMount(async() => {
        try {
            const response = await fetch(`/protected/messages/convo/${convoId}/manage/`);

            const data = await response.json();

            if (response.ok) {
                conversation = data.convo;
                console.log(conversation);
                user = data.user;
            } else {
                errorMessage = data.message;
            }
        } catch (error) {
            errorMessage = 'Could not retrieve any participant in this conversation!';
        }
    });

    function goBack() {
		window.history.back(); // Navigates to the previous URL in the history stack
	}

    async function deleteChat() {
        try {
            const response = await fetch(`/protected/messages/convo/${convoId}/manage`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (response.ok) {
                goto('/protected/messages/');
            } else {
                errorMessage = data.message;
            }
        } catch (error) {
            console.error(error);
            errorMessage = 'Could not delete the conversation!';
        }
    }
</script>

<div class="h-screen">
    <div class="px-10 py-5 flex gap-5 items-center">
        <button on:click|preventDefault={goBack} class="py-2 px-3">
			<Icon icon="fluent:ios-arrow-24-filled" class="w-7 h-7" />
		</button>
        <p class="text-3xl font-bold">Manage Chat</p>
    </div>

    <div class="px-10 py-5">
        {#if conversation}
        {#each conversation.participants as participant}
        <div class="flex items-center">
            {#if participant.id !== user.id}
                <div class="flex gap-3 items-center">
                    {#if participant.image}
                        <img src={participant.image} class="w-8 h-8 rounded-full" alt={participant.name} />
                    {:else}
                        <Icon
                            icon="mingcute:user-3-line"
                            class="w-8 h-8 border-2 text-white border-white rounded-full px-1 bg-[#D9D9D9] dark:bg-[#252525]"
                        />
                    {/if}

                    <p class="font-semibold text-lg w-48 flex items-center justify-between">
                        {participant.name}
                    </p>
                </div>
            {/if}
        </div>
		{/each}
        {/if}
    </div>

    <div class="flex justify-center w-full">
        <button class="my-3 text-white bg-red-500 dark:bg-red-700 py-3 rounded-full font-semibold px-5" on:click={deleteChat}>Delete Chat!</button>
    </div>
</div>
