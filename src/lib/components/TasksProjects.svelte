<script lang="ts">
    import { page } from '$app/stores';
</script>

<div class="flex gap-3 w-4/6 mx-auto">
    <a 
        href="/protected/projects" 
        class="text-center border-2 py-1 px-2 border-[#645a37] h-10 w-1/2 text-xl font-bold rounded-full {$page.url.pathname === '/protected/projects' ? 'bg-[#d4be76]' : ''}">
        Projects
    </a>
    <a 
        href="/protected/tasks" 
        class="text-center border-2 py-1 px-2 border-[#645a37] h-10 w-1/2 text-xl font-bold rounded-full {$page.url.pathname === '/protected/tasks' ? 'bg-[#d4be76]' : ''}">
        Tasks
    </a>
</div>