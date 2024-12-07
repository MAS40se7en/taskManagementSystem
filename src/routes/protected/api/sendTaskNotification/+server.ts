import { sendTaskDeadlineEmail } from '$lib/mailer.js';
import { prisma } from '$lib/prisma.js';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

const serviceAccountPath = join(process.cwd(), 'src/lib/server/serviceAccountKey.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
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
            sendTaskDeadlineEmail(userToReceive?.email, upcomingTasks);
            upcomingTasks.map(
                (task) => {
                    payload = {
                        notification: {
                            title: task.title,
                            body: `Deadline Aproaching: ${task.deadline ? task.deadline : task.endsAt}`,
                        },
                        token: fcmToken
                    }
                }
            )
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
