import { prisma } from '$lib/prisma.js';
import { error, json } from '@sveltejs/kit';

export async function GET({ locals }) {
    const { user } = locals;
    const loggedInUserId = locals.user?.id;

    if (!loggedInUserId) {
        return new Response("User not logged in", { status: 401 });
    }

    try {
        const conversations = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: { id: loggedInUserId },
                },
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                messages: {
                    orderBy: {
                        sentAt: 'asc',
                    },
                },
            },
        });

        const users = await prisma.user.findMany();

        return json({conversations, loggedInUserId, users, user}, { status: 200 });
    } catch (error) {
        return new Response("Error fetching data", { status: 500 });
    }
}

export async function POST({request, locals}) {
    const { selectedUser } = await request.json();
    
    if (!selectedUser) {
        throw error(400, 'At least one user ID must be provided');
    }

    const { user } = locals;

    try {
        const conversation = await prisma.conversation.create({
            data: {
                participants: {
                    connect: [
                        { id: user?.id },
                        { id: selectedUser }
                    ]
                },
            }
        });

        return json({ id: conversation.id, user});
    } catch (error) {
        console.error("Error creating conversation: ", error);
    }
}