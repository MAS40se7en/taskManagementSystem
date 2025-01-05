import { prisma } from '$lib/prisma';
import { json, type RequestHandler } from '@sveltejs/kit';
import path from 'path';
import fs from 'fs';
import admin from '$lib/server/firebaseAdmin';

export async function GET({ params, locals }) {
	const { id } = params;
	const { user } = locals;
	const projectId = parseInt(id, 10);

	if (isNaN(projectId)) {
		return json({ message: 'Invalid ID' }, { status: 400 });
	}

	try {
		const currentUser = await prisma.user.findUnique({
			where: {
				id: user?.id
			}
		})
		const project = await prisma.project.findUnique({
			where: { id: projectId }
		});

		if (!project) {
			return json({ message: 'Task not found' }, { status: 404 });
		}

		return json({ project, user: currentUser });
	} catch (error) {
		return json({ message: 'Internal server error' }, { status: 500 });
	}
}

export const POST: RequestHandler = async ({ request, locals }) => {
	const { tasks, projectId } = await request.json();
	const { user } = locals;

	if (!user || !user.id) {
		return new Response(JSON.stringify({ message: 'User not authenticated' }), { status: 401 });
	}


	if (!tasks || !projectId) {
		return new Response(JSON.stringify({ message: 'Invalid data provided' }), { status: 400 });
	}

	const projectIdInt = parseInt(projectId, 10);
	const project = await prisma.project.findUnique({
		where: { id: projectIdInt },
		include: {
			tasks: true,
			users: true,
		}
	});

	if (!project) {
		return new Response(JSON.stringify({ message: 'Project not found' }), { status: 404 });
	}

	try {
		const currentUser = await prisma.user.findUnique({
			where: {
				id: user?.id
			}
		})
		const isUpgraded = currentUser?.upgraded;

		const taskLimit = 10;
		const taskCount = tasks.length;

		if (!isUpgraded && project.tasks.length + tasks.length >= taskLimit) {
			return new Response(
				JSON.stringify({
					message: `Task limit of ${taskLimit}, was reached. Upgrade to Plus to create more tasks.`
				}),
				{ status: 403 }
			)
		}
		await Promise.all(
			tasks.map(async (task: any) => {
				let instructionsPath = null;

				const taskImage = task.image;
				let savedImagePath: string | null = null;

				if (taskImage) {
					const base64Data = taskImage.replace(/^data:image\/\w+;base64,/, '');
					const buffer = Buffer.from(base64Data, 'base64');

					const fileName = `${Date.now()}-task-image.png`;
					const filePath = path.join('static/uploads/pfp', fileName);

					fs.writeFileSync(filePath, buffer);

					savedImagePath = `/uploads/pfp/${fileName}`;
				}

				if (task.instructions.type == 'audio' && task.instructions.path) {
					const base64Data = task.instructions.path.replace(/^data:audio\/\w+;base64,/, '');
					const buffer = Buffer.from(base64Data, 'base64');

					const fileName = `instruction_${Date.now()}.wav`;
					const filePath = path.join('static', 'uploads', 'audio', fileName);

					fs.writeFileSync(filePath, buffer);

					instructionsPath = `/uploads/audio/${fileName}`;
					console.log(instructionsPath);
				}

				if (!task.title || !task.description || (!task.deadline && (!task.endsAt || !task.startsAt))) {
					return new Response(JSON.stringify({ message: 'Failed to create tasks' }), { status: 500 });
				}

				return await prisma.task.create({
					data: {
						title: task.title,
						description: task.description,
						projectId: project.id,
						createdById: user.id,
						instructions:
							task.instructions.type === 'text'
								? { type: 'text', content: task.instructions.content }
								: { type: 'audio', path: instructionsPath },
						deadline: task.deadline ? new Date(task.deadline) : null,
						startsAt: task.startsAt ? new Date(task.startsAt) : null,
						endsAt: task.endsAt ? new Date(task.endsAt) : null,
						urgency: task.urgency,
						imagePath: savedImagePath
					}
				});
			})
		);

		for (const user of project.users) {
			const fcmToken = user.deviceFcmToken;

			if (fcmToken) {
				const payload = {
					notification: {
						title: `Project: ${project.title}`,
						body: `${currentUser?.name} added ${taskCount} tasks to the project`
					},
					token: fcmToken
				};

				try {
					await admin.messaging().send(payload);
				} catch (error) {
					console.error(`Error sending notification for created tasks in project: ${project.title}, `, error)
				}
			}
		}

		return new Response(JSON.stringify({ message: 'Tasks created successfully' }), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ message: 'Failed to create tasks' }), { status: 500 });
	}
};
