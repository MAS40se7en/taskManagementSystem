import { sendVerificationEmail } from "$lib/mailer";
import { prisma } from "$lib/prisma";
import { faker } from "@faker-js/faker";

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
        
        const code = JSON.stringify(faker.number.int({ min: 1000000, max: 10000000 }));

		const existingVerificationCode = await prisma.emailCodes.findUnique({
			where: {
				userId: user.id,
			}
		});

		if (existingVerificationCode) {
			await prisma.emailCodes.delete({
				where: {
                    userId: user?.id,
                }
			})
		}
	
		const newVerificationCode = await prisma.emailCodes.create({
			data: {
				userId: user.id,
				code: code,
				expiresAt: new Date(Date.now() + 60 * 120 * 1000), // 1 hour expiration
				email: user.email
			}
		});

		if (newVerificationCode) {
			await sendVerificationEmail(user.email, code);
		}

        return new Response(JSON.stringify({ message: 'email sent successfully', user }), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ message: 'Failed to send verification email' }), { status: 500 });
    }
}