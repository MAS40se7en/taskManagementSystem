export async function GET({ locals }) {
    const { user } = locals;

    if (!user) {
        return new Response(JSON.stringify({ message: "unauthorized" }), { status: 400 });
    }

    try {
        const projects = await prisma.project.findMany();

        return new Response(JSON.stringify({ message: 'got projects', projects }), { status: 200 });
    } catch(error) {
        return new Response(JSON.stringify({ message: 'error occurred' }), { status: 400 });
    }
}