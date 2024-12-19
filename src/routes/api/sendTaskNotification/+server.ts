import { sendTaskDeadlineEmail } from '$lib/mailer.js';
import { prisma } from '$lib/prisma.js';
import admin from 'firebase-admin';
//import { readFileSync } from 'fs';
//import { join } from 'path';

//const serviceAccountPath = join(process.cwd(), 'src/lib/server/serviceAccountKey.json');
//const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

const serviceAccountKey = JSON.parse(Buffer.from(`${process.env.SERVICE_ACCOUNT_KEY}`, 'base64').toString('utf-8'))
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccountKey),
    })
}

export async function POST({ request }) {
    const data = await request.json();

    const user = data.user;

    let payload;

    try {
        const userToReceive = await prisma.user.findUnique({
            where: {
                id: user.id
            }
        });

        if (!userToReceive) {
            return new Response(JSON.stringify({ message: 'User not found' }), { status: 404 });
        }

        const createdTasks = await prisma.task.findMany({
            where: {
                createdById: userToReceive.id
            }
        });

        const relatedProjects = await prisma.project.findMany({
            where: {

                users: {
                    some: {
                        id: userToReceive?.id
                    }
                }
            },
            include: {
                tasks: true
            }
        });

        const projectTasks = relatedProjects.flatMap((project) => project.tasks);


        const fcmToken = userToReceive?.deviceFcmToken;

        if (!fcmToken) {
            return new Response(JSON.stringify({ message: 'token not available' }), { status: 400 });
        }

        const allTasks = [
            ...createdTasks,
            ...projectTasks
        ];

        const now = new Date();
        const oneWeekFromNow = new Date(now);
        oneWeekFromNow.setDate(now.getDate() + 7);

        const upcomingTasks = allTasks.filter((task) => {
            const deadline = task.deadline || task.endsAt;
            return deadline && new Date(deadline) <= oneWeekFromNow && new Date(deadline) > now;
        });

        if (upcomingTasks.length === 0) {
            sendTaskDeadlineEmail(userToReceive?.email, upcomingTasks);
                    payload = {
                        notification: {
                            title: "task.title",
                            body: "Deadline Aproaching: ${task.deadline ? task.deadline : task.endsAt}",
                        },
                        token: fcmToken
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


        console.log('Sending payload: ', payload)

        if (payload) {
            const response = await admin.messaging().send(payload);
            console.log('Notification sent:', response);
            return new Response(JSON.stringify({ message: 'Notification sent', response }), { status: 200 });
        }
        return new Response(JSON.stringify({ message: 'Notification sent' }), { status: 200 });
    } catch (error) {
        console.error('Error sending notification: ', error);
        return new Response(JSON.stringify({ message: 'Failed to send notification' }), { status: 500 });
    }
}
