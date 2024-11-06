import { prisma } from '$lib/prisma';

export async function GET({ locals, params }) {
    const { user } = locals;
    const { id } = params;

    const projectId = parseInt(id, 10);
    
    if (!user) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const allUsers = await prisma.user.findMany();
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: {
                title: true,
                completed: true,
                users: true,
            },
        });

        return new Response(JSON.stringify({ message: 'Add users to the project with existing users', allUsers, project}), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ message: 'Failed to fetch project users' }), { status: 500 });
    }
}

export async function POST({ locals, params, request }) {
    const { user } = locals;
    const { id } = params;
    const { selectedUserIds } = await request.json();

    if (!user || !selectedUserIds) {
        return new Response('Unauthorized or missing selectedUsers', { status: 401 });
    }

    const projectId = parseInt(id, 10);

    try {
        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: {
                users: {
                    connect: selectedUserIds.map((selectedUserId: any) => ({
                        id: selectedUserId
                    }))
                },
            },
        });

        return new Response(JSON.stringify({ message: 'Users added to the project', project: updatedProject }), { status: 200 });
    } catch (error) {
        console.error('Error adding users to the project:', error);
        return new Response(JSON.stringify({ message: 'Failed to add users to the project' }), { status: 500 });
    }
}