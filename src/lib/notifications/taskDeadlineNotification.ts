import { prisma } from "$lib/prisma";
import type { FcmService } from "$lib/services/fcm.service";
import admin from 'firebase-admin';

function daysDifference(date1: Date, date2: Date): number {
    if (date1 && date2) {
        const timeDiff = date2.getTime() - date1.getTime();
        return Math.floor(timeDiff / (1000 * 3600 * 24));
    }

    return 0;
}

async function getTasksApproachingDeadline() {
    const now = new Date();
    const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const tasks = await prisma.task.findMany({
        where: {
            OR: [
                {
                    deadline: {
                        gte: now,
                        lte: oneWeekLater || oneDayLater,
                    },
                },
                {
                    endsAt: {
                        gte: now,
                        lte: oneWeekLater || oneDayLater,
                    }
                }
            ],
            completed: false,
        },
        include: {
            createdBy: true
        }
    });

    return tasks.map(task => ({
        id: task.id,
        title: task.title,
        deadline: task.deadline,
        endsAt: task.endsAt,
        createdBy: task.createdBy
    }))
}

async function sendNotificaiton(fcmToken: string, payload: { title: string; body: string }) {
    if (!fcmToken) {
        console.warn('No FCM token available. Skipping notification.');
        return;
    }

    try {
        await admin.messaging().send({
            token: fcmToken,
            notification: {
                title: payload.title,
                body: payload.body,
            },
        });
        console.log(`Notification sent to token: ${fcmToken}`);
    } catch (error) {
        console.error('Error sending notification: ', error);
    }
}

export async function checkTaskDeadlines(fcmService: FcmService) {
    const fcmToken = await fcmService.getTokenFromStorage();
    if (!fcmToken) {
        console.warn('No FCM token found. skipping task deadline notificaitons.');
        return;
    }

    const tasks = await getTasksApproachingDeadline();

    for (const task of tasks) {
        if (task.deadline) {
            const timeDiff = daysDifference(new Date(), task.deadline);
            if (timeDiff === 1 || timeDiff === 7) {
                await sendNotificaiton(fcmToken, {
                    title: 'Task Deadline Reminder',
                    body: `Your task ${task.title} is due soon! Deadline: ${task.deadline}`
                })
            }
        } else if (task.endsAt) {
            const timeDiff = daysDifference(new Date(), task.endsAt);
            if (timeDiff === 1 || timeDiff === 7) {
                await sendNotificaiton(fcmToken, {
                    title: 'Task Ending Soon',
                    body: `Your task ${task.title} is due soon! Finish it by: ${task.endsAt}`
                })
            }
        }
    }
}