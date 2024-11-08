import { prisma } from '$lib/prisma';
import type { JsonArray } from '@prisma/client/runtime/library';
import { json } from '@sveltejs/kit';

export async function GET({ locals }) {
    const loggedInUserId = locals.user?.id;

    if(!loggedInUserId) {
        return new Response(JSON.stringify({ message: "Unauthorized"}), { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: loggedInUserId
            },
            select: {
                name: true,
                associations: true
            }
        });

        if (!user) {
            return new Response(JSON.stringify({ message: "User not found"}), { status: 404 });
        }

        const associationsArray = user.associations as string[];

        if(associationsArray.length === 0) {
            return json({
                user: {
                    name: user?.name,
                    associations: []
                }
            })
        }

        const associatedUsers = await prisma.user.findMany({
            where: {
                id: {
                    in: associationsArray
                }
            },
            select: {
                id: true,
                name: true,
                image: true
            }
        });

        return json({
            user: {
                name: user?.name,
                associations: associatedUsers
            }
        })
    } catch (error) {
        console.error('Error retrieving user associations:', error);
        return new Response(JSON.stringify({ message: "Failed to retrieve user associations"}), { status: 500 });
    }
}