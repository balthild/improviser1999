import path from 'node:path';

import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import { importX } from 'eslint-plugin-import-x';
import svelte from 'eslint-plugin-svelte';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';

import svelteConfig from './svelte.config.js';

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore');

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	ts.configs.recommended,
	svelte.configs.recommended,
	importX.configs['flat/typescript'],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
		settings: {
			'import-x/resolver-next': [createTypeScriptImportResolver()],
		},
		rules: {
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			'no-undef': 'off',

			'svelte/no-add-event-listener': 'error',
			'svelte/prefer-class-directive': 'warn',
			'svelte/prefer-style-directive': 'warn',
			'svelte/require-event-prefix': 'warn',
			'svelte/shorthand-attribute': ['error', { prefer: 'never' }],
			'svelte/shorthand-directive': ['error', { prefer: 'never' }],

			'import-x/no-cycle': 'error',
			'import-x/consistent-type-specifier-style': ['warn', 'prefer-top-level'],
			'no-duplicate-imports': ['warn', { allowSeparateTypeImports: true }],
		},
	},
	{
		files: ['src/**/*.svelte', 'src/**/*.ts', 'src/**/*.js'],
		ignores: ['src/service-worker.ts', 'src/service-worker/**'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig,
			},
		},
		rules: {
			'@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
			'@typescript-eslint/no-floating-promises': 'error',

			'no-restricted-syntax': [
				'error',
				{
					selector: 'ImportDeclaration[source.value=/\\.(js|ts)$/]',
					message: 'Unexpected file extension in imports',
				},
			],
		},
	},
);
