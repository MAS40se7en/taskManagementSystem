import { prisma } from "$lib/prisma";
import { json } from '@sveltejs/kit';

export async function GET({ locals }) {
    const { user } = locals;
    
    const tasks = await prisma.task.findMany({
        where: {
            createdById: user?.id
        }
    });

    return json({tasks, user});
}