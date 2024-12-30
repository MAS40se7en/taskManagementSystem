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