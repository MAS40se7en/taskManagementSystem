<script lang="ts">
    import { page } from "$app/stores"; // To access the current route
    import Icon from '@iconify/svelte';

    $: hideNavbar = $page.url.pathname.startsWith('/auth/login') ||
                  $page.url.pathname.startsWith('/auth/register') ||
                  $page.url.pathname.startsWith('/admin') ||
                  $page.url.pathname.startsWith('/protected/messages/convo');
  </script>
  
  <!-- Conditional Navbar logic based on the route -->
  <div class="z-10 w-full shadow-2xl bg-[#ebebeb] dark:bg-[#252525] dark:text-stone-300 h-16 place-content-center" class:hidden={hideNavbar}>
  <div class="flex justify-between w-full px-14">
    <a href="/protected/create">

        <Icon icon="gridicons:create" class="w-8 h-8" />

    </a>
    <a href="/protected/">
      {#if $page.url.pathname === '/protected'}
      <Icon icon="si:home-fill" class="w-8 h-8" />
      
      {:else}
      <Icon icon="lucide:home" class="w-8 h-8" />
      {/if}
    </a>
    <a href="/protected/All">
      {#if $page.url.pathname === '/protected/All'}
        <Icon icon="fa6-solid:list-ul" class="w-8 h-8" />
        {:else}
        <Icon icon="lucide:list" class="w-8 h-8" />
      {/if}
      
    </a>
    <a href="/protected/user/account">
      {#if $page.url.pathname === '/protected/user/account'}
      <Icon icon="mingcute:user-3-fill" class="w-8 h-8" />
        {:else}
        <Icon icon="mingcute:user-3-line" class="w-8 h-8" />
      {/if}
      
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
