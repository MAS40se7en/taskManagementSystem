export async function GET({ locals }) {
    const { user } = locals;

    if (!user) {
        return new Response(JSON.stringify({ message: "unauthorized" }), { status: 400 });
    }

    try {
        const tasks = await prisma.task.findMany();

        return new Response(JSON.stringify({ message: 'got tasks', tasks }), { status: 200 });
    } catch(error) {
        return new Response(JSON.stringify({ message: 'error occurred' }), { status: 400 });
    }
}