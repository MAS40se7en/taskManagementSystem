import { prisma } from "$lib/prisma";
import admin from "$lib/server/firebaseAdmin";
import { json } from "@sveltejs/kit";

export async function GET({ params, locals }) {
  const { user } = locals;

  if (!user) {
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

    // Extract participants' IDs and names to pass them in the URL
    const participantIds = conversation.participants.map((participant) => participant.id);

    return json({ conversation, participantIds, user }, { status: 200 });
  } catch (error) {
    return json({ message: 'Internal server error' }, { status: 500 });
  }
}


export async function POST({ request, locals }) {
  const user = locals.user;

  if (!user) {
    return json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { conversationId, content } = await request.json();

    if (!conversationId || !content) {
      return json({ message: 'Missing required fields' }, { status: 400 });
    }

    const convoId = parseInt(conversationId, 10);
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: convoId
      },
      include: {
        participants: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            deviceFcmToken: true
          },
        }
      }
    });

    if (conversation?.participants) {

      const newMessage = await prisma.message.create({
        data: {
          content,
          senderId: user.id,
          conversationId: convoId,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        }
      });



      for (const participant of conversation?.participants) {

        if (participant.id !== user.id) {
          const fcmToken = participant.deviceFcmToken;

          if (fcmToken) {
            const payload = {
              notification: {
                title: `${newMessage.sender.name}`,
                body: `${newMessage.content}`
              },
              token: fcmToken
            };

            try {
              await admin.app('admin').messaging().send(payload);
            } catch (error) {
              console.error(`Error sending notification for the message sent by : ${newMessage.sender.name}, `, error)
            }
          }
        }
      }

      return new Response(JSON.stringify({ message: 'message created', newMessage }), { status: 200 });

    }
    console.log('reached here')

  } catch (error) {
    return json({ message: 'Failed to send message', error }, { status: 500 });
  }
}

export async function DELETE({ params }) {
  const { id } = params;
  const conversationId = parseInt(id, 10);

  if (isNaN(conversationId)) {
    return json({ message: 'Invalid ID' }, { status: 400 });
  }

  try {
    await prisma.conversation.delete({
      where: { id: conversationId },
    });

    return json({ message: 'Conversation deleted successfully' }, { status: 204 });
  } catch (error) {
    return json({ message: 'Failed to delete conversation', error }, { status: 500 });
  }
}