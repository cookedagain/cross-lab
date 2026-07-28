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
  | "cbc"
  // Varin
  | "cbdv"
  | "cbgv"
  | "cbcv"
  // Phorol
  | "thcp"
  | "cbdp"
  | "cbcp"
  // Other
  | "d8thc"
  | "cbe"
  | "cbl"
  | "cbt"
  | "cbnd";

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
  // Major
  thc: { name: "THC", label: "Delta-9 THC", effect: "primary psychoactive, euphoric", color: "#16a34a", reference: 25 },
  cbd: { name: "CBD", label: "Cannabidiol", effect: "calming, non-intoxicating, balancing", color: "#0ea5e9", reference: 12 },
  cbg: { name: "CBG", label: "Cannabigerol", effect: "focus, mild, mother cannabinoid", color: "#a855f7", reference: 2 },
  cbc: { name: "CBC", label: "Cannabichromene", effect: "mood support, mild, synergistic", color: "#dc2626", reference: 1.5 },
  cbn: { name: "CBN", label: "Cannabinol", effect: "sedative, formed by THC aging", color: "#a16207", reference: 1.5 },
  d8thc: { name: "Δ8-THC", label: "Delta-8 THC", effect: "mildly psychoactive, anti-nausea", color: "#22c55e", reference: 1 },
  // Acid precursors
  thca: { name: "THCA", label: "THC acid (raw)", effect: "non-intoxicating precursor, anti-inflammatory", color: "#15803d", reference: 28 },
  cbda: { name: "CBDA", label: "CBD acid (raw)", effect: "raw precursor, anti-nausea", color: "#0284c7", reference: 14 },
  cbga: { name: "CBGA", label: "CBG acid (raw)", effect: "precursor to all cannabinoids", color: "#9333ea", reference: 2.5 },
  // Varin chain
  thcv: { name: "THCV", label: "Tetrahydrocannabivarin", effect: "energetic, appetite-suppressing", color: "#65a30d", reference: 3 },
  cbdv: { name: "CBDV", label: "Cannabidivarin", effect: "anti-convulsant, neuroprotective", color: "#06b6d4", reference: 1 },
  cbgv: { name: "CBGV", label: "Cannabigerovarin", effect: "anti-inflammatory, synergistic", color: "#c084fc", reference: 0.5 },
  cbcv: { name: "CBCV", label: "Cannabichromevarin", effect: "bone health, synergistic", color: "#f43f5e", reference: 0.5 },
  // Phorol chain
  thcp: { name: "THCP", label: "Tetrahydrocannabiphorol", effect: "highly potent, extended effects", color: "#ef4444", reference: 0.1 },
  cbdp: { name: "CBDP", label: "Cannabidiphorol", effect: "potent CBD-like effects", color: "#3b82f6", reference: 0.1 },
  cbcp: { name: "CBCP", label: "Cannabichromenephorol", effect: "potent mood support", color: "#ec4899", reference: 0.1 },
  // Other trace
  cbe: { name: "CBE", label: "Cannabielsoin", effect: "synergistic, CBD metabolite", color: "#f59e0b", reference: 0.3 },
  cbl: { name: "CBL", label: "Cannabicyclol", effect: "trace degradation product", color: "#6b7280", reference: 0.2 },
  cbt: { name: "CBT", label: "Cannabicitran", effect: "trace, synergistic potential", color: "#8b5cf6", reference: 0.4 },
  cbnd: { name: "CBND", label: "Cannabinodiol", effect: "trace, sedative properties", color: "#ca8a04", reference: 0.3 },
};

export const CANNABINOID_ORDER: CannabinoidKey[] = [
  // Major
  "thc",
  "cbd",
  "cbg",
  "cbc",
  "cbn",
  "d8thc",
  // Acid precursors
  "thca",
  "cbda",
  "cbga",
  // Varin chain
  "thcv",
  "cbdv",
  "cbgv",
  "cbcv",
  // Phorol chain
  "thcp",
  "cbdp",
  "cbcp",
  // Other trace
  "cbe",
  "cbl",
  "cbt",
  "cbnd",
];

const round = (value: number) => Math.round(value * 100) / 100;

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
  const phorolBoost = /FM2|italian/i.test(text) ? 0.1 : 0.02; // for THCP, CBDP, etc.
  const d8Boost = /delta|aged|cured/i.test(text) ? 0.5 : 0.1;

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

    // Varin
    cbdv: { min: round(thcvBoost * 0.1), max: round(thcvBoost * 0.25) },
    cbgv: { min: round(thcvBoost * 0.05), max: round(thcvBoost * 0.15) },
    cbcv: { min: round(cbcBoost * 0.1), max: round(cbcBoost * 0.2) },

    // Phorol
    thcp: { min: round(phorolBoost * 0.1), max: round(phorolBoost) },
    cbdp: { min: round(phorolBoost * 0.1), max: round(phorolBoost) },
    cbcp: { min: round(phorolBoost * 0.1), max: round(phorolBoost) },

    // Other
    d8thc: { min: round(d8Boost * 0.2), max: round(d8Boost) },
    cbe: { min: 0.0, max: 0.3 },
    cbl: { min: 0.0, max: 0.2 },
    cbt: { min: 0.0, max: 0.4 },
    cbnd: { min: 0.0, max: 0.3 },
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