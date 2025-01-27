import { prisma } from '$lib/prisma'; // Ensure the correct path
import admin from 'firebase-admin';
import { ProjectDeadlineEmail, sendTaskDeadlineEmail } from '$lib/mailer';

const privateKey = process.env.PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: `${process.env.PROJECT_ID}`,
            clientEmail: `${process.env.CLIENT_EMAIL}`,
            privateKey: `${privateKey}`
        }),
    })

    if (admin.apps.length) {
            console.log('admin initialized', admin);
        }
}

export async function GET() {
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
                        await prisma.project.update({
                            where: {
                                id: project.id
                            },
                            data: {
                                emailNotificationSent: true
                            }
                        });

                        if (project.notification < 2) {
                            const payload = {
                                notification: {
                                    title: `Project: ${project.title}`,
                                    body: `End date approaching: ${project.endsAt ? new Date(project.endsAt).toLocaleDateString() : 'Soon'}`
                                },
                                token: fcmToken,
                            };
        
                            try {
                                const response = await admin.app('admin').messaging().send(payload);
    
                                await prisma.project.update({
                                    where: {
                                        id: project.id
                                    },
                                    data: {
                                        notification: project.notification++
                                    }
                                })
                                console.log(`Notification sent to user ${user.email}:`, response);
                            } catch (error) {
                                console.error(`Error sending notification for task ${project.title}:`, error);
                            }
                        }
                    }
                }
    
                if (upcomingTasks.length > 0) {
                    await sendTaskDeadlineEmail(user.email, upcomingTasks);
    
                    const formattedDate = (date: Date | null | undefined) => {
                        return date ? new Date(date).toLocaleDateString() : 'No date provided';
                    }
    
                    for (const task of upcomingTasks) {
                        await prisma.task.update({
                            where: {
                                id: task.id
                            },
                            data: {
                                emailNotificationSent: true
                            }
                        });

                        if (task.notification < 2) {
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
                            const response = await admin.app('admin').messaging().send(payload);
                            
                            await prisma.task.update({
                                where: {
                                    id: task.id
                                },
                                data: {
                                    notification: task.notification++
                                }
                            })
                            console.log(`Notification sent to user ${user.email}:`, response);
                        } catch (error) {
                            console.error(`Error sending notification for task ${task.title}:`, error);
                        }
                        } 
                    }
                    
                }
            }
        } catch (error) {
            console.log('Error in cron job execution:', error);
        }
}