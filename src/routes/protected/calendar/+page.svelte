<script lang="ts">
	import { goto } from '$app/navigation';
	import { da } from '@faker-js/faker';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	let currentDate = new Date();
	let month = currentDate.getMonth();
	let year = currentDate.getFullYear();
	let days: any[];
	const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	let selectedItem: any;

	let projects: any[] = [];
	let tasks: any[] = [];
	let user: any = {};

	onMount(async () => {
		const response = await fetch('/protected/calendar');

		if (response.ok) {
			const data = await response.json();

			projects = data.relatedProjectsWithTasks;
			tasks = data.userTasks;
			user = data.user;

			if (!user?.isVerified) {
				alert('please verify your email to use the application');

				const url = new URL(`/auth/register/verify-email/`, window.location.origin);
				url.searchParams.append('userId', user?.id);

				goto(url.toString());
			}
		} else {
			alert('Failed to fetch data');
		}
	});

	$: monthYear = new Date(year, month).toLocaleString('default', {
		month: 'long',
		year: 'numeric'
	});

	function previousMonth() {
		if (month === 0) {
			month = 11;
			year--;

			console.log('Previous month');
		} else {
			month--;
			console.log('Previous month: ', month);
		}

		days = getDaysInMonth();
	}

	function nextMonth() {
		if (month === 11) {
			month = 0;
			year++;

			console.log('next month');
		} else {
			month++;
		}

		days = getDaysInMonth();
	}

	$: days = getDaysInMonth();

	function getDaysInMonth() {
		//const days = [];
		const daysInMonth = new Date(year, month + 1, 0).getDate();
		const daysArray = [];

		for (let i = 0; i < daysInMonth; i++) {
			const date = new Date(year, month, i + 1);
			daysArray.push({
				dayName: weekDays[date.getDay()],
				dayNumber: (i + 1).toString().padStart(2, '0'),
				date: new Date(year, month, i + 1),
				weekDay: date.getDay()
			});
			//	const dayName = weekDays[date.getDay()];
			//	const dayNumber = (i + 1).toString().padStart(2, '0');
			//	days.push({ dayName, dayNumber });
		}

		console.log(days);

		return daysArray;
	}

	function isWithinRange(item: { startsAt: Date; endsAt: Date }, day: { date: Date }) {
		const startsAt = new Date(item.startsAt);
		const endsAt = new Date(item.endsAt);
		return day.date >= startsAt && day.date <= endsAt;
	}

	function getGridColumnSpan(item: { startsAt: Date; endsAt: Date }) {
		const startsAt = new Date(item.startsAt);
		const endsAt = new Date(item.endsAt);
		const startDay = startsAt.getDate();
		const endDay = endsAt.getDate();

		return endDay - startDay + 1;
	}

	function getGridColumnStart(item: { startsAt: Date; endsAt: Date }) {
		const startsAt = new Date(item.startsAt);

		return startsAt.getDate();
	}

	function goBack() {
		window.history.back();
	}
</script>

<div>
	<div class="flex items-center px-10 pt-12 pb-4 top-0 sticky z-10 bg-white dark:bg-black">
		<button on:click|preventDefault={goBack} class="py-2 px-3">
			<Icon icon="fluent:ios-arrow-24-filled" class="w-7 h-7" />
		</button>
		<div class="flex items-center">
			<h1 class="text-3xl font-bold mr-2">Calendar</h1>
		</div>
	</div>

	<div class="bg-[#D9D9D9] min-h-96 mx-5 rounded-xl my-5 shadow-md relative">
		<div class="text-center py-2 flex items-center justify-between w-2/3 mx-auto gap-3">
			<button on:click={previousMonth} class="font-bold text-2xl">←</button>
			<h3>{monthYear}</h3>
			<button on:click={nextMonth} class="text-2xl font-bold">→</button>
		</div>
		<div class="overflow-auto h-full relative">
			<div class="text-center py-2 grid grid-cols-7">
				{#each weekDays as day}
					<div class="text-xs text-nowrap">{day}</div>
				{/each}

				{#each days as day}
					<div class="border border-gray-300 p-2 h-24 w-24">
						<div class="font-bold">{day.dayNumber}</div>

						{#each projects as project}
							{#if isWithinRange(project, day)}
								<div
									class="bg-blue-200 text-xs mt-1 p-1 rounded"
									style="
									grid-column: {getGridColumnStart(project)} / span {getGridColumnSpan(project)};
									top: calc((1 + Math.floor((getGridColumnStart(project) - 1) / 7)) * 100%);
									"
								>
									{project?.title}
									{#if project?.tasks}
										{#each project?.tasks as task}
											{#if isWithinRange(task, day)}
												<div
													class="bg-green-200 text-xs mt-1 p-1 truncate rounded absolute"
													style="
						grid-column: {getGridColumnStart(task)} / span {getGridColumnSpan(task)};
						top: calc((1 + Math.floor((getGridColumnStart(task) - 1) / 7)) * 100%);
					"
												>
													{task.title}
												</div>
											{/if}
										{/each}
									{/if}
								</div>
							{/if}
						{/each}
						{#each tasks as task}
							{#if isWithinRange(task, day)}
								<div
									class="bg-green-200 text-xs mt-1 p-1 truncate rounded absolute"
									style="
						grid-column: {getGridColumnStart(task)} / span {getGridColumnSpan(task)};
						top: calc((1 + Math.floor((getGridColumnStart(task) - 1) / 7)) * 100%);
					"
								>
									{task.title}
								</div>
							{/if}
						{/each}
					</div>
				{/each}
			</div>
		</div>
	</div>

	<div class="text-center w-4/6 mx-auto">
		<p class="text-xs opacity-60">
			Drag and drop projects and tasks to best fit your day.
			<br />
			<strong>Note</strong> that you can only modify the projects and tasks that you have created
		</p>
	</div>

	<div class="w-5/6 mx-auto mt-5">
		<h3 class="font-semibold">Selected Item:</h3>
		<div class="pt-5 px-10">
			<h1 class="text-lg font-bold">Project Title</h1>
		</div>
	</div>
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		position: relative;
	}
</style>
