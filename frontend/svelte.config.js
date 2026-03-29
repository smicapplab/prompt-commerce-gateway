import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			fallback: 'index.html' // Enables SPA mode
		}),
		alias: {
			$prisma: '../src/generated/client'
		},
		prerender: {
			entries: ['*'],
			handleUnseenRoutes: 'ignore',
			handleHttpError: 'ignore'
		}
	}
};

export default config;
