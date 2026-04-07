import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	server: {
		port: 3003,
		proxy: {
			'/api': 'http://localhost:3002',
			'/sse': 'http://localhost:3002',
			'/webhooks': 'http://localhost:3002',
			'/payment': 'http://localhost:3002'
		}
	}
});
