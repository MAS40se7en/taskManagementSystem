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
            }
        })

        const tasks = await prisma.task.findMany({
            where: {
                createdById: user?.id
            }
        });

        return new Response(JSON.stringify({ projects, tasks, user }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ message: "Error fetching data." }), { status: 500 })
    }
}