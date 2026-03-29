import * as v from 'valibot';

export const QUERY_SUMMON_URL_BASE = 'https://game-re-service.sl916.com/query/summon';

export const ImportUrlScheme = v.pipe(
	v.string(),
	v.url(),
	v.startsWith(QUERY_SUMMON_URL_BASE),
	v.transform((url) => new URL(url)),
	v.check((url) => url.searchParams.has('userId')),
	// ideally I would be able to write something like
	// v.tap(v.and(
	//   v.transform((url) => url.searchParams.get('token')!),
	//   v.uuid(),
	// ))
	// https://github.com/open-circle/valibot/issues/835
	v.check((url) => {
		const token = url.searchParams.get('token')!;
		return v.uuid().requirement.test(token);
	}),
);
