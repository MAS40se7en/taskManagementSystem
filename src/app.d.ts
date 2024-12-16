// See https://kit.svelte.dev/docs/types#app

import type { PrismaClient } from "@prisma/client";

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: import("lucia").User | null;
			session: import("lucia").Session | null;
			colorTheme: import('$lib/types').ColorTheme;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
		interface Session {
			colorTheme: import('$lib/types').ColorTheme;
		}
	}

	var prisma: PrismaClient;
}

export {};
