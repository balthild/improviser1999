import plugin from 'tailwindcss/plugin';

export default plugin(({ matchVariant }) => {
	// https://keithclark.co.uk/articles/targeting-first-and-last-rows-in-css-grid-layouts/
	matchVariant('last-row', (value) => {
		return [
			`&:nth-child(${value}n+1):nth-last-child(-n+${value})`,
			`&:nth-child(${value}n+1):nth-last-child(-n+${value}) ~ &`,
		];
	});
	matchVariant('first-row', (value) => {
		return `&:nth-child(-n+${value})`;
	});
	matchVariant('last-col', (value) => {
		return `&:nth-child(${value}n)`;
	});
	matchVariant('first-col', (value) => {
		return `&:nth-child(${value}n+1)`;
	});
});
