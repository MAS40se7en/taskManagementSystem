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

    return json({task, user});
  } catch (error) {
    console.error('Database query failed:', error);
    return json({ message: 'Internal server error' }, { status: 500 });
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
      return json({ message: 'Task Deleted' }, { status: 200 });
    } catch (error) {
      console.error('Database deletion failed:', error);
      return json({ message: 'Internal server error' }, { status: 500 });
    }
  }
