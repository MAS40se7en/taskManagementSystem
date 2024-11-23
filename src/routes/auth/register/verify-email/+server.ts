import { prisma } from '$lib/prisma';

export async function POST({ request }) {
    const { userId, verificationCode } = await request.json();

    console.log('request: ', request);
    console.log('user id: ', userId);
    console.log('verification code: ', verificationCode);

    try {
        const codeObject = await prisma.emailCodes.findUnique({
            where: {
                userId: userId,
            }
        });

        console.log('codeObject: ', codeObject )

        if (!codeObject) {
            return new Response(JSON.stringify({ message: 'Error finding your verification code'}), { status: 400 });
        }

        const currentTime = new Date();
        if (currentTime > codeObject.expiresAt) {
            return new Response(JSON.stringify({ message: 'Verification code has expired' }), { status: 400 });
        }

        if (codeObject.code !== verificationCode) {
            return new Response(JSON.stringify({ message: 'Invalid verification code'}), { status: 400 });
        }

        if (codeObject.code === verificationCode) {
            await prisma.emailCodes.delete({
                where: {
                    userId: userId,
                }
            });

            await prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    isVerified: true,
                }
            });
        }

        return new Response(JSON.stringify({ message: 'Email verification successful!' }), { status: 200 });
    } catch (error) {
        console.error("Error verifying email:", error);
        return new Response(JSON.stringify({ message: 'Error verifying email.' }), { status: 500 });
    }
}