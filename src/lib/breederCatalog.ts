// Live breeder availability.
//
// Most seed shops/breeders run on Shopify, which exposes a public
// `/products.json` endpoint listing current products. We fetch that through the
// same public proxy used elsewhere, parse the titles into availability items,
// and cache the result for 24h so each breeder syncs at most once a day (same
// cadence as the web-lineage feature).
//
// Breeders without a configured store URL simply report "no live source yet",
// so nothing breaks — you can add a URL to BREEDER_SHOPS at any time.

const ALL_ORIGINS_RAW = "https://api.allorigins.win/raw?url=";
const CACHE_KEY = "crosslab-breeder-availability-v1";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // once a day

// Known breeder storefronts. Shopify stores work automatically via
// `/products.json`. Leave a breeder out (or null) to mark it "no live source".
export const BREEDER_SHOPS: Record<string, string | null> = {
  "Ethos Genetics": "https://www.ethosgenetics.com",
  "Humboldt Seed Company": "https://humboldtseedcompany.com",
  "In-House Genetics": "https://inhousegenetics.com",
  "Brothers Grimm": "https://brothersgrimmseeds.com",
  "Binchickens Genetics": null,
  "Terpyz Mutant Genetics": null,
  "Black Leaf Genetics": null,
  "WolfPack Selections": null,
  "Happy Valley Genetics": null,
  "Greenspace AU": null,
  "Burn Pile": null,
};

export type AvailabilityItem = {
  id: string;
  title: string;
  available: boolean;
  price?: string;
  url?: string;
};

export type BreederAvailability = {
  breeder: string;
  status: "live" | "no-source" | "unreachable" | "empty";
  items: AvailabilityItem[];
  storeUrl?: string;
  syncedAt: string;
  note: string;
};

type ShopifyVariant = { available?: boolean; price?: string };
type ShopifyProduct = {
  id: number | string;
  title: string;
  handle: string;
  product_type?: string;
  variants?: ShopifyVariant[];
};

type CacheShape = Record<string, BreederAvailability>;

const readCache = (): CacheShape => {
  if (typeof window === "undefined") return {};
  try {
    const stored = window.localStorage.getItem(CACHE_KEY);
    return stored ? (JSON.parse(stored) as CacheShape) : {};
  } catch {
    return {};
  }
};

const writeCache = (cache: CacheShape) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore quota errors
  }
};

const isFresh = (syncedAt: string) => Date.now() - new Date(syncedAt).getTime() < CACHE_TTL_MS;

// Pull "seed"-like products out of a Shopify products feed.
const parseShopify = (products: ShopifyProduct[], storeUrl: string): AvailabilityItem[] =>
  products
    .filter((product) => {
      const type = (product.product_type ?? "").toLowerCase();
      const title = product.title.toLowerCase();
      // Skip obvious merch / accessories.
      if (/(shirt|hoodie|sticker|mug|hat|merch|gift card|accessor)/.test(`${type} ${title}`)) return false;
      return true;
    })
    .map((product) => {
      const variant = product.variants?.[0];
      return {
        id: String(product.id),
        title: product.title,
        available: product.variants ? product.variants.some((v) => v.available) : true,
        price: variant?.price,
        url: `${storeUrl}/products/${product.handle}`,
      };
    });

export async function fetchBreederAvailability(breeder: string): Promise<BreederAvailability> {
  const syncedAt = new Date().toISOString();
  const storeUrl = BREEDER_SHOPS[breeder];

  if (!storeUrl) {
    return {
      breeder,
      status: "no-source",
      items: [],
      syncedAt,
      note: "No live store source configured for this breeder yet.",
    };
  }

  const key = breeder;
  const cache = readCache();
  const cached = cache[key];
  if (cached && isFresh(cached.syncedAt)) return cached;

  try {
    const target = `${storeUrl.replace(/\/$/, "")}/products.json?limit=250`;
    const response = await fetch(`${ALL_ORIGINS_RAW}${encodeURIComponent(target)}`);
    if (!response.ok) throw new Error("store unreachable");

    const data = (await response.json()) as { products?: ShopifyProduct[] };
    const products = data.products ?? [];
    const items = parseShopify(products, storeUrl.replace(/\/$/, ""));

    const result: BreederAvailability = {
      breeder,
      status: items.length > 0 ? "live" : "empty",
      items,
      storeUrl,
      syncedAt,
      note:
        items.length > 0
          ? "Live from the breeder's store, cached for 24 hours. Stock can change between syncs."
          : "The store responded but no seed products were found.",
    };
    cache[key] = result;
    writeCache(cache);
    return result;
  } catch {
    const result: BreederAvailability = {
      breeder,
      status: "unreachable",
      items: [],
      storeUrl,
      syncedAt,
      note: "Could not reach this breeder's store from the browser. It may not expose a public product feed.",
    };
    cache[key] = result;
    writeCache(cache);
    return result;
  }
}
