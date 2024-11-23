import { prisma } from '$lib/prisma.js';

export async function GET({locals}) {
    const { user } = locals;

    if (!user) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const currentUser = await prisma.user.findUnique({
            where: {
                id: user?.id,
            },
            select: {
                id: true,
                name: true,
                email: true,
                isVerified: true
            }
        });

        return new Response(JSON.stringify({ message: 'user info retrieved', user: currentUser}))
    } catch (error) {
        return new Response(JSON.stringify({ message: 'Error fetching data.' }), { status: 500 })
    }
}

export async function POST({ locals, request }) {
    const { user } = locals;

    if (!user) {
        return new Response(JSON.stringify({ message: 'User not authenticated' }), { status: 401 });
    }

    try {
        const { name, email } = await request.json();

        if (!name && !email) {
            return new Response(JSON.stringify({ message: 'One updated field is required to Save!' }), { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { name, email },
        });

        return new Response(JSON.stringify({ message: 'User info updated', user: updatedUser }))
    } catch (error) {
        console.error(error);
        return new Response(
            JSON.stringify({ message: 'Error updating data.' }),
            { status: 500 }
        );    }
}