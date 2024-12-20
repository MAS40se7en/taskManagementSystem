import path from 'path';
import fs from 'fs';
import { prisma } from '$lib/prisma';

export async function POST({ request, cookies, locals }) {
    const { user } = locals;
    const data = await request.formData();
    const { title, description, instructions, deadline, urgency, startsAt, endsAt } = Object.fromEntries(data) as Record<string, string>;
    const image = data.get('image') as string | null;

    if (!user) {
        return new Response(JSON.stringify({ message: 'User not authenticated' }), { status: 401 });
    }

    const parsedInstructions = JSON.parse(instructions);
    let savedImagePath: string | null = null;

    if (image) {
            const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
    
            const fileName = `${Date.now()}-task-image.png`;
            const filePath = path.join('static/uploads/pfp', fileName);
    
            fs.writeFileSync(filePath, buffer);
    
            savedImagePath = `/uploads/${fileName}`;
        }

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
        const task = await prisma.task.create({
            data: {
                title,
                description,
                urgency,
                deadline: deadline ? new Date(deadline) : null,
                startsAt: startsAt? new Date(startsAt) : null,
                endsAt: endsAt? new Date(endsAt) : null,            createdById: user?.id,
                instructions: parsedInstructions.type === 'text'
                    ? { type: 'text', content: parsedInstructions.content}
                    : { type: 'audio', path: instructionsPath },
                imagePath: savedImagePath
            }
        })
    
        return new Response(JSON.stringify({ message: "New Task has been created!", id: task.id}), { status: 200 });
    } catch (error) {
        console.error("Error creating task:", error);
        return new Response(JSON.stringify({ message: "Failed to create task." }), { status: 500 });
    }
}