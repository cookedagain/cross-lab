"use client";

export type CycoKey =
  | "growA"
  | "growB"
  | "bloomA"
  | "bloomB"
  | "silica"
  | "ryzofuel"
  | "b1boost"
  | "zyme"
  | "xl"
  | "swell"
  | "potashPlus"
  | "kleanse"
  | "drRepair"
  | "uptake"
  | "phUp"
  | "phDown"
  | "greatWhite";

export interface FeedWeek {
  week: number;
  label: string;
  stage: "Veg" | "Flower" | "Flush";
  ecTarget: string;
  phTarget: string;
  rates: Partial<Record<CycoKey, number>>;
}

export const DEFAULT_RESERVOIR_L = 10;

export const FLUSH_NOTE = "Flush with Kleanse, Dr Repair, and Uptake for the final week of flower to clear out residual salts.";

export const STAGE_TONE: Record<string, string> = {
  Veg: "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/40 dark:text-teal-200 dark:border-teal-900",
  Flower: "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-950/40 dark:text-pink-200 dark:border-pink-900",
  Flush: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-900",
};

export const mixAmount = (rate: number, reservoirL: number) => {
  return Math.round(rate * reservoirL * 10) / 10;
};

export const CYCO_PRODUCTS: Record<CycoKey, { name: string; color: string; role: string }> = {
  growA: { name: "Cyco Platinum Grow A", color: "#16a34a", role: "Primary vegetative nutrient (Part A)" },
  growB: { name: "Cyco Platinum Grow B", color: "#22c55e", role: "Primary vegetative nutrient (Part B)" },
  bloomA: { name: "Cyco Platinum Bloom A", color: "#db2777", role: "Primary flowering nutrient (Part A)" },
  bloomB: { name: "Cyco Platinum Bloom B", color: "#ec4899", role: "Primary flowering nutrient (Part B)" },
  silica: { name: "Cyco Platinum Silica", color: "#0ea5e9", role: "Strengthens cell walls and heat/drought tolerance" },
  ryzofuel: { name: "Cyco Ryzofuel", color: "#f59e0b", role: "Rapid root development and stress recovery" },
  b1boost: { name: "Cyco B1 Boost", color: "#8b5cf6", role: "B-vitamins to reduce transplant shock and boost growth" },
  zyme: { name: "Cyco Zyme", color: "#06b6d4", role: "Enzymes to break down dead root material into sugars" },
  xl: { name: "Cyco XL", color: "#f97316", role: "Phosphoric acid booster for explosive early flowering" },
  swell: { name: "Cyco Swell", color: "#fb7185", role: "Phosphorus & Potassium booster for mid-to-late flower" },
  potashPlus: { name: "Cyco Potash Plus", color: "#7c3aed", role: "Late flower hardener and terpene enhancer" },
  kleanse: { name: "Cyco Kleanse", color: "#14b8a6", role: "Salt leaching agent to clear nutrient buildup" },
  drRepair: { name: "Cyco Dr Repair", color: "#3b82f6", role: "Chlorophyll booster to treat iron deficiency" },
  uptake: { name: "Cyco Uptake", color: "#6366f1", role: "Humic acid to maximize nutrient absorption" },
  phUp: { name: "pH Up", color: "#facc15", role: "Raises pH of nutrient solution" },
  phDown: { name: "pH Down", color: "#ef4444", role: "Lowers pH of nutrient solution" },
  greatWhite: { name: "Great White Mycorrhizae", color: "#a855f7", role: "Beneficial microbes for root health and water uptake" },
};

export const MIXING_ORDER = [
  {
    step: 1,
    keys: ["silica"] as CycoKey[],
    note: "Add Silica first to prevent precipitation with other minerals. Mix thoroughly.",
  },
  {
    step: 2,
    keys: ["growA", "bloomA"] as CycoKey[],
    note: "Add Part A nutrients. Stir well before adding Part B.",
  },
  {
    step: 3,
    keys: ["growB", "bloomB"] as CycoKey[],
    note: "Add Part B nutrients. Stir well.",
  },
  {
    step: 4,
    keys: ["ryzofuel", "b1boost", "zyme", "xl", "swell", "potashPlus", "kleanse", "drRepair", "uptake", "greatWhite"] as CycoKey[],
    note: "Add additives and organic supplements.",
  },
  {
    step: 5,
    keys: [] as CycoKey[],
    note: "Check and adjust pH to 5.5–6.0. Stir thoroughly and let settle.",
  },
];

export const CYCO_SCHEDULE: FeedWeek[] = [
  {
    week: 1,
    label: "Seedling / Early Veg",
    stage: "Veg",
    ecTarget: "0.8 - 1.2 EC",
    phTarget: "5.5 - 5.8",
    rates: {
      growA: 0.25,
      growB: 0.25,
      silica: 0.25,
      zyme: 0.25,
      greatWhite: 0.1,
    },
  },
  {
    week: 2,
    label: "Veg Week 1",
    stage: "Veg",
    ecTarget: "1.2 - 1.6 EC",
    phTarget: "5.5 - 5.8",
    rates: {
      growA: 0.5,
      growB: 0.5,
      silica: 0.5,
      zyme: 0.5,
      b1boost: 0.25,
      greatWhite: 0.1,
    },
  },
  {
    week: 3,
    label: "Veg Week 2",
    stage: "Veg",
    ecTarget: "1.4 - 1.8 EC",
    phTarget: "5.5 - 5.8",
    rates: {
      growA: 0.75,
      growB: 0.75,
      silica: 0.5,
      zyme: 0.5,
      b1boost: 0.25,
      greatWhite: 0.1,
    },
  },
  {
    week: 4,
    label: "Veg Week 3",
    stage: "Veg",
    ecTarget: "1.6 - 2.0 EC",
    phTarget: "5.5 - 5.8",
    rates: {
      growA: 1.0,
      growB: 1.0,
      silica: 0.5,
      zyme: 0.5,
      b1boost: 0.5,
      greatWhite: 0.1,
    },
  },
  {
    week: 5,
    label: "Transition",
    stage: "Veg",
    ecTarget: "1.6 - 2.0 EC",
    phTarget: "5.5 - 5.8",
    rates: {
      bloomA: 0.5,
      bloomB: 0.5,
      silica: 0.5,
      zyme: 0.5,
      b1boost: 0.25,
      greatWhite: 0.05,
    },
  },
  {
    week: 6,
    label: "Flower Week 1",
    stage: "Flower",
    ecTarget: "1.8 - 2.2 EC",
    phTarget: "5.8 - 6.0",
    rates: {
      bloomA: 1.0,
      bloomB: 1.0,
      silica: 0.5,
      zyme: 0.5,
      xl: 0.25,
      greatWhite: 0.05,
    },
  },
  {
    week: 7,
    label: "Flower Week 2",
    stage: "Flower",
    ecTarget: "1.8 - 2.2 EC",
    phTarget: "5.8 - 6.0",
    rates: {
      bloomA: 1.0,
      bloomB: 1.0,
      silica: 0.5,
      zyme: 0.5,
      xl: 0.25,
      swell: 0.25,
      greatWhite: 0.05,
    },
  },
  {
    week: 8,
    label: "Flower Week 3",
    stage: "Flower",
    ecTarget: "2.0 - 2.4 EC",
    phTarget: "5.8 - 6.0",
    rates: {
      bloomA: 1.0,
      bloomB: 1.0,
      silica: 0.5,
      zyme: 0.5,
      xl: 0.5,
      swell: 0.25,
      potashPlus: 0.25,
      greatWhite: 0.05,
    },
  },
  {
    week: 9,
    label: "Flower Week 4",
    stage: "Flower",
    ecTarget: "2.0 - 2.4 EC",
    phTarget: "5.8 - 6.0",
    rates: {
      bloomA: 1.0,
      bloomB: 1.0,
      silica: 0.5,
      zyme: 0.5,
      xl: 0.5,
      swell: 0.5,
      potashPlus: 0.25,
    },
  },
  {
    week: 10,
    label: "Flower Week 5",
    stage: "Flower",
    ecTarget: "1.8 - 2.2 EC",
    phTarget: "5.8 - 6.0",
    rates: {
      bloomA: 1.0,
      bloomB: 1.0,
      silica: 0.25,
      zyme: 0.5,
      xl: 0.5,
      swell: 0.5,
      potashPlus: 0.5,
    },
  },
  {
    week: 11,
    label: "Flush Week",
    stage: "Flush",
    ecTarget: "0.2 - 0.6 EC",
    phTarget: "5.5 - 5.8",
    rates: {
      kleanse: 1.0,
      drRepair: 0.25,
      uptake: 0.25,
      phUp: 0.1,
      phDown: 0.1,
    },
  },
];
