// Medical cannabis product catalog feed.
//
// This module exposes a curated catalog used by the "Recommended products" section
// on the rotation page. It is structured so the static fallback list below can be
// transparently replaced by a live, once-a-day scraped feed from sites like
// cannareviews.health or catalyst.honahlee.com.au:
//
//   1. Stand up a backend route (e.g. /api/medical-products) that scrapes the
//      review/catalog site once per 24h and returns the same MedicalProduct[] shape.
//   2. Point MEDICAL_FEED_URL at that route.
//
// Until then, fetchMedicalCatalog() serves the curated list with a 24h cache so the
// UI behaves like a daily catalog sync.

import type { RotationCategory } from "@/hooks/useRotationStore";

export type MedicalProduct = {
  id: string;
  name: string;
  brand: string;
  category: RotationCategory;
  thc: number;
  cbd: number;
  rating: number; // community review score out of 5
  effects: string[];
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

export const cannareviewsSearchUrl = (query: string) =>
  `${CANNAREVIEWS_SITE}/?s=${encodeURIComponent(query)}`;

type RawItem = Omit<MedicalProduct, "id" | "url">;

const RAW_CATALOG: RawItem[] = [
  { brand: "Little Green Pharma", name: "LGP Classic 20:1", category: "Flower", thc: 20, cbd: 1, rating: 4.2, effects: ["Relaxing", "Sleep"], source: "cannareviews.health" },
  { brand: "Cannatrek", name: "Cannatrek T22 Eve", category: "Flower", thc: 22, cbd: 0, rating: 4.0, effects: ["Euphoric", "Pain"], source: "cannareviews.health" },
  { brand: "Montu", name: "Circle Pink Rozay", category: "Flower", thc: 28, cbd: 0, rating: 4.6, effects: ["Calming", "Mood"], source: "catalyst.honahlee.com.au" },
  { brand: "Cinnabis (Khali)", name: "Khalifa Mints", category: "Flower", thc: 27, cbd: 0, rating: 4.5, effects: ["Gas", "Heavy"], source: "catalyst.honahlee.com.au" },
  { brand: "ANTG", name: "Mac 1", category: "Flower", thc: 24, cbd: 0, rating: 4.4, effects: ["Balanced", "Creative"], source: "cannareviews.health" },
  { brand: "Curaleaf", name: "Sapphire Cookies", category: "Flower", thc: 21, cbd: 0, rating: 3.9, effects: ["Relaxing", "Appetite"], source: "cannareviews.health" },
  { brand: "Tasmanian Botanics", name: "Lazy Lobster", category: "Flower", thc: 26, cbd: 0, rating: 4.3, effects: ["Sleep", "Body"], source: "catalyst.honahlee.com.au" },
  { brand: "Australian Natural Therapeutics", name: "Gelato 41", category: "Flower", thc: 25, cbd: 0, rating: 4.5, effects: ["Mood", "Dessert"], source: "catalyst.honahlee.com.au" },
  { brand: "Med Lab", name: "Live Rosin Garlic Cookies", category: "Rosin", thc: 72, cbd: 0, rating: 4.7, effects: ["Potent", "Funk"], source: "cannareviews.health" },
  { brand: "Kanna", name: "Hash Temple Ball", category: "Hash", thc: 45, cbd: 1, rating: 4.4, effects: ["Traditional", "Heavy"], source: "catalyst.honahlee.com.au" },
  { brand: "Cantek", name: "Live Resin Vape — Sour Diesel", category: "Vape", thc: 80, cbd: 0, rating: 4.1, effects: ["Energetic", "Citrus"], source: "cannareviews.health" },
  { brand: "Eve", name: "CBD 50 Oil", category: "Oil", thc: 1, cbd: 50, rating: 4.0, effects: ["Calming", "Daytime"], source: "cannareviews.health" },
  { brand: "Greenway", name: "Balanced 10:10 Oil", category: "Oil", thc: 10, cbd: 10, rating: 4.2, effects: ["Balanced", "Anxiety"], source: "catalyst.honahlee.com.au" },
  { brand: "Levin Health", name: "THC Gummies 5mg", category: "Edible", thc: 5, cbd: 0, rating: 3.8, effects: ["Microdose", "Mood"], source: "cannareviews.health" },
];

const buildItem = (raw: RawItem, index: number): MedicalProduct => ({
  ...raw,
  id: `medical-${index}`,
  url: cannareviewsSearchUrl(`${raw.brand} ${raw.name}`),
});

export const MEDICAL_CATALOG: MedicalProduct[] = RAW_CATALOG.map(buildItem);

const CACHE_KEY = "vaultlab-medical-catalog-v1";
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