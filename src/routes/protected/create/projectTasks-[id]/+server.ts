import { prisma } from "$lib/prisma";
import { json, type RequestHandler } from "@sveltejs/kit";

export async function GET({ params }) {
    const { id } = params;
    const projectId = parseInt(id, 10);
  
    if (isNaN(projectId)) {
      return json({ message: 'Invalid ID' }, { status: 400 });
    }
  
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId }
      });
  
      if (!project) {
        return json({ message: 'Task not found' }, { status: 404 });
      }
  
      return json(project);
    } catch (error) {
      console.error('Database query failed:', error);
      return json({ message: 'Internal server error' }, { status: 500 });
    }
  }

  export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        const { tasks, projectId } = await request.json();
        const { user } = locals;

        console.log("Tasks received:", tasks);
        console.log("Project ID received:", projectId);


        if (!tasks || !projectId) {
            return new Response(JSON.stringify({ message: 'Invalid data provided' }), { status: 400 });
        }


        const projectIdInt = parseInt(projectId, 10);


        const project = await prisma.project.findUnique({
            where: { id: projectIdInt },
        });

        if (!project) {
            return new Response(JSON.stringify({ message: 'Project not found' }), { status: 404 });
        }


        for (const task of tasks) {
            console.log("Creating task:", task);

            await prisma.task.create({
                data: {
                    title: task.title,
                    description: task.description,
                    deadline: task.deadline ? new Date(task.deadline) : null,
                    instructions: task.instructions || {},
                    projectId: projectIdInt,
                    urgency: task.urgency,
                    createdById: user?.id
                }
            });
        }

        return new Response(JSON.stringify({ message: 'Tasks created successfully' }), { status: 200 });
    } catch (error) {
        console.error("Error creating tasks:", error);
        return new Response(JSON.stringify({ message: 'Failed to create tasks', error }), { status: 500 });
    }
};

