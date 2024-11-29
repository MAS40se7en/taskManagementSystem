<<<<<<< HEAD
import { prisma } from '$lib/prisma';
import { json } from '@sveltejs/kit';

export async function POST({ request, url, cookies, locals }) {
    const { user } = locals; // The currently authenticated user
    const data = await request.formData();
    const { title, description, startsAt, endsAt, users } = Object.fromEntries(data) as Record<string, string>;

    // Check for required fields
    if (!title || !description) {
        return new Response(JSON.stringify({ message: "Title and Description are required!" }), { status: 400 });
    }

    // Parse participants JSON array
    let usersArray = [];
    if (users) {
        try {
            usersArray = JSON.parse(users); // Assumes participants is a JSON string array of user IDs
        } catch (error) {
            return new Response(JSON.stringify({ message: "Invalid participants format!" }), { status: 400 });
        }
    }

    try {
        const loggedInUserId = user?.id;
        if (!loggedInUserId) {
            throw new Error("User is not authenticated");
        }

        // Create a new project and connect participants
        const newProject = await prisma.project.create({
            data: {
                title,
                description,
                startsAt: startsAt ? new Date(startsAt) : null,
                endsAt: endsAt ? new Date(endsAt) : null,
                createdById: user?.id,
                users: {
                    connect: usersArray.map((id: any) => ({ id })) // Connect users by their IDs
                }
            }
        });


        await Promise.all(usersArray.map(async (userId: any) => {
            const existingAssociations = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    associations: true
                }
            });

            const existingAssociationsArray = Array.isArray(existingAssociations?.associations)
                ? existingAssociations.associations
                : []

            const updatedAssociations = new Set([
                ...existingAssociationsArray,
                ...usersArray.filter((id: any) => id !== userId),
                loggedInUserId
            ])

            await prisma.user.update({
                where: { id: userId },
                data: {
                    associations: Array.from(updatedAssociations)
                }
            })
        }))

        const currentUserAssociations = await prisma.user.findUnique({
            where: { id: loggedInUserId },
            select: {
                associations: true
            }
        });

        const associationsArray = Array.isArray(currentUserAssociations?.associations)
            ? currentUserAssociations.associations
            : []

        const updatedLoggedInUserAssociations = new Set([
            ...associationsArray,
            ...usersArray
        ]);

        await prisma.user.update({
            where: { id: loggedInUserId },
            data: {
                associations: Array.from(updatedLoggedInUserAssociations)
            }
        });

        return new Response(JSON.stringify({ id: newProject.id }), { status: 200 });
    } catch (error) {
        console.error("Error creating project:", error);
        return new Response(JSON.stringify({ message: "Failed to create project!", error }), { status: 500 });
    }
}


export async function GET({ url, locals }) {
    const loggedInUserId = locals?.user?.id;

    const allUsers = await prisma.user.findMany({
        where: {
            id: {
                not: loggedInUserId,
            }
        },
        select: {
            id: true,
            name: true,
            image: true
        }
    })

    return json({allUsers});
=======
import { prisma } from '$lib/prisma';
import { json } from '@sveltejs/kit';

export async function POST({ request, url, cookies, locals }) {
    const { user } = locals; // The currently authenticated user
    const data = await request.formData();
    const { title, description, startsAt, endsAt, users } = Object.fromEntries(data) as Record<string, string>;

    // Check for required fields
    if (!title || !description) {
        return new Response(JSON.stringify({ message: "Title and Description are required!" }), { status: 400 });
    }

    // Parse participants JSON array
    let usersArray = [];
    if (users) {
        try {
            usersArray = JSON.parse(users); // Assumes participants is a JSON string array of user IDs
        } catch (error) {
            return new Response(JSON.stringify({ message: "Invalid participants format!" }), { status: 400 });
        }
    }

    try {
        const loggedInUserId = user?.id;
        if (!loggedInUserId) {
            throw new Error("User is not authenticated");
        }

        // Create a new project and connect participants
        const newProject = await prisma.project.create({
            data: {
                title,
                description,
                startsAt: startsAt ? new Date(startsAt) : null,
                endsAt: endsAt ? new Date(endsAt) : null,
                createdById: user?.id,
                users: {
                    connect: usersArray.map((id: any) => ({ id })) // Connect users by their IDs
                }
            }
        });


        await Promise.all(usersArray.map(async (userId: any) => {
            const existingAssociations = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    associations: true
                }
            });

            const existingAssociationsArray = Array.isArray(existingAssociations?.associations)
                ? existingAssociations.associations
                : []

            const updatedAssociations = new Set([
                ...existingAssociationsArray,
                ...usersArray.filter((id: any) => id !== userId),
                loggedInUserId
            ])

            await prisma.user.update({
                where: { id: userId },
                data: {
                    associations: Array.from(updatedAssociations)
                }
            })
        }))

        const currentUserAssociations = await prisma.user.findUnique({
            where: { id: loggedInUserId },
            select: {
                associations: true
            }
        });

        const associationsArray = Array.isArray(currentUserAssociations?.associations)
            ? currentUserAssociations.associations
            : []

        const updatedLoggedInUserAssociations = new Set([
            ...associationsArray,
            ...usersArray
        ]);

        await prisma.user.update({
            where: { id: loggedInUserId },
            data: {
                associations: Array.from(updatedLoggedInUserAssociations)
            }
        });

        return new Response(JSON.stringify({ id: newProject.id }), { status: 200 });
    } catch (error) {
        console.error("Error creating project:", error);
        return new Response(JSON.stringify({ message: "Failed to create project!", error }), { status: 500 });
    }
}


export async function GET({ url, locals }) {
    const loggedInUserId = locals?.user?.id;

    const allUsers = await prisma.user.findMany({
        where: {
            id: {
                not: loggedInUserId,
            }
        },
        select: {
            id: true,
            name: true,
            image: true
        }
    })

    return json({allUsers});
>>>>>>> 2689b32a279db71525fba4df4c3d46aae9075f8c
}