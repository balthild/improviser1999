import type { Cookies } from '@sveltejs/kit';
import Negotiator from 'negotiator';

import { getRequestEvent } from '$app/server';

import type { Language } from '../language';
import { languages } from '../language';

export class DefaultLanguageResolver {
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
