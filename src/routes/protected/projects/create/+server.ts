import { prisma } from '$lib/prisma.js';
import { json } from '@sveltejs/kit';

export async function POST({ request, url, cookies, locals}) {
    const { user } = locals;
    const data = await request.formData();
    const { title, description, startsAt, endsAt, users: formParticipants } = Object.fromEntries(data) as Record<string, string>;

    if (!title || !description) {
        return new Response(JSON.stringify({ message: "Title and Description are required!" }), { status: 400 });
    }

    let participants: string | any[] = [];
    
    if (formParticipants) {
        participants = formParticipants.split(',').map((id) => ({ id }));
    }
    
    const newProject = await prisma.project.create({
        data: {
            title,
            description,
            startsAt: startsAt ? new Date(startsAt) : null,
            endsAt: endsAt ? new Date(endsAt) : null,
            createdById: user?.id,
            ...(participants.length > 0 && {
                users: {
                    connect: participants,
                }
            })
        }
    });

    return new Response(JSON.stringify({ id: newProject.id }), { status: 200 });
}

export async function GET({ url, locals }) {
    const loggedInUserId = locals?.user?.id;

    const participantsParams = url.searchParams.get('participants');
    let participants: { id: string; name: string | null }[] = [];

    if (participantsParams) {
        const participantIds = participantsParams.split(',').filter((id) => id !== loggedInUserId);
    

    participants = await prisma.user.findMany({
        where: {
            id: { in: participantIds },
        },
        select: {
            id: true,
            name: true,
        },
    });
    }

    console.log('participants', participants);

    const allUsers = await prisma.user.findMany({
        where: {
            id: {
                not: loggedInUserId,
            }
        },
        select: {
            id: true,
            name: true,
        }
    })

    return json({
        allUsers,
        participants,
    });
}