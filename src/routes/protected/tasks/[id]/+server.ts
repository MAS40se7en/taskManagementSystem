import { prisma } from '$lib/prisma';
import { json } from '@sveltejs/kit';

export async function GET({ params, locals }) {
  const { id } = params;
  const taskId = parseInt(id, 10);

  const user = locals.user;

  if (isNaN(taskId)) {
    return json({ message: 'Invalid ID' }, { status: 400 });
  }

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { 
        createdBy: true
       }
    });

    if (!task) {
      return json({ message: 'Task not found' }, { status: 404 });
    }

    return new Response(JSON.stringify({ message: 'data retrieved', task, user }), {status: 200});
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
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

      if (user?.id !== task?.createdById) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 403 });
      }

      const updatedTask  = await prisma.task.update({
        where: { id: id },
        data: { completed: !task.completed }
      });

      return new Response(JSON.stringify({ message: 'Task completed' }), { status: 200 });
    } catch (error) {
      console.error('Database update failed:', error);
      return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
    }
  }