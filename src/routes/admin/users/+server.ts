import { prisma } from '$lib/prisma';

export async function GET() {
    try {
        // Fetch all users from the database
        const users = await prisma.user.findMany({
            include: {
                _count: {
                    select: {
                        createdTasks: true,
                        createdProjects: true,
                        projects: true
                    }
                }
            }
        });

        const modifiedUsers = users.map(user => ({
            ...user,
            projectsRelated: user._count.createdProjects + user._count.projects
        }))

        // Return users as JSON response with a 200 status
        return new Response(JSON.stringify({ users: modifiedUsers }), { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' } // Set content type to JSON
        });
    } catch (error) {
        console.error("Error fetching users:", error); // Log error for debugging
        return new Response(JSON.stringify({ message: "Error fetching data." }), { 
            status: 500 
        });
    }
}
