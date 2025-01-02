import { json } from "@sveltejs/kit";
import { prisma } from '$lib/prisma';

export async function GET({ locals }) {
    const { user } = locals;

    if (!user) {
        return new Response(JSON.stringify({ message: "unauthorized" }), { status: 400 });
    }

    try {
        const tasks = await prisma.task.findMany();

        return new Response(JSON.stringify({ message: 'got tasks', tasks }), { status: 200 });
    } catch(error) {
        return new Response(JSON.stringify({ message: 'error occurred' }), { status: 400 });
    }
}

export async function DELETE({ request }) {
    const { taskId } = await request.json();
    const id = parseInt(taskId, 10);
  
    if (isNaN(id)) {
      return json({ message: 'Invalid ID' }, { status: 400 });
    }
  
    try {
      await prisma.task.delete({
        where: { id: id }
      });
      return new Response(JSON.stringify({ message: 'Task Deleted' }), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
    }
  }