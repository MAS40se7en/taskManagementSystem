import { prisma } from "$lib/prisma";
import { json } from "@sveltejs/kit";

export async function POST({ locals, request, params }) {
    const { user } = locals;
    if (!user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const { deletedUserId } = await request.json();

    const { id } = params;
    const projectId = parseInt(id, 10);

    if (!projectId || !deletedUserId) {
        return json({ message: 'Invalid project or user ID' }, { status: 400 });
    }

    try {
        await prisma.project.update({
            where: { id: projectId },
            data: {
                users: {
                    disconnect: {
                        id: deletedUserId
                    }
                }
            }
        });

        return json({ success: true });
    } catch (error) {
        console.error('Database update failed: ', error);
        return json({ message: 'Internal server error' }, { status: 500 });
    }
}