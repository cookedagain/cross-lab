import { cleanExternalText, hasExternalDataConsent } from "@/lib/privacy";

export type WebLineageResult = {
  status: "resolved" | "explicit-cross" | "not-found" | "error";
  parents?: [string, string];
  source?: string;
  note: string;
  syncedAt: string;
};

const CACHE_KEY = "crosslab-web-lineage-cache-v4-direct";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const LOOKUP_TIMEOUT_MS = 8000;
const MAX_QUERY_CHARS = 180;

const BREEDER_NOISE = [
  "ethos", "genetics", "seeds", "seed", "company", "selections", "humboldt",
  "binchickens", "terpyz", "wolfpack", "grimm", "greenspace", "leafly",
  "seedfinder", "allbud",
];

const normalize = (value: string) =>
  cleanExternalText(value, MAX_QUERY_CHARS)
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b(f\d+|bx\d*|s\d+|r\d+|rbx|v\d+|auto|fem|reg|#\d+)\b/gi, " ")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const hasExplicitCross = (name: string) => /\s[×x]\s/i.test(` ${name} `);
const cacheKeyFor = (name: string, breeder?: string) => normalize(`${name} ${breeder ?? ""}`);

type LineageCache = Record<string, WebLineageResult>;

const readCache = (): LineageCache => {
  if (typeof window === "undefined") return {};
  try {
    const stored = window.localStorage.getItem(CACHE_KEY);
    return stored ? (JSON.parse(stored) as LineageCache) : {};
  } catch {
    return {};
  }
};

const writeCache = (cache: LineageCache) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore storage quota errors.
  }
};

const fresh = (result: WebLineageResult) => Date.now() - new Date(result.syncedAt).getTime() < CACHE_TTL_MS;

const htmlToText = (html: string) =>
  html
    .slice(0, 1000000)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

const cleanParent = (value: string) => {
  let cleaned = value
    .replace(/\b(strain|cannabis|marijuana|seeds?|genetics?|lineage|parents?|hybrid|cross(?:ed)?|created|bred|from|between|with|by|crossing)\b/gi, " ")
    .replace(/[|:;,.()[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^and\s+/i, "")
    .replace(/\s+and$/i, "");

  const noise = new RegExp(`\\b(${BREEDER_NOISE.join("|")})\\b`, "gi");
  cleaned = cleaned.replace(noise, " ").replace(/\s+/g, " ").trim();

  let tokens = cleaned.split(" ").filter(Boolean);
  while (tokens.length > 1) {
    const last = tokens[tokens.length - 1];
    if (/^[a-z]$/i.test(last) || /^(bx\d*|rbx|s\d+|r\d+|v\d+|f\d+)$/i.test(last)) tokens.pop();
    else break;
  }

  return tokens.slice(0, 4).join(" ").trim();
};

const looksLikeParent = (candidate: string, strainName: string) => {
  const cleaned = cleanParent(candidate);
  if (cleaned.length < 3 || cleaned.length > 40) return false;
  const lowered = cleaned.toLowerCase();
  if (lowered === normalize(strainName)) return false;
  if (/\b(review|info|menu|shop|buy|flowering|thc|cbd|yield|effects|flavor|aroma|seedfinder|leafly|allbud)\b/i.test(cleaned)) return false;
  if (BREEDER_NOISE.some((word) => lowered === word)) return false;
  return /[a-z]/i.test(cleaned);
};

const explicitPairPatterns = [
  /(?:cross|crossed|hybrid|bred|created|made|genetics|lineage|parents?)\s+(?:is\s+)?(?:a\s+)?(?:between|of|from)?\s*([A-Za-z0-9'# .-]{3,40})\s+(?:and|x|×)\s+([A-Za-z0-9'# .-]{3,40})/gi,
  /(?:between|from)\s+([A-Za-z0-9'# .-]{3,40})\s+(?:and|x|×)\s+([A-Za-z0-9'# .-]{3,40})/gi,
  /([A-Z][A-Za-z0-9'# .-]{2,34})\s+(?:x|×)\s+([A-Z][A-Za-z0-9'# .-]{2,34})/g,
];

const extractParents = (text: string, strainName: string): [string, string] | null => {
  for (const pattern of explicitPairPatterns) {
    pattern.lastIndex = 0;
    for (const match of Array.from(text.matchAll(pattern))) {
      const first = cleanParent(match[1] ?? "");
      const second = cleanParent(match[2] ?? "");
      if (looksLikeParent(first, strainName) && looksLikeParent(second, strainName) && normalize(first) !== normalize(second)) {
        return [first, second];
      }
    }
  }
  return null;
};

const BROTANICAL_DOMAIN = "brotanicalgardens.com";
const ETHOS_DOMAIN = "ethosgenetics.com";
const isEthos = (breeder?: string) => /ethos/i.test(breeder ?? "");

const fetchSearchText = async (query: string) => {
  const safeQuery = cleanExternalText(query, MAX_QUERY_CHARS);
  const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(safeQuery)}`;
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { Accept: "text/html" } });
    if (!response.ok) throw new Error("Lineage search failed");
    return htmlToText(await response.text());
  } finally {
    window.clearTimeout(timer);
  }
};

export async function lookupWebLineage(name: string, breeder?: string): Promise<WebLineageResult> {
  const syncedAt = new Date().toISOString();

  if (!hasExternalDataConsent("lineage")) {
    return { status: "error", note: "Lineage consent is required before searching.", syncedAt };
  }

  if (hasExplicitCross(name)) {
    return { status: "explicit-cross", note: "This strain is already labelled as a cross, so no web lookup was needed.", syncedAt };
  }

  const safeName = cleanExternalText(name);
  const safeBreeder = cleanExternalText(breeder ?? "");
  const key = cacheKeyFor(safeName, safeBreeder);
  const cache = readCache();
  const cached = cache[key];
  if (cached && fresh(cached)) return cached;

  const tiers: { source: string; note: string; queries: string[] }[] = [];

  if (isEthos(safeBreeder)) {
    tiers.push({
      source: "Ethos Genetics",
      note: "Scraped from public search results and cached for 24 hours. Treat as a lead to verify, not pack-label proof.",
      queries: [
        `site:${ETHOS_DOMAIN}/genetics ${safeName} lineage parents`,
        `site:${ETHOS_DOMAIN} ${safeName} genetics parents`,
        `${safeName} ethos genetics lineage parents`,
      ],
    });
  }

  tiers.push(
    {
      source: "Brotanical Gardens",
      note: "Scraped from public search results and cached for 24 hours. Treat as a lead to verify, not pack-label proof.",
      queries: [
        `site:${BROTANICAL_DOMAIN} ${safeName} ${safeBreeder} lineage`,
        `site:${BROTANICAL_DOMAIN} ${safeName} genetics parents`,
        `site:${BROTANICAL_DOMAIN} freebies ${safeName} ${safeBreeder}`,
      ],
    },
    {
      source: "web search",
      note: "Scraped from public web-search result text and cached for 24 hours. Treat as a lead to verify, not pack-label proof.",
      queries: [
        `${safeName} ${safeBreeder} cannabis strain parents lineage`,
        `${safeName} cannabis cross parents`,
      ],
    },
  );

  try {
    for (const tier of tiers) {
      for (const query of tier.queries) {
        const parents = extractParents(await fetchSearchText(query), safeName);
        if (parents) {
          const result: WebLineageResult = { status: "resolved", parents, source: tier.source, note: tier.note, syncedAt };
          cache[key] = result;
          writeCache(cache);
          return result;
        }
      }
    }

    const result: WebLineageResult = {
      status: "not-found",
      note: "No confident parent pair was found. Try checking the pack label.",
      syncedAt,
    };
    cache[key] = result;
    writeCache(cache);
    return result;
  } catch {
    const result: WebLineageResult = {
      status: "error",
      note: "The public lineage lookup could not be reached from the browser.",
      syncedAt,
    };
    cache[key] = result;
    writeCache(cache);
    return result;
  }
}