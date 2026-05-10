export interface Rng {
  next: () => number;
  getState: () => number;
}

export interface WeightedItem<T> {
  item: T;
  weight: number;
}

export function createRng(seed: number): Rng {
  let state = seed >>> 0;

  return {
    next: () => {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

      return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
    },
    getState: () => state >>> 0,
  };
}

export function between(rng: Rng, min: number, max: number): number {
  return min + (max - min) * rng.next();
}

export function integer(rng: Rng, min: number, max: number): number {
  return Math.floor(between(rng, min, max + 1));
}

export function chance(rng: Rng, probability: number): boolean {
  if (probability <= 0) {
    return false;
  }

  if (probability >= 1) {
    return true;
  }

  return rng.next() < probability;
}

export function pick<T>(rng: Rng, items: readonly T[]): T {
  if (items.length === 0) {
    throw new Error("Cannot pick from an empty list.");
  }

  return items[integer(rng, 0, items.length - 1)] as T;
}

export function weighted<T>(rng: Rng, items: readonly WeightedItem<T>[]): T {
  if (items.length === 0) {
    throw new Error("Cannot pick a weighted item from an empty list.");
  }

  const total = items.reduce((sum, entry) => sum + Math.max(0, entry.weight), 0);

  if (total <= 0) {
    throw new Error("Weighted items must have at least one positive weight.");
  }

  let roll = between(rng, 0, total);

  for (const entry of items) {
    roll -= Math.max(0, entry.weight);

    if (roll <= 0) {
      return entry.item;
    }
  }

  return items[items.length - 1]?.item as T;
}
