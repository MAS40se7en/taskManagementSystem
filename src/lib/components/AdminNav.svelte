<script>

	import Icon from "@iconify/svelte";

</script>
<div class="px-5 py-3 bg-amber-200 w-4/5 mx-auto mt-2 rounded-xl flex justify-between">
    <a href="/admin" class="text-xl font-bold">Admin Dashboard</a>
    <div class="flex gap-4">
        <a href="/admin/allTasks">All Tasks</a>
        <a href="/admin/allProjects">All Projects</a>
        <a href="/admin/users">All Users</a>
        <a href="/user/account"><Icon icon="mingcute:user-3-line" class="w-7 h-7 border-2 rounded-full border-black p-1" /></a>
    </div>
</div>