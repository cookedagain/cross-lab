export type WebLineageSource = {
  label: string;
  url: string;
};

export type WebLineageResult = {
  status: "resolved" | "explicit-cross" | "not-found" | "error";
  parents?: [string, string];
  source?: string;
  sourceUrl?: string;
  searchedSources?: WebLineageSource[];
  note: string;
  syncedAt: string;
};

const CACHE_KEY = "crosslab-web-lineage-cache-v4-breeder-sources";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b(f\d+|bx\d*|s\d+|r\d+|rbx\d*|v\d+|auto|fem|reg|#\d+)\b/gi, " ")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const slugify = (value: string) =>
  value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[×x]/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const hasExplicitCross = (name: string) => /\s[×x]\s/i.test(` ${name} `);
const cacheKeyFor = (name: string, breeder?: string) => normalize(`${name} ${breeder ?? ""}`);

type LineageCache = Record<string, WebLineageResult>;

const inFlightLookups = new Map<string, Promise<WebLineageResult>>();

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

export const getLineageSourceLinks = (name: string, breeder?: string): WebLineageSource[] => {
  const query = `${breeder ?? ""} ${name}`.trim();
  const encodedQuery = encodeURIComponent(query);
  const encodedName = encodeURIComponent(name);
  const greenspaceName = name.replace(/\bauto(?:flower)?\b/gi, " ").replace(/\s+/g, " ").trim();
  const links: Record<string, WebLineageSource> = {
    brotanical: {
      label: "Brotanical Gardens",
      url: `https://brotanicalgardens.com/?s=${encodedQuery}&post_type=product`,
    },
    ethos: {
      label: "Ethos Genetics",
      url: `https://ethosgenetics.com/genetics/${slugify(name)}`,
    },
    "seven-east": {
      label: "7 East Genetics",
      url: `https://www.7eastgenetics.com/search?controller=search&s=${encodedName}`,
    },
    greenspace: {
      label: "Greenspace Genetics",
      url: `https://greenspacegenetics.com/${slugify(greenspaceName)}`,
    },
    leafly: {
      label: "Leafly fallback",
      url: `https://www.leafly.com/search?q=${encodedName}&searchCategory=strain`,
    },
  };

  const normalizedBreeder = (breeder ?? "").toLowerCase();
  const preferred = normalizedBreeder.includes("ethos")
    ? "ethos"
    : normalizedBreeder.includes("7 east")
      ? "seven-east"
      : normalizedBreeder.includes("greenspace")
        ? "greenspace"
        : "brotanical";
  const primaryOrder = [preferred, ...["brotanical", "ethos", "seven-east", "greenspace"].filter((id) => id !== preferred)];
  return [...primaryOrder.map((id) => links[id]), links.leafly];
};

const isWebLineageResult = (value: unknown): value is WebLineageResult => {
  if (!value || typeof value !== "object") return false;
  const result = value as Partial<WebLineageResult>;
  return (result.status === "resolved" || result.status === "not-found") && typeof result.note === "string" && typeof result.syncedAt === "string";
};

export async function lookupWebLineage(
  name: string,
  breeder?: string,
  options: { force?: boolean } = {},
): Promise<WebLineageResult> {
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
  if (!options.force && cached && fresh(cached)) return cached;

  const pending = inFlightLookups.get(key);
  if (pending) return pending;

  const lookup = (async (): Promise<WebLineageResult> => {
    const params = new URLSearchParams({ name });
    if (breeder) params.set("breeder", breeder);

    try {
      const response = await fetch(`/api/lineage?${params.toString()}`);
      if (!response.ok) throw new Error("Lineage lookup failed");
      const data: unknown = await response.json();
      if (!isWebLineageResult(data)) throw new Error("Invalid lineage response");

      const result: WebLineageResult = {
        ...data,
        searchedSources: data.searchedSources?.length ? data.searchedSources : getLineageSourceLinks(name, breeder),
      };
      const latestCache = readCache();
      latestCache[key] = result;
      writeCache(latestCache);
      return result;
    } catch {
      return {
        status: "error",
        searchedSources: getLineageSourceLinks(name, breeder),
        note: "The automatic lookup could not be completed. The direct breeder-site searches below still work and Leafly is available last as a fallback.",
        syncedAt,
      };
    } finally {
      inFlightLookups.delete(key);
    }
  })();

  inFlightLookups.set(key, lookup);
  return lookup;
}
