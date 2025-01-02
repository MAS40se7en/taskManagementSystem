import { prisma } from '$lib/prisma';
import { Argon2id } from 'oslo/password';
import { lucia } from '$lib/server/auth';

export async function POST({ request, cookies }) {
	const { email, password } = Object.fromEntries(await request.formData()) as Record<
		string,
		string
	>;
	const user = await prisma.user.findUnique({
		where: {
			email: email
		}
	});

	if (!user) {
		return new Response(JSON.stringify({ message: 'Incorrect username or password' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	if (user.password) {
		const validPassword = await new Argon2id().verify(user.password, password);
		if (!validPassword) {
			return new Response(JSON.stringify({ message: 'Incorrect username or password' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}
	}

	const session = await lucia.createSession(user.id, []);
	const sessionCookie = lucia.createSessionCookie(session.id);
	cookies.set(sessionCookie.name, sessionCookie.value, {
		path: '.',
		...sessionCookie.attributes
	});

	const userAgent = request.headers.get('user-agent') || '';
	const isMobile = /mobile/i.test(userAgent);

	if (user.role === 'admin' && isMobile) {
        return new Response(JSON.stringify({ message: "You can't access the admin layout on mobile", mobile: true }), { status: 200 });
    } else if (user.role === 'admin' && !isMobile) {
        return new Response(JSON.stringify({ redirect: '/admin' }), { status: 200 });
    } else if (!isMobile && user.role === 'user') {
        return new Response(JSON.stringify({ redirect: '/userWeb' }), { status: 200 });
    } else if (isMobile && user.role === 'user') {
		return new Response(JSON.stringify({ redirect: '/protected' }), { status: 200 });
	}
}
