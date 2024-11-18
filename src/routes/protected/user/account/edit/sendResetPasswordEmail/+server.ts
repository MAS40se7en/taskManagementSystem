import { sendPasswordResetEmail } from "$lib/mailer";
import { prisma } from "$lib/prisma";
import crypto from "crypto";

export async function POST({ request }) {
    const { userId } = await request.json();

    if (!userId) {
        throw new Error('Missing required field: userId');
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!user) {
            return new Response(JSON.stringify({ message: 'User not found' }), { status: 400 });
        }

        if (!user.isVerified) {
            return new Response(JSON.stringify({ message: 'User not verified' }), { status: 400 });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600 * 1000);
        
		await prisma.user.update({
            where: { id: userId },
            data: {
                resetToken: resetTokenHash,
                resetTokenExpiresAt: resetTokenExpiry
            },
        });

        const link = `${process.env.BASE_URL}/auth/reset-password-${resetToken}`;

        await sendPasswordResetEmail(user.email, link);

        return new Response(JSON.stringify({ message: 'email sent successfully', user }), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ message: 'Failed to send verification email' }), { status: 500 });
    }
}