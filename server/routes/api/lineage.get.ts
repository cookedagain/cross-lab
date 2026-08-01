import { defineHandler } from "nitro";
import { createError, getQuery } from "nitro/h3";

type SourceId = "brotanical" | "ethos" | "seven-east" | "greenspace" | "leafly";

type Source = {
  id: SourceId;
  label: string;
  url: string;
  fetchUrls: string[];
  candidatePath?: RegExp;
};

const USER_AGENT = "Mozilla/5.0 (compatible; CrossLabVault/1.0; lineage lookup)";
const MAX_RESPONSE_CHARS = 180_000;

const decodeHtml = (value: string) =>
  value
    .replace(/&amp;/gi, "&")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&#215;|&times;/gi, "×")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)));

const htmlToText = (html: string) =>
  decodeHtml(html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b(f\d+|bx\d*|s\d+|r\d+|rbx\d*|v\d+|auto|fem|reg|#\d+)\b/gi, " ")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const slugify = (value: string, separator = "-") =>
  value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[×x]/g, " ")
    .replace(/[^a-z0-9]+/g, separator)
    .replace(new RegExp(`^\\${separator}|\\${separator}$`, "g"), "");

const sourceOrder = (breeder: string): SourceId[] => {
  const normalized = breeder.toLowerCase();
  const preferred: SourceId = normalized.includes("ethos")
    ? "ethos"
    : normalized.includes("7 east")
      ? "seven-east"
      : normalized.includes("greenspace")
        ? "greenspace"
        : "brotanical";
  return [preferred, ...(["brotanical", "ethos", "seven-east", "greenspace"] as SourceId[]).filter((id) => id !== preferred), "leafly"];
};

const buildSources = (name: string, breeder: string): Source[] => {
  const query = `${breeder} ${name}`.trim();
  const encodedQuery = encodeURIComponent(query);
  const encodedName = encodeURIComponent(name);
  const hyphenSlug = slugify(name);
  const greenspaceName = name.replace(/\bauto(?:flower)?\b/gi, " ").replace(/\s+/g, " ").trim();
  const greenspaceSlug = slugify(greenspaceName);
  const greenspaceCompactSlug = slugify(greenspaceName, "");
  const sources: Record<SourceId, Source> = {
    brotanical: {
      id: "brotanical",
      label: "Brotanical Gardens",
      url: `https://brotanicalgardens.com/?s=${encodedQuery}&post_type=product`,
      fetchUrls: [
        `https://brotanicalgardens.com/wp-json/wc/store/v1/products?search=${encodedQuery}&per_page=10`,
      ],
      candidatePath: /\/shop\//i,
    },
    ethos: {
      id: "ethos",
      label: "Ethos Genetics",
      url: `https://ethosgenetics.com/genetics/${hyphenSlug}`,
      fetchUrls: [
        `https://ethosgenetics.com/genetics/${hyphenSlug}`,
        `https://ethosgenetics.com/genetics?search=${encodedName}`,
      ],
      candidatePath: /\/genetics\//i,
    },
    "seven-east": {
      id: "seven-east",
      label: "7 East Genetics",
      url: `https://www.7eastgenetics.com/search?controller=search&s=${encodedName}`,
      fetchUrls: [`https://www.7eastgenetics.com/search?controller=search&s=${encodedName}`],
      candidatePath: /\/(regular-seeds|regular-pollen)\//i,
    },
    greenspace: {
      id: "greenspace",
      label: "Greenspace Genetics",
      url: `https://greenspacegenetics.com/${greenspaceSlug}`,
      fetchUrls: [
        `https://greenspacegenetics.com/${greenspaceSlug}`,
        `https://greenspacegenetics.com/${greenspaceCompactSlug}`,
      ],
    },
    leafly: {
      id: "leafly",
      label: "Leafly",
      url: `https://www.leafly.com/search?q=${encodedName}&searchCategory=strain`,
      fetchUrls: [`https://www.leafly.com/search?q=${encodedName}&searchCategory=strain`],
      candidatePath: /\/strains\//i,
    },
  };
  return sourceOrder(breeder).map((id) => sources[id]);
};

const fetchHtml = async (url: string) => {
  const response = await fetch(url, {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": USER_AGENT,
    },
    redirect: "follow",
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error(`${response.status}`);
  return (await response.text()).slice(0, MAX_RESPONSE_CHARS);
};

const bestCandidateUrl = (html: string, source: Source, name: string) => {
  if (!source.candidatePath) return null;
  if (source.id === "brotanical") {
    try {
      const products = JSON.parse(html) as { permalink?: string }[];
      const permalink = products[0]?.permalink;
      if (permalink) return permalink;
    } catch {
      // Continue with HTML link matching when the response is not JSON.
    }
  }

  const targetWords = normalize(name).split(" ").filter((word) => word.length > 1);
  const candidates: { url: string; score: number }[] = [];
  const anchorPattern = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  for (const match of html.matchAll(anchorPattern)) {
    try {
      const url = new URL(decodeHtml(match[1]), source.url);
      if (!source.candidatePath.test(url.pathname)) continue;
      const text = normalize(htmlToText(match[2]));
      const path = normalize(url.pathname);
      const score = targetWords.reduce(
        (total, word) => total + (text.includes(word) ? 3 : 0) + (path.includes(word) ? 2 : 0),
        0,
      );
      if (score > 0) candidates.push({ url: url.toString(), score });
    } catch {
      // Ignore malformed links from third-party pages.
    }
  }

  return candidates.sort((a, b) => b.score - a.score)[0]?.url ?? null;
};

const cleanParent = (value: string) =>
  value
    .replace(/\b(strain|cannabis|marijuana|seeds?|genetics?|lineage|parents?|hybrid|cross(?:ed)?|created|bred|from|between|with|by|crossing)\b/gi, " ")
    .replace(/^[\s(:-]+|[\s).,:;-]+$/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .slice(0, 8)
    .join(" ");

const validParent = (value: string, name: string) => {
  const normalized = normalize(value);
  return normalized.length >= 3 && normalized.length <= 60 && normalized !== normalize(name) && /[a-z]/i.test(value);
};

const extractParents = (text: string, name: string): [string, string] | null => {
  const patterns = [
    /Parent Crosses?\s+([A-Za-z0-9'#&“”()., /-]{2,80}?)\s+[x×]\s+([A-Za-z0-9'#&“”()., /-]{2,80}?)(?=\s+(?:Pack|Flowering|Sex|Strain|TAC|THC|CBD|Yield|Terpenes?|Type|Stats|Buy|$))/gi,
    /Genetics\s+([A-Za-z0-9'#&“”()., /-]{2,80}?)\s+[x×]\s+([A-Za-z0-9'#&“”()., /-]{2,80}?)(?=\s+(?:TAC|THC|CBD|Type|Sativa|Indica|Effect|Taste|Flowering|Yield|Stats|Buy|$))/gi,
    /(?:lineage|parents?|cross(?:ed)?|created|bred|made)\s+(?:is\s+)?(?:a\s+)?(?:between|of|from)?\s*([A-Za-z0-9'#&“”()., /-]{2,70}?)\s+(?:and|x|×)\s+([A-Za-z0-9'#&“”()., /-]{2,70}?)(?=[.!|]|\s+(?:Flowering|Yield|THC|CBD|Terpenes?|Stats|Buy|$))/gi,
    /\(?([A-Z][A-Za-z0-9'#&“”()., /-]{2,55}?)\s+[x×]\s+([A-Z][A-Za-z0-9'#&“”()., /-]{2,55}?)\)?(?=[.!|]|\s+(?:Flowering|Yield|THC|CBD|Terpenes?|Stats|Buy|$))/g,
  ];

  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern)) {
      const first = cleanParent(match[1] ?? "");
      const second = cleanParent(match[2] ?? "");
      if (validParent(first, name) && validParent(second, name) && normalize(first) !== normalize(second)) {
        return [first, second];
      }
    }
  }
  return null;
};

export default defineHandler(async (event) => {
  const query = getQuery(event);
  const name = typeof query.name === "string" ? query.name.trim() : "";
  const breeder = typeof query.breeder === "string" ? query.breeder.trim() : "";

  if (!name || name.length > 120 || breeder.length > 120) {
    throw createError({ statusCode: 400, statusMessage: "A valid strain name is required" });
  }

  const sources = buildSources(name, breeder);
  const searchedSources = sources.map((source) => ({ label: source.label, url: source.url }));

  for (const source of sources) {
    for (const fetchUrl of source.fetchUrls) {
      try {
        const html = await fetchHtml(fetchUrl);
        const candidateUrl = bestCandidateUrl(html, source, name);
        const candidateHtml = candidateUrl ? await fetchHtml(candidateUrl).catch(() => "") : "";
        const parents = extractParents(htmlToText(`${candidateHtml} ${html}`), name);
        if (parents) {
          return {
            status: "resolved" as const,
            parents,
            source: source.label,
            sourceUrl: candidateUrl ?? source.url,
            searchedSources,
            note: `Found on ${source.label}. Verify against the original breeder listing or pack label.`,
            syncedAt: new Date().toISOString(),
          };
        }
      } catch {
        // A blocked or missing source should not stop the remaining fallback chain.
      }
    }
  }

  return {
    status: "not-found" as const,
    searchedSources,
    note: "No confident parent pair was extracted automatically. Open one of the source searches below to check the original listing; Leafly is included last as the fallback.",
    syncedAt: new Date().toISOString(),
  };
});
