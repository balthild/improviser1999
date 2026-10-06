export const languages = {
	zh: '中文',
	en: 'English',
} as const;

export type Language = keyof typeof languages;
