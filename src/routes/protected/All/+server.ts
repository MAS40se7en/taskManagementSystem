import { prisma } from '$lib/prisma.js';

export async function GET({ locals }) {
    const { user } = locals;

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
        })

        const tasks = await prisma.task.findMany({
            where: {
                createdById: user?.id
            },
            include: {
              project: true
            }
        });

        return new Response(JSON.stringify({ projects: projects.map(project => ({
          ...project,
          userCount: project.users.length, // Add user count for each project
        })), tasks, user }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ message: "Error fetching data." }), { status: 500 })
    }
}