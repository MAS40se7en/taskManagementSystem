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

  export const POST: RequestHandler = async ({ request }) => {
    try {
        const { tasks, projectId } = await request.json();

        // Log the incoming data
        console.log("Tasks received:", tasks);
        console.log("Project ID received:", projectId);

        // Check if tasks and projectId are valid
        if (!tasks || !projectId) {
            return new Response(JSON.stringify({ message: 'Invalid data provided' }), { status: 400 });
        }

        // Convert projectId to an integer
        const projectIdInt = parseInt(projectId, 10);

        // Verify that the project exists before adding tasks
        const project = await prisma.project.findUnique({
            where: { id: projectIdInt },
        });

        if (!project) {
            return new Response(JSON.stringify({ message: 'Project not found' }), { status: 404 });
        }

        // Loop through tasks and create them in the database
        for (const task of tasks) {
            // Log task data to check if everything is correct
            console.log("Creating task:", task);

            await prisma.task.create({
                data: {
                    title: task.title,
                    description: task.description,
                    imageUrl: task.imageUrl || null, // Handle null imageUrl
                    deadline: task.deadline,
                    instructions: task.instructions || {}, // Handle empty instructions
                    projectId: projectIdInt // Associate the task with the project
                }
            });
        }

        return new Response(JSON.stringify({ message: 'Tasks created successfully' }), { status: 200 });
    } catch (error) {
        // Log the detailed error message
        console.error("Error creating tasks:", error);
        return new Response(JSON.stringify({ message: 'Failed to create tasks', error }), { status: 500 });
    }
};

