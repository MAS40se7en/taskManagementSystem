<script lang="ts">
    import Cropper from 'cropperjs';
    import 'cropperjs/dist/cropper.css';
	import { onMount } from 'svelte';

    export let imageUrl: string;
    export let onCrop: (croppedImage: string) => void;

    let cropper: Cropper | null = null;
    let imageElement: HTMLImageElement;

    onMount(() => {
        if (imageElement) {
            cropper = new Cropper(imageElement, {
                aspectRatio: 1,
                viewMode: 1,
                autoCropArea: 1,
                crop: () => {
                    const canvas = cropper?.getCroppedCanvas();
                    if (canvas) {
                        onCrop(canvas.toDataURL());
                    }
                }
            })
        }
    });

    function destroyCropper() {
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
    }

    $: if (!imageUrl) {
        destroyCropper();
    }
</script>

<div>
    {#if imageUrl}
        <img bind:this={imageElement} class="max-w-100" src={imageUrl} alt="Crop" on:load={() => {
            if (cropper) {
                cropper.destroy();
            }
            cropper = new Cropper(imageElement, {
                aspectRatio: 1,
                viewMode: 1,
                autoCropArea: 1,
                crop: () => {
                    const canvas = cropper?.getCroppedCanvas();
                    if (canvas) {
                        onCrop(canvas.toDataURL());
                    }
                }
            })
        }} >
        <button on:click={destroyCropper}>Save</button>
    {/if}
</div>