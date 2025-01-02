import { json } from "@sveltejs/kit";
import { prisma } from '$lib/prisma';

export async function GET({ params, locals }) {
    const taskId = parseInt(params.id);
    const { user } = locals;

    if (!user) {
        return new Response(JSON.stringify({ message: 'unauthorized' }), {status: 400})
    }

    try {
        const task = await prisma.task.findUnique({
            where: {
                id: taskId
            },
            include: {
                createdBy: true,
                project: true
            }
        });

        if (!task) {
            return new Response(JSON.stringify({ message: 'Task not found' }), { status: 404 });
        }

        return new Response(JSON.stringify({ message: 'task loaded', task }), { status: 200 });
    } catch(error) {
        return new Response(JSON.stringify({ message: error }), { status: 400 });
    }
}

export async function DELETE({ params }) {
    const { id } = params;
    const taskId = parseInt(id, 10);
  
    if (isNaN(taskId)) {
      return json({ message: 'Invalid ID' }, { status: 400 });
    }
  
    try {
      await prisma.task.delete({
        where: { id: taskId }
      });
      return new Response(JSON.stringify({ message: 'Task Deleted' }), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
    }
  }


  export async function POST({ locals, request }) {
    const { user } = locals;
    const { taskId } = await request.json();

    const id = parseInt(taskId, 10);

    if (!taskId) {
      return new Response(JSON.stringify({ message: 'Missing required fields' }), { status: 400 });
    }

    if (!user) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    try {
      const task = await prisma.task.findUnique({
        where: { id: id }
      });

      const updatedTask  = await prisma.task.update({
        where: { id: id },
        data: { completed: !task?.completed }
      });

      return new Response(JSON.stringify({ message: 'Task completed', updatedTask }), { status: 200 });
    } catch (error) {
      console.error('Database update failed:', error);
      return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
    }
  }