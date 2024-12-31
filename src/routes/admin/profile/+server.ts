import { lucia } from "$lib/server/auth.js";

export async function GET({ locals }) {
    if (!locals.session) {
      return new Response('Unauthorized', { status: 401 });
    }
  
    const user = locals.user;
  
    try {
        const currentUser = await prisma.user.findUnique({
            where: {
                id: user?.id
            },
            include: {
                _count: {
                    select: {
                        createdTasks: true,
                        createdProjects: true,
                        projects: true
                    }
                },
                createdTasks: true,
                createdProjects: true,
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
      })
    
      return new Response(JSON.stringify({
        taskCount,
        relatedProjectCount,
        user: currentUser,
        completedProjectCount,
        completedTaskCount,
      }), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ message: 'Error fetching data.' }), { status: 500 })
    }
  }

  export async function POST({ locals, cookies }) {
    try {
      if (!locals.session) {
        return new Response('Unauthorized', { status: 401 });
      }
      
    
      // Invalidate the session
      await lucia.invalidateSession(locals.session.id);
    
      // Clear session cookies
      const sessionCookie = lucia.createBlankSessionCookie();
      cookies.set(sessionCookie.name, sessionCookie.value, {
        path: ".",
        ...sessionCookie.attributes,
      });
    
      // Redirect or return a success response
      return new Response(null, { status: 204 });
    } catch (error) {
      console.error(error);
    }
  }
  
  export async function DELETE({ request, locals, cookies }) {
    const { userId } = await request.json();
    const { user } = locals;

    if (!locals.session) {
      return new Response('Unauthorized', { status: 401 });
    }
    

    if (!user) {
        return new Response(JSON.stringify({ message: 'unauthorised' }), { status: 200 });
    }

    if (userId === user.id) {
      return new Response(JSON.stringify({ message: 'unauthorised' }), { status: 200 });
  }

    console.log(userId);

    try {
        await prisma.project.deleteMany({
            where: { createdById: userId }
        })

        const projects = await prisma.project.findMany({
            where: {
                users: {
                    some: {
                        id: userId
                    }
                }
            },
            include: {
                users: true
            }
        });

        for (const project of projects) {
            const updatedUsers = project.users.filter(user => user.id !== userId);

            await prisma.project.update({
                where: {
                    id: project.id,
                },
                data: {
                    users: {
                        disconnect: [{ id: userId }]
                    }
                }
            })
        }

        const conversations = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: {
                        id: userId
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
                            disconnect: [{ id: userId }]
                        }
                    }
                })
            }
        }

        await prisma.message.deleteMany({
            where: {
                senderId: userId
            }
        })

        await prisma.session.deleteMany({
            where: { userId: userId }
        });

        await prisma.passwordResetTokens.deleteMany({
            where: { userId: userId }
        });

        await prisma.task.deleteMany({
            where: {
                createdById: userId
            }
        })


        // Delete the user
        await prisma.user.delete({
            where: { id: userId }
        });

        

        console.log('user deleted')

        return new Response(JSON.stringify({ message: 'user deleted successfully' }), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ message: 'error deleting user' }), { status: 400 });
    }
}