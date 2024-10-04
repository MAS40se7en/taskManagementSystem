import { prisma } from '$lib/prisma.js';
import { lucia } from '$lib/server/auth';

export async function POST({ locals, cookies }) {
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
}

export async function GET({ locals }) {
  if (!locals.session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { user } = locals;

  const taskCount = await prisma.task.count({
    where: {
      createdById: user?.id
    }
  });

  const relatedProjectCount = await prisma.project.count({
    where: {
      OR: [
        {
          users: {
            some: {
              id: user?.id
            }
          }
        },
        {
          createdById: user?.id
        }
      ]
    }
  });

  return new Response(JSON.stringify({
    taskCount,
    relatedProjectCount,
    user
  }), { status: 200 });
}