import { prisma } from '$lib/prisma';
import { lucia } from '$lib/server/auth.js';
import { Argon2id } from 'oslo/password';

export async function GET({ params }) {
    try {
        const resetToken = params;

        if (!resetToken) {
            return new Response(JSON.stringify({ message: 'could not get the reset token'}), {status: 400});
        }

        const existToken = await prisma.passwordResetTokens.findFirst({
            where: {
                token: resetToken
            }
        });

        if (!existToken) {
            return new Response(
                JSON.stringify({ message: 'Reset token not found' }),
                { status: 404 }
            );
        }

        const currentTime = new Date();
        if (existToken.expiresAt < currentTime) {
            return new Response(
                JSON.stringify({ message: 'Reset token has expired' }),
                { status: 403 }
            );
        }

        const user = await prisma.user.findUnique({
            where: {
                id: existToken.userId
            }
        })

        console.log('existing token: ', existToken)

        return new Response(JSON.stringify({ message: 'reset token found', existToken, user }), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ message: 'failed to Authorize your token' }), { status: 400 });
    }
}

export async function POST({ request }) {
    const { user, token, password } = await request.json();

    try {
        const hashedPassword = await new Argon2id().hash(password);

        const newUser = await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                password: hashedPassword
            }
        });

        await prisma.passwordResetTokens.delete({
            where: {
                userId: newUser.id
            }
        });

        await lucia.invalidateUserSessions(newUser.id);

        return new Response(JSON.stringify({ message: 'Password has been updated successfully', newUser }), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ message: 'failed to update password' }), { status: 400 });
    }
}