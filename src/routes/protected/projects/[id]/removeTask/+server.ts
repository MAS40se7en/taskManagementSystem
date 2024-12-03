import { prisma } from '$lib/prisma.js';

export async function DELETE({locals, request}) {
    const { user } = locals;
    const data = await request.json();

    if (!user) {
        return new Response(JSON.stringify({message: 'unauthorized'}), { status: 400});
    }

    const taskId = data.taskId;

    try {
        await prisma.task.delete({
            where: {
                id: taskId
            }
        });

        return new Response(JSON.stringify({ message: 'Task deleted successfully!'}), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ message: 'Could not remove task!' }), {status: 400});
    }
}