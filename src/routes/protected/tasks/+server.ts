import { prisma } from "$lib/prisma";
import { json } from '@sveltejs/kit';

export async function GET({ locals }) {
    const { user } = locals;

    if (!user) {
        return new Response('Unauthorized', { status: 401 });
    }
    
    try {
        const tasks = await prisma.task.findMany({
            where: {
                createdById: user?.id
            }
        });
    
        return new Response(JSON.stringify({ message: 'retrieved data', tasks, user}), { status: 200 });
    } catch (error) {
        console.error('Error fetching data:', error);
        return new Response(JSON.stringify({ message: 'Failed to fetch data' }), { status: 500 });
    }
}