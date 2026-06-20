// Brotanical Gardens catalog feed.
//
// This module exposes the seed catalog used by the "Recommended seeds to pick up"
// feature. It is structured so the static fallback list below can be transparently
// replaced by a live, once-a-day scraped feed:
//
//   1. Stand up a backend route (e.g. /api/brotanical-seeds) that scrapes
//      brotanicalgardens.com once per 24h and returns the same BrotanicalItem[]
//      shape (Shopify stores expose /products.json which maps cleanly to this).
//   2. Point BROTANICAL_FEED_URL at that route.
//
// Until then, fetchBrotanicalCatalog() serves the curated list with a 24h cache so
// the UI behaves like a daily catalog sync.

import type { SeedType } from "@/data/seeds";
import type { TraitGoal } from "@/lib/crossName";

export type BrotanicalItem = {
  id: string;
  breeder: string;
  name: string;
  type: SeedType;
  traits: TraitGoal[];
  priceAud: number;
  url: string;
};

export type BrotanicalCatalog = {
  items: BrotanicalItem[];
  syncedAt: string; // ISO timestamp of the last catalog sync
  source: "live" | "catalog";
};

// Optional: set to a backend route that returns BrotanicalItem[] to go fully live.
const BROTANICAL_FEED_URL: string | null = null;

export const BROTANICAL_SITE = "https://brotanicalgardens.com";

// Brotanical Gardens runs on Shopify, whose search endpoint is /search?q=...
// (the previous WordPress-style /?s=... URL 404'd).
export const brotanicalSearchUrl = (query: string) =>
  `${BROTANICAL_SITE}/search?q=${encodeURIComponent(query)}&type=product`;

type RawItem = Omit<BrotanicalItem, "id" | "url">;

const RAW_CATALOG: RawItem[] = [
  { breeder: "Compound Genetics", name: "Jokerz", type: "Feminized", traits: ["Gas", "Candy"], priceAud: 180 },
  { breeder: "Compound Genetics", name: "Apple Tartz", type: "Feminized", traits: ["Candy", "Gas"], priceAud: 180 },
  { breeder: "Cannarado Genetics", name: "Gushers", type: "Feminized", traits: ["Candy", "Heavy resin"], priceAud: 150 },
  { breeder: "Cannarado Genetics", name: "Grape Pie", type: "Feminized", traits: ["Purple", "Candy"], priceAud: 150 },
  { breeder: "Exotic Genetix", name: "Rainbow Chip", type: "Feminized", traits: ["Candy", "Funk"], priceAud: 170 },
  { breeder: "Exotic Genetix", name: "The Menthol", type: "Regular", traits: ["Funk", "Gas"], priceAud: 160 },
  { breeder: "Seed Junky Genetics", name: "Kush Mints", type: "Regular", traits: ["Gas", "Hashplant"], priceAud: 200 },
  { breeder: "Seed Junky Genetics", name: "Wedding Cake S1", type: "Feminized", traits: ["Candy", "Heavy resin"], priceAud: 200 },
  { breeder: "Tiki Madman", name: "Donny Burger", type: "Feminized", traits: ["Gas", "Funk"], priceAud: 175 },
  { breeder: "Clearwater Genetics", name: "Lemon Cherry Gelato", type: "Feminized", traits: ["Citrus", "Candy"], priceAud: 165 },
  { breeder: "Karma Genetics", name: "Biker Kush", type: "Regular", traits: ["Gas", "Hashplant"], priceAud: 140 },
  { breeder: "Bodhi Seeds", name: "Space Monkey", type: "Regular", traits: ["Hashplant", "Gas"], priceAud: 110 },
  { breeder: "Bodhi Seeds", name: "Goji OG", type: "Regular", traits: ["Funk", "Hashplant"], priceAud: 110 },
  { breeder: "Mosca Seeds", name: "Old Time Moonshine", type: "Regular", traits: ["Heavy resin", "Hashplant"], priceAud: 100 },
  { breeder: "Capulator", name: "Mac 1 S1", type: "Feminized", traits: ["Heavy resin", "Gas"], priceAud: 220 },
  { breeder: "In-House Genetics", name: "Platinum Kush Breath", type: "Feminized", traits: ["Heavy resin", "Gas"], priceAud: 150 },
  { breeder: "Humboldt Seed Company", name: "Squirt", type: "Feminized", traits: ["Citrus", "Candy"], priceAud: 130 },
  { breeder: "Ethos Genetics", name: "Member Berry R10", type: "Feminized", traits: ["Candy", "Funk"], priceAud: 140 },
  { breeder: "Twenty20 Mendocino", name: "Lavender Jones", type: "Feminized", traits: ["Floral", "Purple"], priceAud: 120 },
  { breeder: "Mephisto Genetics", name: "Sour Stomper", type: "Autoflower", traits: ["Auto traits", "Gas"], priceAud: 95 },
  { breeder: "Mephisto Genetics", name: "Forum Stomper", type: "Autoflower", traits: ["Auto traits", "Candy"], priceAud: 95 },
  { breeder: "Night Owl Seeds", name: "Cosmic Queen", type: "Autoflower", traits: ["Auto traits", "Purple"], priceAud: 90 },
  { breeder: "Sweet Seeds", name: "Gorilla Girl Auto", type: "Autoflower", traits: ["Auto traits", "Heavy resin"], priceAud: 80 },
  { breeder: "Useful Seeds", name: "Tomahawk", type: "Regular", traits: ["Gas", "Hashplant"], priceAud: 105 },
  { breeder: "Massive Creations", name: "Lemon Up", type: "Regular", traits: ["Citrus", "Gas"], priceAud: 115 },
  { breeder: "Square One Genetics", name: "Lilac Mintz", type: "Feminized", traits: ["Floral", "Funk"], priceAud: 135 },
  { breeder: "Dominion Seed Company", name: "Appalachian Super Skunk", type: "Regular", traits: ["Funk", "Hashplant"], priceAud: 100 },
  { breeder: "Annunaki Genetics", name: "Strawberry Cough BX", type: "Regular", traits: ["Candy", "Citrus"], priceAud: 110 },
];

const buildItem = (raw: RawItem, index: number): BrotanicalItem => ({
  ...raw,
  id: `brotanical-${index}`,
  url: brotanicalSearchUrl(`${raw.breeder} ${raw.name}`),
});

export const BROTANICAL_CATALOG: BrotanicalItem[] = RAW_CATALOG.map(buildItem);

const CACHE_KEY = "crosslab-brotanical-catalog-v2";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // once a day

type CachedCatalog = { syncedAt: string; items: BrotanicalItem[]; source: BrotanicalCatalog["source"] };

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

// Fetches the catalog, syncing at most once every 24h. When BROTANICAL_FEED_URL is
// configured it pulls the live daily scrape; otherwise it serves the curated list.
export async function fetchBrotanicalCatalog(): Promise<BrotanicalCatalog> {
  const cached = readCache();
  if (cached && isFresh(cached.syncedAt)) {
    return { items: cached.items, syncedAt: cached.syncedAt, source: cached.source };
  }

  let items = BROTANICAL_CATALOG;
  let source: BrotanicalCatalog["source"] = "catalog";

  if (BROTANICAL_FEED_URL) {
    try {
      const response = await fetch(BROTANICAL_FEED_URL);
      if (response.ok) {
        const data = (await response.json()) as BrotanicalItem[];
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
