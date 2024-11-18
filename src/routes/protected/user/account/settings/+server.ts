import { prisma } from "$lib/prisma";

export async function GET({locals}) {
    try {
        const { user } = locals;
    
    if (!user) {
        return new Response('Unauthorized', { status: 401 });
    }

    return new Response(JSON.stringify({ message: 'User information retrieved', user}), { status: 200})
    } catch (error) {
        return new Response('Internal server error', { status: 500 });
    }
}

export async function DELETE({ locals, request }) {
    const { user } = locals;
    const { id } = await request.json();
    const userId = id;

    if (!user) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        await prisma.user.delete({
            where: { id: userId }
        })

        return new Response('User deleted successfully', { status: 200 });
    } catch (error) {
        return new Response('Failed to delete user', { status: 500 });
    }
}