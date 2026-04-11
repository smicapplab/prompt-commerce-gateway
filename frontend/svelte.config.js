import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			fallback: 'index.html' // Enables SPA mode
		}),
		alias: {
			$shared: '../src/shared',
		},
		prerender: {
			entries: ['*'],
			handleUnseenRoutes: 'ignore',
			handleHttpError: 'ignore'
		}
	}
};

export default config;
