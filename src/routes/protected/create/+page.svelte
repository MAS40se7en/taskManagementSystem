<script lang="ts">
	import { goto } from '$app/navigation';
	import Navbar from '$lib/components/Navbar.svelte';
	import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
	import Icon from '@iconify/svelte';

	let title = '';
	let description = '';
	let imageUrl = '';
	let startsAt = '';
	let endsAt = '';
	let deadline = '';
	let errorMessage = '';
	let selectedType: 'project' | 'task' = 'project';
	let instructionsText = '';
	let instructionsAudio: File | null = null;
	let useVoiceNote = false;
    let isSubmitting = false;

	async function create() {
		errorMessage = '';
        isSubmitting = true;

		if (!title || !description) {
			errorMessage = 'Missing important fields!';
            isSubmitting = false;
            return;
		}

        if (selectedType === 'project' && (!startsAt || !endsAt)) {
            errorMessage = 'Please provide start and end dates for the project.';
            isSubmitting = false;
            return;
        }

		const formData = new FormData();
		formData.append('title', title);
		formData.append('description', description);
		formData.append('imageUrl', imageUrl);
		formData.append('startsAt', startsAt);
		formData.append('endsAt', endsAt);
		if (useVoiceNote && instructionsAudio) {
			formData.append('instructionsAudio', instructionsAudio);
		} else if (!useVoiceNote && instructionsText) {
			formData.append('instructionsText', instructionsText);
		}

		const endpoint = selectedType === 'task' ? '/protected/tasks/create' : '/protected/projects/create';
        
        try { 
	        const response = await fetch(endpoint, {
	        	method: 'POST',
	        	body: formData
	        });
	        if (response.ok) {
	        	const data = await response.json();
                const projectId = data.id;
	        	goto(selectedType === 'task' ? '/tasks' : `/protected/create/projectTasks-${projectId}`);
	        } else {
	        	// Handle error (optional)
	        	const error = await response.json();
	        	errorMessage = error.message || `${selectedType} creation failed`;
	        }
        } catch (error) {
            errorMessage = `An error occurred: ${errorMessage}`;
        } finally {
            isSubmitting = false;
        }
	}

	async function takePicture() {
		const image = await Camera.getPhoto({
			resultType: CameraResultType.DataUrl,
			source: CameraSource.Prompt,
			quality: 90
		});

		imageUrl = image.dataUrl ?? '';
		console.log('Image captured: ', imageUrl);
	}

	function handleFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			instructionsAudio = target.files[0];
		}
	}
</script>

<div class="mb-20">
	<div class="px-8 pt-10 bg-gray-200 top">
		<h1 class="px-5 text-4xl font-bold">Create...</h1>
		<div class="flex flex-col gap-3 pt-4 pb-6">
			<button
				class="flex justify-between w-full px-3 h-14 bg-amber-200 items-center rounded-full
            {selectedType === 'project' ? 'border-gray-700 border-4' : ''}"
				on:click={() => (selectedType = 'project')}
                disabled={isSubmitting}
			>
				<h1 class="font-semibold text-xl">Project</h1>
				<p class="font-semibold text-sm">You fully manage</p>
			</button>

			<button
				class="flex justify-between w-full px-3 h-14 bg-amber-200 items-center rounded-full
            {selectedType === 'task' ? 'border-gray-700 border-4' : ''}"
				on:click={() => (selectedType = 'task')}
                disabled={isSubmitting}
			>
				<h1 class="font-semibold text-xl">Task</h1></button
			>
		</div>
	</div>
	<div class="px-10 pt-10">
		<!-- Shared Fields -->
         {#if errorMessage}
            <div class="bg-red-500 text-white p-2 rounded-xl mb-4">{errorMessage}</div>
         {/if}
		<div class="pb-4">
			<h1 class="font-semibold">Title</h1>
			<input type="text" class="bg-gray-300 px-2 py-2 w-full rounded-xl mt-2" bind:value={title} />
		</div>
		<div class="pb-4">
			<h1 class="font-semibold">Description</h1>
			<textarea class="bg-gray-300 px-2 py-2 w-full rounded-xl mt-2 h-32" bind:value={description}
			></textarea>
		</div>

		<!-- Conditional Fields based on selection-->
		{#if selectedType === 'project'}
			<div class="pb-4">
				<h1 class="font-semibold">Project Start Date</h1>
				<input
					type="date"
					bind:value={startsAt}
					class="bg-gray-300 px-2 py-2 w-full rounded-xl mt-2"
				/>
			</div>
			<div class="pb-4">
				<h1 class="font-semibold">Project End Date</h1>
				<input
					type="date"
					bind:value={endsAt}
					class="bg-gray-300 px-2 py-2 w-full rounded-xl mt-2"
				/>
			</div>
		{:else}
			<div>
				<div class="pb-4 flex justify-between items-center">
					<h1 class="font-semibold">Deadline</h1>
					<input type="date" class="bg-gray-300 px-2 py-2 rounded-xl mt-2" bind:value={deadline}>
				</div>
				<div class="flex justify-between">
					<h1 class="font-semibold">Instructions</h1>
					<label>
						<input class="appearance-none" type="checkbox" bind:checked={useVoiceNote} />
						<span class={useVoiceNote ? 'font-semibold border-b-4 border-black' : ''}
							>Use Audio</span
						>
					</label>
				</div>
				{#if useVoiceNote}
					<!-- File input for voice note -->
					<input
						type="file"
						accept="audio/*"
						class="block w-full text-sm text-slate-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-amber-100 file:text-black
                          active:file:bg-violet-100
                          my-3
                        "
						on:change={handleFileChange}
					/>
				{:else}
					<!-- Text input instructions -->
					<textarea
						bind:value={instructionsText}
						class="bg-gray-300 mb-2 px-2 py-2 w-full rounded-xl mt-2 h-32"
					></textarea>
				{/if}
			</div>
			<div class="mt-5">
				{#if imageUrl}
					<div class="items-center">
						<img src={imageUrl} alt="Task" class="max-w-44 rounded-lg" />
						<button
							on:click={takePicture}
							class="mr-5 bg-black text-nowrap text-white px-3 py-2 rounded-full">Edit Image</button
						>
					</div>
				{:else}
					<div class="">
						<button
							on:click={takePicture}
							class="flex justify-between mr-5 w-full bg-gray-200 text-nowrap text-black px-3 py-2 rounded-xl"
							><h1 class="font-semibold">Add Image</h1>
							<Icon icon="uil:image-plus" class="w-7 h-7" /></button
						>
					</div>
				{/if}
			</div>
		{/if}

        {#if selectedType === 'task'}
            <button on:click={create} class="w-full text-end py-3 px-2 text-xl text-green-700"
                    disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Create'}
            </button>
            {:else}
            <button on:click={create} class="w-full text-end py-3 px-2 text-xl text-green-700">
                {isSubmitting ? "Submitting..." : 'Next >'}
            </button>
        {/if}
		
	</div>
</div>

<style>
	.top {
		border-bottom-left-radius: 4rem;
		border-bottom-right-radius: 4rem;
	}
</style>
