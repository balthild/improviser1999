import cloudflare from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		runes: true,
		experimental: {
			async: true,
		},
	},
	kit: {
		adapter: cloudflare(),
		experimental: {
			remoteFunctions: true,
		},
	},
};

export default config;
