import { prisma } from "$lib/prisma";

export async function GET({locals}) {
    try {
        const { user } = locals;
    
    if (!user) {
        return new Response('Unauthorized', { status: 401 });
    }

    return new Response(JSON.stringify({ message: 'User information retrieved', user}), { status: 200})
    } catch (error) {
        return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
    }
}

export async function DELETE({ locals, request }) {
    try {
        const { userId } = await request.json();
        const { user } = locals;

        if (userId !== user?.id) {
            return new Response(JSON.stringify({ message: 'unauthorized' }), { status: 400 });
        }
        

        await prisma.project.deleteMany({
            where: { createdById: userId }
        })

        const projects = await prisma.project.findMany({
            where: {
                users: {
                    some: {
                        id: userId
                    }
                }
            },
            include: {
                users: true
            }
        });

        for (const project of projects) {
            const updatedUsers = project.users.filter(user => user.id !== userId);

            await prisma.project.update({
                where: {
                    id: project.id,
                },
                data: {
                    users: {
                        disconnect: [{ id: userId }]
                    }
                }
            })
        }

        await prisma.session.deleteMany({
            where: { userId: userId }
        });

        await prisma.passwordResetTokens.deleteMany({
            where: { userId: userId }
        });

        await prisma.task.deleteMany({
            where: {
                createdById: userId
            }
        })


        // Delete the user
        await prisma.user.delete({
            where: { id: userId }
        });

        return new Response('User deleted successfully', { status: 200 });
    } catch (error) {
        console.error('Error deleting user:', error);
        return new Response('Failed to delete user', { status: 500 });
    }
}