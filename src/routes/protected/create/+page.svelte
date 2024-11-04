<script lang="ts">
	import { goto } from '$app/navigation';
	import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';
	import { VoiceRecorder } from 'capacitor-voice-recorder';
	import { fade } from 'svelte/transition';

	let title = '';
	let description = '';
	let startsAt = '';
	let urgency = 'normal';
	let endsAt = '';
	let deadline = '';
	let errorMessage = '';
	let selectedType: 'project' | 'task' = 'project';
	let instructionsText = '';
	let useVoiceNote = false;
	let isSubmitting = false;
	let searchQuery = '';
	let users: any[] = [];
	let selectedUsers: any[] = [];
	let instructions: { type: 'text' | 'audio'; content?: string; path?: string } | null = null;
	let isRecording = false;
	let audioPreviewUrl: string | null = null;

	async function fetchUsers() {
		const response = await fetch('/protected/projects/create');
		if (response.ok) {
			const data = await response.json();
			users = data.allUsers;
		} else {
			console.error('Failed to fetch users');
		}

		console.log('Users: ', users);
	}

	onMount(fetchUsers);

	function addUser(user: any) {
		if (!selectedUsers.includes(user)) {
			selectedUsers = [...selectedUsers, user];
		}
		searchQuery = '';
	}

	function removeUser(user: any) {
		selectedUsers = selectedUsers.filter((u) => u !== user);
	}

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

		const selectedUserIds = selectedUsers.map((user) => user.id);

		const formData = new FormData();
		formData.append('title', title);
		formData.append('description', description);
		formData.append('deadline', deadline);
		formData.append('startsAt', startsAt);
		formData.append('endsAt', endsAt);
		formData.append('urgency', urgency);
		formData.append('users', JSON.stringify(selectedUserIds));
		if (useVoiceNote && instructions && instructions.type == 'audio' && instructions.path) {
			formData.append('instructions', JSON.stringify(instructions));
		} else if (!useVoiceNote && instructionsText) {
			instructions = {
				type: 'text',
				content: instructionsText
			};
			alert('instructions text: ' + instructions)
			formData.append('instructions', JSON.stringify(instructions));
		}

		const endpoint =
			selectedType === 'task' ? '/protected/tasks/create' : '/protected/projects/create';

		try {
			const response = await fetch(endpoint, {
				method: 'POST',
				body: formData
			});
			if (response.ok) {
				const data = await response.json();
				const projectId = data.id;
				goto(
					selectedType === 'task'
						? '/protected/tasks'
						: `/protected/create/projectTasks-${projectId}`
				);
			} else {
				const error = await response.json();
				errorMessage = error.message || `${selectedType} creation failed`;
			}
		} catch (error) {
			errorMessage = `An error occurred: ${errorMessage}`;
		} finally {
			isSubmitting = false;
		}
	}

	//function handleFileChange(e: Event) {
	//	const target = e.target as HTMLInputElement;
	//	if (target.files && target.files.length > 0) {
	//		instructionsAudio = target.files[0];
	//	}
	//}

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
	<div class="px-8 pt-10 bg-[#D9D9D9] top dark:bg-[#252525]">
		<h1 class="px-5 text-4xl font-bold">Create...</h1>
		<div class="flex flex-col gap-3 pt-4 pb-6">
			<button
				class="flex justify-between w-full px-3 h-14 bg-[#E1CA7D] dark:bg-[#E1CA7D] dark:text-black items-center rounded-full
            {selectedType === 'project' ? 'border-gray-700 border-4' : ''}"
				on:click={() => (selectedType = 'project')}
				disabled={isSubmitting}
			>
				<h1 class="font-semibold text-xl">Project</h1>
				<p class="font-semibold text-sm">You fully manage</p>
			</button>

			<button
				class="flex justify-between w-full px-3 h-14 bg-[#E1CA7D] dark:bg-[#E1CA7D] dark:text-black items-center rounded-full
            {selectedType === 'task' ? 'border-[#545454] border-4' : ''}"
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
			<input
				type="text"
				class="border-2 border-black px-2 py-2 w-full rounded-xl mt-2 dark:bg-[#151515]"
				bind:value={title}
			/>
		</div>
		<div class="pb-4">
			<h1 class="font-semibold">Description</h1>
			<textarea
				class="border-2 border-black px-2 py-2 w-full rounded-xl mt-2 h-32 dark:bg-[#151515]"
				bind:value={description}
			></textarea>
		</div>
		{#if selectedType === 'project'}
			<div class="pb-4">
				<h1 class="font-semibold">Project Start Date</h1>
				<input
					type="date"
					bind:value={startsAt}
					class="border-2 border-black px-2 py-2 w-full rounded-xl mt-2 dark:bg-[#151515]"
				/>
			</div>
			<div class="pb-4">
				<h1 class="font-semibold">Project End Date</h1>
				<input
					type="date"
					bind:value={endsAt}
					class="border-2 border-black px-2 py-2 w-full rounded-xl mt-2 dark:bg-[#151515]"
				/>
			</div>
			<div>
				<h1>Participants</h1>
				<input
					type="text"
					placeholder="Search for users..."
					bind:value={searchQuery}
					on:input={fetchUsers}
					class="px-2 py-2 w-full rounded-xl mt-2 border-2 border-black dark:bg-[#151515]"
				/>

				{#if searchQuery.length > 0}
					<ul class="bg-gray-100 dark:bg-stone-700 mt-2 rounded-lg max-h-60 overflow-y-auto">
						{#each users.filter((user) => user.name
								.toLowerCase()
								.includes(searchQuery.toLowerCase())) as user (user.id)}
							<li class="px-3 py-2 flex justify-between items-center">
								<button on:click={() => addUser(user)} class="flex w-full gap-3 items-center">
									<img src={user.image} alt="" class="w-8 rounded-full" />
									<p>{user.name}</p>
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
			{#if selectedUsers.length > 0}
				<div class="mt-3">
					<ul class="border-2 border-[#ffe48d] px-3 py-2 my-2 rounded-2xl overflow-auto">
						{#each selectedUsers as user}
							<li class="px-2 py-2 flex justify-between items-center">
								<div class="flex gap-3 items-center">
									<img src={user.image} alt="" class="w-8 rounded-full" />
									<p>{user.name}</p>
								</div>
								<button on:click={() => removeUser(user)} class="text-red-500 font-bold text-2xl">
									&times
								</button>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		{:else}
			<div>
				<div class="pb-4 flex justify-between items-center">
					<h1 class="font-semibold">Deadline</h1>
					<input
						type="date"
						class="border-2 border-black px-2 py-2 rounded-xl mt-2 dark:bg-[#151515]"
						bind:value={deadline}
					/>
				</div>
				<div class="flex justify-between {useVoiceNote && 'mb-3'}">
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
		{/if}

		<div class="w-full text-end">
			{#if selectedType === 'task'}
				<button
					on:click={create}
					class="text-end py-3 px-2 text-xl text-green-700"
					disabled={isSubmitting}
				>
					{isSubmitting ? 'Submitting...' : 'Create'}
				</button>
			{:else}
				<button on:click={create} class="text-end py-3 px-2 text-xl text-green-700">
					{isSubmitting ? 'Submitting...' : 'Next >'}
				</button>
			{/if}
		</div>
	</div>
</div>

<style>
	.top {
		border-bottom-left-radius: 4rem;
		border-bottom-right-radius: 4rem;
	}
</style>
