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
  
  <div class="flex flex-col items-center py-10">
    <h1 class="text-3xl font-bold mb-5">Time Table</h1>
    
    <div class="relative">
        <div class="border-l-2 border-gray-300 h-full absolute left-1/2 transform -translate-x-1/2"></div>
        
        <div class="flex flex-col">
            {#each projects as project}
                <div class="flex justify-between items-center mb-8 relative">
                    <div class="absolute w-4 h-4 bg-blue-500 rounded-full left-1/2 transform -translate-x-1/2" />
                    <div class="flex items-center w-1/2 ml-4">
                        <h2 class="text-xl font-semibold">{project.title}</h2>
                        <span class="ml-4 text-gray-600">
                            {new Date(project.startsAt).toLocaleDateString()} - 
                            {new Date(project.endsAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            {/each}
        </div>
    </div>
</div>
  