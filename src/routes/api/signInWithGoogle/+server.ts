import { lucia } from "$lib/server/auth";
import { OAuth2RequestError } from "arctic";

export async function POST({ request, cookies }) {
    const { userData } = await request.json();

    try {
        const existingUser = await prisma.user.findUnique({
            where: {
                email: userData.email
            }
        });

        if (existingUser) {
            const newUserData = await prisma.user.update({
                where: {
                    email: userData.email
                },
                data: {
                    googleId: userData.googleId,
                    accessToken: userData.accessToken,
                    refreshToken: userData.refreshToken
                }
            });

            const session = await lucia.createSession(newUserData.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
            console.log(newUserData)

            return new Response(JSON.stringify({user: newUserData}), {
                status: 302,
            });
        } else {
            const newUser = await prisma.user.create({
                data: {
                    name: userData.name,
                    email: userData.email,
                    image: userData.avatar,
                    googleId: userData.googleId,
                    accessToken: userData.accessToken,
                    refreshToken: userData.refreshToken
                }
            });

            const session = await lucia.createSession(newUser.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
            console.log(newUser)

            return new Response(JSON.stringify({user: newUser}), {
                status: 302,
            });
        }
    } catch(e) {
        if (e instanceof OAuth2RequestError) {
            console.error(e);
			return new Response(null, {
				status: 400
			});
		}
        console.log(e)
		return new Response(null, {
			status: 500
		});
    }
}