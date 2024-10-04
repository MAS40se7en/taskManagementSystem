<script lang="ts">
  import { goto } from '$app/navigation';
	import Icon from '@iconify/svelte';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { stringify } from 'postcss';

    let user: {
      name: any;
      image: any;
      email: any;
    };
    let taskCount = 0;
    let relatedProjectCount = 0;
    let errorMessage = '';

    onMount(async () => {
      try {
        const response = await fetch('/user/account');
        if (response.ok) {
          const data = await response.json();
          taskCount = data.taskCount;
          relatedProjectCount = data.relatedProjectCount;
        } else {
          errorMessage = 'Failed to load data';
        }
      } catch (error) {
        errorMessage = 'Error Fetching profile data';
      }
    });
  
    async function logout() {
      const response = await fetch('/user/account', {
        method: 'POST'
      });
  
      if (response.ok) {
        // Redirect to login page after logout
        goto('/auth/login');
      } else {
        console.error('Logout failed');
      }
    }
  </script>
  
  <div class="mx-10 mt-12">
    <h1 class="font-bold text-4xl text-wrap">{user?.name}</h1>
  </div>
  <div class="w-fit bg-gray-200 rounded-full px-4 pb-9 pt-3 flex flex-col gap-3 mx-auto my-8">
    <div class="">
      {#if user?.image}
        <img src={user?.image} alt="profile" class="w-32 h-32 rounded-full">
      {:else}
        <Icon icon="mingcute:user-3-line" class="w-32 h-32 border-4 border-black rounded-full px-1"/>
      {/if}
    </div>
    <div class="w-fit mx-auto">
      <a href="/user/account/edit/image" class="bg-gray-100 px-2 py-1 rounded-xl">edit image</a>
    </div>
  </div>

  <div class="grid grid-cols-2 w-4/5 mx-auto text-center mb-4">
    <h1 class="font-semibold">Tasks</h1>
    <h1 class="font-semibold">Projects</h1>
    <p class="text-[#E1CA7D]">{taskCount}</p>
    <p class="text-[#E1CA7D]">{relatedProjectCount}</p>
  </div>

  <div class="flex flex-col w-4/5 bg-gray-200 mx-auto gap-3 py-4 rounded-2xl">
    <a href="/user/account/associates" class="px-3 active:text-black/20 transition">Associations</a>
    <hr class="border-t-1 border-black/30">
    <a href="/user/account/theme" class="px-3 active:text-black/20 transition">Theme</a>
    <hr class="border-t-1 border-black/30">
    <a href="/user/account/edit" class="px-3 active:text-black/20 transition">Edit Profile</a>
  </div>
  <div class="w-full flex justify-center py-4">
  <button on:click={logout} class="text-lg text-red-500 active:text-red-200 transition">
    Logout
  </button>
</div>
 
<div class="w-4/5 flex flex-col mx-auto py-4 mb-20 rounded-2xl bg-gray-200">
  <a href="/user/account/settings" class="px-3 active:text-black/20 transition">Settings</a>
</div>

  