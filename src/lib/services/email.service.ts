import { sendTaskDeadlineEmail } from '$lib/mailer';
import { prisma } from '$lib/prisma';
import cron from 'node-cron';

export class EmailService {
	constructor() {}

	async fetchTasksApproachingDeadline() {
		const now = new Date();
		const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);

		
		const tasks = await prisma.task.findMany({
			where: {
				OR: [
					{
						deadline: {
							gte: now,
							lte: oneDayLater
						}
					},
					{
						endsAt: {
							gte: now,
							lte: oneDayLater
						}
					}
				],
				completed: false,
				emailNotificationSent: false
			},
			include: {
				createdBy: true
			}
		});

		return tasks;
	}


	startTaskDeadlineEmailScheduler() {
		cron.schedule('0 * * * *', async () => {
			console.log('Running task deadline email check...');
			const tasks = await this.fetchTasksApproachingDeadline();

			for (const task of tasks) {
				if (task.createdBy?.email) {
					const taskLink = `${process.env.BASE_URL}/protected/tasks/${task.id}`;
					await sendTaskDeadlineEmail(task.createdBy?.email, taskLink, task);

					await prisma.task.update({
						where: { id: task.id },
						data: { emailNotificationSent: true },
					});
				} else {
					console.warn(`No email found for user associated with task ID: ${task.id}`);
				}
			}
		});
	}
}
