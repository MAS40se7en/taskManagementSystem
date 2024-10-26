import path from 'path';
import fs from 'fs';
import { prisma } from '$lib/prisma';

export async function POST({ request, cookies, locals }) {
    const { user } = locals;
    const data = await request.formData();
    const { title, description, imageUrl, deadline, urgency } = Object.fromEntries(data) as Record<string, string>;

    let instructions: string | null = null;
    let audioFilePath: string | null = null;

    let savedImagePath = null;

    const instructionsFile = data.get('instructionsAudio') as File | null;
    const instrucitonsText = data.get('instructionsText') as string | null;

    if (imageUrl) {
        const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');

        const fileName = `${Date.now()}-task-image.png`;
        const filePath = path.join('static/uploads', fileName);

        fs.writeFileSync(filePath, buffer);

        savedImagePath = `/uploads/${fileName}`;
    }

    if (instructionsFile) {
        const audioBase64Data = await instructionsFile.arrayBuffer();
        const audioBuffer = Buffer.from(audioBase64Data);
        const audioFileName = `${Date.now()}-${instructionsFile.name}`;
        const audioFilePath = path.join('static/uploads', audioFileName);

        fs.writeFileSync(audioFilePath, audioBuffer);
        instructions = `/uploads/${audioFileName}`;
    } else if (instrucitonsText) {
        instructions = instrucitonsText;
    }

    const task = await prisma.task.create({
        data: {
            title,
            description,
            urgency,
            imageUrl: savedImagePath,
            deadline: deadline ? new Date(deadline) : null,
            createdById: user?.id,
            instructions: instructions ? instructions : undefined
        }
    })

    return new Response(JSON.stringify({ message: "New Task has been created!"}), { status: 200 });
}