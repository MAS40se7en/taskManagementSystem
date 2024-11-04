import { prisma } from '$lib/prisma.js';

export async function GET({ locals }) {
    const { user } = locals;

    if (!user) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    try {
        const tasks = await prisma.task.findMany({
            where: {
                createdById: user?.id,
            }
        })

        const relatedProjectsWithTasks = await prisma.project.findMany({
            where: {
                OR: [
                    {
                        createdById: user?.id,
                    },
                    {
                        users: {
                            some: {
                                id: user?.id
                            }
                        }
                    }
                ]
            }
        });

        console.log(tasks);
        console.log(relatedProjectsWithTasks);

        return new Response(JSON.stringify({ message: 'All related tasks gotten', userTasks: tasks, relatedTasks: relatedProjectsWithTasks}));
    } catch (error) {
        console.error('Error fetching user tasks:', error);
        return new Response(JSON.stringify({ message: 'Failed to fetch user related tasks' }), { status: 500 });
    }
}