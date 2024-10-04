import { prisma } from "$lib/prisma";
import { json } from "@sveltejs/kit";

export async function GET() {
    const tasks = await prisma.task.findMany();
    return json(tasks);
}