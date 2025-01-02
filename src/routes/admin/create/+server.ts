import { prisma } from '$lib/prisma';

export async function POST({ request, locals }) {
     const { user } = locals;
     const data = await request.formData();
    const { type, title, description, deadline, startsAt, endsAt, instructions, urgency, users } = Object.fromEntries(data) as Record<string, string>;

    if (!user) {
        return new Response(JSON.stringify({ message: 'unauthorised' }), { status: 400 });
    }

    // Check for required fields
    if (!title || !description) {
        return new Response(JSON.stringify({ message: "Title and Description are required!" }), { status: 400 });
    }

    // Parse participants JSON array
    let usersArray = [];
    if (users) {
        try {
            usersArray = JSON.parse(users); // Assumes participants is a JSON string array of user IDs
        } catch (error) {
            return new Response(JSON.stringify({ message: "Invalid participants format!" }), { status: 400 });
        }
    }

    try {
        if (type === 'Project') {
            const newProject = await prisma.project.create({
                data: {
                    title,
                    description,
                    startsAt: new Date(startsAt),
                    endsAt: new Date(endsAt),
                    createdById: user?.id,
                    users: {
                        connect: usersArray.map((id: any) => ({ id })) // Connect users by their IDs
                    }
                }
            });

            return new Response(JSON.stringify({ message: 'Project created', id: newProject.id }), { status: 200 });
        } else if (type === 'Task') {
            const parsedInstructions = JSON.parse(instructions);

            const newTask = await prisma.task.create({
                data: {
                    title,
                    description,
                    urgency,
                    deadline: deadline ? new Date(deadline) : null,
                    startsAt: startsAt? new Date(startsAt) : null,
                    endsAt: endsAt? new Date(endsAt) : null,
                    createdById: user?.id,
                    instructions: { type: 'text', content: parsedInstructions.content}
                }
            })
        
            return new Response(JSON.stringify({ message: "New Task has been created!", id: newTask.id}), { status: 200 });
        }
    } catch (error) {
        return new Response(JSON.stringify({ message: 'error creating item' }), {status: 400})
    }
}