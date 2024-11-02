import { prisma } from "$lib/prisma";
import { error, json } from "@sveltejs/kit";

export async function POST({ request, url, locals }) {
    const userId = url.searchParams.get('loggedInUserId'); // Get the logged-in user's ID from URL
    const data = await request.formData();
    const { title, description, startsAt, endsAt } = Object.fromEntries(data) as Record<string, string>;

    // Validate title and description
    if (!title || !description) {
        return new Response(JSON.stringify({ message: "Title and Description are required!" }), { status: 400 });
    }

    // Log the full URL for debugging
    console.log('Full URL in POST:', url.toString());

    // Get participants from the URL
    const urlParticipants = url.searchParams.get('participants');
    let participants: { id: string }[] = []; // Type declaration for participants

    // Split the participants and prepare them for database insertion
    if (urlParticipants) {
        participants = urlParticipants.split(',').map((id) => ({ id }));
        console.log('Participants from URL:', participants);
    }

    // Create the new project with participants connected
    const newProject = await prisma.project.create({
        data: {
            title,
            description,
            startsAt: startsAt ? new Date(startsAt) : null,
            endsAt: endsAt ? new Date(endsAt) : null,
            createdById: userId, // Set the creator's ID
            users: { // Connect the users (participants) to the project
                connect: participants,
            },
        },
    });

    // Return the created project's ID
    return new Response(JSON.stringify({ id: newProject.id }), { status: 200 });
}


export async function GET({ params }) {
    const id = Number(params.id);

    try {
        const conversation = await prisma.conversation.findUnique({
            where: { id },
            include: { participants: true }
        });

        if (!conversation) {
            throw error(404, 'Conversation not found');
        }

        return json({ participants: conversation.participants });
    } catch (error) {
        console.error('Error fetching participants:', error);
        return new Response(JSON.stringify({ message: 'Error fetching participants' }), { status: 500 });
    }
}