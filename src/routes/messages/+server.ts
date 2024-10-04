import { prisma } from '$lib/prisma.js';
import { json } from '@sveltejs/kit';

export async function GET({ locals }) {
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

        return json({conversations, loggedInUserId}, { status: 200 });
    } catch (error) {
        console.error("Error fetching shared messages users: ", error);
        return new Response("Error fetching data", { status: 500 });
    }
}