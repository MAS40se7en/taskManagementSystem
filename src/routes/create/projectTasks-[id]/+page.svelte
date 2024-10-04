<script lang="ts">
	import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let title = '';
	let description = '';
	let imageUrl = '';
	let instructionsText = '';
	let instructionsAudio: File | null = null;
    let deadline = '';
	let tasks: any[] = [];
	let useVoiceNote = false;
	let errorMessage = '';
	let isSubmitting = false;
	let project: { title: any } | null = null;

	const projectId = $page.params.id;

	onMount(async () => {
		try {
			const res = await fetch(`/create/projectTasks-${projectId}`);
			if (!res.ok) throw new Error(`Failed to fetch project id: ${res.status} ${res.statusText}`);

			project = await res.json();
			console.log('project details:', project);
		} catch (error) {
			console.error('Error fetching project:', error);
		}
	});

	async function addTaskLater() {
		goto(`/projects/${projectId}`);
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

	function addTask() {
		if (!title || !description) {
			errorMessage = 'Title and Desctiption are required!';
			return;
		}

		tasks = [...tasks, { title: title, description: description }];
		console.log('Tasks', tasks);
		title = '';
		description = '';
	}

	async function saveTasks() {
		const tasksToSave = tasks.map((task) => ({
			title: task.title,
			description: task.description,
			imageUrl: task.imageUrl,
			instructions: task.instructions
		}));

		const requestData = {
			tasks: tasksToSave,
			projectId
		};

		const response = await fetch(`/create/projectTasks-${projectId}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(requestData)
		});

		const result = await response.json();
		if (response.ok) {
			console.log(result.message);
			goto(`/projects/${projectId}`);
		} else {
			console.error(result.message);
		}
	}

	console.log(tasks);

	function removeTask(index: number) {
		tasks = tasks.filter((_, i) => i !== index);
		console.log(tasks);
	}
</script>

<div class="mb-20">
	<div class="px-8 pt-10 bg-gray-200 top">
		<div class="flex justify-between">
			<a href="/" class="py-2 px-3">
				<Icon icon="fluent:ios-arrow-24-filled" class="w-7 h-7" />
			</a>
			<h1 class="px-5 text-3xl font-bold">{project?.title}</h1>
		</div>
		<div class="flex gap-3 pt-4 pb-6">
			<button
				on:click={addTaskLater}
				class="flex justify-between w-full px-3 h-14 font-semibold text-xl bg-amber-200 items-center rounded-full"
			>
				Add tasks later?
			</button>
		</div>
	</div>
	<div class="h-screen py-5">
		<h1 class="font-semibold text-2xl mx-10 my-2">Tasks</h1>

		{#if tasks.length > 0}
			{#each tasks as task, index}
				<div
					class="bg-gray-100 w-5/6 mx-auto px-4 py-4 rounded-3xl flex justify-between items-center mb-3"
				>
					<div>
						<h2 class="font-semibold text-xl">{task.title}</h2>
					</div>
					<button on:click={() => removeTask(index)} class="text-red-500 font-bold text-2xl">
						&times;
					</button>
				</div>
			{/each}
		{:else}
			<div class="flex justify-center py-5">
				<p class="">No tasks added!</p>
			</div>
		{/if}

		<div class="bg-gray-100 w-5/6 mx-auto px-4 py-4 rounded-3xl">
			<div class="pb-4">
				<h1 class="font-semibold">Title</h1>
				<input
					type="text"
					class="bg-gray-300 px-2 py-2 w-full rounded-xl mt-2"
					bind:value={title}
				/>
			</div>
			<div class="pb-4">
				<h1 class="font-semibold">Description</h1>
				<textarea class="bg-gray-300 px-2 py-2 w-full rounded-xl mt-2 h-32" bind:value={description}
				></textarea>
			</div>
            <div class="pb-4 flex justify-between items-center">
				<h1 class="font-semibold">Deadline</h1>
				<input type="date" class="bg-gray-300 px-2 py-2 rounded-xl mt-2" bind:value={deadline}>
			</div>
			<div>
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
		</div>
		{#if errorMessage}
			<div>
				<p class="text-red-600 text-center mt-5">
					{errorMessage}
				</p>
			</div>
		{/if}
		<div class="flex justify-end px-10 flex-col">
			<button on:click={addTask} class="w-full text-end py-3 px-2 text-xl text-green-700">
				Add a Task
			</button>
		</div>
		{#if tasks.length > 0}
			<div class="flex justify-center">
				<button
					on:click={saveTasks}
					class="bg-green-400 px-4 py-2 rounded-xl font-semibold text-white">Save Tasks</button
				>
			</div>
		{/if}
	</div>
</div>

<style>
	.top {
		border-bottom-left-radius: 4rem;
		border-bottom-right-radius: 4rem;
	}
</style>
