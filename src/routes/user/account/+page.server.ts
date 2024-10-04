import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
    const { user } = locals; // Get the user object from locals

    return {
        loggedInUser: user // Pass the entire user object
    };
}) satisfies PageServerLoad;
