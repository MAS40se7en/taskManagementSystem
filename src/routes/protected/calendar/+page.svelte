<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	let currentDate = new Date();
	let month = currentDate.getMonth();
	let year = currentDate.getFullYear();
	let days: any[];
	const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	let selectedDay: any;
	let message: string;
	let calendarData: any;

	let projects: any[] = [];
	let tasks: any[] = [];
	let user: any = {};
	let loading = true;

	let selectedDayContainer: HTMLDivElement | null = null;

	onMount(async () => {
		const response = await fetch('/protected/calendar');

		if (response.ok) {
			const data = await response.json();

			projects = data.relatedProjectsWithTasks;
			tasks = data.userTasks;
			user = data.user;
			loading = false;

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
		return day.date < new Date(new Date().setHours(0, 0, 0, 0));
	}

	function isWithinRange(
		item: { startsAt?: Date; endsAt?: Date; deadline?: Date },
		day: { date: Date }
	) {
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

	async function addEventsToGoogleCalendar() {
		if (!user.googleId) {
			message = 'Please sign in with google to add your events to your google calendar';
		}
		try {
			const response = await fetch('/api/addEventsToGoogleCalendar', {
				method: 'POST',
				body: JSON.stringify({ tasks, projects, user })
			});

			const data = await response.json();

			message = data.message;
			calendarData = data.taskEvents;
			setTimeout(() => {
				message = '';
			}, 10000);
			console.log(data);
		} catch (error) {
			console.error(error);
		}
	}
	function goBack() {
		window.history.back();
	}
</script>

<div>
	<div class="flex items-center px-10 pt-12 pb-4 top-0 sticky z-10 bg-white dark:bg-black">
		<a href="/protected" class="py-2 px-3">
			<Icon icon="fluent:ios-arrow-24-filled" class="w-7 h-7" />
		</a>
		<div class="flex items-center">
			<h1 class="text-3xl font-bold mr-2">Calendar</h1>
		</div>
	</div>

	<div
		class="min-h-96 mx-5 py-2 bg-gray-100 dark:bg-[#151515] rounded-3xl border-2 mt-5 mb-3 relative"
	>
	{#if loading}
		<div class="w-full top-0 right-0 left-0 bottom-0 absolute rounded-3xl backdrop-blur-sm z-50 flex place-items-center justify-center">
			<Icon icon="line-md:loading-twotone-loop" class="w-20 h-20" />
		</div>
	{/if}
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
						class="py-2 h-fit w-11 mx-auto min-h-10 max-h-24 overflow-y-auto rounded-xl
							{selectedDay === day ? 'bg-[#D9D9D9] dark:bg-[#252525]' : ''}
							{isPastDay(day) ? 'opacity-40 pointer-events-none' : ''}
							"
						on:click={!isPastDay(day) ? () => selectDay(day) : undefined}
					>
						<div class="font-semibold">{day.dayNumber}</div>

						{#each projects as project}
							{#if isWithinRange(project, day)}
								<div class="flex flex-col gap-6 w-3/4 mx-auto">
									<div
										class="bg-[#d1d1d1] dark:bg-[#c2c2c2] rounded-full w-full h-2 mb-1"
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
								<div class="flex flex-col gap-6 w-3/4 mx-auto">
									<div
										class="mt-1 p-1 rounded-full w-full h-2 mb-1
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
				<div class="mt-1 p-1 rounded-full w-4 h-4 bg-[#5d52ff] dark:bg-[#373097]"></div>
				<div class="mt-1 p-1 rounded-full w-4 h-4 bg-[#ad1aad] dark:bg-[#8b278b]"></div>
				<div class="mt-1 p-1 rounded-full w-4 h-4 bg-[#b62b2b] dark:bg-[#aa2929]"></div>
				<div class="mt-1 p-1 rounded-full w-4 h-4 bg-[#c2c477] dark:bg-[#9d9e5f]"></div>
			</div>
			<h1 class="text-sm">Task</h1>
		</div>
	</div>

	{#if user.googleId}

			<div class="flex flex-col gap-1 items-center justify-center mb-2">
				<button
					on:click={addEventsToGoogleCalendar}
					class="dark:bg-[#252525] dark:border-[#323232] flex items-center justify-center gap-3 w-4/6 border-2 rounded-xl py-3 px-3"
				>
					<Icon icon="devicon:google" class="w-6 h-6" />
					<h1 class="font-semibold text-xs">Add to Google Calendar</h1>
				</button>
				{#if message}
					<div class="dark:bg-[#252525] dark:border-[#323232] px-3 py-2 rounded-xl flex flex-col">
						<p class="text-black text-sm">{message}</p>
						<a href={calendarData.htmlLink} class="font-semibold text-sm">View Calendar</a>
					</div>
				{/if}
			</div>

	{/if}

	{#if selectedDay}
		<div
			class="h-full mt-5 mx-5 border-2 rounded-3xl px-3 py-4 bg-gray-100 dark:bg-[#151515]"
			bind:this={selectedDayContainer}
		>
			<h3 class="font-semibold text-xl">{selectedDay.date.toLocaleDateString()}</h3>
			<div class="pt-5">
				<div class="mt-5">
					<h2 class="font-bold text-lg">Projects</h2>
					{#if filteredProjects.length > 0}
						<ul class="mt-3">
							{#each filteredProjects as project}
								<li
									class="py-2 bg-white dark:bg-[#202020] dark:text-white relative shadow-md rounded-lg min-h-24 mb-2"
								>
									{#if project.completed}
										<div
											class="flex justify-between pl-3 items-center {project.completed
												? 'z-20 absolute top-0 bottom-0'
												: ''}"
										>
											<a href={`/protected/projects/${project.id}`} class="font-semibold text-lg"
												>{project.title}</a
											>
											<div class="flex text-[#c9b46f] px-2 items-center">
												<Icon icon="mingcute:user-3-line" class="w-5 h-5" />
												<p>{project.userCount}</p>
											</div>
										</div>
									{:else}
										<div class="flex justify-between items-center px-3">
											<a href={`/protected/projects/${project.id}`} class="font-semibold">
												{project.title}
											</a>
											<div class="flex text-[#c9b46f] px-2 items-center">
												<Icon icon="mingcute:user-3-line" class="w-5 h-5" />
												<p>{project.userCount}</p>
											</div>
										</div>
									{/if}

									<p class="text-sm px-4 mb-2">{project.description}</p>
									<div
										class="flex justify-between text-xs mt-2 absolute bottom-2 right-0 left-0 px-5"
									>
										<div>
											<span class="font-semibold">Starts At:</span>
											<span>{new Date(project.startsAt).toLocaleDateString()}</span>
										</div>
										<div>
											<span class="font-semibold">Ends At:</span>
											<span>{new Date(project.endsAt).toLocaleDateString()}</span>
										</div>
									</div>
									{#if project.completed}
										<div
											class="absolute inset-0 bg-green-500/20 backdrop-blur-md rounded-lg flex items-center justify-end pr-10 z-10"
										>
											<Icon icon="typcn:tick-outline" class="w-12 h-12 text-green-600 righ-5" />
										</div>
									{/if}
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
								<li class="rounded-lg shadow-lg p-4 relative bg-white dark:bg-[#202020] mb-2">
									<!-- Urgency Tag -->

									{#if task.completed}
										<div
											class="flex items-center gap-4 {task.completed
												? 'z-20 absolute top-0 bottom-0'
												: ''}"
										>
											<div
												class="w-6 h-6 rounded-full flex-shrink-0
											{task.urgency === 'important' && 'bg-indigo-500'}
											{task.urgency === 'urgent' && 'bg-purple-600'}
											{task.urgency === 'very urgent' && 'bg-red-600'}
											{task.urgency === 'normal' && 'bg-yellow-500'}"
											></div>
											<div class="flex-1">
												<a
													href="/protected/tasks/{task.id}"
													class="text-lg font-semibold text-gray-800 dark:text-gray-100 hover:underline
												{task.completed ? 'text-sm' : ''}
											"
												>
													{task.title}
												</a>
												{#if task.project}
													<a
														href="/protected/projects/{task.project.id}"
														class="block text-sm text-gray-500 dark:text-gray-400"
													>
														{task.project.title}
													</a>
												{/if}
											</div>
										</div>
									{:else}
										<div
											class="absolute top-4 right-4 px-2 py-1 text-xs font-semibold rounded-full
									{task.urgency === 'important' && 'bg-blue-500 text-white'}
									{task.urgency === 'urgent' && 'bg-purple-500 text-white'}
									{task.urgency === 'very urgent' && 'bg-red-500 text-white'}
									{task.urgency === 'normal' && 'bg-yellow-500 text-black'}"
										>
											{task.urgency}
										</div>

										<!-- Task Details -->
										<div class="mb-2">
											<a
												href="/protected/tasks/{task.id}"
												class="text-lg font-semibold hover:underline"
											>
												{task.title}
											</a>
										</div>
									{/if}
									<p class="text-sm text-gray-600 dark:text-gray-300 mb-2">{task.description}</p>

									<!-- Task Dates -->
									{#if task.startsAt && task.endsAt}
										<div class="flex justify-between text-xs mt-2">
											<div>
												<span class="font-semibold">Starts At:</span>
												<span class="text-green-600 text-xs"
													>{new Date(task.startsAt).toLocaleDateString()}</span
												>
											</div>
											<div>
												<span class="font-semibold">Ends At:</span>
												<span class="text-red-600 text-xs"
													>{new Date(task.endsAt).toLocaleDateString()}</span
												>
											</div>
										</div>
									{:else if task.deadline}
										<div class="text-right">
											<span class="font-semibold text-xs">Deadline:</span>
											<span class="text-red-600 text-xs">
												{new Date(task.deadline).toLocaleDateString()}
											</span>
										</div>
									{/if}

									{#if task.completed}
										<div
											class="absolute inset-0 bg-green-500/20 backdrop-blur-md rounded-lg flex items-center justify-end pr-10 z-10"
										>
											<Icon icon="typcn:tick-outline" class="w-12 h-12 text-green-600 righ-5" />
										</div>
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
