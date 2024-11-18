<script lang="ts">
	import { onMount } from "svelte";

    let user: { id: string, name: string, email: string, password: string } | null = null;
    let password: any;

    onMount(async () => {
        try {
            const response = await fetch('/protected/user/account/edit/resetPassword');

            if (response.ok) {
                const data = await response.json();
                user = data.user;
                password = user?.password;
            } else {
                throw new Error('Failed to fetch user data');
            }
        } catch (error) {
            alert('Failed to get your data');
        }
    })
</script>