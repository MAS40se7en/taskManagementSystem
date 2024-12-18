import { prisma } from "$lib/prisma";
import { json } from '@sveltejs/kit';

export async function GET({ locals }) {
    const { user } = locals;

    if (!user) {
      return new Response(JSON.stringify({ message: 'Unauthorized'}), { status: 401 });
    }

    try {
      const projects = await prisma.project.findMany({
        where: {
            OR: [
                {
                  users: {
                    some: {
                      id: user?.id
                    }
                  }
                },
                {
                  createdById: user?.id
                }
              ]
        },
        include: {
          users: true
        }
    });

    
    return new Response(JSON.stringify({ message: 'projects data retrieved', projects: projects.map(project => ({
      ...project,
      userCount: project.users.length, // Add user count for each project
    })), user}), { status: 200});
    } catch (error) {
      console.error('Error fetching projects:', error);
      return new Response(JSON.stringify({ message: 'Error fetching projects' }), { status: 500 });
    }
}