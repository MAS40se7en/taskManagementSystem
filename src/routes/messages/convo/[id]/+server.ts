// +server.ts
import { prisma } from "$lib/prisma";
import { json } from "@sveltejs/kit";

export async function GET({ params, locals }) {
    const loggedInUserId = locals.user?.id;

    if (!loggedInUserId) {
        return new Response("User not logged in", { status: 401 });
    }

    const { id } = params;
    const conversationId = parseInt(id, 10);
  
    if (isNaN(conversationId)) {
      return json({ message: 'Invalid ID' }, { status: 400 });
    }
  
    try {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
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
        }
      });
  
      if (!conversation) {
        return json({ message: 'Conversation not found' }, { status: 404 });
      }
  
      return json({ conversation, loggedInUserId }, { status: 200 });
    } catch (error) {
      console.error('Database query failed:', error);
      return json({ message: 'Internal server error' }, { status: 500 });
    }
}
