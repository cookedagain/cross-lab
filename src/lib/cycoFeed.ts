// Cyco Platinum Series feeding schedule, tuned for a recirculating DWC reservoir.
//
// Rates are expressed in mL per Litre of reservoir water and are based on Cyco's
// published Platinum Series guidance. DWC runs hotter than coco/soil, so these
// are deliberately on the conservative side — always start new genetics at
// half strength and verify against the bottle label and your own EC/pH meter.

export type CycoKey =
  | "ryzofuel"
  | "growA"
  | "growB"
  | "bloomA"
  | "bloomB"
  | "silica"
  | "b1boost"
  | "zyme"
  | "xl"
  | "swell"
  | "potashPlus"
  | "drRepair"
  | "uptake"
  | "kleanse";

export type CycoProduct = {
  key: CycoKey;
  name: string;
  role: string;
  color: string;
};

export const CYCO_PRODUCTS: Record<CycoKey, CycoProduct> = {
  silica: { key: "silica", name: "Cyco Silica", role: "Cell-wall strength, added first & alone", color: "#0ea5e9" },
  ryzofuel: { key: "ryzofuel", name: "Cyco Ryzofuel", role: "Root stimulant for seedlings/clones", color: "#14b8a6" },
  growA: { key: "growA", name: "Cyco Grow A", role: "Base veg nutrient (part A)", color: "#16a34a" },
  growB: { key: "growB", name: "Cyco Grow B", role: "Base veg nutrient (part B)", color: "#15803d" },
  bloomA: { key: "bloomA", name: "Cyco Bloom A", role: "Base flower nutrient (part A)", color: "#a855f7" },
  bloomB: { key: "bloomB", name: "Cyco Bloom B", role: "Base flower nutrient (part B)", color: "#9333ea" },
  b1boost: { key: "b1boost", name: "Cyco B1 Boost", role: "Vitamin B1 — stress & vigour", color: "#f97316" },
  zyme: { key: "zyme", name: "Cyco Zyme", role: "Enzymes — keeps roots clean in DWC", color: "#eab308" },
  xl: { key: "xl", name: "Cyco XL", role: "Growth enhancer (veg → early bloom)", color: "#65a30d" },
  swell: { key: "swell", name: "Cyco Swell", role: "P-K bloom booster (mid flower)", color: "#dc2626" },
  potashPlus: { key: "potashPlus", name: "Cyco Potash Plus", role: "Late-flower ripening / potassium", color: "#b45309" },
  drRepair: { key: "drRepair", name: "Cyco Dr. Repair", role: "Recovery additive (as needed)", color: "#0d9488" },
  uptake: { key: "uptake", name: "Cyco Uptake", role: "Wetting agent / nutrient uptake", color: "#64748b" },
  kleanse: { key: "kleanse", name: "Cyco Kleanse", role: "Reservoir flush / final rinse (used alone)", color: "#94a3b8" },
};

export type FeedStage = "Seedling" | "Veg" | "Transition" | "Flower" | "Late Flower" | "Flush";

export type FeedWeek = {
  week: number;
  stage: FeedStage;
  label: string;
  ecTarget: string;
  phTarget: string;
  rates: Partial<Record<CycoKey, number>>; // mL per Litre
};

export const STAGE_TONE: Record<FeedStage, string> = {
  Seedling: "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/40 dark:text-teal-200 dark:border-teal-900",
  Veg: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-900",
  Transition: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900",
  Flower: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 dark:bg-fuchsia-950/40 dark:text-fuchsia-200 dark:border-fuchsia-900",
  "Late Flower": "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-200 dark:border-orange-900",
  Flush: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700",
};

// Full grow → bloom → flush schedule (mL/L). A 9-week flower window suits most
// photoperiod genetics; autos can compress veg to weeks 1–3.
export const CYCO_SCHEDULE: FeedWeek[] = [
  {
    week: 1,
    stage: "Seedling",
    label: "Seedling / rooted clone",
    ecTarget: "0.4–0.6 EC",
    phTarget: "5.8–6.0",
    rates: { ryzofuel: 2, silica: 0.5, b1boost: 1, zyme: 2 },
  },
  {
    week: 2,
    stage: "Veg",
    label: "Early veg",
    ecTarget: "0.8–1.0 EC",
    phTarget: "5.6–5.9",
    rates: { growA: 2, growB: 2, silica: 1, b1boost: 2, zyme: 2, xl: 2, ryzofuel: 1 },
  },
  {
    week: 3,
    stage: "Veg",
    label: "Mid veg",
    ecTarget: "1.2–1.4 EC",
    phTarget: "5.6–5.9",
    rates: { growA: 4, growB: 4, silica: 1, b1boost: 2, zyme: 2, xl: 2 },
  },
  {
    week: 4,
    stage: "Veg",
    label: "Late veg",
    ecTarget: "1.4–1.6 EC",
    phTarget: "5.6–5.9",
    rates: { growA: 4, growB: 4, silica: 1, b1boost: 2, zyme: 2, xl: 2 },
  },
  {
    week: 5,
    stage: "Transition",
    label: "Flip / stretch",
    ecTarget: "1.4–1.6 EC",
    phTarget: "5.7–6.0",
    rates: { bloomA: 2, bloomB: 2, growA: 2, growB: 2, silica: 1, b1boost: 2, zyme: 2, xl: 2 },
  },
  {
    week: 6,
    stage: "Flower",
    label: "Early flower",
    ecTarget: "1.6–1.8 EC",
    phTarget: "5.8–6.2",
    rates: { bloomA: 4, bloomB: 4, silica: 1, b1boost: 2, zyme: 2, swell: 2 },
  },
  {
    week: 7,
    stage: "Flower",
    label: "Mid flower (peak)",
    ecTarget: "1.8–2.0 EC",
    phTarget: "5.8–6.2",
    rates: { bloomA: 4, bloomB: 4, b1boost: 2, zyme: 2, swell: 2 },
  },
  {
    week: 8,
    stage: "Flower",
    label: "Mid–late flower",
    ecTarget: "1.8–2.0 EC",
    phTarget: "5.8–6.2",
    rates: { bloomA: 4, bloomB: 4, b1boost: 2, zyme: 2, swell: 2, potashPlus: 2 },
  },
  {
    week: 9,
    stage: "Late Flower",
    label: "Ripening",
    ecTarget: "1.6–1.8 EC",
    phTarget: "6.0–6.2",
    rates: { bloomA: 4, bloomB: 4, zyme: 2, potashPlus: 2 },
  },
  {
    week: 10,
    stage: "Late Flower",
    label: "Late ripening",
    ecTarget: "1.2–1.4 EC",
    phTarget: "6.0–6.2",
    rates: { bloomA: 2, bloomB: 2, zyme: 2, potashPlus: 2 },
  },
  {
    week: 11,
    stage: "Flush",
    label: "Flush / final week",
    ecTarget: "0.0–0.4 EC",
    phTarget: "5.8–6.2",
    rates: { kleanse: 2, zyme: 2 },
  },
];

// Cyco's official "order of addition" for a shared reservoir. Silica always goes
// in first and alone; Zyme is next; then the A base, then the B base (A and B are
// NEVER combined while concentrated); then supplements one at a time; pH is
// adjusted LAST. Kleanse is a flush product and is used on its own, not mixed
// into a feeding reservoir.
export const MIXING_ORDER: { step: number; keys: CycoKey[]; note: string }[] = [
  { step: 1, keys: ["silica"], note: "Add Silica FIRST and alone. Stir well and wait ~10 min before adding anything else — it can lock out if mixed with concentrated nutrients." },
  { step: 2, keys: ["zyme"], note: "Add Zyme next so enzymes are active before the base nutrients go in." },
  { step: 3, keys: ["growA", "bloomA"], note: "Add the A base (Grow A in veg, Bloom A in flower). Stir fully." },
  { step: 4, keys: ["growB", "bloomB"], note: "Add the B base. Never combine A and B while still concentrated — always add them to water separately." },
  { step: 5, keys: ["ryzofuel", "b1boost", "xl", "swell", "potashPlus", "drRepair", "uptake"], note: "Add supplements one at a time, stirring between each." },
  { step: 6, keys: [], note: "Adjust pH LAST, once everything is mixed and the EC has settled." },
];

// Kleanse is used as a standalone reservoir flush, not part of the feed mix.
export const FLUSH_NOTE =
  "Cyco Kleanse is a reservoir/root-zone flush — run it on its own with plain water (don't combine it with a feeding mix).";

export const mixAmount = (rate: number, reservoirL: number) =>
  Math.round(rate * reservoirL * 10) / 10;

export const DEFAULT_RESERVOIR_L = 15;