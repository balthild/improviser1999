import type { Language } from '../language';
import { languages } from '../language';

export class DefaultLanguageResolver {
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
