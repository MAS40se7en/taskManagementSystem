<script lang="ts">
    import { page } from '$app/stores';
</script>

<div class="flex gap-3 w-4/6 mx-auto pt-3 opacity-65">
    <a 
        href="/protected/projects" 
        class="text-center h-10 w-1/2 text-xl font-bold rounded-full {$page.url.pathname === '/protected/projects' ? 'text-[#d4be76]' : ''}">
        Projects
    </a>
    <a 
        href="/protected/tasks" 
        class="text-center h-10 w-1/2 text-xl font-bold rounded-full {$page.url.pathname === '/protected/tasks' ? 'text-[#d4be76]' : ''}">
        Tasks
    </a>
</div>