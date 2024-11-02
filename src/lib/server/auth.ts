import { PrismaClient } from '@prisma/client';
import { PrismaAdapter } from '@lucia-auth/adapter-prisma';
import { Lucia } from 'lucia';
import { dev } from '$app/environment';
import type { JsonArray } from '@prisma/client/runtime/library';

const client = new PrismaClient();

const adapter = new PrismaAdapter(client.session, client.user);

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
}