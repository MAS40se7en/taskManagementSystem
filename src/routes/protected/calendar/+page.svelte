<script lang="ts">
	import { goto } from '$app/navigation';
  import Calendar from '@event-calendar/core';
  import TimeGrid from '@event-calendar/time-grid';
	import { onMount } from 'svelte';

  type Task = {
    title: string,
    urgency: string,
    endsAt: Date,
    startsAt: Date,
    deadline: Date,
  }

  let userTasks: Task[];
  let relatedTasks: Task[];
  let user: any;

  onMount(async () => {
    const response = await fetch('/protected/calendar', {
      method: 'GET'
    });

    if (response.ok) {
      const data = await response.json();
      userTasks = data.userTasks;
      relatedTasks = data.relatedTasks;
      user = data.user;
      if (!user?.isVerified) {
					alert('please verify your email to use the application');

					const url = new URL(`/auth/register/verify-email/`, window.location.origin);
					url.searchParams.append('userId', user?.id);

					goto(url.toString());
				}
    } else {
      console.error('Failed to fetch data');
    }
  })

</script>