import { prisma } from '$lib/prisma.js';
import { lucia } from '$lib/server/auth';

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

export async function GET({ locals }) {
  if (!locals.session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const user = locals.user;

  try {
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
  
    const completedProjectCount = await prisma.project.count({
      where: {
          completed: true,
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
  
    const completedTaskCount = await prisma.task.count({
      where: {
          createdById: user?.id,
          completed: true
      }
    })
  
    return new Response(JSON.stringify({
      taskCount,
      relatedProjectCount,
      user,
      completedProjectCount,
      completedTaskCount,
    }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Error fetching data.' }), { status: 500 })
  }
}