import { redirect } from '@sveltejs/kit';

export async function GET({ locals, request }) {
    if (!locals || !locals.session) {
        console.log('No session found');
        return new Response(JSON.stringify({ session: null, user: null }), { status: 200 });
    }

    const { session } = locals;

    // Assuming the session object has some user identifier
    const user = locals.user; // 'user' should have been set in the hooks

    if (!user) {
        console.log("No user found in locals");
        return new Response(JSON.stringify({ session: null, user: null }), { status: 200});
    }

    // If user exists, redirect to the protected route
    if (session && user) {
        redirect(302, '/protected');
    }

    const userAgent = request.headers.get('user-agent') || '';
	const isMobile = /mobile/i.test(userAgent);

    // Return both session and user
    return new Response(JSON.stringify({ session, user, isMobile }), { status: 200 });
};
