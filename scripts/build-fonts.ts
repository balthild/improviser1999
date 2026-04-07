#!/usr/bin/env node

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { Font, woff2 } from 'fonteditor-core';
import type { TTF } from 'fonteditor-core';

await woff2.init();

function adjust(glyph: TTF.Glyph, left: number, right: number, raise: number = 0) {
	glyph.advanceWidth += left + right;
	glyph.leftSideBearing += left;
	glyph.xMin += left;
	glyph.xMax += left;
	glyph.yMin += raise;
	glyph.yMax += raise;
	for (const contour of glyph.contours) {
		for (const point of contour) {
			point.x += left;
			point.y += raise;
		}
	}
}

type Adjustment = (glyph: TTF.Glyph) => void;

const glyphs: Record<string, Adjustment> = {
	'\u00b7': (glyph) => adjust(glyph, 275, 275),
	'\u201c': (glyph) => adjust(glyph, 40, 10, 90),
	'\u201d': (glyph) => adjust(glyph, 10, 40, 90),
};

const uri = import.meta.resolve('@fontsource/work-sans/files/work-sans-latin-400-normal.woff2');
const input = await readFile(fileURLToPath(uri));

const font = Font.create(input, {
	type: 'woff2',
	subset: Object.keys(glyphs).map((c) => c.charCodeAt(0)),
});

for (const [char, adjust] of Object.entries(glyphs)) {
	if (!adjust) continue;
	const [glyph] = font.find({ unicode: [char.charCodeAt(0)] });
	adjust(glyph);
}

const output = font.write({ type: 'woff2', toBuffer: true });

await mkdir('src/lib/assets/fonts', { recursive: true });
await writeFile('src/lib/assets/fonts/work-sans-punct.woff2', output);
