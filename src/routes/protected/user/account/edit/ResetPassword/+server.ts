import { prisma } from "$lib/prisma.js";
import crypto from "crypto";

export async function GET({ url }) {
    try {
        const token = url.searchParams.get('token');

        if (!token) {
            return new Response(JSON.stringify({ message: 'Token is required' }), { status: 400 });
        }

        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        const user = await prisma.user.findFirst({
            where: {
                resetToken: tokenHash,
                resetTokenExpiresAt: {
                    gte: new Date(),
                }
            }
        });

        if (!user) {
            return new Response(JSON.stringify({ message: 'Invalid token or expired' }), { status: 401 });
        }

        return new Response(JSON.stringify({
            message: 'Token is valid',
            user: { id: user.id, email: user.email },
        }), { status: 200 });
    } catch (error) {
        console.error('Error validating token:', error);
        return new Response(JSON.stringify({ message: 'Failed to validate token' }), { status: 500 });
    }
}