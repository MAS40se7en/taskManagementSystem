<script lang="ts">
    import "../app.css";
    import { createThemeSwitcher, Theme } from 'svelte-theme-select';

    createThemeSwitcher();

</script>

<div class="dark:bg-black bg-white dark:text-white transition-colors">
    <Theme />
    <slot />
</div>
