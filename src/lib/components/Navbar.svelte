<script lang="ts">
    import { page } from "$app/stores"; // To access the current route
    import Icon from '@iconify/svelte';
  </script>
  
  <!-- Conditional Navbar logic based on the route -->
  <div
  class="z-10 w-full bg-gray-200 h-16 place-content-center"
  class:hidden={$page.url.pathname === '/auth/login' || 
                $page.url.pathname === '/auth/register' || 
                $page.url.pathname === '/admin' ||
                $page.url.pathname === '/admin/users'}
>
  <div class="flex justify-between w-full px-14">
    <a href="/create"><Icon icon="gridicons:create" class="w-7 h-7" /></a>
    <a href="/"><Icon icon="lucide:home" class="w-7 h-7" /></a>
    <a href="/All"><Icon icon="lucide:list" class="w-7 h-7" /></a>
    <a href="/user/account"><Icon icon="mingcute:user-3-line" class="w-7 h-7" /></a>
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
