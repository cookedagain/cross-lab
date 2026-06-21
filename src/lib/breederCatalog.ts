// Live breeder availability — sourced from Brotanical Gardens.
//
// Rather than scraping each breeder's own storefront (which is unreliable and
// inconsistent), we pull the full Brotanical Gardens catalog once a day from
// their public Shopify `/products.json` feed and filter it down to each
// breeder. Brotanical stocks most of the breeders in the vault, so this is a
// single, dependable source.
//
// Two breeders are intentionally excluded (per request): Greenspace and
// Mediseedman. They report "no live source" so nothing breaks.

const ALL_ORIGINS_RAW = "https://api.allorigins.win/raw?url=";
const BROTANICAL_BASE = "https://brotanicalgardens.com";
const PRODUCTS_CACHE_KEY = "crosslab-brotanical-products-v1";
const AVAILABILITY_CACHE_KEY = "crosslab-breeder-availability-v2";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // once a day
const MAX_PAGES = 6; // up to 6 × 250 = 1500 products

// Breeders we never source live (excluded by request).
const EXCLUDED_BREEDERS = new Set(["Greenspace AU", "Mediseedman"]);

// Aliases used to match a Brotanical product (by vendor or title) to a breeder
// in the vault. Lowercase, matched as substrings.
const BREEDER_ALIASES: Record<string, string[]> = {
  "Ethos Genetics": ["ethos"],
  "Happy Valley Genetics": ["happy valley"],
  "Black Leaf Genetics": ["black leaf", "blackleaf"],
  "Terpyz Mutant Genetics": ["terpyz"],
  "Humboldt Seed Company": ["humboldt"],
  "In-House Genetics": ["in-house", "in house", "inhouse"],
  "Brothers Grimm": ["brothers grimm", "grimm"],
  "WolfPack Selections": ["wolfpack", "wolf pack"],
  "Burn Pile": ["burn pile"],
  "Binchickens Genetics": ["binchickens", "bin chickens", "bin chicken"],
};

export type AvailabilityItem = {
  id: string;
  title: string;
  available: boolean;
  info: string[];
};

export type BreederAvailability = {
  breeder: string;
  status: "live" | "no-source" | "unreachable" | "empty";
  items: AvailabilityItem[];
  storeUrl?: string;
  syncedAt: string;
  note: string;
};

type ShopifyVariant = { available?: boolean };
type ShopifyProduct = {
  id: number | string;
  title: string;
  handle: string;
  vendor?: string;
  product_type?: string;
  tags?: string[] | string;
  variants?: ShopifyVariant[];
};

// --- Brotanical product cache (shared across all breeders) ---------------

type ProductsCache = { syncedAt: string; products: ShopifyProduct[] };

const readProductsCache = (): ProductsCache | null => {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(PRODUCTS_CACHE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as ProductsCache;
    if (!parsed?.syncedAt || !Array.isArray(parsed.products)) return null;
    return parsed;
  } catch {
    return null;
  }
};

const writeProductsCache = (value: ProductsCache) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
};

const isFresh = (syncedAt: string) => Date.now() - new Date(syncedAt).getTime() < CACHE_TTL_MS;

// Fetches the whole Brotanical catalog (paginated), syncing at most once a day.
// Returns null if the store could not be reached and nothing is cached.
async function fetchBrotanicalProducts(): Promise<ProductsCache | null> {
  const cached = readProductsCache();
  if (cached && isFresh(cached.syncedAt)) return cached;

  try {
    const all: ShopifyProduct[] = [];
    for (let page = 1; page <= MAX_PAGES; page++) {
      const target = `${BROTANICAL_BASE}/products.json?limit=250&page=${page}`;
      const response = await fetch(`${ALL_ORIGINS_RAW}${encodeURIComponent(target)}`);
      if (!response.ok) throw new Error("brotanical unreachable");
      const data = (await response.json()) as { products?: ShopifyProduct[] };
      const products = data.products ?? [];
      all.push(...products);
      if (products.length < 250) break; // last page reached
    }

    const result: ProductsCache = { syncedAt: new Date().toISOString(), products: all };
    writeProductsCache(result);
    return result;
  } catch {
    // If a stale cache exists, fall back to it so the UI still shows something.
    return cached ?? null;
  }
}

// --- Per-breeder availability --------------------------------------------

const matchesBreeder = (product: ShopifyProduct, aliases: string[]): boolean => {
  const haystack = `${product.vendor ?? ""} ${product.title}`.toLowerCase();
  return aliases.some((alias) => haystack.includes(alias));
};

const isMerch = (product: ShopifyProduct): boolean => {
  const text = `${product.product_type ?? ""} ${product.title}`.toLowerCase();
  return /(shirt|hoodie|sticker|mug|hat|merch|gift card|accessor|grinder|tray|lighter|apparel)/.test(text);
};

const toItem = (product: ShopifyProduct, breeder: string): AvailabilityItem => {
  const tags = Array.isArray(product.tags)
    ? product.tags
    : typeof product.tags === "string"
      ? product.tags.split(",").map((tag) => tag.trim())
      : [];
  const info = [product.product_type, ...tags]
    .map((value) => (value ?? "").trim())
    .filter(Boolean)
    // Drop tags that just repeat the breeder name.
    .filter((value) => !value.toLowerCase().includes(breeder.split(" ")[0].toLowerCase()))
    .filter((value, index, self) => self.indexOf(value) === index)
    .slice(0, 4);

  return {
    id: String(product.id),
    title: product.title,
    available: product.variants ? product.variants.some((v) => v.available) : true,
    info,
  };
};

type AvailabilityCache = Record<string, BreederAvailability>;

const readAvailabilityCache = (): AvailabilityCache => {
  if (typeof window === "undefined") return {};
  try {
    const stored = window.localStorage.getItem(AVAILABILITY_CACHE_KEY);
    return stored ? (JSON.parse(stored) as AvailabilityCache) : {};
  } catch {
    return {};
  }
};

const writeAvailabilityCache = (cache: AvailabilityCache) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(AVAILABILITY_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore quota errors
  }
};

export async function fetchBreederAvailability(breeder: string): Promise<BreederAvailability> {
  const syncedAt = new Date().toISOString();

  if (EXCLUDED_BREEDERS.has(breeder)) {
    return {
      breeder,
      status: "no-source",
      items: [],
      syncedAt,
      note: "Not sourced live — this breeder is excluded from the Brotanical Gardens feed.",
    };
  }

  const aliases = BREEDER_ALIASES[breeder];
  if (!aliases) {
    return {
      breeder,
      status: "no-source",
      items: [],
      syncedAt,
      note: "No live source configured for this breeder yet.",
    };
  }

  const cache = readAvailabilityCache();
  const cached = cache[breeder];
  if (cached && isFresh(cached.syncedAt)) return cached;

  const catalog = await fetchBrotanicalProducts();
  if (!catalog) {
    const result: BreederAvailability = {
      breeder,
      status: "unreachable",
      items: [],
      storeUrl: BROTANICAL_BASE,
      syncedAt,
      note: "Could not reach the Brotanical Gardens catalog from the browser. Try again later.",
    };
    cache[breeder] = result;
    writeAvailabilityCache(cache);
    return result;
  }

  const items = catalog.products
    .filter((product) => matchesBreeder(product, aliases) && !isMerch(product))
    .map((product) => toItem(product, breeder))
    // In-stock first, then alphabetical.
    .sort((a, b) => Number(b.available) - Number(a.available) || a.title.localeCompare(b.title));

  const result: BreederAvailability = {
    breeder,
    status: items.length > 0 ? "live" : "empty",
    items,
    storeUrl: BROTANICAL_BASE,
    syncedAt: catalog.syncedAt,
    note:
      items.length > 0
        ? "Live from the Brotanical Gardens catalog, synced daily. Stock can change between syncs."
        : "No current Brotanical Gardens listings found for this breeder.",
  };
  cache[breeder] = result;
  writeAvailabilityCache(cache);
  return result;
}
