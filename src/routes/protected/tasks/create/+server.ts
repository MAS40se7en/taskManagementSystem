import path from 'path';
import fs from 'fs';
import { prisma } from '$lib/prisma';

export async function POST({ request, cookies, locals }) {
    const { user } = locals;
    const data = await request.formData();
    const { title, description, instructions, deadline, urgency } = Object.fromEntries(data) as Record<string, string>;

    const parsedInstructions = JSON.parse(instructions);

    let instructionsPath;
    if (parsedInstructions.type === 'audio' && parsedInstructions.path) {
        const base64Data = parsedInstructions.path.replace(/^data:audio\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');

        const fileName = `instruction_${Date.now()}.wav`;
        const filePath = path.join('static', 'uploads', fileName);

        fs.writeFileSync(filePath, buffer);

        instructionsPath = `/uploads/audio/${fileName}`;
    }

    const task = await prisma.task.create({
        data: {
            title,
            description,
            urgency,
            deadline: deadline ? new Date(deadline) : null,
            createdById: user?.id,
            instructions: parsedInstructions.type === 'text'
                ? { type: 'text', content: parsedInstructions.content}
                : { type: 'audio', content: instructionsPath }
        }
    })

    return new Response(JSON.stringify({ message: "New Task has been created!"}), { status: 200 });
}