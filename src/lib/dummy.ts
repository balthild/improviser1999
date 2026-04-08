import type { Arcanist, Material, Pool } from './types/dataset';
import type { PoolTypeId } from './types/primitive';

type PartialArcanist = Partial<Arcanist> & Pick<Arcanist, 'id'>;
type PartialMaterial = Partial<Material> & Pick<Material, 'id'>;
type PartialPool = Partial<Pool> & Pick<Pool, 'id'>;

export function dummyArcanist(arcanist: PartialArcanist): Arcanist {
	return {
		id: arcanist.id,
		name: {
			zh: arcanist.name?.zh ?? String(arcanist.id),
			en: arcanist.name?.en ?? String(arcanist.id),
		},
		rarity: arcanist.rarity ?? 6,
		career: arcanist.career ?? 0,
	};
}

export function dummyMaterial(material: PartialMaterial): Material {
	return {
		id: material.id,
		name: {
			zh: material.name?.zh ?? String(material.id),
			en: material.name?.en ?? String(material.id),
		},
		rarity: material.rarity ?? 6,
	};
}

export function dummyPool(pool: PartialPool): Pool {
	return {
		id: pool.id,
		type: pool.type ?? (0 as PoolTypeId),
		name: {
			zh: pool.name?.zh ?? String(pool.id),
			en: pool.name?.en ?? String(pool.id),
		},
		pity: pool.pity ?? 70,
		arcanists: pool.arcanists ?? {},
	};
}
