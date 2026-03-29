import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	server: {
		port: 3002,
		proxy: {
			'/api': 'http://localhost:3003',
			'/sse': 'http://localhost:3003',
			'/webhooks': 'http://localhost:3003',
			'/payment': 'http://localhost:3003'
		}
	}
});
