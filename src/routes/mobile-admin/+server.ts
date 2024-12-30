import { lucia } from "$lib/server/auth.js";

export async function GET({ locals, request }) {
    const { user } = locals;

    if (!user) {
        return new Response(JSON.stringify({ message: 'unauthorized' }), { status: 400 });
    }

    try {
        const currentUser = await prisma.user.findUnique({
            where: {
                id: user.id
            }
        });

        const userAgent = request.headers.get('user-agent') || '';
	    const isMobile = /mobile/i.test(userAgent);

        return new Response(JSON.stringify({ user: currentUser, isMobile }), { status: 200 });
    } catch(error) {
        console.error(error);
        return new Response(JSON.stringify({ message: 'error retrieving data' }), { status: 404 });
    }
}

export async function POST({ locals, cookies }) {
    try {
        if (!locals.session) {
          return new Response('Unauthorized', { status: 401 });
        }
        
      
        // Invalidate the session
        await lucia.invalidateSession(locals.session.id);
      
        // Clear session cookies
        const sessionCookie = lucia.createBlankSessionCookie();
        cookies.set(sessionCookie.name, sessionCookie.value, {
          path: ".",
          ...sessionCookie.attributes,
        });
      
        // Redirect or return a success response
        return new Response(null, { status: 204 });
      } catch (error) {
        console.error(error);
      }
}