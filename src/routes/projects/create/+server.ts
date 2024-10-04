import { prisma } from '$lib/prisma.js';

export async function POST({ request, cookies, locals}) {
    const { user } = locals;
    const data = await request.formData();
    const { title, description, startsAt, endsAt } = Object.fromEntries(data) as Record<string, string>;

    if (!title || !description) {
        return new Response(JSON.stringify({ message: "Title and Description are required!" }), { status: 400 });
    }
    
    const newProject = await prisma.project.create({
        data: {
            title,
            description,
            startsAt: startsAt ? new Date(startsAt) : null,
            endsAt: endsAt ? new Date(endsAt) : null,
            createdById: user?.id
        }
    });

    return new Response(JSON.stringify({ id: newProject.id }), { status: 200 });
}