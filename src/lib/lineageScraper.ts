export type WebLineageResult = {
  status: "resolved" | "explicit-cross" | "not-found" | "error";
  parents?: [string, string];
  source?: string;
  note: string;
  syncedAt: string;
};

const CACHE_KEY = "crosslab-web-lineage-cache-v1";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const ALL_ORIGINS_RAW = "https://api.allorigins.win/raw?url=";

const normalize = (value: string) =>
  value
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
    // ignore storage quota errors
  }
};

const fresh = (result: WebLineageResult) => Date.now() - new Date(result.syncedAt).getTime() < CACHE_TTL_MS;

const htmlToText = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

const cleanParent = (value: string) =>
  value
    .replace(/\b(strain|cannabis|marijuana|seeds?|genetics?|lineage|parents?|hybrid|cross(?:ed)?|created|bred|from|between|with|by)\b/gi, " ")
    .replace(/[|:;,.()[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^and\s+/i, "")
    .replace(/\s+and$/i, "");

const looksLikeParent = (candidate: string, strainName: string) => {
  const cleaned = cleanParent(candidate);
  if (cleaned.length < 3 || cleaned.length > 48) return false;
  const lowered = cleaned.toLowerCase();
  if (lowered === normalize(strainName)) return false;
  if (/\b(review|info|menu|shop|buy|flowering|thc|cbd|yield|effects|flavor|aroma|seedfinder|leafly|allbud)\b/i.test(cleaned)) return false;
  return /[a-z]/i.test(cleaned);
};

const explicitPairPatterns = [
  /(?:cross|crossed|hybrid|bred|created|made|genetics|lineage|parents?)\s+(?:is\s+)?(?:a\s+)?(?:between|of|from)?\s*([A-Za-z0-9'# .-]{3,48})\s+(?:and|x|×)\s+([A-Za-z0-9'# .-]{3,48})/gi,
  /(?:between|from)\s+([A-Za-z0-9'# .-]{3,48})\s+(?:and|x|×)\s+([A-Za-z0-9'# .-]{3,48})/gi,
  /([A-Z][A-Za-z0-9'# .-]{2,40})\s+(?:x|×)\s+([A-Z][A-Za-z0-9'# .-]{2,40})/g,
];

const extractParents = (text: string, strainName: string): [string, string] | null => {
  for (const pattern of explicitPairPatterns) {
    pattern.lastIndex = 0;
    const matches = Array.from(text.matchAll(pattern));
    for (const match of matches) {
      const first = cleanParent(match[1] ?? "");
      const second = cleanParent(match[2] ?? "");
      if (looksLikeParent(first, strainName) && looksLikeParent(second, strainName) && normalize(first) !== normalize(second)) {
        return [first, second];
      }
    }
  }
  return null;
};

const fetchSearchText = async (query: string) => {
  const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const response = await fetch(`${ALL_ORIGINS_RAW}${encodeURIComponent(url)}`);
  if (!response.ok) throw new Error("Lineage search failed");
  return htmlToText(await response.text());
};

export async function lookupWebLineage(name: string, breeder?: string): Promise<WebLineageResult> {
  const syncedAt = new Date().toISOString();

  if (hasExplicitCross(name)) {
    return {
      status: "explicit-cross",
      note: "This strain is already labelled as a cross, so no web lookup was needed.",
      syncedAt,
    };
  }

  const key = cacheKeyFor(name, breeder);
  const cache = readCache();
  const cached = cache[key];
  if (cached && fresh(cached)) return cached;

  const queries = [
    `${name} ${breeder ?? ""} cannabis strain parents`,
    `${name} strain genetics lineage parents`,
    `${name} cannabis cross parents`,
  ];

  try {
    for (const query of queries) {
      const text = await fetchSearchText(query);
      const parents = extractParents(text, name);
      if (parents) {
        const result: WebLineageResult = {
          status: "resolved",
          parents,
          source: "web search snippets",
          note: "Scraped from public web-search result text and cached for 24 hours. Treat as a lead to verify, not pack-label proof.",
          syncedAt,
        };
        cache[key] = result;
        writeCache(cache);
        return result;
      }
    }

    const result: WebLineageResult = {
      status: "not-found",
      note: "No confident parent pair was found in the scraped web results. Try adding breeder context or checking the pack label.",
      syncedAt,
    };
    cache[key] = result;
    writeCache(cache);
    return result;
  } catch {
    const result: WebLineageResult = {
      status: "error",
      note: "The public lineage lookup could not be reached from the browser. This will be more reliable once a backend route can be installed.",
      syncedAt,
    };
    cache[key] = result;
    writeCache(cache);
    return result;
  }
}
