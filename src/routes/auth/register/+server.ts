import { prisma } from '$lib/prisma';
import { generateId } from 'lucia';
import { Argon2id } from 'oslo/password';
import { lucia } from '$lib/server/auth';
import { faker } from'@faker-js/faker';
import { sendVerificationEmail } from '$lib/mailer.js';
import { redirect } from '@sveltejs/kit';

export async function POST({ request, cookies }) {
	const data = await request.formData();
	const { email, password, name } = Object.fromEntries(data) as Record<string, string>;

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		return new Response(JSON.stringify({ message: 'Invalid email format' }), { status: 400 });
	}

	if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
		return new Response(JSON.stringify({
			message: "Password must be at least 8 characters long, contain an uppercase letter and a number"
		}), { status: 400 })
	}

	const existingUser = await prisma.user.findUnique({
		where: { email }
	});

	if (existingUser) {
		return new Response(JSON.stringify({ message: 'Email already in use' }), { status: 400 });
	}

	const userId = generateId(15);
	const hashedPassword = await new Argon2id().hash(password);

	try {
		const user = await prisma.user.create({
			data: {
				id: userId,
				email: email,
				password: hashedPassword,
				name: name,
				isVerified: false
			}
		});
	
	
		const session = await lucia.createSession(user.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	
		const code = JSON.stringify(faker.number.int({ min: 1000000, max: 10000000 }));

		const existingVerificationCode = await prisma.emailCodes.findUnique({
			where: {
				userId: user.id,
			}
		});

		if (existingVerificationCode) {
			await prisma.emailCodes.delete({
				where: {
                    userId: user.id,
                }
			})
		}
	
		const newVerificationCode = await prisma.emailCodes.create({
			data: {
				userId: user.id,
				code: code,
				expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour expiration
				email: user.email
			}
		});

		if (newVerificationCode) {
			await sendVerificationEmail(user.email, code);
		}

		return new Response(JSON.stringify({ message: 'Registration successful!', user, code },), { status: 200 });
	} catch (error) {
		console.error('Error registering user:', error);
        return new Response(JSON.stringify({ message: 'Failed to register user' }), { status: 500 });
	}
	
}
