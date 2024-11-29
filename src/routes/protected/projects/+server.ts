<<<<<<< HEAD
import { prisma } from "$lib/prisma";
import { json } from '@sveltejs/kit';

export async function GET({ locals }) {
    const { user } = locals;

    if (!user) {
      return new Response(JSON.stringify({ message: 'Unauthorized'}), { status: 401 });
    }

    try {
      const projects = await prisma.project.findMany({
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

    
    return new Response(JSON.stringify({ message: 'projects data retrieved', projects, user}), { status: 200});
    } catch (error) {
      console.error('Error fetching projects:', error);
      return new Response(JSON.stringify({ message: 'Error fetching projects' }), { status: 500 });
    }
=======
import { prisma } from "$lib/prisma";
import { json } from '@sveltejs/kit';

export async function GET({ locals }) {
    const { user } = locals;

    if (!user) {
      return new Response(JSON.stringify({ message: 'Unauthorized'}), { status: 401 });
    }

    try {
      const projects = await prisma.project.findMany({
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

    
    return new Response(JSON.stringify({ message: 'projects data retrieved', projects, user}), { status: 200});
    } catch (error) {
      console.error('Error fetching projects:', error);
      return new Response(JSON.stringify({ message: 'Error fetching projects' }), { status: 500 });
    }
>>>>>>> 2689b32a279db71525fba4df4c3d46aae9075f8c
}