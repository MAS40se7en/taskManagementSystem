<script lang="ts">
	import { goto } from "$app/navigation";
	import Icon from "@iconify/svelte";
	import { onMount } from "svelte";

    let title = '';
    let description = '';
    let participants: { id: string; name: string | null }[] = [];
    let loggedInUserId: string = '';
    let conversationId: string = '';
    let startsAt = '';
    let endsAt = '';
    let errorMessage = '';
    let isSubmitting = false;
    let user: any;
    let loading = true;

    onMount(async () => {
        const pathParts = window.location.pathname.split('/');
        conversationId = pathParts[pathParts.length - 2]; // Get the conversation ID from the URL

        loggedInUserId = new URLSearchParams(window.location.search).get('loggedInUserId') || '';
        
        try {
            const response = await fetch(`/protected/messages/convo/${conversationId}/createProject`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            user = data.user;
            participants = data.participants || []; // Ensure to handle undefined case

            
            if (!user) {
			    alert('unauthorized access');
                goto('/auth/login');
		    }
            loading = false;
            
            if (!user?.isVerified) {
					alert('please verify your email to use the application');

					const url = new URL(`/auth/register/verify-email/`, window.location.origin);
					url.searchParams.append('userId', user?.id);

					goto(url.toString());
				}
                
        } catch (error) {
            console.error('Error fetching participants:', error);
        }
    });


    async function create() {
		errorMessage = '';
        isSubmitting = true;

		if (!title || !description) {
			errorMessage = 'Missing important fields!';
            isSubmitting = false;
            return;
		}

        if (!startsAt || !endsAt) {
            errorMessage = 'Please provide start and end dates for the project.';
            isSubmitting = false;
            return;
        }

		const formData = new FormData();
		formData.append('title', title);
		formData.append('description', description);
		formData.append('startsAt', startsAt);
		formData.append('endsAt', endsAt);

        const participantIds = participants.map(participant => participant.id);

		const endpoint = `/protected/messages/convo/${conversationId}/createProject?participants=${participantIds.join(',')}&loggedInUserId=${loggedInUserId}`;
        
        try { 
	        const response = await fetch(endpoint, {
	        	method: 'POST',
	        	body: formData
	        });
	        if (response.ok) {
	        	const data = await response.json();
                const projectId = data.id;
	        	goto(`/protected/projects/${projectId}`);
	        } else {
	        	// Handle error (optional)
	        	const error = await response.json();
	        	errorMessage = error.message || 'project creation failed';
	        }
        } catch (error) {
            errorMessage = `An error occurred: ${errorMessage}`;
        } finally {
            isSubmitting = false;
        }
	}
</script>

<div class="mb-20">
	<div class="px-8 pb-1 py-4 bg-[#D9D9D9] dark:bg-[#252525] top flex">
        <div>
            <a href={`/protected/messages/convo/${conversationId}`} class="py-2 px-3">
                <Icon icon="fluent:ios-arrow-24-filled" class="w-7 h-7" />
            </a>
        </div>
        <div class="pl-2">
		<h1 class="px-5 text-xl font-bold">Create a project with</h1>
        <div class="py-1 rounded-3xl my-2 px-5 ml-4 border-2 border-black">
            <ul class="overflow-auto">
                {#if loading}
                    <div class="w-24 h-7 bg-gray-200/60 dark:bg-gray-200/20 rounded-full"></div>
                {/if}
            {#each participants as participant}
                {#if participant.id !== loggedInUserId}
                <li class="text-xl text-[#9c8c57] font-bold text-nowrap">{participant.name}</li>
                {/if}
            {/each}
                </ul>
        </div>
    </div>
	</div>
	<div class="px-10 pt-10">
		<!-- Shared Fields -->
         {#if errorMessage}
            <div class="bg-red-500 text-white p-2 rounded-xl mb-4">{errorMessage}</div>
         {/if}
		<div class="pb-4">
			<h1 class="font-semibold">Title</h1>
			<input type="text" class="bg-white border-2 border-black px-2 py-2 w-full rounded-xl mt-2 dark:bg-[#151515]" bind:value={title} />
		</div>
		<div class="pb-4">
			<h1 class="font-semibold">Description</h1>
			<textarea class="bg-white border-2 border-black px-2 py-2 w-full rounded-xl mt-2 h-32 dark:bg-[#151515]" bind:value={description}
			></textarea>
		</div>
			<div class="pb-4">
				<h1 class="font-semibold">Project Start Date</h1>
				<input
					type="date"
					bind:value={startsAt}
					class="bg-white border-2 border-black px-2 py-2 w-full rounded-xl mt-2 dark:bg-[#151515]"
				/>
			</div>
			<div class="pb-4">
				<h1 class="font-semibold">Project End Date</h1>
				<input
					type="date"
					bind:value={endsAt}
					class="bg-white border-2 border-black px-2 py-2 w-full rounded-xl mt-2 dark:bg-[#151515]"
				/>
			</div>

            <button on:click={create} class="w-full text-end py-3 px-2 text-xl text-green-700"
                    disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Create'}
            </button>
		
	</div>
</div>
