import { OAuth2RequestError } from 'arctic';
import { google, lucia } from '$lib/server/auth';
import type { RequestEvent } from '@sveltejs/kit';
import { prisma } from '$lib/prisma';

interface GoogleUser {
	sub: string; // Unique identifier for the user
	name: string; // Full name of the user
	email: string; // Email address of the user
}


export async function GET(event: RequestEvent): Promise<Response> {
    try {
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');
	const codeVerifier = event.cookies.get('google_oauth_code_verifier');
	const storedState = event.cookies.get('google_oauth_state') ?? null;

	if (!code || !state || !storedState || !codeVerifier || state !== storedState) {
		return new Response(null, {
			status: 400
		});
	}

	
		const tokens = await google.validateAuthorizationCode(code, codeVerifier);
        console.log(tokens);
        
        const accessToken = tokens.accessToken(); // Extract access token as a string
        const refreshToken = tokens.accessToken();
        
		const googleUserResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken()}`
			}
		});
		const googleUser: GoogleUser = await googleUserResponse.json();

		const existingGoogleUser = await prisma.user.findUnique({
			where: {
				googleId: googleUser.sub
			}
		});

        const existingUserEmail = await prisma.user.findUnique({
            where: {
                email: googleUser.email
            }
        })

		if (existingGoogleUser) {
            const newUserData = await prisma.user.update({
                where: {
                    email: existingGoogleUser.email
                },
                data: {
                    refreshToken,
                    accessToken
                }
            });

			const session = await lucia.createSession(newUserData.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
            console.log(newUserData)

            return new Response(JSON.stringify({newUserData}), {
                status: 302,
                headers: {
                    Location: 'taskfocused://task-management-system-steel.vercel.app/protected'
                }
            });
		} else if (existingUserEmail) {
            const newUserData = await prisma.user.update({
                where: {
                    email: googleUser.email
                },
                data: {
                    googleId: googleUser.sub,
                    refreshToken,
                    accessToken
                }
            });

            const session = await lucia.createSession(newUserData.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
            console.log(newUserData)

            return new Response(JSON.stringify({newUserData}), {
                status: 302,
                headers: {
                    Location: 'taskfocused://task-management-system-steel.vercel.app/protected'
                }
            });
        } else {
			const newUser = await prisma.user.create({
				data: {
					email: googleUser.email, // Using email as username
					googleId: googleUser.sub,
					name: googleUser.name, // Name field may not always be present, handle accordingly
                    refreshToken,
                    accessToken
				}
			});

			const session = await lucia.createSession(newUser.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
            console.log(newUser)

            return new Response(JSON.stringify({newUser}), {
                status: 302,
                headers: {
                    Location: 'taskfocused://task-management-system-steel.vercel.app/protected'
                }
            });
		}
	} catch (e) {
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