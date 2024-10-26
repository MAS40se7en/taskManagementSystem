<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';

    let projects: any[] = [];
    let selectedProject = {
        title: '',
        startsAt: '',
        endsAt: '',
        description: ''
    };

    let isZoomedIn = false; // Track zoom state
let selectedMonth: number; // Store currently selected month

function zoomIn(month: number) {
    selectedMonth = month; // Update selected month
    isZoomedIn = true; // Set zoom state
}

    const projectId = $page.params.projectId;

    onMount(async () => {
        // Fetch the selected project data from the URL
        const params = new URLSearchParams(window.location.search);
        selectedProject.title = params.get('title') || '';
        selectedProject.startsAt = params.get('startsAt') || '';
        selectedProject.endsAt = params.get('endsAt') || '';
        selectedProject.description = params.get('description') || '';

        // Fetch all projects for the logged-in user
        const response = await fetch('/protected/projects');
        if (response.ok) {
            projects = await response.json();
        } else {
            console.error('Failed to fetch projects:', response.status);
        }
    });
</script>

<div>
    <h1 class="text-2xl font-bold">Timetable</h1>

    <div class="my-4">
        <h2 class="text-xl">Selected Project:</h2>
        <p><strong>Title:</strong> {selectedProject.title}</p>
        <p><strong>Description:</strong> {selectedProject.description}</p>
        <p><strong>Start Date:</strong> {new Date(selectedProject.startsAt).toLocaleDateString()}</p>
        <p><strong>End Date:</strong> {new Date(selectedProject.endsAt).toLocaleDateString()}</p>
    </div>

    <div class="relative">
        <div class="absolute border-l-2 border-gray-300 h-full left-5"></div>
        <div class="flex flex-col">
            {#each projects as project}
                {#if new Date(project.startsAt).getMonth() === selectedMonth} <!-- Replace selectedMonth with actual logic -->
                    <div class="flex justify-between items-center">
                        <span class="text-gray-600">{new Date(project.startsAt).toLocaleDateString('en-US', { month: 'long' })}</span>
                        <div class="bg-blue-200 p-2 rounded-md">
                            <p>{project.title}</p>
                        </div>
                    </div>
                {/if}
            {/each}
        </div>
    </div>
</div>
