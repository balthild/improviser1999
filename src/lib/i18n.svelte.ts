import Negotiator from 'negotiator';

import { browser } from '$app/environment';
import { getRequestEvent } from '$app/server';

export const languages = {
	zh: '中文',
	en: 'English',
} as const;

export type Language = keyof typeof languages;

export function tr(strings: Record<Language, string>) {
	const language = getLanguage();
	return strings[language];
}

let current = $state<Language>();

export function getLanguage(): Language {
	return current ?? getDefaultLanguage();
}

export function setLanguage(language: Language) {
	current = language;
}

function getDefaultLanguage(): Language {
	return browser ? getBrowserDefaultLanguage() : getServerDefaultLanguage();
}

function getBrowserDefaultLanguage(): Language {
	for (const language of navigator.languages) {
		const short = language.substring(0, 2);
		if (Object.hasOwn(languages, short)) {
			return short as Language;
		}
	}

	return 'zh';
}

function getServerDefaultLanguage(): Language {
	const { request } = getRequestEvent();

	// TODO: get from cookies first
	const headers = { 'accept-language': request.headers.get('accept-language') ?? '' };
	const negotiator = new Negotiator({ headers });
	const language = negotiator.language(Object.keys(languages)) ?? 'zh';

	return language as Language;
}
