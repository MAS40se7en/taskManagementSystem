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