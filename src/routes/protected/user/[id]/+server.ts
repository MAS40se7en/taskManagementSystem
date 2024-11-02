import { prisma } from "$lib/prisma";
import { json } from "@sveltejs/kit";

export async function GET({ locals, params }) {
    const { id } = params;
    const userId = id;

    const { user } = locals;
    
    if (!user) {
        return new Response("User not logged in", { status: 401 });
    }

    if (!userId) {
        return json({ message: 'Invalid ID' }, { status: 400 });
    }
    
    try {
        const userProfile = await prisma.user.findUnique({
            where: { id: userId},
            select: {
                name: true,
                image: true,
                email: true,
                projects: true,
                associations: true,
            }
        });

        const relatedProjectCount = await prisma.project.count({
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
          });

          const completedProjectCount = await prisma.project.count({
            where: {
                completed: true,
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
          });

          const relatedTaskCount = await prisma.task.count({
            where: {
                  createdById: user?.id
            }
          });

          const completedTaskCount = await prisma.task.count({
            where: {
                createdById: user?.id,
                completed: true
            }
          })

        return new Response(JSON.stringify({ message: 'User profile', completedProjectCount, completedTaskCount, relatedTaskCount, userProfile, relatedProjectCount}), { status: 200 });
    } catch (error) {
        return json({ message: 'Failed to retrieve user profile' }, { status: 500 });
    }
}