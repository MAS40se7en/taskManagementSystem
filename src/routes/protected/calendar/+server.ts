import { prisma } from '$lib/prisma.js';

export async function GET({ locals }) {
	const { user } = locals;

	if (!user) {
		return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
	}

	try {
		const currentUser = await prisma.user.findUnique({
			where: {
				id: user.id
			}
		});

		const userTasks = await prisma.task.findMany({
			where: {
				createdById: user?.id
			},
            include: {
                project: true
            }
		});

		const relatedProjectsWithTasks = await prisma.project.findMany({
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
			,
			include: {
				createdBy: true,
				users: true,
				tasks: true
			}
		});

        const relatedTasks = relatedProjectsWithTasks.flatMap(project => project.tasks.map(task => ({
            id: task.id,
            title: task.title,
            urgency: task.urgency,
            startsAt: task.startsAt,
            endsAt: task.endsAt,
            deadline: task.deadline
          })));

        const allTasks = [
      ...userTasks.map(task => ({
        id: task.id,
        title: task.title,
        urgency: task.urgency,
        startsAt: task.startsAt,
        endsAt: task.endsAt,
        deadline: task.deadline
      })),
      ...relatedTasks
    ];

		return new Response(
			JSON.stringify({
				message: 'All related tasks gotten',
				user: currentUser,
				userTasks,
                relatedTasks,
                allTasks,
				relatedProjectsWithTasks: relatedProjectsWithTasks.map(project => ({
					...project,
					userCount: project.users.length, // Add user count for each project
				  }))
			})
		); //;
	} catch (error) {
		return new Response(JSON.stringify({ message: 'Failed to fetch user related tasks' }), {
			status: 500
		});
	}
}
