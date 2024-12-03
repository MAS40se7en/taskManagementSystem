import { prisma } from "$lib/prisma";
import path from 'path';
import fs from 'fs';

export async function GET({ params, locals }) {
    const { id } = params;
    const { user } = locals;

    if (!user) {
        return new Response(JSON.stringify({ message: 'unauthorized' }), { status: 400 });
    }

    const taskId = parseInt(id, 10);

    if (isNaN(taskId)) {
        return new Response(JSON.stringify({ message: 'Invalid ID' }), { status: 400 });
    }

    console.log(taskId);

    try {
        const taskToEdit = await prisma.task.findUnique({
            where: {
                id: taskId
            },
        });

        if (taskToEdit?.createdById !== user?.id) {
            return new Response(JSON.stringify({ message: 'unauthorized user' }), { status: 400 });
        }

        return new Response(JSON.stringify({ message: 'task to edit gotten successfully', task: taskToEdit, user }), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ message: 'something went wrong while fetching task data' }), { status: 400 });
    }
}

export async function POST({ request, locals }) {
    const { user } = locals;
    const data = await request.formData();
    const { taskId, title, description, instructions, deadline, urgency, startsAt, endsAt } = Object.fromEntries(data) as Record<string, string>;

    if (!user) {
        return new Response(JSON.stringify({ message: 'User not authenticated' }), { status: 401 });
    }

    const id = parseInt(taskId, 10)
    const parsedInstructions = JSON.parse(instructions);

    let instructionsPath;
    if (parsedInstructions.type === 'audio' && parsedInstructions.path) {
        const base64Data = parsedInstructions.path.replace(/^data:audio\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');

        const fileName = `instruction_${Date.now()}.wav`;
        const filePath = path.join('static', 'uploads', 'audio', fileName);

        fs.writeFileSync(filePath, buffer);

        instructionsPath = `/uploads/audio/${fileName}`;
    }

    try {
        const task = await prisma.task.update({
            where: {
                id: id
            },
            data: {
                title,
                description,
                urgency,
                deadline: deadline ? new Date(deadline) : null,
                startsAt: startsAt ? new Date(startsAt) : null,
                endsAt: endsAt ? new Date(endsAt) : null,
                createdById: user?.id,
                instructions: parsedInstructions.type === 'text'
                    ? { type: 'text', content: parsedInstructions.content }
                    : { type: 'audio', path: instructionsPath }
            }
        })

        return new Response(JSON.stringify({ message: "Task has been updated!", newTask: task }), { status: 200 });
    } catch (error) {
        console.error("Error creating task:", error);
        return new Response(JSON.stringify({ message: "Failed to update task." }), { status: 500 });
    }
}