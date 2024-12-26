import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
    if (!locals || !locals.session) {
        console.log('No session found');
        return { session: null, user: null };
    }

    const { session } = locals;

    // Assuming the session object has some user identifier
    const user = locals.user; // 'user' should have been set in the hooks

    if (!user) {
        console.log("No user found in locals");
        return { session: null, user: null };
    }

    // If user exists, redirect to the protected route
    if (session && user) {
        redirect(302, '/protected');
    }

    // Return both session and user
    return { session, user };
};
