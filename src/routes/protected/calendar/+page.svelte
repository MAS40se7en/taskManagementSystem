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
	let selectedDay: any;

	let projects: any[] = [];
	let tasks: any[] = [];
	let user: any = {};

	let selectedDayContainer: HTMLDivElement | null = null;

	onMount(async () => {
		const response = await fetch('/protected/calendar');

		if (response.ok) {
			const data = await response.json();

			projects = data.relatedProjectsWithTasks;
			tasks = data.userTasks;
			user = data.user;

			if (!user) {
				alert('unauthorized access');
				goto('/auth/login');
			}

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

	function isPastDay(day: { date: Date }) {
		return day.date < new Date(new Date().setHours(0,0,0,0));
	}

	function isWithinRange(item: { startsAt?: Date; endsAt?: Date; deadline?: Date }, day: { date: Date }) {
		if (item.startsAt && item.endsAt) {
			const startsAt = new Date(item.startsAt);
			const endsAt = new Date(item.endsAt);
			return day.date >= startsAt && day.date <= endsAt;
		} else if (!item.startsAt && item.deadline) {
			const deadline = new Date(item.deadline);
			return day.date.toDateString() === deadline.toDateString();
		}

		return false;
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

	function selectDay(day: any) {
		selectedDay = day;

		selectedDayContainer?.scrollIntoView({ behavior: 'smooth' });
	}

	$: filteredProjects = selectedDay
		? projects.filter((project) => isWithinRange(project, selectedDay))
		: [];
	$: filteredTasks = selectedDay ? tasks.filter((task) => isWithinRange(task, selectedDay)) : [];

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

	<div class="min-h-96 mx-5 rounded-3xl my-5 relative">
		<div class="text-center py-2 my-4 flex items-center justify-between w-2/3 mx-auto gap-3">
			<button on:click={previousMonth} class="font-bold text-2xl"
				><Icon icon="bxs:left-arrow" /></button
			>
			<h3>{monthYear}</h3>
			<button on:click={nextMonth} class="text-2xl font-bold"
				><Icon icon="bxs:right-arrow" /></button
			>
		</div>
		<div class="overflow-auto h-full relative">
			<div class="text-center py-2 grid grid-cols-7 gap-1">
				{#each weekDays as day}
					<div class="text-xs text-nowrap">{day}</div>
				{/each}

				{#each days as day}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<div
						class="py-2 h-fit w-20 min-h-20 max-h-24 overflow-y-auto shadow-md rounded-xl
							{selectedDay === day
							? 'bg-[#D9D9D9] dark:bg-[#252525]'
							: ' border-2 border-[#D9D9D9] dark:border-[#252525]'}
							{isPastDay(day) ? 'opacity-40 pointer-events-none' : ''}
							"
						on:click={!isPastDay(day) ? () => selectDay(day) : undefined}
					>
						<div class="font-bold">{day.dayNumber}</div>

						{#each projects as project}
							{#if isWithinRange(project, day)}
								<div class="grid grid-cols-2 w-3/4 mx-auto">
									<div
										class="bg-[#e9e9e9] dark:bg-[#c2c2c2] rounded-full w-6 h-6"
										style="
									grid-column: {getGridColumnStart(project)} / span {getGridColumnSpan(project)};
									top: calc((1 + Math.floor((getGridColumnStart(project) - 1) / 7)) * 100%);
									"
									></div>
								</div>
							{/if}
						{/each}

						{#each tasks as task}
							{#if isWithinRange(task, day)}
								<div class="grid grid-cols-2 w-3/4 mx-auto">
									<div
										class="mt-1 p-1 rounded-full w-6 h-6
									{task.urgency === 'important' && 'bg-[#5d52ff] dark:bg-[#373097] text-white'}
					{task.urgency === 'urgent' && 'bg-[#ad1aad] dark:bg-[#8b278b] text-white'}
					{task.urgency === 'very urgent' && 'bg-[#b62b2b] dark:bg-[#aa2929] text-white'}
					{task.urgency === 'normal' && 'bg-[#c2c477] dark:bg-[#9d9e5f] dark:text-white text-black'}"
										style="
						grid-column: {getGridColumnStart(task)} / span {getGridColumnSpan(task)};
						top: calc((1 + Math.floor((getGridColumnStart(task) - 1) / 7)) * 100%);
					"
									></div>
								</div>
							{/if}
						{/each}
					</div>
				{/each}
			</div>
		</div>
	</div>

	{#if selectedDay}
		<div class="w-3/4 mx-auto text-center mb-4">
			<p class="text-xs opacity-60">Please scroll down to view more information</p>
		</div>
	{/if}

	<div
		class="w-3/4 mx-auto flex gap-8 justify-center bg-[#D9D9D9]/30 dark:bg-[#252525]/50 py-2 px-3 rounded-2xl mb-3"
	>
		<div class="flex gap-3 items-center">
			<div class="bg-[#e9e9e9] dark:bg-[#c2c2c2] rounded-full w-4 h-4"></div>
			<h1 class="text-sm">Project</h1>
		</div>
		<div class="flex gap-3 items-center">
			<div class="flex gap-2">
				<div class="mt-1 p-1 rounded-full w-4 h-4 bg-[#5d52ff] dark:bg-[#373097] rounded"></div>
				<div class="mt-1 p-1 rounded-full w-4 h-4 bg-[#ad1aad] dark:bg-[#8b278b] rounded"></div>
				<div class="mt-1 p-1 rounded-full w-4 h-4 bg-[#b62b2b] dark:bg-[#aa2929] rounded"></div>
				<div class="mt-1 p-1 rounded-full w-4 h-4 bg-[#c2c477] dark:bg-[#9d9e5f] rounded"></div>
			</div>
			<h1 class="text-sm">Task</h1>
		</div>
	</div>

	<div class="text-center w-4/6 mx-auto mb-5">
		<p class="text-xs opacity-60">Select a project or a task to see more information</p>
	</div>

	{#if selectedDay}
		<hr />
		<div class="w-5/6 mx-auto mt-5" bind:this={selectedDayContainer}>
			<h3 class="font-semibold text-xl">{selectedDay.date.toLocaleDateString()}</h3>
			<div class="pt-5">
				<div class="mt-5">
					<h2 class="font-bold text-lg">Projects</h2>
					{#if filteredProjects.length > 0}
						<ul class="mt-3">
							{#each filteredProjects as project}
								<li class="py-2 bg-[#e9e9e9] dark:bg-[#c2c2c2] dark:text-black relative shadow-md rounded-xl min-h-24 mb-2">
									<a href={`/protected/projects/${project.id}`} class="px-3 font-semibold"
										>{project.title}</a
									>
									<div class="flex justify-center gap-2 bottom-2 absolute text-sm w-full mx-auto">
										<p class="bg-green-600 text-white py-1 px-2 rounded-lg text-center">
											{new Date(project?.startsAt).toLocaleDateString()}
										</p>
										<p class="bg-red-600 dark:bg-red-800 text-white py-1 px-2 rounded-lg text-center">
											{new Date(project?.endsAt).toLocaleDateString()}
										</p>
									</div>
								</li>
							{/each}
						</ul>
					{:else}
						<p class="text-sm opacity-60">No projects for this day</p>
					{/if}
				</div>

				<div class="mt-5">
					<h2 class="font-bold text-lg">Tasks</h2>
					{#if filteredTasks.length > 0}
						<ul class="mt-3">
							{#each filteredTasks as task}
								<li
									class="py-2 rounded-xl mb-2 relative shadow-md min-h-24
										{task.urgency === 'important' && 'bg-[#5d52ff] dark:bg-[#373097] text-white'}
					{task.urgency === 'urgent' && 'bg-[#ad1aad] dark:bg-[#8b278b] text-white'}
					{task.urgency === 'very urgent' && 'bg-[#b62b2b] dark:bg-[#aa2929] text-white'}
					{task.urgency === 'normal' && 'bg-[#c2c477] dark:bg-[#9d9e5f] dark:text-white text-black'}
								"
								>
								<div class="flex justify-between px-3">
									<a href={`/protected/tasks/${task.id}`} class="font-semibold">{task.title}</a>
									<p class="text-sm opacity-70">
										{task.urgency}
									</p>
								</div>
									{#if task.startsAt && task.endsAt}
									<div class="flex justify-center bottom-2 absolute gap-2 text-sm w-full mx-auto">
										<p class="bg-green-600 text-white py-1 px-2 rounded-lg text-center">
											{new Date(task?.startsAt).toLocaleDateString()}
										</p>
										<p class="bg-red-600 dark:bg-red-800 text-white py-1 px-2 rounded-lg text-center">
											{new Date(task?.endsAt).toLocaleDateString()}
										</p>
									</div>
									{:else if !task.startsAt && task.deadline}
									<p class="text-sm opacity-70">
										{new Date(task.deadline).toLocaleDateString()} -
									</p>
									{/if}
								</li>
							{/each}
						</ul>
					{:else}
						<p class="text-sm opacity-60">No tasks for this day</p>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		position: relative;
	}
</style>
