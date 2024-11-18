<script lang="ts">
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";

    let user: { id: string, name: string, email: string, password: string } | null = null;
    let password: any;

    let errorMessage ='';

    onMount(async () => {
        try {
            const response = await fetch('/auth/reset-password-[token]');
            const data = await response.json();

            console.log(data);
            if (response.ok) {
                
                user = data.user;
                password = user?.password;

                if (!user) {
			    alert('unauthorized access');
                goto('/auth/login');
		    }
            } else {
                errorMessage = data.message;
            }
        } catch (error) {
            alert('Failed to get your data');
        }
    })
</script>

{errorMessage}