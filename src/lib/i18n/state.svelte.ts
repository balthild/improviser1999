import { DefaultLanguageResolver } from '#lib/i18n/resolver';

import type { Language } from './language';

export function tr(strings: Record<Language, string>) {
	const language = getLanguage();
	return strings[language];
}

let current = $state<Language>();

export function getLanguage(): Language {
	return current ?? DefaultLanguageResolver.resolve();
}

export function setLanguage(language: Language) {
	current = language;
	document.cookie = `improviser1999_language=${language}; max-age=34560000; path=/`;
}
