import { prisma } from "$lib/prisma";
import { json } from '@sveltejs/kit';

export async function GET({ locals }) {
    const { user } = locals;

    const projects = await prisma.project.findMany({
        where: {
            createdById: user?.id
        }
    });

    
    return json(projects);
}