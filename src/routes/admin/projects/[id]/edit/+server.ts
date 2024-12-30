import { prisma } from "$lib/prisma";

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
      });
  
      if (!project) {
        return new Response(JSON.stringify({ message: 'Project not found' }), { status: 404 });
      }
  
      return new Response(JSON.stringify({ message: 'Project data retrieved', project, user}), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
    }
  }

  export async function POST({ request, locals }) {
    const { user } = locals;
    const data = await request.formData();
    const { projectId, title, description, startsAt, endsAt } = Object.fromEntries(data) as Record<string, string>;

    if (!user) {
        return new Response(JSON.stringify({ message: 'User not authenticated' }), { status: 401 });
    }

    const id = parseInt(projectId, 10);

    if (!projectId || !title || !description || !startsAt || !endsAt) {
        return new Response(JSON.stringify({ message: 'Missing required fields' }), { status: 400 });
    }    

    try {
        const project = await prisma.project.update({
            where: {
                id: id
            },
            data: {
                title,
                description,
                startsAt: new Date(startsAt),
                endsAt: new Date(endsAt),
                createdById: user?.id,
            }
        })

        return new Response(JSON.stringify({ message: "Project has been updated!", newProject: project }), { status: 200 });
    } catch (error) {
        console.error("Error creating task:", error);
        return new Response(JSON.stringify({ message: "Failed to update task." }), { status: 500 });
    }
}