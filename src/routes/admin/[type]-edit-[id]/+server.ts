import { prisma } from '$lib/prisma';

export async function GET({ params, locals }) {
    const { user } = locals;
    const itemId = params.id;
    const itemType = params.type;

    if (!user) {
        return new Response(JSON.stringify({ message: 'unauthorised' }), { status: 400 });
    }

    try {
        const currentUser = await prisma.user.findUnique({
            where: {
                id: user?.id
            }
        });

        if (itemType === 'Project') {
            const projectId = parseInt(itemId, 10);
            const project = await prisma.project.findUnique({
                where: {
                    id: projectId
                },
                include: {
                    createdBy: true,
                    tasks: true,
                    users: true
                }
            });

            return new Response(JSON.stringify({ message: 'retrieved project data', project, user }), { status: 200 });
        }

        if (itemType === 'Task') {
            const taskId = parseInt(itemId, 10);
            const task = await prisma.task.findUnique({
                where: {
                    id: taskId
                },
                include: {
                    createdBy: true,
                    project: true
                }
            });

            return new Response(JSON.stringify({ message: 'retrieved task data', task, user: currentUser }), { status: 200 });
        }
    } catch(error) {
        return new Response(JSON.stringify({ message: 'error retrieving data' }), { status: 400 });
    }
}

export async function POST({ request, locals }) {
    const { user } = locals;
    const data = await request.formData();
    const { id, title, description, startsAt, endsAt, deadline, instructions, type } = Object.fromEntries(data) as Record<string, string>;

    if (!user) {
        return new Response(JSON.stringify({ message: 'unauthorised' }), { status: 400 });
    }

    const itemId = parseInt(id, 10);

    try {
        if (type === 'Project') {
            const newProject = await prisma.project.update({
                where: {
                    id: itemId
                },
                data: {
                    title: title,
                    description: description,
                    startsAt: new Date(startsAt),
                    endsAt: new Date(endsAt)
                }
            });

            return new Response(JSON.stringify({ message: 'Project updated', newProject }), { status: 200 });
        } else if (type === 'Task') {
            const parsedInstructions = JSON.parse(instructions);

            const newTask = await prisma.task.update({
                where: {
                    id: itemId
                },
                data: {
                    title: title,
                    description: description,
                    deadline: deadline ? new Date(deadline) : null,
                    startsAt: startsAt ? new Date(startsAt) : null,
                    endsAt: endsAt ? new Date(endsAt) : null,
                    instructions: { type: 'text', content: parsedInstructions.content}
                }
            });

            return new Response(JSON.stringify({ message: 'Task updated' }), { status: 200 });
        }
    } catch (error) {
        return new Response(JSON.stringify({ message: 'error updating item' }), { status: 400 });
    }
}