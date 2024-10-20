<script lang="ts">
    import { onMount } from "svelte";
    import { page } from '$app/stores';
	import TimeTableInit from "$lib/components/TimeTableInit.svelte";
  
    let project: { title: any; description: any; createdBy: { name: any; }; startsAt: string | number | Date; endsAt: string | number | Date; };
    let projects: any[] = [];
    let isLoading = true; // State variable to control loading
    const loadingMessage = "Time Table"; // Message to display during loading
  
    // Fetch all projects for the logged-in user
    async function fetchProjects() {
      const response = await fetch("/protected/projects");
      if (response.ok) {
        projects = await response.json();
      } else {
        console.error("Failed to fetch projects");
      }
    }
  
    // Function to extract project data from URL
    function getProjectFromUrl() {
      const urlParams = new URLSearchParams(window.location.search);
      const projectData = urlParams.get("project");
      if (projectData) {
        project = JSON.parse(decodeURIComponent(projectData));
      }
    }
  
    // Fetch data on component mount
    onMount(async () => {
      getProjectFromUrl();
      await fetchProjects();
      
      // Simulate delay for loading animation (can be adjusted)
      setTimeout(() => {
        isLoading = false; // Hide loading spinner after delay
      }, 2000); // Adjust time as needed
    });
  </script>
  
  {#if isLoading}
    <TimeTableInit message={loadingMessage} /> <!-- Show the loading message -->
  {:else}
    <div>
      <h1>Timetable Page</h1>
  
      {#if project}
        <h2>Project: {project.title}</h2>
        <p>Description: {project.description}</p>
        <p>Created By: {project.createdBy?.name}</p>
        <p>Start Date: {new Date(project.startsAt).toLocaleDateString()}</p>
        <p>End Date: {new Date(project.endsAt).toLocaleDateString()}</p>
      {/if}
  
      <h3>All Projects Created by You:</h3>
      <ul>
        {#each projects as proj (proj.id)}
          <li>{proj.title}</li>
        {/each}
      </ul>
    </div>
  {/if}
  