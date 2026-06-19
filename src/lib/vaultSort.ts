import type { Seed } from "@/data/seeds";
import { estimateCannabinoids, estimateLineageSplit, estimateSeedGrowth } from "@/lib/crossName";
import { getSeedRarity } from "@/lib/rarity";

export type SortMode =
  | "count"
  | "rarity-desc"
  | "yield-desc"
  | "yield-asc"
  | "height-desc"
  | "height-asc"
  | "sativa-desc"
  | "indica-desc"
  | "potency-desc"
  | "flowering-asc"
  | "flowering-desc"
  | "terpene-desc"
  | "resin-desc"
  | "ease-desc"
  | "stretch-desc"
  | "stress-desc"
  | "mold-desc"
  | "keeper-desc"
  | "name";

export const SORT_OPTIONS: { mode: SortMode; label: string }[] = [
  { mode: "count", label: "Seed count" },
  { mode: "rarity-desc", label: "Rarity high → low" },
  { mode: "potency-desc", label: "THC high → low" },
  { mode: "yield-desc", label: "Yield high → low" },
  { mode: "yield-asc", label: "Yield low → high" },
  { mode: "height-desc", label: "Height tall → short" },
  { mode: "height-asc", label: "Height short → tall" },
  { mode: "sativa-desc", label: "Sativa % high → low" },
  { mode: "indica-desc", label: "Indica % high → low" },
  { mode: "flowering-asc", label: "Flowering fast → slow" },
  { mode: "flowering-desc", label: "Flowering slow → fast" },
  { mode: "terpene-desc", label: "Terpene intensity" },
  { mode: "resin-desc", label: "Resin density" },
  { mode: "ease-desc", label: "Ease of grow" },
  { mode: "stretch-desc", label: "Stretch factor" },
  { mode: "stress-desc", label: "Stress resistance" },
  { mode: "mold-desc", label: "Mold resilience" },
  { mode: "keeper-desc", label: "Keeper priority" },
  { mode: "name", label: "Name A → Z" },
];

export const seedYieldMetric = (seed: Seed) => {
  const estimates = estimateSeedGrowth(seed);
  const top = estimates[estimates.length - 1];
  return top ? top.yieldG.max : 0;
};

export const seedHeightMetric = (seed: Seed) => {
  const estimates = estimateSeedGrowth(seed);
  const top = estimates[estimates.length - 1];
  return top ? top.heightCm.max : 0;
};

export const seedSativaMetric = (seed: Seed) => estimateLineageSplit(seed).sativa;
export const seedPotencyMetric = (seed: Seed) => estimateCannabinoids(seed).thc.max;
export const seedRarityMetric = (seed: Seed) => getSeedRarity(seed).score;