<script lang="ts">
    import { run } from 'svelte/legacy';

    import Cropper from 'cropperjs';
    import 'cropperjs/dist/cropper.css';
	import { onMount } from 'svelte';

    interface Props {
        imageUrl: string;
        onCrop: (croppedImage: string) => void;
    }

    let { imageUrl, onCrop }: Props = $props();

    let cropper: Cropper | null = $state(null);
    let imageElement: HTMLImageElement = $state();

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

    run(() => {
        if (!imageUrl) {
            destroyCropper();
        }
    });
</script>

<div>
    {#if imageUrl}
        <img bind:this={imageElement} class="max-w-100" src={imageUrl} alt="Crop" onload={() => {
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
        <button onclick={destroyCropper}>Save</button>
    {/if}
</div>