import { prisma } from '$lib/prisma';
import { json, type RequestHandler } from '@sveltejs/kit';
import path from 'path';
import fs from 'fs';

export async function GET({ params }) {
	const { id } = params;
	const projectId = parseInt(id, 10);

	if (isNaN(projectId)) {
		return json({ message: 'Invalid ID' }, { status: 400 });
	}

	try {
		const project = await prisma.project.findUnique({
			where: { id: projectId }
		});

		if (!project) {
			return json({ message: 'Task not found' }, { status: 404 });
		}

		return json(project);
	} catch (error) {
		console.error('Database query failed:', error);
		return json({ message: 'Internal server error' }, { status: 500 });
	}
}

export const POST: RequestHandler = async ({ request, locals }) => {
	const { tasks, projectId } = await request.json();
	const { user } = locals;

	if (!user || !user.id) {
		return new Response(JSON.stringify({ message: 'User not authenticated' }), { status: 401 });
	}

	console.log('Tasks received:', tasks);
	console.log('Project ID received:', projectId);

	if (!tasks || !projectId) {
		return new Response(JSON.stringify({ message: 'Invalid data provided' }), { status: 400 });
	}

	const projectIdInt = parseInt(projectId, 10);
	const project = await prisma.project.findUnique({
		where: { id: projectIdInt }
	});

	if (!project) {
		return new Response(JSON.stringify({ message: 'Project not found' }), { status: 404 });
	}

	try {
		const createdTasks = await Promise.all(
			tasks.map(async (task: any) => {
				let instructionsPath = null;
				if (task.instructions.type == 'audio' && task.instructions.path) {
					const base64Data = task.instructions.path.replace(/^data:audio\/\w+;base64,/, '');
					const buffer = Buffer.from(base64Data, 'base64');

					const fileName = `instruction_${Date.now()}.wav`;
					const filePath = path.join('static', 'uploads', 'audio', fileName);

					fs.writeFileSync(filePath, buffer);

					instructionsPath = `/uploads/audio/${fileName}`;
					console.log(instructionsPath);
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
						urgency: task.urgency
					}
				});
			})
		);
		console.log('Tasks created:', createdTasks);

		return new Response(JSON.stringify({ message: 'Tasks created successfully' }), { status: 200 });
	} catch (error) {
		console.error('Error creating tasks: ', error);
		return new Response(JSON.stringify({ message: 'Failed to create tasks' }), { status: 500 });
	}
};
