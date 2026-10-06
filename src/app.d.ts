import type { Language } from '#lib/i18n';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			language?: Language;
		}
	}
}

export {};
