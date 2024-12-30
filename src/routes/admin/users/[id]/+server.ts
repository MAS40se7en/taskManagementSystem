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