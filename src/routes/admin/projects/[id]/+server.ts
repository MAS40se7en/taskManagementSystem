export async function GET({ params, locals }) {
    const projectId = parseInt(params.id);
    const { user } = locals;

    if (!user) {
        return new Response(JSON.stringify({ message: 'unauthorized' }), {status: 400})
    }

    try {
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

        if (!project) {
            return new Response(JSON.stringify({ message: 'Task not found' }), { status: 404 });
        }

        return new Response(JSON.stringify({ message: 'task loaded', project, user }), { status: 200 });
    } catch(error) {
        return new Response(JSON.stringify({ message: error }), { status: 400 });
    }
}

export async function DELETE({ request }) {
    const {projectId} = await request.json();

    try {
        await prisma.project.delete({
            where: {
                id: projectId
            }
        });

        return new Response(JSON.stringify({ message: 'project deleted' }), { status: 200 });
    } catch(error) {
        return new Response(JSON.stringify({ message: 'could not delete the project' }), { status: 400 });
    }
}