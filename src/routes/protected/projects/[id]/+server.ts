import { prisma } from '$lib/prisma.js';
import { json } from '@sveltejs/kit';

export async function GET({ params, locals }) {
  const { id } = params;
  const projectId = parseInt(id, 10);
  const { user } = locals;

  if (isNaN(projectId)) {
    return new Response(JSON.stringify({ message: 'Invalid ID' }), { status: 400 });
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
      return new Response(JSON.stringify({ message: 'Project not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: 'Project data retrieved', project, user}), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  }
}

export async function DELETE({ params }) {
    const { id } = params;
    const projectId = parseInt(id, 10);
  
    if (isNaN(projectId)) {
      return new Response(JSON.stringify({ message: 'Invalid ID' }), { status: 400 });
    }
  
    try {
      await prisma.project.delete({
        where: { id: projectId }
      });
      return new Response(JSON.stringify({ message: 'project Deleted' }), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
    }
  }

  export async function POST({ locals, params }) {
    const { user } = locals;
    const { id } = params;
    const projectId = parseInt(id, 10);


    if (!user) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    try {
      await prisma.project.update({
        where: { id: projectId },
        data: {
          completed: true,
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
    }

    return new Response(JSON.stringify({ message: 'Project updated successfully' }), { status: 200 });
  }