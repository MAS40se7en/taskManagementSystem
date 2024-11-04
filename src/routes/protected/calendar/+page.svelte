<script lang="ts">
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

  onMount(async () => {
    const response = await fetch('/protected/calendar', {
      method: 'GET'
    });

    if (response.ok) {
      const data = await response.json();
      userTasks = data.userTasks;
      relatedTasks = data.relatedTasks;
    } else {
      console.error('Failed to fetch data');
    }
  })

</script>