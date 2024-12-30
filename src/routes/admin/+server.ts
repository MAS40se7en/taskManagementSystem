import { prisma } from '$lib/prisma';

export async function GET({ locals }) {
    const { user } = locals;

    if (!user) {
        return new Response(JSON.stringify({ message: 'unauthorized access' }), { status: 400 });
    }

    try {
        const projects = await prisma.project.findMany()

        const tasks = await prisma.task.findMany();

        return new Response(JSON.stringify({ projects, tasks }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ message: "Error fetching data." }), { status: 500 })
    }
}

export async function POST({ request }) {
    const { itemId, itemType } = await request.json();

    try {
        if (itemType === 'Project') {
            await prisma.project.delete({
                where: {
                    id: itemId
                }
            });
        } else if (itemType === 'Task') {
            await prisma.task.delete({
                where: {
                    id: itemId
                }
            });
        }

        return new Response(JSON.stringify({ message: 'item deleted successfully' }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error, message: 'could not delete item' }), { status: 400 })
    }
}