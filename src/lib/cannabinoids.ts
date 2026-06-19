import type { Seed } from "@/data/seeds";
import { estimateCannabinoids } from "@/lib/crossName";

export type CannabinoidKey =
  | "thc"
  | "thca"
  | "thcv"
  | "cbd"
  | "cbda"
  | "cbg"
  | "cbga"
  | "cbn"
  | "cbc";

export type CannabinoidRange = { min: number; max: number };

export type CannabinoidCategory = "Trace" | "Low" | "Moderate" | "High" | "Very High";

type CannabinoidInfo = {
  name: string;
  label: string;
  aroma?: string;
  effect: string;
  color: string;
  reference: number; // typical "high" % for scaling categories
};

export const CANNABINOIDS: Record<CannabinoidKey, CannabinoidInfo> = {
  thc: { name: "THC", label: "Delta-9 THC", effect: "primary psychoactive, euphoric", color: "#16a34a", reference: 25 },
  thca: { name: "THCA", label: "THC acid (raw)", effect: "non-intoxicating precursor, anti-inflammatory", color: "#15803d", reference: 28 },
  thcv: { name: "THCV", label: "Tetrahydrocannabivarin", effect: "energetic, appetite-suppressing", color: "#65a30d", reference: 3 },
  cbd: { name: "CBD", label: "Cannabidiol", effect: "calming, non-intoxicating, balancing", color: "#0ea5e9", reference: 12 },
  cbda: { name: "CBDA", label: "CBD acid (raw)", effect: "raw precursor, anti-nausea", color: "#0284c7", reference: 14 },
  cbg: { name: "CBG", label: "Cannabigerol", effect: "focus, mild, mother cannabinoid", color: "#a855f7", reference: 2 },
  cbga: { name: "CBGA", label: "CBG acid (raw)", effect: "precursor to all cannabinoids", color: "#9333ea", reference: 2.5 },
  cbn: { name: "CBN", label: "Cannabinol", effect: "sedative, formed by THC aging", color: "#a16207", reference: 1.5 },
  cbc: { name: "CBC", label: "Cannabichromene", effect: "mood support, mild, synergistic", color: "#dc2626", reference: 1.5 },
};

export const CANNABINOID_ORDER: CannabinoidKey[] = [
  "thc",
  "thca",
  "thcv",
  "cbd",
  "cbda",
  "cbg",
  "cbga",
  "cbn",
  "cbc",
];

const round = (value: number) => Math.round(value * 10) / 10;

// Classifies any cannabinoid value into a category, scaled per-cannabinoid so
// that e.g. 1% THCV reads "High" while 1% THC reads "Trace".
export const categorizeCannabinoid = (key: CannabinoidKey, value: number): CannabinoidCategory => {
  const ratio = value / CANNABINOIDS[key].reference;
  if (ratio < 0.05) return "Trace";
  if (ratio < 0.25) return "Low";
  if (ratio < 0.55) return "Moderate";
  if (ratio < 0.8) return "High";
  return "Very High";
};

export const CATEGORY_TONE: Record<CannabinoidCategory, string> = {
  Trace: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700",
  Low: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-200 dark:border-sky-900",
  Moderate: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-900",
  High: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900",
  "Very High": "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 dark:bg-fuchsia-950/40 dark:text-fuchsia-200 dark:border-fuchsia-900",
};

export type CannabinoidPanelEntry = {
  key: CannabinoidKey;
  info: CannabinoidInfo;
  range: CannabinoidRange;
  category: CannabinoidCategory;
};

// Builds a full natural cannabinoid panel. THC/CBD/CBG/CBN reuse the existing
// estimate; acidic precursors and minors (THCA, THCV, CBDA, CBGA, CBC) are
// derived from name/lineage cues so the whole panel stays internally consistent.
export const estimateCannabinoidPanel = (seed: Seed): CannabinoidPanelEntry[] => {
  const base = estimateCannabinoids(seed);
  const text = `${seed.name} ${seed.breeder}`.toLowerCase();

  const thcvBoost = /durban|haze|malawi|thai|tangie|doug|power plant|cherry pie/i.test(text) ? 2.4 : 0.4;
  const cbcBoost = /tropical|thai|landrace|afghan|charas|hash/i.test(text) ? 0.9 : 0.5;

  const ranges: Record<CannabinoidKey, CannabinoidRange> = {
    thc: base.thc,
    thca: { min: round(base.thc.min * 1.1), max: round(base.thc.max * 1.18) },
    thcv: { min: round(thcvBoost * 0.4), max: round(thcvBoost) },
    cbd: base.cbd,
    cbda: { min: round(base.cbd.min * 1.05), max: round(base.cbd.max * 1.15) },
    cbg: base.cbg,
    cbga: { min: round(base.cbg.min * 1.1), max: round(base.cbg.max * 1.25) },
    cbn: base.cbn,
    cbc: { min: round(cbcBoost * 0.4), max: round(cbcBoost) },
  };

  return CANNABINOID_ORDER.map((key) => {
    const range = ranges[key];
    const midpoint = (range.min + range.max) / 2;
    return {
      key,
      info: CANNABINOIDS[key],
      range,
      category: categorizeCannabinoid(key, midpoint),
    };
  });
};