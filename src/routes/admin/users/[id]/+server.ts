import { prisma } from '$lib/prisma';

export async function GET({ params }) {
    const id = params.id;
    
    if (!id) {
        return new Response(JSON.stringify({ message: 'no id provided' }), { status: 400 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: id
            },
            include:{
                _count: {
                    select: {
                        createdProjects: true,
                        createdTasks: true,
                    }
                },
                createdProjects: true,
                createdTasks: true
            }
        });

        const taskCount = await prisma.task.count({
            where: {
              createdById: user?.id
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
        
          const completedTaskCount = await prisma.task.count({
            where: {
                createdById: user?.id,
                completed: true
            }
          });

          if (!user) {
            return new Response(JSON.stringify({ message: 'no user found with this id' }), { status: 400 });
        };
        
          return new Response(JSON.stringify({
            taskCount,
            relatedProjectCount,
            user,
            completedProjectCount,
            completedTaskCount,
          }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ message: 'error getting user data' }), { status: 400 });
    }
}

export async function DELETE({ params, locals }) {
    const id = params.id;
    const { user } = locals;

    if (!user) {
        return new Response(JSON.stringify({ message: 'unauthorised' }), { status: 200 });
    }

    console.log(id);

    try {
        await prisma.project.deleteMany({
            where: { createdById: id }
        })

        const projects = await prisma.project.findMany({
            where: {
                users: {
                    some: {
                        id: id
                    }
                }
            },
            include: {
                users: true
            }
        });

        for (const project of projects) {
            const updatedUsers = project.users.filter(user => user.id !== id);

            await prisma.project.update({
                where: {
                    id: project.id,
                },
                data: {
                    users: {
                        disconnect: [{ id: id }]
                    }
                }
            })
        }

        const conversations = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: {
                        id: id
                    }
                }
            },
            include: {
                participants: true
            }
        });

        for (const conversation of conversations) {
            if (conversation.participants.length <= 2) {
                await prisma.conversation.delete({
                    where: {
                        id: conversation.id
                    }
                })
            } else {
                await prisma.conversation.update({
                    where: {
                        id: conversation.id,
                    },
                    data: {
                        participants: {
                            disconnect: [{ id: id }]
                        }
                    }
                })
            }
        }

        await prisma.message.deleteMany({
            where: {
                senderId: id
            }
        })

        await prisma.session.deleteMany({
            where: { userId: id }
        });

        await prisma.passwordResetTokens.deleteMany({
            where: { userId: id }
        });

        await prisma.task.deleteMany({
            where: {
                createdById: id
            }
        })


        // Delete the user
        await prisma.user.delete({
            where: { id: id }
        });

        

        console.log('user deleted')

        return new Response(JSON.stringify({ message: 'user deleted successfully' }), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ message: 'error deleting user' }), { status: 400 });
    }
}