import { prisma } from '$lib/prisma';
import { generateId } from 'lucia';
import { Argon2id } from 'oslo/password';
import { lucia } from '$lib/server/auth';
import { faker } from'@faker-js/faker';
import crypto from 'crypto';

export async function POST({ request, cookies }) {
	const data = await request.formData();
	const { email, password, name, image } = Object.fromEntries(data) as Record<string, string>;

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		return new Response(JSON.stringify({ message: 'Invalid email format' }), { status: 400 });
	}

	if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
		return new Response(JSON.stringify({
			message: "Password must be at least 8 characters long, contain an uppercase letter and a number"
		}))
	}

	const existingUser = await prisma.user.findUnique({
		where: { email }
	});

	if (existingUser) {
		return new Response(JSON.stringify({ message: 'Email already in use' }), { status: 400 });
	}

	const userId = generateId(15);
	const hashedPassword = await new Argon2id().hash(password);
	let savedImagePath = null;

	const fakeImageUrl = faker.image.avatar();
	savedImagePath = fakeImageUrl;

	const user = await prisma.user.create({
		data: {
			id: userId,
			email: email,
			password: hashedPassword,
			name: name,
			image: savedImagePath,
			isVerified: false
		}
	});

	const session = await lucia.createSession(user.id, {});
	const sessionCookie = lucia.createSessionCookie(session.id);
	cookies.set(sessionCookie.name, sessionCookie.value, {
		path: '.',
		...sessionCookie.attributes
	});

	return new Response(JSON.stringify({ message: 'Registration successful!' }), { status: 200 });
}
