import { json } from "@sveltejs/kit";

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

export async function DELETE({ request }) {
    const { projectId } = await request.json();
    const id = parseInt(projectId, 10);
  
    if (isNaN(id)) {
      return json({ message: 'Invalid ID' }, { status: 400 });
    }
  
    try {
      await prisma.project.delete({
        where: { id: id }
      });
      return new Response(JSON.stringify({ message: 'Project Deleted' }), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
    }
  }