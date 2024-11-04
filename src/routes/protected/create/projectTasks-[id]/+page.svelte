<script lang="ts">
	import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { VoiceRecorder } from 'capacitor-voice-recorder';

	let title = '';
	let description = '';
	let imageUrl = '';
	let instructionsText = '';
	let instructions: { type: 'text' | 'audio'; content?: string; path?: string } | null = null;
	let isRecording = false;
	let audioPreviewUrl: string | null = null;
	let urgency = "normal";
    let deadline = '';
	let tasks: any[] = [];
	let useVoiceNote = false;
	let errorMessage = '';
	let isSubmitting = false;
	let project: { title: any } | null = null;

	const projectId = $page.params.id;

	onMount(async () => {
		try {
			const res = await fetch(`/protected/create/projectTasks-${projectId}`);
			if (!res.ok) throw new Error(`Failed to fetch project id: ${res.status} ${res.statusText}`);

			project = await res.json();
			console.log('project details:', project);
		} catch (error) {
			console.error('Error fetching project:', error);
		}
	});

	function addTask() {
		if (!title || !description || !deadline) {
			errorMessage = 'Title and Desctiption and deadline are required!';
			return;
		}

		let finalInstructions = null;
		if (useVoiceNote && audioPreviewUrl) {
			finalInstructions = {
				type: 'audio',
                path: audioPreviewUrl
			};
		} else if (instructionsText) {
			finalInstructions = {
				type: 'text',
                content: instructionsText
			}
		}

		tasks = [
			...tasks, 
			{ 
				title: title, 
				description: description, 
				urgency: urgency, 
				deadline: deadline, 
				imageUrl: imageUrl, 
				instructions: finalInstructions
			}
		];
		console.log('Tasks', tasks);
		title = '';
		description = '';
		urgency = "normal";
		deadline = '';
		instructions = null;
		instructionsText = '';
		useVoiceNote = false;
		isRecording = false;
		audioPreviewUrl = null;
		errorMessage = '';
	}

	async function saveTasks() {
		isSubmitting = true;

		if (tasks.length === 0) {
			errorMessage = 'No tasks to save!';
            isSubmitting = false;
            return;
		}
		
		const tasksToSave = tasks.map((task) => ({
			title: task.title,
			description: task.description,
			imageUrl: task.imageUrl,
			instructions: task.instructions,
			deadline: task.deadline,
			urgency: task.urgency,
		}));

		console.log("tasks to save: ", tasksToSave);

		const requestData = {
			tasks: tasksToSave,
			projectId
		};

		const response = await fetch(`/protected/create/projectTasks-${projectId}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(requestData)
		});

		const result = await response.json();
		if (response.ok) {
			console.log(result.message);
			isSubmitting = false;
			errorMessage = '';
			goto(`/protected/projects/${projectId}`);
		} else {
			errorMessage = 'Could not save the tasks you added';
			console.error(result.message);
		}
	}

	console.log(tasks);

	function removeTask(index: number) {
		tasks = tasks.filter((_, i) => i !== index);
		console.log(tasks);
	}

	function goBack() {
		window.history.back(); // Navigates to the previous URL in the history stack
	}

	async function startRecording() {
		try {
			const canRecord = await VoiceRecorder.canDeviceVoiceRecord();
			if (!canRecord.value) {
				console.error('Device cannot record audio');
				return;
			}

			const permission = await VoiceRecorder.requestAudioRecordingPermission();
			if (!permission.value) {
				console.error('Permission to record audio denied');
				return;
			}

			const result = await VoiceRecorder.startRecording();
			console.log('Recording started: ', result.value);
			isRecording = true;
		} catch (error) {
			console.error('Error starting recording: ', error);
		}
	}

	async function stopRecording() {
		try {
			const result = await VoiceRecorder.stopRecording();
			console.log('Recording stopped: ', result.value);
			const audioData = result.value.recordDataBase64;

			instructions = {
				type: 'audio',
				path: audioData
			};
			audioPreviewUrl = `data:audio/wav;base64,${audioData}`;
			isRecording = false;
		} catch (error) {
			console.error('Error stopping recording: ', error);
		}
	}

	function removeAudio() {
		instructions = null;
		audioPreviewUrl = null;
	}

	function toggleRecording() {
		if (isRecording) {
			stopRecording();
		} else {
			startRecording();
		}

		console.log('Recording: ', isRecording);
	}
</script>

<div class="mb-20">
	<div class="px-8 py-10 bg-[#D9D9D9] top dark:bg-[#252525]">
		<div class="flex justify-between">
			<button on:click|preventDefault={goBack} class="py-2 px-3">
				<Icon icon="fluent:ios-arrow-24-filled" class="w-7 h-7" />
			</button>
			<h1 class="px-5 text-3xl font-bold">{project?.title}</h1>
		</div>
	</div>
	<div class="h-screen py-5">
		<h1 class="font-semibold text-2xl mx-10 my-2">Tasks</h1>

		{#if errorMessage}
			<div class="w-4/6 mx-auto bg-red-500 rounded-xl text-left px-3 py-2">
				<p class="text-white">{errorMessage}</p>
			</div>
		{/if}

		{#if tasks.length > 0}
			{#each tasks as task, index}
				<div
					class="bg-gray-100 dark:bg-[#151515] w-5/6 mx-auto px-4 py-4 rounded-3xl flex justify-between items-center mb-3"
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

		<div class="bg-gray-100 dark:bg-[#252525] w-5/6 mx-auto px-4 py-4 rounded-3xl">
			<div class="pb-4">
				<h1 class="font-semibold">Title</h1>
				<input
					type="text"
					class="bg-gray-200 px-2 py-2 w-full rounded-xl mt-2 border-2 border-black dark:bg-[#151515]"
					bind:value={title}
				/>
			</div>
			<div class="pb-4">
				<h1 class="font-semibold">Description</h1>
				<textarea class="bg-gray-200 px-2 py-2 w-full rounded-xl mt-2 h-32 border-2 border-black dark:bg-[#151515]" bind:value={description}
				></textarea>
			</div>
            <div class="pb-4 flex justify-between items-center">
				<h1 class="font-semibold">Deadline</h1>
				<input type="date" class="bg-gray-200 px-2 py-2 rounded-xl mt-2 border-2 border-black dark:bg-[#151515]" bind:value={deadline}>
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
					{#if !audioPreviewUrl}
						<div class="flex gap-2 pb-4">
							<button
								on:click={toggleRecording}
								class="mt-2 items-center flex gap-3 text-left border-2 rounded-3xl border-black/50 py-2 p-3"
							>
								<Icon
									icon="pepicons-pop:microphone-circle-filled"
									class="w-20 h-20 {isRecording ? 'text-[#615736]' : 'text-[#d4be76] '}"
								/>
								<p class="right-0 opacity-60 text-[#d4be76] text-sm">
									Click to record and click again to stop recording!
								</p>
							</button>
						</div>
					{:else}
						<div class="flex gap-3 items-center mt-3 pb-4">
							<audio controls>
								<source src={audioPreviewUrl} type="audio/wav" />
								Your browser does not support the audio element.
							</audio>
							<button class="text-3xl text-red-500" on:click={removeAudio}>&times</button>
						</div>
					{/if}
				{:else}
					<textarea
						class="border-2 border-black px-2 py-2 w-full rounded-xl mt-2 h-24 dark:bg-[#151515]"
						bind:value={instructionsText}
						placeholder="Enter instructions..."
					></textarea>
				{/if}
			</div>
			<div>
				<h1 class="font-semibold">Urgency</h1>
				<select bind:value={urgency} class="w-full py-2 px-2 mt-2 border-2 border-black rounded-xl dark:bg-[#151515]">
					<option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
					<option value="very urgent">Very Urgent</option>
				</select>
			</div>
		</div>
		<div class="flex justify-end px-10 flex-col">
			<button on:click={addTask} class="w-full text-end py-3 px-2 text-xl text-green-700">
				Add a Task
			</button>
		</div>
		{#if tasks.length > 0}
			<div class="flex justify-center">
				<button
					on:click={saveTasks}
					class="bg-green-400 dark:bg-green-600 px-4 py-2 rounded-xl font-semibold text-white">
					{isSubmitting ? 'Saving...' : 'Save Tasks'}
				</button>
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
