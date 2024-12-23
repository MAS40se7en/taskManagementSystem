import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter(),
		alias: {
			$env: './src/env'
		},
		prerender: {
			handleHttpError({ status, path, referrer, referenceType }) {
				if (status === 404 || status === 405) {
				  console.warn(`${status} ${path} could not be prerendered`);
				  return;
				}
		
				throw new Error(`${status} ${path} could not be prerendered`);
			  }
		}
	}
};

export default config;
