import cron from 'node-cron';
import { prisma } from '$lib/prisma'; // Ensure the correct path
import admin from 'firebase-admin';

cron.schedule('* * * * *', async () => {
    console.log('Running daily task check at 8:00 AM...');

    try {
        const users = await prisma.user.findMany();

        for (const user of users) {
            const fcmToken = user.deviceFcmToken;

            if (!fcmToken) continue;
            console.log(fcmToken);

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

            if (relatedProjects.length === 0) {
                console.log('no related projects');
                return new Response(JSON.stringify({ message: 'no related projects' }), { status: 200 });
            }
            
            const projectTasks = relatedProjects ? relatedProjects.flatMap((project) => project.tasks) : [];
            const allTasks = relatedProjects ? [...createdTasks, ...projectTasks] : tasks;

            const now = new Date();
            const oneWeekFromNow = new Date(now);
            oneWeekFromNow.setDate(now.getDate() + 7);

            const upcomingTasks = allTasks.filter((task) => {
                const deadline = task.deadline || task.endsAt;
                return deadline && new Date(deadline) <= oneWeekFromNow && new Date(deadline) > now;
            });

            if (upcomingTasks.length === 0) {
                console.log('no upcoming tasks')
                return new Response(JSON.stringify({ message: 'No upcoming tasks' }), { status: 200 });
            }

            if (upcomingTasks.length > 1) {
                const payload = {
                    notification: {
                        title: 'Upcoming Task Deadlines',
                        body: `You have ${upcomingTasks.length} task(s) due within the next week.`
                    },
                    token: fcmToken
                };
            } else {
                const payload = {
                    notification: {
                        title: 'Upcoming Task Deadline',
                        body: `Task (${task.title}) is ending within the next week.`
                    },
                    token: fcmToken
                };
            };

            console.log('Sending payload: ', payload)

        if (!payload.token) {
            console.error('Missing FCM token in payload');
            return new Response(JSON.stringify({ error: 'Missing FCM token' }), { status: 400 });
        }

        if (payload) {
            // Send the notification via Firebase Admin
        const response = await admin.messaging().send(payload);
        console.log('Notification sent:', response);
        return new Response(JSON.stringify({ message: 'Notification sent', response }), { status: 200 });
        }
        }
    } catch (error) {
        console.log('Error in cron job execution:', error);
    }
});
