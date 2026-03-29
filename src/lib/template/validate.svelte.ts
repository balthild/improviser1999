import type { Action } from 'svelte/action';
import { on } from 'svelte/events';
import * as v from 'valibot';

type Field = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
type Schema = v.BaseSchema<string, unknown, v.BaseIssue<unknown>>;

export const validate: Action<Field, Schema> = (el, schema) => {
	$effect(() => {
		run(el, schema, false);
		return on(el, 'input', () => run(el, schema, true));
	});
};

async function run(el: Field, schema: Schema, report: boolean) {
	const result = await schema['~standard'].validate(el.value);
	el.setCustomValidity(result.issues?.[0].message ?? '');
	if (report) {
		el.reportValidity();
	}
}
