import { prisma } from "$lib/prisma";

export async function GET({ locals }) {
    const { user } = locals;

    if (!user) {
        return new Response(JSON.stringify({ message: 'unauthorized' }), { status: 400 });
    }

    const currentUser = await prisma.user.findUnique({
        where: {
            id: user.id
        }
    })
    

    // If user is logged in, fetch tasks
    const createdTasks = await prisma.task.findMany({
        where: {
                    createdById: user?.id
        },
        include: {
            createdBy: true,
        }
    });

    const users = await prisma.user.findMany();

    const assignedProjects = await prisma.project.findMany({
        where: {
            users: {
                some: {
                    id: user?.id
                }
            }
        },
        include: {
            tasks: {
                    include: {
                        createdBy: true,
                    }
            },
        }
    })

    const assignedTasks = assignedProjects.flatMap(project => project.tasks);

    const tasks = [...createdTasks, ...assignedTasks];

    return new Response(JSON.stringify({ message: 'user data retrieved successfully', tasks, user: currentUser }), { status: 200 });
}