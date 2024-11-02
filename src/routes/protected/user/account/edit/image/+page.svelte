<script lang="ts">
	import { onMount } from 'svelte';
	import '@pqina/pintura/pintura.css';
	import { getEditorDefaults } from '@pqina/pintura';
	import { PinturaEditor } from '@pqina/svelte-pintura';
	import Icon from '@iconify/svelte';
	import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
	import { goto } from '$app/navigation';

	type User = {
		name: string;
		image: string;
		email: string;
	};

	let user: User | null = null;
	let errorMessage = '';
	let editorDefaults = getEditorDefaults();
	let image = '';
    let editor;
    let edit = false;
    let newImage = false;

	onMount(async () => {
		try {
			const response = await fetch('/protected/user/account/edit/image/');
			if (response.ok) {
				const data = await response.json();
				user = data.user;
			} else {
				errorMessage = 'Failed to load data';
			}
		} catch (error) {
			errorMessage = 'Error Fetching profile data';
		}
	});

    async function takePicture() {
		try {
			const im = await Camera.getPhoto({
				resultType: CameraResultType.DataUrl,
				source: CameraSource.Prompt,
				quality: 90
			});

			image = im.dataUrl ?? '';
			newImage = true;
		} catch (error) {
			errorMessage = 'Error capturing image';
		}
	}

    async function toggleEdit() {
        edit = !edit;
    }

    async function uploadImage() {
        if (!image) {
            errorMessage = 'No image selected';
            return;
        }

        const formData = new FormData();
        formData.append('image', image);

        try {
            const response = await fetch('/protected/user/account/edit/image', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                alert('image added'+ response);
				goto('/protected/user/account/');
            } else {
                const errorData = await response.json();
                errorMessage = errorData.error?? 'Failed to upload image';
            }
        } catch (error) {
            errorMessage = 'Error uploading image';
        }
    }

    function cancelCapture() {
        newImage = false;
    }

    function goBack() {
		window.history.back(); // Navigates to the previous URL in the history stack
	}
</script>

<div class="px-10 py-5 gap-4 flex justify-between items-center">
    <div class="flex items-center">
        <button on:click|preventDefault={goBack} class="py-2 px-3">
			<Icon icon="fluent:ios-arrow-24-filled" class="w-7 h-7" />
		</button>
        <h1 class="text-2xl font-bold">Modify Profile Picture</h1>
    </div>
	
    {#if edit}
        <button class="text-red-600 text-3xl" on:click={toggleEdit}>&times</button>
        {:else if !edit && !newImage}
        <button class="px-3 py-1 rounded-xl text-sm text-nowrap" on:click={takePicture}><Icon icon="ion:camera-sharp" class="text-4xl border-[#d4be76] text-[#d4be76]" /></button>
        {:else if !edit && newImage}
        <button class="text-red-600 text-3xl" on:click={cancelCapture}>&times</button>
        {:else if !user?.image}
        <div class="bg-gray-100 h-64 mt-24 w-5/6 mx-auto rounded-2xl gap-4 flex justify-center items-center"></div>
    {/if}
</div>
<div style="height:80vh" class="w-5/6 mx-auto text-center">
	{#if user?.image && !edit && !newImage}
    <img class="rounded-2xl w-96 h-96 object-cover border-2" src={user?.image} alt="Profile pic" />
    <button on:click={toggleEdit} class="mt-3 bg-[#d4be76] px-3 py-2 rounded-xl font-bold">Edit</button>
    {:else if user?.image && edit}
		<PinturaEditor bind:this={editor} {...editorDefaults} src={user?.image} />
    {:else if newImage && image}
    <img class="rounded-2xl w-96 h-96 object-cover border-2" src={image} alt="Profile pic" />
        <button on:click={uploadImage}>Save Image</button>
	{:else}
		<div class="bg-gray-100 h-64 mt-24 w-5/6 mx-auto rounded-2xl gap-4 flex justify-center items-center">
			<Icon icon="carbon:no-image" class="w-12 h-12 mx-auto" />
			{#if user}
				<button class="bg-gray-300 py-1 px-2 rounded-lg">Add Image</button>
			{/if}
		</div>
	{/if}
</div>
