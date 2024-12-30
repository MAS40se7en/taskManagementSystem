<script>
	import { Theme } from "svelte-theme-select";


	import ThemeSwitch from "./ThemeSwitch.svelte";

</script>
<div class="px-5 py-3 dark:bg-[#2b2b2b] bg-[#D9D9D9] w-4/5 mx-auto mt-2 rounded-xl flex items-center justify-between">
    <a href="/admin" class="text-xl font-bold">Admin Dashboard</a>
    <div class="flex gap-4 items-center">
        <a href="/admin/tasks">All Tasks</a>
        <a href="/admin/projects">All Projects</a>
        <a href="/admin/users">All Users</a>
        <a href="/admin/profile">Profile</a>
        <ThemeSwitch />
		<Theme />
    </div>
</div>