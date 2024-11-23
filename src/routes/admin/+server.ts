import { prisma } from '$lib/prisma';

export async function GET({ locals }) {
    const { user } = locals;

    try {
        const projects = await prisma.project.findMany()

        const tasks = await prisma.task.findMany();

        return new Response(JSON.stringify({ projects, tasks }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ message: "Error fetching data." }), { status: 500 })
    }
}