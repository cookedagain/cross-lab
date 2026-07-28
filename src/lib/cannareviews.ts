import { hasExternalDataConsent } from "@/lib/privacy";

const CANNAREVIEWS_BASE = "https://cannareviews.health";
const CACHE_KEY = "vaultlab-cannareviews-cache-v2";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const LOOKUP_TIMEOUT_MS = 8000;
const MAX_QUERY_CHARS = 180;

export const CANNAREVIEWS_SITE = CANNAREVIEWS_BASE;

const cleanQuery = (value: string) => value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, MAX_QUERY_CHARS);
export const cannareviewsSearchUrl = (query: string) => `${CANNAREVIEWS_BASE}/?s=${encodeURIComponent(cleanQuery(query))}`;

export type CannaReviewResult = {
  status: "resolved" | "not-found" | "error";
  query: string;
  rating?: number;
  snippet?: string;
  url: string;
  note: string;
  syncedAt: string;
};

type ReviewCache = Record<string, CannaReviewResult>;
const cacheKeyFor = (name: string, brand?: string) => cleanQuery(`${name} ${brand ?? ""}`).toLowerCase();

const readCache = (): ReviewCache => {
  if (typeof window === "undefined") return {};
  try {
    const stored = window.localStorage.getItem(CACHE_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    return parsed && typeof parsed === "object" ? (parsed as ReviewCache) : {};
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
const htmlToText = (html: string) => html.slice(0, 1000000)
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;/g, " ")
  .replace(/&#39;/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/\s+/g, " ")
  .trim();

const extractRating = (text: string): number | undefined => {
  for (const pattern of [/([0-5](?:\.\d)?)\s*\/\s*5/, /rated\s*([0-5](?:\.\d)?)/i, /rating[:\s]*([0-5](?:\.\d)?)/i]) {
    const match = text.match(pattern);
    if (match) {
      const value = Number(match[1]);
      if (Number.isFinite(value) && value >= 0 && value <= 5) return value;
    }
  }
  return undefined;
};

const buildSnippet = (text: string, query: string): string | undefined => {
  const term = query.toLowerCase().split(" ")[0];
  const index = text.toLowerCase().indexOf(term);
  if (index === -1) return undefined;
  const snippet = text.slice(Math.max(0, index - 60), index + 160).trim();
  return snippet.length > 20 ? `…${snippet}…` : undefined;
};

const fetchWithTimeout = async (url: string) => {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);
  try {
    return await fetch(url, { signal: controller.signal, headers: { Accept: "text/html" } });
  } finally {
    window.clearTimeout(timer);
  }
};

export async function lookupCannaReview(name: string, brand?: string): Promise<CannaReviewResult> {
  if (!hasExternalDataConsent()) throw new Error("Privacy consent is required before external lookups.");
  const syncedAt = new Date().toISOString();
  const query = cleanQuery(`${name} ${brand ?? ""}`);
  const url = cannareviewsSearchUrl(query);
  const key = cacheKeyFor(name, brand);
  const cache = readCache();
  const cached = cache[key];
  if (cached && isFresh(cached.syncedAt)) return cached;

  try {
    const response = await fetchWithTimeout(url);
    if (!response.ok) throw new Error("CannaReviews unreachable");
    const text = htmlToText(await response.text());
    const rating = extractRating(text);
    const snippet = buildSnippet(text, query);
    const hasResult = Boolean(rating || snippet) && !/nothing found|no results/i.test(text);
    const result: CannaReviewResult = {
      status: hasResult ? "resolved" : "not-found",
      query,
      ...(rating === undefined ? {} : { rating }),
      ...(snippet ? { snippet } : {}),
      url,
      note: hasResult ? "Pulled directly from the CannaReviews site and cached for 24 hours. Treat scraped content as advisory." : "No confident match found. Tap to search the site directly.",
      syncedAt,
    };
    cache[key] = result;
    writeCache(cache);
    return result;
  } catch {
    const result: CannaReviewResult = { status: "error", query, url, note: "CannaReviews could not be reached directly. Tap to open the search manually.", syncedAt };
    cache[key] = result;
    writeCache(cache);
    return result;
  }
}
