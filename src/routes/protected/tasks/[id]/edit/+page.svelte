<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Icon from '@iconify/svelte';
	import { VoiceRecorder } from 'capacitor-voice-recorder';
	import { onMount } from 'svelte';

	const taskId = $page.params.id;

	type Task = {
		title: any;
		description: any;
		deadline?: any;
		startsAt?: any;
		endsAt?: any;
		instructions: {
			type: 'audio' | 'text';
			path?: string;
			content?: string;
		} | null;
		urgency: any;
		completed: any;
		createdBy: { id: string; name: string };
	} | null;

	let task: Task;
	let user: any;

	let title: any;
	let description: any;
	let deadline: any | null = null;
	let startsAt: any | null = null;
	let endsAt: any | null = null;
	let urgency: any;
	let instructionsText = '';
	let instructions: { type: 'text' | 'audio'; content?: string; path?: string } | null = null;
	let isRecording = false;
	let audioPreviewUrl: string | null = null;

	let isPeriod = false;
	let useVoiceNote = false;
	let errorMessage = '';
	let isSubmitting = false;
	let loading = true;

	onMount(async () => {
		const response = await fetch(`/protected/tasks/${taskId}/edit`);

		const data = await response.json();

		if (response.ok) {
			task = data.task;
			user = data.user;
			if (task) {
				title = task.title;
				description = task.description;
				deadline = task.deadline ? new Date(task.deadline).toISOString().slice(0, 10) : null;
				startsAt = task.startsAt ? new Date(task.startsAt).toISOString().slice(0, 10) : null;
				endsAt = task.endsAt ? new Date(task.endsAt).toISOString().slice(0, 10) : null;
				urgency = task.urgency;
				instructions = task.instructions || { type: 'text', content: '' };

				if (instructions.type === 'audio' && instructions.path) {
					audioPreviewUrl = instructions.path;
				} else if (instructions.type === 'text' && instructions.content) {
					instructionsText = instructions.content;
					console.log('instructions: ', instructionsText);
				}

				if (startsAt && endsAt) {
					isPeriod = true;
				}
			}
			loading = false;

			if (!user?.isVerified) {
				alert('please verify your email to use the application');

				const url = new URL(`/auth/register/verify-email/`, window.location.origin);
				url.searchParams.append('userId', user?.id);

				goto(url.toString());
			}
		} else {
			console.error('Error fetching task data:', response.status, response.statusText);
			errorMessage = `Failed to load task. Please try again.`;
		}
	});

	function goBack() {
		window.history.back();
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
			isRecording = true;
		} catch (error) {
			console.error('Error starting recording: ', error);
		}
	}

	async function stopRecording() {
		try {
			const result = await VoiceRecorder.stopRecording();
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
	}

	async function updateTask() {
		isSubmitting = true;
		errorMessage = '';

		if (!title || !description) {
			errorMessage = 'Missing important fields!';
			isSubmitting = false;
			return;
		}

		if (title.length < 3 || title.length > 50) {
			errorMessage = 'Title must be between 3 and 50 characters!';
			isSubmitting = false;
			return;
		}

		if (description.length > 500) {
			errorMessage = 'Description must be less than 500 characters!';
			isSubmitting = false;
			return;
		}

		if (!deadline && !isPeriod) {
			errorMessage = 'A deadline or a period of time is required for a task!';
			isSubmitting = false;
			return;
		}

		if (isPeriod) {
			if (!startsAt || !endsAt) {
				errorMessage = 'Start and end dates are required for a period!';
				isSubmitting = false;
				return;
			}

			if (new Date(startsAt) >= new Date(endsAt)) {
				errorMessage = 'Start date must be before end date!';
				isSubmitting = false;
				return;
			}
		} else if (new Date(deadline) < new Date()) {
			errorMessage = 'The deadline must be a future date.';
			isSubmitting = false;
			return;
		}

		if (!instructions && !instructionsText) {
			errorMessage = 'Instructions required!';
			isSubmitting = false;
			return;
		}

		try {

            const formData = new FormData();
            formData.append('taskId', taskId);
		formData.append('title', title);
		formData.append('description', description);
		formData.append('deadline', isPeriod ? '' : deadline);
		formData.append('startsAt', isPeriod ? startsAt : '');
		formData.append('endsAt', isPeriod ? endsAt : '');
		formData.append('urgency', urgency);
		if (useVoiceNote &&  instructions?.type == 'audio' && instructions?.path) {
			formData.append('instructions', JSON.stringify(instructions));
		} else if (!useVoiceNote && instructionsText) {
			instructions = {
				type: 'text',
				content: instructionsText
			};
			alert('instructions text: ' + instructions);
			formData.append('instructions', JSON.stringify(instructions));
		}

			const response = await fetch(`/protected/tasks/${taskId}/edit`, {
				method: 'POST',
				body: formData
			});

			const data = await response.json();

			if (response.ok) {
				errorMessage = '';
				const newTask = data.newTask;
                goto(`/protected/tasks/${taskId}`);
			} else {
				errorMessage = data.message;
			}
		} catch (error) {
			console.error(error);
			errorMessage = 'Could not update task!';
		}
	}
</script>

<div class="h-screen">
	<div class="flex items-center px-10 py-5 gap-2">
		<button on:click|preventDefault={goBack} class="py-2 px-3">
			<Icon icon="fluent:ios-arrow-24-filled" class="w-7 h-7" />
		</button>
		<div>
			<h1 class="text-3xl font-bold">Edit Task</h1>
			<p class="text-lg border-2 rounded-full w-fit px-3">
				{#if loading}
				<Icon icon="eos-icons:loading" width="24" height="24" />
				{:else}
				{task?.title}
				{/if}
			</p>
		</div>
	</div>

	<div class="px-10 pty-10 flex flex-col gap-5">
		{#if errorMessage}
			<div class="w-4/6 bg-red-600 px-3 py-2 rounded-xl">
				<p class="font-semibold text-white">{errorMessage}</p>
			</div>
		{/if}
		<div class="flex flex-col gap-2">
			<label for="title" class="font-semibold">Title</label>
			<input
				type="text"
				bind:value={title}
				class="bg-[#D9D9D9] px-3 dark:bg-[#151515] h-10 rounded-lg"
			/>
		</div>
		<div class="flex flex-col gap-2">
			<label for="description" class="font-semibold">Description</label>
			<textarea
				bind:value={description}
				class="bg-[#D9D9D9] dark:bg-[#151515] px-3 py-2 min-h-24 rounded-xl"
			></textarea>
		</div>
		<div>
			<div class="pb-4 items-center">
				<div class="flex justify-between items-center">
					<h1 class="font-semibold">{isPeriod ? 'Specify a Period' : 'Deadline'}</h1>
					<div>
						<label>
							<input class="appearance-none" type="checkbox" bind:checked={isPeriod} />
							<span class={isPeriod ? 'font-semibold border-b-4 border-black' : ''}>
								Use Period
							</span>
						</label>
					</div>
				</div>
				{#if isPeriod}
					<div class="grid grid-cols-2 mx-auto gap-x-4 text-center py-2">
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
				{:else}
					<input
						type="date"
						class="bg-gray-200 px-2 py-2 rounded-xl mt-2 border-2 border-black dark:bg-[#151515]"
						bind:value={deadline}
					/>
				{/if}
			</div>
			<div class="flex justify-between {useVoiceNote && 'mb-3'}">
				<h1 class="font-semibold">Instructions</h1>
				<label>
					<input class="appearance-none" type="checkbox" bind:checked={useVoiceNote} />
					<span class={useVoiceNote ? 'font-semibold border-b-4 border-black' : ''}>Use Audio</span>
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
			<select
				bind:value={urgency}
				class="w-full py-2 px-2 mt-2 border-2 border-black rounded-xl dark:bg-[#151515]"
			>
				<option value="normal">Normal</option>
				<option value="important">Important</option>
				<option value="urgent">Urgent</option>
				<option value="very urgent">Very Urgent</option>
			</select>
		</div>
	</div>
	<div class="px-10 py-5 flex justify-end">
		{#if isSubmitting}
            <p class="text-green-400">Submitting...</p>
            {:else}
            <button class="bg-blue-400 text-white font-semibold px-3 py-2 rounded-xl" on:click={updateTask}
			>Update Task</button
		>
        {/if}
	</div>
</div>
