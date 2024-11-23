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

        const possibleConvo = await prisma.conversation.findFirst({
          where: {
            AND: [
              {
                participants: {
                  some: {
                    id: user?.id,
                  },
                },
              },
              {
                participants: {
                  some: {
                    id: userId,
                  },
                },
              },
            ],
          },
        });
        

        const relatedProjectCount = await prisma.project.count({
            where: {
              OR: [
                {
                  users: {
                    some: {
                      id: userId
                    }
                  }
                },
                {
                  createdById: userId
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
                      id: userId
                    }
                  }
                },
                {
                  createdById: userId
                }
              ]
            }
          });

          const sharedProjects = await prisma.project.findMany({
            where: {
              OR: [
                {
                  AND: [
                    {
                      users: {
                        some: {
                          id: userId,
                        }
                      }
                    },
                    {
                      users: {
                        some: {
                          id: user?.id,
                        }
                      }
                    }
                  ],
                },
                {
                  AND: [
                    {
                      createdById: userId,
                    },
                    {
                      users: {
                        some: {
                          id: user?.id,
                        }
                      }
                    }
                  ],
                },
                {
                  AND: [
                    {
                      createdById: user?.id,
                    },
                    {
                      users: {
                        some: {
                          id: userId,
                        }
                      }
                    }
                  ]
                }
              ]
            }
          });

          const relatedTaskCount = await prisma.task.count({
            where: {
                  createdById: userId
            }
          });

          const completedTaskCount = await prisma.task.count({
            where: {
                createdById: userId,
                completed: true
            }
          })

        return new Response(JSON.stringify({ message: 'User profile', completedProjectCount, sharedProjects, completedTaskCount, relatedTaskCount, userProfile, relatedProjectCount, user, possibleConvo}), { status: 200 });
    } catch (error) {
        return json({ message: 'Failed to retrieve user profile' }, { status: 500 });
    }
}

export async function POST({ locals, params }) {
  const { user } = locals;
  
  if (!user) {
    return new Response("User not logged in", { status: 401 });
  }

  const { id } = params;
  const userId = id;

    try {
        const conversation = await prisma.conversation.create({
            data: {
                participants: {
                    connect: [
                        { id: user?.id },
                        { id: userId }
                    ]
                },
            }
        });

        return new Response(JSON.stringify({ message: 'data retrieved', conversationId: conversation.id}), { status: 200 });
    } catch (error) {
        console.error("Error creating conversation: ", error);
        return new Response(JSON.stringify({ message: 'error getting the user data' }), { status: 401 });

    }
}

export async function DELETE({ locals, params }) {
  const { user } = locals;
  const { id } = params;
  const userId = id;

  if (!user) {
    return json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const updatedAssociations = Array.isArray(user.associations)
      ? user.associations.filter(associationId => associationId !== userId)
      : []

      await prisma.user.update({
        where: { id: user?.id},
        data: {
          associations: updatedAssociations
        }
      });

      return new Response(JSON.stringify({ message: 'Associations removed successfully' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Error removing association', error }), { status: 500 });
  }
}