import type { Arcanist, Material, Pool } from '#lib/types/dataset';
import type { PoolTypeId } from '#lib/types/primitive';

type Name = { zh: string; en: string };

type Info<T extends { id: unknown }> = Pick<T, 'id'> & {
	[K in keyof T]?: T[K] extends Name ? Partial<Name> | string : T[K];
};

type Factory<T extends { id: unknown }> = (info: Info<T>) => T;

export const dummyArcanist: Factory<Arcanist> = (arcanist) => {
	return {
		id: arcanist.id,
		name: dummyName(arcanist.name, String(arcanist.id)),
		rarity: arcanist.rarity ?? 6,
		career: arcanist.career ?? 0,
	};
};

export const dummyMaterial: Factory<Material> = (material) => {
	return {
		id: material.id,
		name: dummyName(material.name, String(material.id)),
		rarity: material.rarity ?? 6,
	};
};

export const dummyPool: Factory<Pool> = (pool) => {
	return {
		id: pool.id,
		type: pool.type ?? (0 as PoolTypeId),
		name: dummyName(pool.name, String(pool.id)),
		pity: pool.pity ?? 70,
		order: pool.order ?? 4,
		arcanists: pool.arcanists ?? {},
	};
};

function dummyName(name: Partial<Name> | string | undefined, fallback: string): Name {
	if (typeof name === 'string') {
		return { zh: name, en: name };
	}

	return {
		zh: name?.zh ?? fallback,
		en: name?.en ?? fallback,
	};
}
