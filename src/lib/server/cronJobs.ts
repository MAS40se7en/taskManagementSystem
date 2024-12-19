import cron from 'node-cron';
import { prisma } from '$lib/prisma'; // Ensure the correct path
import admin from 'firebase-admin';
import { ProjectDeadlineEmail, sendTaskDeadlineEmail } from '$lib/mailer';

const serviceAccountKey = JSON.parse(Buffer.from(process.env.SERVICE_ACCOUNT_KEY, 'base64').toString('utf-8'))
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccountKey),
    })
}

cron.schedule('0 8 */2 * *', async () => {
    console.log('Running daily task check at 8:00 AM...');

    try {
        const users = await prisma.user.findMany();

        for (const user of users) {
            const fcmToken = user.deviceFcmToken;

            if (!fcmToken) continue;

            // Fetch created tasks
            const createdTasks = await prisma.task.findMany({
                where: { createdById: user.id }
            });

            // Fetch tasks from related projects
            const relatedProjects = await prisma.project.findMany({
                where: {
                    users: { some: { id: user.id } }
                },
                include: { tasks: true }
            });

            const projectTasks = relatedProjects ? relatedProjects.flatMap((project) => project.tasks) : [];
            const allTasks = relatedProjects ? [...createdTasks, ...projectTasks] : createdTasks;

            const now = new Date();
            const oneWeekFromNow = new Date(now);
            oneWeekFromNow.setDate(now.getDate() + 7);

            const upcomingTasks = allTasks.filter((task: any) => {
                const deadline = task.deadline || task.endsAt;
                return deadline && new Date(deadline) <= oneWeekFromNow && new Date(deadline) > now;
            });

            const upcomingProjects = relatedProjects.filter((project: any) => {
                const deadline = project.endsAt;
                return deadline && new Date(deadline) <= oneWeekFromNow && new Date(deadline) > now;
            });

            if (upcomingProjects.length > 0) {
                await ProjectDeadlineEmail(user.email, upcomingProjects);

                for (const project of upcomingProjects) {
                    const payload = {
                        notification: {
                            title: `Task: ${project.title}`,
                            body: `End date approaching: ${new Date(project.endsAt).toLocaleDateString()}`
                        },
                        token: fcmToken,
                    };

                    try {
                        const response = await admin.messaging().send(payload);
                        console.log(`Notification sent to user ${user.email}:`, response);
                    } catch (error) {
                        console.error(`Error sending notification for task ${project.title}:`, error);
                    }
                }
            }

            if (upcomingTasks.length > 0) {
                await sendTaskDeadlineEmail(user.email, upcomingTasks);

                const formattedDate = (date: Date | null | undefined) => {
                    return date ? new Date(date).toLocaleDateString() : 'No date provided';
                }

                for (const task of upcomingTasks) {
                    const taskDate = task.deadline || task.endsAt;
                    const formattedTaskDate = formattedDate(taskDate);
                    const payload = {
                        notification: {
                            title: `Task: ${task.title}`,
                            body: `Deadline approaching: ${formattedTaskDate}`
                        },
                        token: fcmToken
                    };

                    try {
                        const response = await admin.messaging().send(payload);
                        console.log(`Notification sent to user ${user.email}:`, response);
                    } catch (error) {
                        console.error(`Error sending notification for task ${task.title}:`, error);
                    }
                }
                
            }
        }
    } catch (error) {
        console.log('Error in cron job execution:', error);
    }
});
