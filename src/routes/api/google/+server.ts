import { google } from '$lib/server/auth';
import { redirect, type RequestEvent } from '@sveltejs/kit';
import { generateCodeVerifier, generateState } from 'arctic';

export async function GET(event: RequestEvent): Promise<Response> {
	const state = generateState();
	const codeVerifier = generateCodeVerifier();

    const scopes = ['profile', 'email', 'https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'];


	const url = google.createAuthorizationURL(state, codeVerifier, scopes);
    url.searchParams.set("access_type", "offline");

    
	event.cookies.set('google_oauth_state', state, {
		path: '/',
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: 'lax'
	});

	event.cookies.set('google_oauth_code_verifier', codeVerifier, {
		path: '/',
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: 'lax'
	});

	return redirect(302, url.toString());
}