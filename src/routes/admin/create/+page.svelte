<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';
	import { VoiceRecorder } from 'capacitor-voice-recorder';
	import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

	let title = '';
	let description = '';
	let startsAt = '';
	let urgency = 'normal';
	let endsAt = '';
	let deadline = '';
	let errorMessage = '';
	let selectedType: 'project' | 'task' = 'project';
	let instructionsText = '';
	let isSubmitting = false;
	let isPeriod = false;
	let searchQuery = '';
	let users: any[] = [];
	let user: any;
	let selectedUsers: any[] = [];
	let instructions: { type: 'text'; content?: string; } | null = null;
	let displayModal = false;

	async function fetchUsers() {
		const response = await fetch('/protected/projects/create');
		if (response.ok) {
			const data = await response.json();
			users = data.allUsers;
			user = data.user;
		} else {
			console.error('Failed to fetch users');
		}
	}

	onMount(fetchUsers);

	function addUser(user: any) {
		if (!selectedUsers.some((selectedUser) => selectedUser.id === user.id)) {
			selectedUsers = [...selectedUsers, user]; // Add the user if not already selected
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

		if (selectedType === 'project') {
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

			if (!startsAt || !endsAt) {
				errorMessage = 'Start and end dates are required for a project!';
				isSubmitting = false;
				return;
			}
			if (new Date(startsAt) >= new Date(endsAt)) {
				errorMessage = 'Start date must be before end date!';
				isSubmitting = false;
				return;
			}
			if (new Date(startsAt) < new Date()) {
				errorMessage = 'Start date must be a future date!';
				isSubmitting = false;
				return;
			}
		}

		if (selectedType === 'task') {
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
		}

		const selectedUserIds = selectedUsers.map((user) => user.id);

		const formData = new FormData();
        if (selectedType === 'project') {
            let type = 'Project';
            formData.append('type', type)
        } else {
            let type = 'Task';
            formData.append('type', type)
        }
		formData.append('title', title);
		formData.append('description', description);
		formData.append('deadline', deadline);
		formData.append('startsAt', startsAt);
		formData.append('endsAt', endsAt);
		formData.append('urgency', urgency);
		formData.append('users', JSON.stringify(selectedUserIds));
		instructions = {
			type: 'text',
			content: instructionsText
		};
		formData.append('instructions', JSON.stringify(instructions));

		try {
			const response = await fetch('/admin/create', {
				method: 'POST',
				body: formData
			});
			if (response.ok) {
				const data = await response.json();
				goto(
					selectedType === 'task'
						? `/admin/tasks/${data.id}`
						: `/admin/projects/${data.id}`
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
</script>

<div class="py-14 w-3/5 mx-auto">
	<div class="px-8 pb-4">
		<h1 class="px-5 pb-2 text-3xl font-bold">CREATE...</h1>
		<div class="flex gap-3 mx-auto px-3">
			<button
				class="flex justify-center w-full px-3 h-14 bg-[#E1CA7D] dark:bg-[#E1CA7D] dark:text-black items-center rounded-full
            {selectedType === 'project' ? 'border-gray-700 border-4' : ''}"
				on:click={() => (selectedType = 'project')}
				disabled={isSubmitting}
			>
				<h1 class="font-semibold text-xl">Project</h1>
			</button>

			<button
				class="flex justify-center w-full px-3 h-14 bg-[#E1CA7D] dark:bg-[#E1CA7D] dark:text-black items-center rounded-full
            {selectedType === 'task' ? 'border-[#545454] border-4' : ''}"
				on:click={() => (selectedType = 'task')}
				disabled={isSubmitting}
			>
				<h1 class="font-semibold text-xl">Task</h1></button
			>
		</div>
	</div>
	<div class="px-20">
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
									{#if user.image}
										<img src={user.image} alt="" class="w-8 h-8 rounded-full" />
									{:else}
										<Icon
											icon="mingcute:user-3-line"
											class="w-8 h-8 border-4 border-black rounded-full px-1 bg-[#D9D9D9] dark:bg-[#252525]"
										/>
									{/if}
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
									{#if user.image}
										<img src={user.image} alt="" class="w-8 h-8 rounded-full" />
									{:else}
										<Icon
											icon="mingcute:user-3-line"
											class="w-8 h-8 border-4 border-black rounded-full px-1 bg-[#D9D9D9] dark:bg-[#252525]"
										/>
									{/if}

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
				<div class="pb-4 items-center">
					<div class="flex justify-between items-center">
						<h1 class="font-semibold">{isPeriod ? 'Specify a Period' : 'Deadline'}</h1>
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
				<div class="flex justify-between">
					<h1 class="font-semibold">Instructions</h1>
				</div>

					<textarea
						class="border-2 border-black px-2 py-2 w-full rounded-xl mt-2 h-24 dark:bg-[#151515]"
						bind:value={instructionsText}
						placeholder="Enter instructions..."
					></textarea>

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
		{/if}

		<div class="w-full text-end mt-3">
			{#if selectedType === 'task'}
				<button
					on:click={create}
					class="text-end py-2 px-6 text-xl rounded-full text-white bg-green-500 dark:bg-green-700 hover:bg-green-600 dark:hover:bg-green-800"
					disabled={isSubmitting}
				>
					{isSubmitting ? 'Submitting...' : 'Create'}
				</button>
			{:else}
				<button on:click={create} class="text-end py-2 px-6 text-xl {isSubmitting ? "text-green-700" : "rounded-full text-white dark:bg-green-700 bg-green-500 hover:bg-green-600 dark:hover:bg-green-800 active:bg-green-600 dark:active:bg-green-800"}">
					{isSubmitting ? 'Submitting...' : 'Next >'}
				</button>
			{/if}
		</div>
	</div>
</div>
