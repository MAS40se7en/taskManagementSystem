import { prisma } from "$lib/prisma";
import { json, redirect } from "@sveltejs/kit";

export async function GET() {
    // If user is logged in, fetch tasks
    const tasks = await prisma.task.findMany();
    return json(tasks)
}