<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	type Project= {
		title: any;
		startsAt: any;
		endsAt: any;
		description: any;
	} | null;
	let user: any;

	let errorMessage = '';

	const projectId = $page.params.id;

	let project: Project;
	let title: any;
	let description: any;
	let startsAt: any | null = null;
	let endsAt: any | null = null;
	let isSubmitting = false;

	onMount(async () => {
		const response = await fetch(`/protected/projects/${projectId}/edit`);

		const data = await response.json();

		if (response.ok) {
			project = data.project;
			user = data.user;
			errorMessage = '';
			if (project) {
				title = project.title;
				description = project.description;
				startsAt = project.startsAt ? new Date(project.startsAt).toISOString().slice(0, 10) : null;
				endsAt = project.endsAt ? new Date(project.endsAt).toISOString().slice(0, 10) : null;
			}

            if (!user?.isVerified) {
				alert('please verify your email to use the application');

				const url = new URL(`/auth/register/verify-email/`, window.location.origin);
				url.searchParams.append('userId', user?.id);

				goto(url.toString());
			}
		} else {
			console.log(data.message);
			errorMessage = data.message;
		}
	});

	function goBack() {
		window.history.back(); // Navigates to the previous URL in the history stack
	}

	async function updateProject() {
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

		try {
			const formData = new FormData();
			formData.append('projectId', projectId);
			formData.append('title', title);
			formData.append('description', description);
			formData.append('startsAt', startsAt);
			formData.append('endsAt', endsAt);

			const response = await fetch(`/protected/projects/${projectId}/edit`, {
				method: 'POST',
				body: formData
			});

			const data = await response.json();

			if (response.ok) {
				errorMessage = '';
				const newProject = data.newProject;
				console.log(newProject);
				goto(`/protected/projects/${projectId}`);
			} else {
				errorMessage = data.message;
			}
		} catch (error) {
			console.error(error);
			errorMessage = 'Could not update Project!';
		}
	}
</script>

<div class="h-screen">
	<div class="flex items-center px-10 py-5 gap-2">
		<button on:click|preventDefault={goBack} class="py-2 px-3">
			<Icon icon="fluent:ios-arrow-24-filled" class="w-7 h-7" />
		</button>
		<div>
			<h1 class="text-3xl font-bold">Edit Project</h1>
			<p class="text-lg border-2 px-1 rounded-full w-fit">{project?.title}</p>
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
	</div>
    <div class="px-10 py-5 flex justify-end">
        {#if isSubmitting}
            <p class="text-green-400">Submitting...</p>
        {:else}
            <button
                class="bg-blue-400 text-white font-semibold px-3 py-2 rounded-xl"
                on:click={updateProject}>Update Project</button
            >
        {/if}
    </div>
</div>

