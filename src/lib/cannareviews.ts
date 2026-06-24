// Quick CannaReviews lookup for rotation products.
//
// Browser-side scraping is unreliable, so this follows the same pattern as the
// other scrapers in the app: it attempts a public search fetch, extracts a short
// snippet + rating when it can, and always returns a usable search link. Results
// are cached per product for 24 hours so it behaves like a daily refresh.

const ALL_ORIGINS_RAW = "https://api.allorigins.win/raw?url=";
const CACHE_KEY = "vaultlab-cannareviews-cache-v1";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // once a day

export const CANNAREVIEWS_SITE = "https://cannareviews.health";

export const cannareviewsSearchUrl = (query: string) =>
  `${CANNAREVIEWS_SITE}/?s=${encodeURIComponent(query)}`;

export type CannaReviewResult = {
  status: "resolved" | "not-found" | "error";
  query: string;
  rating?: number; // out of 5 when found
  snippet?: string;
  url: string; // always a usable link to view more
  note: string;
  syncedAt: string;
};

type ReviewCache = Record<string, CannaReviewResult>;

const cacheKeyFor = (name: string, brand?: string) =>
  `${name} ${brand ?? ""}`.toLowerCase().replace(/\s+/g, " ").trim();

const readCache = (): ReviewCache => {
  if (typeof window === "undefined") return {};
  try {
    const stored = window.localStorage.getItem(CACHE_KEY);
    return stored ? (JSON.parse(stored) as ReviewCache) : {};
  } catch {
    return {};
  }
};

const writeCache = (cache: ReviewCache) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore quota errors
  }
};

const isFresh = (syncedAt: string) => Date.now() - new Date(syncedAt).getTime() < CACHE_TTL_MS;

const htmlToText = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&/g, "&")
    .replace(/\s+/g, " ")
    .trim();

// Pull a rough star rating out of the page text if one is present.
const extractRating = (text: string): number | undefined => {
  const patterns = [
    /([0-5](?:\.\d)?)\s*\/\s*5/,
    /rated\s*([0-5](?:\.\d)?)/i,
    /rating[:\s]*([0-5](?:\.\d)?)/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const value = Number(match[1]);
      if (Number.isFinite(value) && value >= 0 && value <= 5) return value;
    }
  }
  return undefined;
};

const buildSnippet = (text: string, query: string): string | undefined => {
  const lowered = text.toLowerCase();
  const term = query.toLowerCase().split(" ")[0];
  const index = lowered.indexOf(term);
  if (index === -1) return undefined;
  const start = Math.max(0, index - 60);
  const snippet = text.slice(start, start + 220).trim();
  return snippet.length > 20 ? `…${snippet}…` : undefined;
};

export async function lookupCannaReview(name: string, brand?: string): Promise<CannaReviewResult> {
  const syncedAt = new Date().toISOString();
  const query = `${name} ${brand ?? ""}`.trim();
  const url = cannareviewsSearchUrl(query);
  const key = cacheKeyFor(name, brand);

  const cache = readCache();
  const cached = cache[key];
  if (cached && isFresh(cached.syncedAt)) return cached;

  try {
    const target = cannareviewsSearchUrl(query);
    const response = await fetch(`${ALL_ORIGINS_RAW}${encodeURIComponent(target)}`);
    if (!response.ok) throw new Error("CannaReviews unreachable");

    const text = htmlToText(await response.text());
    const rating = extractRating(text);
    const snippet = buildSnippet(text, query);

    const hasResult = Boolean(rating || snippet) && !/nothing found|no results/i.test(text);

    const result: CannaReviewResult = hasResult
      ? {
          status: "resolved",
          query,
          rating,
          snippet,
          url,
          note: "Pulled from CannaReviews search results and cached for 24 hours.",
          syncedAt,
        }
      : {
          status: "not-found",
          query,
          url,
          note: "No confident CannaReviews match found. Tap to search the site directly.",
          syncedAt,
        };

    cache[key] = result;
    writeCache(cache);
    return result;
  } catch {
    const result: CannaReviewResult = {
      status: "error",
      query,
      url,
      note: "Couldn't reach CannaReviews from the browser. Tap to open the search directly.",
      syncedAt,
    };
    cache[key] = result;
    writeCache(cache);
    return result;
  }
}