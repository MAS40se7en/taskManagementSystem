import { prisma } from '$lib/prisma.js';
import { json } from '@sveltejs/kit';

export async function GET({ params, locals }) {
  const { id } = params;
  const projectId = parseInt(id, 10);
  const { user } = locals;

  if (isNaN(projectId)) {
    return json({ message: 'Invalid ID' }, { status: 400 });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { 
        tasks: true,
        createdBy: true,
        users: true
       }
    });

    if (!project) {
      return json({ message: 'Task not found' }, { status: 404 });
    }

    return json({project, user});
  } catch (error) {
    return json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE({ params }) {
    const { id } = params;
    const projectId = parseInt(id, 10);
  
    if (isNaN(projectId)) {
      return json({ message: 'Invalid ID' }, { status: 400 });
    }
  
    try {
      await prisma.project.delete({
        where: { id: projectId }
      });
      return json({ message: 'project Deleted' }, { status: 200 });
    } catch (error) {
      return json({ message: 'Internal server error' }, { status: 500 });
    }
  }

  export async function POST({ locals, params }) {
    const { user } = locals;
    const { id } = params;
    const projectId = parseInt(id, 10);


    if (!user) {
      return json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
      await prisma.project.update({
        where: { id: projectId },
        data: {
          completed: true,
        }
      });
    } catch (error) {
      return json({ message: 'Internal server error' }, { status: 500 });
    }

    return new Response;
  }