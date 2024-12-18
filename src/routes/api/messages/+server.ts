import { prisma } from '$lib/prisma';

export async function GET({ locals }) {
    const { user } = locals;

    if (!user) {
        return new Response(
            JSON.stringify({ message: 'User not found' }),
            { status: 400 }
        );
    }

    try {
        // Count the unseen messages where `seenAt` is null
        const unreadMessagesCount = await prisma.messageSeenBy.count({
            where: {
                userId: user.id,
                seenAt: null // Only count messages that haven't been seen
            }
        });

        console.log(unreadMessagesCount)

        return new Response(
            JSON.stringify({
                message: 'Unread messages counted',
                unreadCount: unreadMessagesCount
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching unread messages:', error);
        return new Response(
            JSON.stringify({ message: 'Failed to get unread messages' }),
            { status: 500 }
        );
    }
}
