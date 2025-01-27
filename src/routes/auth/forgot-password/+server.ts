import { sendPasswordResetEmail } from "$lib/mailer";
import { prisma } from "$lib/prisma";
import crypto from "crypto";

export async function POST({ request }) {
    const { email } = await request.json();

    if (!email) {
        return new Response(JSON.stringify({ message: 'please provide and email' }), { status: 400 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: email }
        })

        if (!user) {
            return new Response(JSON.stringify({ message: 'User with the provided email, not found' }), { status: 400 });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600 * 1000);
        
        const existToken = await prisma.passwordResetTokens.findFirst({
            where: {
                userId: user.id
            }
        });

        if (existToken) {
            await prisma.passwordResetTokens.update({
                where: {
                    userId: user.id
                },
                data: {
                    token: resetTokenHash,
                    expiresAt: resetTokenExpiry
                }
            })
        } else {
            await prisma.passwordResetTokens.create({
                data: {
                    userId: user.id,
                    token: resetTokenHash,
                    expiresAt: resetTokenExpiry
                },
            });
        }


        const url = new URL('/auth/reset-password', process.env.BASE_URL);
        url.searchParams.append('resetToken', resetToken);

        const link = url.toString();

        await sendPasswordResetEmail(user.email, link);

        return new Response(JSON.stringify({ message: 'email sent successfully', user }), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ message: 'Failed to send verification email' }), { status: 500 });
    }
}