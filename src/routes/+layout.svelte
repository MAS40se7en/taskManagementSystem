<script lang="ts">
    import "../app.css";
    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();
</script>

<div class="dark:bg-black">
    {@render children?.()}
</div>
