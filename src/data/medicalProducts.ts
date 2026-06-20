// Medical cannabis product catalog feed.
//
// This module exposes a curated catalog used by the "Recommended products" section
// on the rotation page. It is structured so the static fallback list below can be
// transparently replaced by a live, once-a-day scraped feed from Catalyst/Honahlee
// when the backend route is available.

import type { RotationCategory } from "@/hooks/useRotationStore";

export type MedicalProduct = {
  id: string;
  name: string;
  brand: string;
  category: RotationCategory;
  thc: number;
  cbd: number;
  rating: number; // community review score out of 5
  description: string;
  effects: string[];
  treatmentUses: string[];
  source: string;
  url: string;
};

export type MedicalCatalog = {
  items: MedicalProduct[];
  syncedAt: string;
  source: "live" | "catalog";
};

// Optional: set to a backend route that returns MedicalProduct[] to go fully live.
const MEDICAL_FEED_URL: string | null = null;

export const CANNAREVIEWS_SITE = "https://cannareviews.health";
export const CATALYST_SITE = "https://catalyst.honahlee.com.au";

export const catalystSearchUrl = (query: string) =>
  `${CATALYST_SITE}/products?search=${encodeURIComponent(query)}`;

type RawItem = Omit<MedicalProduct, "id" | "url">;

const RAW_CATALOG: RawItem[] = [
  {
    brand: "Little Green Pharma",
    name: "LGP Classic 20:1",
    category: "Flower",
    thc: 20,
    cbd: 1,
    rating: 4.2,
    description: "A balanced mid-strength flower profile that suits patients who want reliable evening relief without jumping straight to ultra-high THC products.",
    effects: ["Relaxing", "Body calm", "Sleep support"],
    treatmentUses: ["Insomnia", "Chronic pain", "Evening anxiety"],
    source: "catalyst.honahlee.com.au",
  },
  {
    brand: "Cannatrek",
    name: "T22 Eve",
    category: "Flower",
    thc: 22,
    cbd: 0,
    rating: 4.0,
    description: "A straightforward THC-forward flower for patients who want moderate potency with flexible day-to-evening use depending on tolerance.",
    effects: ["Euphoric", "Pain relief", "Mood lift"],
    treatmentUses: ["Pain", "Low mood", "Appetite support"],
    source: "catalyst.honahlee.com.au",
  },
  {
    brand: "Montu",
    name: "Circle Pink Rozay",
    category: "Flower",
    thc: 28,
    cbd: 0,
    rating: 4.6,
    description: "A high-potency flower pick for experienced patients chasing strong body comfort, mood lift, and heavier nighttime relief.",
    effects: ["Calming", "Mood lift", "Heavy body"],
    treatmentUses: ["Insomnia", "Pain flares", "Stress"],
    source: "catalyst.honahlee.com.au",
  },
  {
    brand: "Cinnabis (Khali)",
    name: "Khalifa Mints",
    category: "Flower",
    thc: 27,
    cbd: 0,
    rating: 4.5,
    description: "A strong gas-and-mint style flower that suits patients wanting potency, appetite support, and a heavier unwind after work.",
    effects: ["Gas", "Heavy", "Appetite"],
    treatmentUses: ["Pain", "Nausea", "Evening stress"],
    source: "catalyst.honahlee.com.au",
  },
  {
    brand: "ANTG",
    name: "Mac 1",
    category: "Flower",
    thc: 24,
    cbd: 0,
    rating: 4.4,
    description: "A balanced hybrid-style flower recommendation when you want clarity and mood support without going fully sedating.",
    effects: ["Balanced", "Creative", "Clear mood"],
    treatmentUses: ["Daytime stress", "Low mood", "Mild pain"],
    source: "catalyst.honahlee.com.au",
  },
  {
    brand: "Curaleaf",
    name: "Sapphire Cookies",
    category: "Flower",
    thc: 21,
    cbd: 0,
    rating: 3.9,
    description: "A cookie-leaning moderate flower for patients who prefer a softer potency range with appetite and relaxation support.",
    effects: ["Relaxing", "Appetite", "Comfort"],
    treatmentUses: ["Appetite loss", "Mild anxiety", "Evening pain"],
    source: "catalyst.honahlee.com.au",
  },
  {
    brand: "Tasmanian Botanics",
    name: "Lazy Lobster",
    category: "Flower",
    thc: 26,
    cbd: 0,
    rating: 4.3,
    description: "A heavier flower option for nighttime rotation slots where body load, sleep pressure, and symptom quieting matter most.",
    effects: ["Sleepy", "Body heavy", "Calming"],
    treatmentUses: ["Insomnia", "Muscle tension", "Pain"],
    source: "catalyst.honahlee.com.au",
  },
  {
    brand: "Australian Natural Therapeutics",
    name: "Gelato 41",
    category: "Flower",
    thc: 25,
    cbd: 0,
    rating: 4.5,
    description: "A dessert-leaning high-THC flower that can bring mood lift, appetite support, and rounded physical comfort.",
    effects: ["Mood", "Dessert", "Relaxed focus"],
    treatmentUses: ["Low mood", "Stress", "Appetite loss"],
    source: "catalyst.honahlee.com.au",
  },
  {
    brand: "Med Lab",
    name: "Live Rosin Garlic Cookies",
    category: "Rosin",
    thc: 72,
    cbd: 0,
    rating: 4.7,
    description: "A concentrate-style option for very experienced patients who need fast, high-intensity relief in tiny amounts.",
    effects: ["Very potent", "Fast relief", "Funk"],
    treatmentUses: ["Severe pain", "Breakthrough symptoms", "Nausea"],
    source: "catalyst.honahlee.com.au",
  },
  {
    brand: "Kanna",
    name: "Hash Temple Ball",
    category: "Hash",
    thc: 45,
    cbd: 1,
    rating: 4.4,
    description: "A traditional hash-style product for patients who prefer rounded body effects and longer-lasting evening relief.",
    effects: ["Traditional", "Heavy", "Longer lasting"],
    treatmentUses: ["Chronic pain", "Sleep support", "Muscle tension"],
    source: "catalyst.honahlee.com.au",
  },
  {
    brand: "Cantek",
    name: "Live Resin Vape — Sour Diesel",
    category: "Vape",
    thc: 80,
    cbd: 0,
    rating: 4.1,
    description: "A rapid-onset vape pick for experienced patients wanting portable symptom control with a brighter, more functional profile.",
    effects: ["Energetic", "Citrus", "Fast onset"],
    treatmentUses: ["Breakthrough pain", "Fatigue", "Low mood"],
    source: "catalyst.honahlee.com.au",
  },
  {
    brand: "Eve",
    name: "CBD 50 Oil",
    category: "Oil",
    thc: 1,
    cbd: 50,
    rating: 4.0,
    description: "A CBD-dominant oil for patients prioritising non-intoxicating baseline support and daytime tolerance.",
    effects: ["Calming", "Daytime", "Non-intoxicating"],
    treatmentUses: ["Anxiety", "Inflammation", "General wellbeing"],
    source: "catalyst.honahlee.com.au",
  },
  {
    brand: "Greenway",
    name: "Balanced 10:10 Oil",
    category: "Oil",
    thc: 10,
    cbd: 10,
    rating: 4.2,
    description: "A balanced oil that may suit patients who want THC/CBD synergy with steadier, longer-lasting symptom coverage.",
    effects: ["Balanced", "Steady", "Anxiety support"],
    treatmentUses: ["Anxiety", "Persistent pain", "Sleep maintenance"],
    source: "catalyst.honahlee.com.au",
  },
  {
    brand: "Levin Health",
    name: "THC Gummies 5mg",
    category: "Edible",
    thc: 5,
    cbd: 0,
    rating: 3.8,
    description: "A low-dose edible format for patients who prefer measured oral dosing and slower, longer effects.",
    effects: ["Microdose", "Mood", "Longer lasting"],
    treatmentUses: ["Mild pain", "Sleep onset", "Mood support"],
    source: "catalyst.honahlee.com.au",
  },
];

const buildItem = (raw: RawItem, index: number): MedicalProduct => ({
  ...raw,
  id: `medical-${index}`,
  url: catalystSearchUrl(`${raw.brand} ${raw.name}`),
});

export const MEDICAL_CATALOG: MedicalProduct[] = RAW_CATALOG.map(buildItem);

const CACHE_KEY = "vaultlab-medical-catalog-v2";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

type CachedCatalog = { syncedAt: string; items: MedicalProduct[]; source: MedicalCatalog["source"] };

const readCache = (): CachedCatalog | null => {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(CACHE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as CachedCatalog;
    if (!parsed?.syncedAt || !Array.isArray(parsed.items)) return null;
    return parsed;
  } catch {
    return null;
  }
};

const writeCache = (value: CachedCatalog) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(value));
  } catch {
    // ignore quota / serialization errors
  }
};

const isFresh = (syncedAt: string) => Date.now() - new Date(syncedAt).getTime() < CACHE_TTL_MS;

// Fetches the catalog, syncing at most once every 24h. When MEDICAL_FEED_URL is
// configured it pulls the live daily scrape; otherwise it serves the curated list.
export async function fetchMedicalCatalog(): Promise<MedicalCatalog> {
  const cached = readCache();
  if (cached && isFresh(cached.syncedAt)) {
    return { items: cached.items, syncedAt: cached.syncedAt, source: cached.source };
  }

  let items = MEDICAL_CATALOG;
  let source: MedicalCatalog["source"] = "catalog";

  if (MEDICAL_FEED_URL) {
    try {
      const response = await fetch(MEDICAL_FEED_URL);
      if (response.ok) {
        const data = (await response.json()) as MedicalProduct[];
        if (Array.isArray(data) && data.length > 0) {
          items = data;
          source = "live";
        }
      }
    } catch {
      // fall back to the curated catalog
    }
  }

  const syncedAt = new Date().toISOString();
  writeCache({ syncedAt, items, source });
  return { items, syncedAt, source };
}
