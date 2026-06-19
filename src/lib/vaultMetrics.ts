import type { Seed } from "@/data/seeds";
import { estimateCannabinoids, estimateLineageSplit, estimateSeedGrowth } from "@/lib/crossName";
import { estimateExtractionProfile } from "@/lib/extraction";

export type SortMode =
  | "count"
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
  | "rosin-desc"
  | "liverosin-desc"
  | "cart-desc"
  | "keeper-desc"
  | "name";

export const SORT_OPTIONS: { mode: SortMode; label: string }[] = [
  { mode: "count", label: "Seed count" },
  { mode: "yield-desc", label: "Yield high → low" },
  { mode: "yield-asc", label: "Yield low → high" },
  { mode: "height-desc", label: "Height tall → short" },
  { mode: "height-asc", label: "Height short → tall" },
  { mode: "sativa-desc", label: "Sativa % high → low" },
  { mode: "indica-desc", label: "Indica % high → low" },
  { mode: "potency-desc", label: "Potency high → low" },
  { mode: "flowering-asc", label: "Flowering fast → slow" },
  { mode: "flowering-desc", label: "Flowering slow → fast" },
  { mode: "terpene-desc", label: "Terpene intensity" },
  { mode: "resin-desc", label: "Resin density" },
  { mode: "ease-desc", label: "Ease of grow" },
  { mode: "stretch-desc", label: "Stretch factor" },
  { mode: "stress-desc", label: "Stress resistance" },
  { mode: "mold-desc", label: "Mold resilience" },
  { mode: "rosin-desc", label: "Rosin pressability" },
  { mode: "liverosin-desc", label: "Live rosin yield" },
  { mode: "cart-desc", label: "Cart quality (510)" },
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

export const seedRosinMetric = (seed: Seed) => {
  const e = estimateExtractionProfile(seed);
  return e.rosin.flower + e.rosin.drySift + e.rosin.bubbleHash;
};

export const seedLiveRosinMetric = (seed: Seed) => estimateExtractionProfile(seed).liveRosin;

export const seedCartMetric = (seed: Seed) => {
  const c = estimateExtractionProfile(seed).cart;
  return c.rosin + c.liveRosin + c.resin + c.liveResin;
};

export const stretchValue = (s: string) => (s === "High" ? 3 : s === "Medium" ? 2 : 1);