import { prisma } from '$lib/prisma';

export async function GET() {
    try {
        // Fetch all users from the database
        const users = await prisma.user.findMany();

        // Return users as JSON response with a 200 status
        return new Response(JSON.stringify({ users }), { 
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
