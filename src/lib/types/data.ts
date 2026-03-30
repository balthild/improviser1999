export interface Arcanist {
	name: string;
	rarity: number;
	career: number;
}

export interface ArcanistDataset {
	[id: string]: Arcanist;
}
