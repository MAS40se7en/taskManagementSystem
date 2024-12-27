import { OAuth2RequestError } from 'arctic';
import { google, lucia } from '$lib/server/auth';
import type { RequestEvent } from '@sveltejs/kit';
import { prisma } from '$lib/prisma';

interface GoogleUser {
	sub: string; 
	name: string;
	email: string;
}


export async function POST(event: RequestEvent): Promise<Response> {
	console.log(event.url)
	try {
		const body = await event.request.json();
		const { code, state } = body;
		const codeVerifier = event.cookies.get('google_oauth_code_verifier');
		const storedState = event.cookies.get('google_oauth_state') ?? null;

		console.log(code, state, storedState, codeVerifier);

		if (!code || !state || !storedState || !codeVerifier || state !== storedState) {
			return new Response(null, {
				status: 400
			});
		}


		const tokens = await google.validateAuthorizationCode(code, codeVerifier);
		console.log(tokens);

		const accessToken = tokens.accessToken(); // Extract access token as a string
		const refreshToken = tokens.refreshToken();

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

		let newUserData;

		if (existingGoogleUser) {
			newUserData = await prisma.user.update({
				where: {
					email: existingGoogleUser.email
				},
				data: {
					refreshToken,
					accessToken
				}
			});
		} else if (existingUserEmail) {
			newUserData = await prisma.user.update({
				where: {
					email: googleUser.email
				},
				data: {
					googleId: googleUser.sub,
					refreshToken,
					accessToken
				}
			});
		} else {
			newUserData = await prisma.user.create({
				data: {
					email: googleUser.email, // Using email as username
					googleId: googleUser.sub,
					name: googleUser.name, // Name field may not always be present, handle accordingly
					refreshToken,
					accessToken
				}
			});
		}

		
		const session = await lucia.createSession(newUserData.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
		console.log(newUserData)

		return new Response(JSON.stringify({ newUserData, success: true }), {
			status: 200,
		});
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