import type { Cookies } from '@sveltejs/kit';
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
	document.cookie = `improviser1999_language=${language}; max-age=34560000; path=/`;
}

function getDefaultLanguage(): Language {
	if (browser) {
		return DefaultBrowserLanguage.resolve();
	} else {
		return DefaultServerLanguage.resolve();
	}
}

class DefaultBrowserLanguage {
	private static language: Language | undefined;

	public static resolve(): Language {
		this.language ??= this.rendered() ?? this.navigator() ?? 'zh';
		return this.language;
	}

	private static rendered(): Language | undefined {
		const language = document.documentElement.lang;
		if (Object.hasOwn(languages, language)) {
			return language as Language;
		}
	}

	private static navigator(): Language | undefined {
		for (const language of navigator.languages) {
			const short = language.substring(0, 2);
			if (Object.hasOwn(languages, short)) {
				return short as Language;
			}
		}
	}
}

class DefaultServerLanguage {
	public static resolve(): Language {
		const { request, cookies, locals } = getRequestEvent();
		locals.language ??= this.cookies(cookies) ?? this.accept(request) ?? 'zh';
		return locals.language;
	}

	private static cookies(cookies: Cookies): Language | undefined {
		const language = cookies.get('improviser1999_language');
		if (language && Object.hasOwn(languages, language)) {
			return language as Language;
		}
	}

	private static accept(request: Request): Language | undefined {
		const headers = { 'accept-language': request.headers.get('accept-language') ?? '' };
		const negotiator = new Negotiator({ headers });
		const language = negotiator.language(Object.keys(languages));

		return language as Language | undefined;
	}
}
