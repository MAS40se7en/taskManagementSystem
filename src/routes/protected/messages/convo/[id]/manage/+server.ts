import { prisma } from '$lib/prisma';

export async function GET({ locals, params }) {
    const { user } = locals;
    const { id } = params;

    const convoId = parseInt(id, 10);

    if (!user) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const allUsers = await prisma.user.findMany();
        const convo = await prisma.conversation.findUnique({
            where: { id: convoId },
            include: {
                participants: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
            }
        });

        console.log(convo)

        return new Response(JSON.stringify({ message: 'Conversation retrieved', allUsers, convo, user }), { status: 200 });
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

export async function DELETE({ params, locals }) {
    const { user } = locals;

    const { id } = params;
    const convoId = parseInt(id, 10);

    if (!user) {
        return new Response(JSON.stringify({ message: 'unauthorized!' }), { status: 400 });
    }

    console.log(convoId);

    try {
        await prisma.conversation.delete({
            where: {
                id: convoId
            }
        });

        return new Response(JSON.stringify({ message: 'Conversation deleted!' }), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ message: 'Conversation could not be deleted!' }), { status: 400 });
    }
}