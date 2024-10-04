import { prisma } from "$lib/prisma";
import { json, redirect } from "@sveltejs/kit";

export async function GET({ locals }) {
    const { user } = locals;

    const tasks = await prisma.task.findMany();
    return json({tasks, user});
}