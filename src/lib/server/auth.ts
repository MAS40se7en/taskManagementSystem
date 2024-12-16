import { PrismaAdapter } from '@lucia-auth/adapter-prisma';
import { Lucia } from 'lucia';
import { dev } from '$app/environment';
import { prisma } from '$lib/prisma';
import { Google } from "arctic";
import { json } from '@sveltejs/kit';

const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = new Lucia(adapter, {
    sessionCookie: {
        attributes: {
            secure: !dev
        }
    },
    getUserAttributes: (attributes) => {
        return {
            email: attributes.email,
            name: attributes.name,
            image: attributes.image,
            associations: attributes.associations,
            isVerified: attributes.isVerified
        }
    }
});

declare module "lucia" {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: DatabaseUserAttributes;
    }
}

interface DatabaseUserAttributes {
    email: string,
    name: string,
    image: string,
    associations: string,
    isVerified: boolean
}

export const google = new Google(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);
