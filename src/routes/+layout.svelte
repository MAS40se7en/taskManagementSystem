<script lang="ts">
    import "../app.css";
    import { createThemeSwitcher, Theme } from 'svelte-theme-select';

    createThemeSwitcher();

</script>

<div class="dark:bg-black dark:text-white">
    <Theme />
    <slot />
</div>
