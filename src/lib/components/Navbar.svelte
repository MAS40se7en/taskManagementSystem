<script lang="ts">
    import { page } from "$app/stores"; // To access the current route
    import Icon from '@iconify/svelte';

    $: hideNavbar = $page.url.pathname.startsWith('/auth/login') ||
                  $page.url.pathname.startsWith('/auth/register') ||
                  $page.url.pathname.startsWith('/admin') ||
                  $page.url.pathname.startsWith('/protected/messages/convo');
  </script>
  
  <!-- Conditional Navbar logic based on the route -->
  <div class="z-10 w-full shadow-2xl bg-[#ebebeb] dark:bg-[#252525] dark:text-stone-300 h-20 place-content-center" class:hidden={hideNavbar}>
  <div class="flex justify-between w-full px-14">
    <a href="/protected/create" class="flex flex-col items-center gap-1">

      {#if $page.url.pathname === '/protected/create'}
      <Icon icon="ion:create" class="w-9 h-9" />
      
      {:else}
      <Icon icon="ion:create-outline" class="w-9 h-9" />
      {/if}

      <p class="text-xs">Create</p>

    </a>
    <a href="/protected/" class="flex flex-col items-center gap-1">
      {#if $page.url.pathname === '/protected'}
      <Icon icon="ion:home" class="w-9 h-9" />
      
      {:else}
      <Icon icon="ion:home-outline" class="w-9 h-9" />
      {/if}

      <p class="text-xs">Home</p>
    </a>
    <a href="/protected/All" class="flex flex-col items-center gap-1">
      {#if $page.url.pathname.startsWith('/protected/All')}
      <Icon icon="ion:list" class="w-9 h-9" />
        {:else}
        <Icon icon="ion:list-outline" class="w-9 h-9" />
      {/if}

      <p class="text-xs">All Items</p>
      
    </a>
    <a href="/protected/user/account" class="flex flex-col items-center gap-1">
      {#if $page.url.pathname === '/protected/user/account'}
      <Icon icon="ion:person" class="w-9 h-9" />
        {:else}
        <Icon icon="ion:person-outline" class="w-9 h-9" />
      {/if}

      <p class="text-xs">Profile</p>
      
    </a>
  </div>
</div>

  
  <!-- Optional alternative Navbar for login/register pages -->
  {#if $page.url.pathname === '/auth/login'}
        <div class="col-span-2 w-full text-center place-content-center bg-gray-200 h-28 bottom-0 fixed z-10">
            <p class="text-center w-full px-14 font-semibold">More Sign-in options will be added later</p>
            <div class="px-36">
                <hr class="border-t-2 border-black/40 my-2" />
            </div>
            <p>Created by <span class="font-semibold">Munir Saker</span></p>
        </div>
        {:else if $page.url.pathname === '/auth/register'}
        <div class="col-span-2 w-full text-center place-content-center bg-gray-200 h-20 bottom-0 fixed">
            <p>Created by <span class="font-semibold">Munir Saker</span></p>
        </div>
  {/if}
