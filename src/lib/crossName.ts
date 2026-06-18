// Creative cannabis cross-name generator + terpene profiler.
// Names are built from each parent's flavor/terpene profile, its lineage
// (the real words in the strain name) and a nod to the breeders — never
// random letter mash-ups. We also estimate the terpene profile of the cross.

import type { Seed } from "@/data/seeds";

const SUFFIX_JUNK =
  /^(F\d+|BX\d+|R\d+|S\d+|V\d+|RBX|RF\d+|MCV\d+|GPP|ABC|BX|Auto|Cross|#\d+|\d+)$/i;

const STOPWORDS = new Set(["the", "of", "de", "and", "&", "x", "×"]);

// --- Terpene reference -----------------------------------------------------

export type TerpeneKey =
  | "myrcene"
  | "limonene"
  | "caryophyllene"
  | "pinene"
  | "linalool"
  | "terpinolene"
  | "humulene"
  | "ocimene"
  | "terpineol";

type TerpeneInfo = { name: string; aroma: string; effect: string; color: string };

export const TERPENES: Record<TerpeneKey, TerpeneInfo> = {
  myrcene: {
    name: "Myrcene",
    aroma: "earthy, mango, musk",
    effect: "relaxing, heavy body",
    color: "#7c3aed",
  },
  limonene: {
    name: "Limonene",
    aroma: "citrus, lemon zest",
    effect: "uplifting, mood-boost",
    color: "#eab308",
  },
  caryophyllene: {
    name: "Caryophyllene",
    aroma: "pepper, fuel, spice",
    effect: "calming, stress relief",
    color: "#dc2626",
  },
  pinene: {
    name: "Pinene",
    aroma: "pine, fresh forest",
    effect: "alert, clear-headed",
    color: "#16a34a",
  },
  linalool: {
    name: "Linalool",
    aroma: "floral, lavender",
    effect: "soothing, sedative",
    color: "#a855f7",
  },
  terpinolene: {
    name: "Terpinolene",
    aroma: "herbal, haze, fruity",
    effect: "energetic, heady",
    color: "#0ea5e9",
  },
  humulene: {
    name: "Humulene",
    aroma: "hops, woody, earthy",
    effect: "grounding, mellow",
    color: "#a16207",
  },
  ocimene: {
    name: "Ocimene",
    aroma: "sweet, tropical, herbal",
    effect: "uplifting, fresh",
    color: "#f97316",
  },
  terpineol: {
    name: "Terpineol",
    aroma: "lilac, clove, cooling",
    effect: "relaxing, calming",
    color: "#0d9488",
  },
};

// Detect a flavor / terpene theme from the parent name and map it to
// evocative descriptor words + the terpene most associated with it.
type Flavor = { match: string[]; words: string[]; terp: string; terpene: TerpeneKey };

const FLAVORS: Flavor[] = [
  { match: ["cherry"], words: ["Cherry", "Cordial", "Bing"], terp: "sweet cherry", terpene: "myrcene" },
  { match: ["lemon"], words: ["Lemon", "Limoncello", "Zest"], terp: "lemon zest", terpene: "limonene" },
  { match: ["lime"], words: ["Lime", "Citrus", "Rickey"], terp: "lime", terpene: "limonene" },
  { match: ["mandarin", "tangie", "orange"], words: ["Tangerine", "Orange Crush", "Citrus"], terp: "orange citrus", terpene: "limonene" },
  { match: ["diesel", "fuel"], words: ["Fuel", "Gas", "Petrol"], terp: "diesel fuel", terpene: "caryophyllene" },
  { match: ["sour"], words: ["Sour", "Tart", "Acid"], terp: "sour funk", terpene: "caryophyllene" },
  { match: ["og", "kush"], words: ["Kush", "Pine", "Loud"], terp: "earthy pine", terpene: "myrcene" },
  { match: ["cookie"], words: ["Cookie", "Dough", "Batter"], terp: "doughy sweet", terpene: "caryophyllene" },
  { match: ["cake", "wedding"], words: ["Cake", "Frosting", "Vanilla"], terp: "creamy vanilla", terpene: "linalool" },
  { match: ["gelato"], words: ["Gelato", "Cream", "Sorbet"], terp: "creamy dessert", terpene: "caryophyllene" },
  { match: ["sherb", "sherbet"], words: ["Sherb", "Sorbet", "Fizz"], terp: "creamy citrus", terpene: "limonene" },
  { match: ["grape"], words: ["Grape", "Vino", "Jelly"], terp: "grape candy", terpene: "myrcene" },
  { match: ["purple", "rozé", "roze", "violet"], words: ["Purple", "Royal", "Violet"], terp: "grape floral", terpene: "linalool" },
  { match: ["lilac", "lavender"], words: ["Lilac", "Bloom", "Petal"], terp: "floral lilac", terpene: "linalool" },
  { match: ["banana"], words: ["Banana", "Foster", "Cream"], terp: "tropical banana", terpene: "myrcene" },
  { match: ["mango"], words: ["Mango", "Tropic", "Smile"], terp: "ripe mango", terpene: "myrcene" },
  { match: ["pineapple", "pina"], words: ["Pineapple", "Colada", "Tropic"], terp: "tropical pineapple", terpene: "ocimene" },
  { match: ["tropical"], words: ["Tropic", "Island", "Paradise"], terp: "tropical fruit", terpene: "ocimene" },
  { match: ["blueberry", "blue"], words: ["Blueberry", "Indigo", "Berry"], terp: "blueberry", terpene: "myrcene" },
  { match: ["berry"], words: ["Berry", "Jam", "Bramble"], terp: "berry", terpene: "myrcene" },
  { match: ["apple"], words: ["Apple", "Orchard", "Cider"], terp: "crisp apple", terpene: "ocimene" },
  { match: ["peach"], words: ["Peach", "Cobbler", "Nectar"], terp: "stone fruit", terpene: "ocimene" },
  { match: ["marshmallow"], words: ["Marshmallow", "S'more", "Fluff"], terp: "toasted sugar", terpene: "linalool" },
  { match: ["mint", "mentha"], words: ["Mint", "Menthol", "Frost"], terp: "cooling menthol", terpene: "terpineol" },
  { match: ["garlic", "gmo"], words: ["Garlic", "Savory", "Funk"], terp: "savory funk (GMO)", terpene: "caryophyllene" },
  { match: ["cheese", "exodus"], words: ["Cheese", "Funk", "Rind"], terp: "funky cheese", terpene: "caryophyllene" },
  { match: ["haze"], words: ["Haze", "Incense", "Spice"], terp: "spicy haze", terpene: "terpinolene" },
  { match: ["skunk"], words: ["Skunk", "Funk", "Loud"], terp: "skunky funk", terpene: "myrcene" },
  { match: ["runtz", "zkittlez", "skittlez", "candy"], words: ["Candy", "Rainbow", "Sugar"], terp: "candy sweet", terpene: "limonene" },
  { match: ["bubblegum", "gum"], words: ["Bubblegum", "Sugar", "Pop"], terp: "bubblegum", terpene: "limonene" },
  { match: ["choco", "chocolate"], words: ["Cocoa", "Truffle", "Mocha"], terp: "chocolate", terpene: "caryophyllene" },
  { match: ["coffee", "espresso"], words: ["Mocha", "Espresso", "Roast"], terp: "roasted coffee", terpene: "caryophyllene" },
  { match: ["hash", "temple", "charas"], words: ["Hash", "Temple", "Charas"], terp: "hashy spice", terpene: "humulene" },
  { match: ["gorilla", "glue"], words: ["Glue", "Resin", "Grip"], terp: "sticky resin", terpene: "caryophyllene" },
  { match: ["chem"], words: ["Chem", "Gas", "Funk"], terp: "chem funk", terpene: "caryophyllene" },
  { match: ["cream", "custard"], words: ["Cream", "Custard", "Velvet"], terp: "creamy", terpene: "linalool" },
  { match: ["honey", "nectar"], words: ["Honey", "Nectar", "Amber"], terp: "honeyed sweet", terpene: "ocimene" },
  { match: ["pine"], words: ["Pine", "Forest", "Sap"], terp: "fresh pine", terpene: "pinene" },
  { match: ["coconut"], words: ["Coconut", "Colada"], terp: "coconut", terpene: "linalool" },
  { match: ["vanilla"], words: ["Vanilla", "Custard"], terp: "vanilla", terpene: "linalool" },
  { match: ["jealousy"], words: ["Envy", "Jealousy"], terp: "creamy gas", terpene: "caryophyllene" },
  { match: ["sauce"], words: ["Sauce", "Drip", "Sticky"], terp: "terpy sauce", terpene: "caryophyllene" },
  { match: ["afghan", "afghani"], words: ["Afghan", "Charas", "Hash"], terp: "hashplant", terpene: "myrcene" },
  { match: ["durban"], words: ["Spice", "Aniseed"], terp: "sweet spice", terpene: "terpinolene" },
  { match: ["northern lights", "aurora"], words: ["Aurora", "Frost", "Borealis"], terp: "earthy sweet", terpene: "myrcene" },
  { match: ["widow", "white"], words: ["Frost", "Resin", "Snow"], terp: "frosty resin", terpene: "caryophyllene" },
  { match: ["diamond", "platinum", "glam", "glitter"], words: ["Diamond", "Glitz", "Frost"], terp: "frosty resin", terpene: "caryophyllene" },
  { match: ["moon"], words: ["Moon", "Lunar", "Eclipse"], terp: "mystic", terpene: "linalool" },
  { match: ["planet", "cosmic", "alien", "ufo"], words: ["Cosmic", "Orbit", "Nebula"], terp: "spacey haze", terpene: "terpinolene" },
  { match: ["yeti", "frozen", "ice", "frost", "glacier"], words: ["Frost", "Glacier", "Ice"], terp: "frosty", terpene: "myrcene" },
  { match: ["dog", "chunk", "deep"], words: ["Deep", "Hound", "Earth"], terp: "earthy indica", terpene: "myrcene" },
  { match: ["wombat", "downunder", "outback"], words: ["Outback", "Bush", "Gum"], terp: "earthy", terpene: "humulene" },
];

// A short flair word for each breeder so names can tip their hat to the source.
const BREEDER_FLAIR: Record<string, string[]> = {
  "Ethos Genetics": ["Ethos", "Crescendo"],
  "Binchickens Genetics": ["Outback", "Bin", "Downunder"],
  "Terpyz Mutant Genetics": ["Mutant", "Terp"],
  "Black Leaf Genetics": ["Black Leaf", "Frost"],
  "Humboldt Seed Company": ["Humboldt", "Cali"],
  "In-House Genetics": ["House"],
  "WolfPack Selections": ["Wolf", "Pack"],
  "Happy Valley Genetics": ["Valley", "Happy"],
  "Brothers Grimm": ["Grimm", "Fable"],
  "Greenspace AU": ["Greenspace", "Orbit"],
  "White Label (Burn Pile)": ["House", "Label"],
};

const DESSERTS = ["Cake", "Sherbet", "Cream", "Pie", "Sundae", "Cobbler"];
const EFFECTS = ["Punch", "Knockout", "Express", "Storm", "Royale", "Drip", "Velvet"];

// --- helpers ---------------------------------------------------------------

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function capitalize(w: string): string {
  return w ? w.charAt(0).toUpperCase() + w.slice(1) : w;
}

function significantWords(name: string): string[] {
  return name
    .replace(/\([^)]*\)/g, " ")
    .split(/[\s×]+/)
    .map((w) => w.replace(/[#.,]/g, "").trim())
    .filter((w) => w.length > 1 && !SUFFIX_JUNK.test(w) && !STOPWORDS.has(w.toLowerCase()))
    .map(capitalize);
}

type Profile = {
  pool: string[];
  terps: string[];
  terpenes: TerpeneKey[];
  flair: string[];
};

function buildProfile(seed: Seed): Profile {
  const lower = seed.name.toLowerCase();
  const pool: string[] = [];
  const terps: string[] = [];
  const terpenes: TerpeneKey[] = [];

  for (const f of FLAVORS) {
    if (f.match.some((m) => lower.includes(m))) {
      pool.push(...f.words);
      if (!terps.includes(f.terp)) terps.push(f.terp);
      terpenes.push(f.terpene);
    }
  }

  const lineage = significantWords(seed.name);
  const merged = Array.from(new Set([...pool, ...lineage]));

  return {
    pool: merged.length ? merged : lineage.length ? lineage : ["Mystery"],
    terps,
    terpenes,
    flair: BREEDER_FLAIR[seed.breeder] ?? [],
  };
}

function pick<T>(arr: T[], rnd: () => number): T {
  return arr[Math.floor(rnd() * arr.length)];
}

function shortName(name: string): string {
  return name.replace(/\([^)]*\)/g, "").trim();
}

// --- Terpene profile of a cross -------------------------------------------

export type TerpeneStat = {
  key: TerpeneKey;
  info: TerpeneInfo;
  share: number; // 0-100, rough relative weight
};

export type CrossProfile = {
  terpenes: TerpeneStat[];
  flavors: string[];
  summary: string;
};

export function getCrossProfile(parentA: Seed, parentB: Seed): CrossProfile {
  const a = buildProfile(parentA);
  const b = buildProfile(parentB);

  const counts = new Map<TerpeneKey, number>();
  // Parents contribute their terpenes; shared terpenes get reinforced.
  for (const t of [...a.terpenes, ...b.terpenes]) {
    counts.set(t, (counts.get(t) ?? 0) + 1);
  }

  const total = Array.from(counts.values()).reduce((s, n) => s + n, 0) || 1;
  const terpenes: TerpeneStat[] = Array.from(counts.entries())
    .map(([key, n]) => ({
      key,
      info: TERPENES[key],
      share: Math.round((n / total) * 100),
    }))
    .sort((x, y) => y.share - x.share)
    .slice(0, 4);

  const flavors = Array.from(new Set([...a.terps, ...b.terps])).slice(0, 5);

  const dominant = terpenes[0]?.info;
  const summary = dominant
    ? `Likely ${dominant.name}-forward — expect a ${dominant.aroma} nose with ${dominant.effect} effects.`
    : "Flavor profile unknown — try a more descriptive pairing.";

  return { terpenes, flavors, summary };
}

// --- Name generation -------------------------------------------------------

export type CrossName = { name: string; note: string };

export function generateCrossNames(
  parentA: Seed,
  parentB: Seed,
  salt = 0,
): CrossName[] {
  const a = buildProfile(parentA);
  const b = buildProfile(parentB);
  const rnd = mulberry32(hashString(parentA.id + "|" + parentB.id) + salt * 8675309);

  const aName = shortName(parentA.name);
  const bName = shortName(parentB.name);

  const terpLine =
    [...a.terps, ...b.terps].length > 0
      ? `Expect ${[...new Set([...a.terps, ...b.terps])].slice(0, 3).join(" + ")} notes.`
      : "";

  const strategies: (() => CrossName | null)[] = [
    () => {
      const wA = pick(a.pool, rnd);
      const wB = pick(b.pool, rnd);
      if (wA === wB) return null;
      return {
        name: `${wA} ${wB}`,
        note: `Pairs ${wA} from ${aName} with ${wB} from ${bName}. ${terpLine}`.trim(),
      };
    },
    () => {
      const wA = pick(a.pool, rnd);
      const wB = pick(b.pool, rnd);
      if (wA === wB) return null;
      return {
        name: `${wB} ${wA}`,
        note: `Leads with ${wB} from ${bName}, backed by ${wA} from ${aName}. ${terpLine}`.trim(),
      };
    },
    () => {
      const wA = pick(a.pool, rnd);
      const wB = pick(b.pool, rnd);
      const dessert = pick(DESSERTS, rnd);
      if (wA === wB) return null;
      return {
        name: `${wA} ${wB} ${dessert}`,
        note: `A dessert-style cross of ${aName} × ${bName}, with a ${dessert.toLowerCase()} finish.`,
      };
    },
    () => {
      const wA = pick(rnd() > 0.5 ? a.pool : b.pool, rnd);
      const eff = pick(EFFECTS, rnd);
      return {
        name: `${wA} ${eff}`,
        note: `Highlights the ${wA.toLowerCase()} side of the ${aName} × ${bName} cross.`,
      };
    },
    () => {
      const flair = [...a.flair, ...b.flair];
      if (flair.length === 0) return null;
      const fl = pick(flair, rnd);
      const w = pick(rnd() > 0.5 ? a.pool : b.pool, rnd);
      if (fl === w) return null;
      const breeder = a.flair.includes(fl) ? parentA.breeder : parentB.breeder;
      return {
        name: `${fl} ${w}`,
        note: `A tip of the hat to ${breeder}, carrying ${w} from the cross.`,
      };
    },
    () => {
      const wA = pick(a.pool, rnd);
      const wB = pick(b.pool, rnd);
      const wC = pick(rnd() > 0.5 ? a.pool : b.pool, rnd);
      const uniq = [...new Set([wA, wB, wC])];
      if (uniq.length < 2) return null;
      return {
        name: uniq.slice(0, 3).join(" "),
        note: `Stacks the standout flavors of ${aName} and ${bName}. ${terpLine}`.trim(),
      };
    },
  ];

  const seen = new Set<string>();
  const results: CrossName[] = [];
  let attempts = 0;
  while (results.length < 6 && attempts < 80) {
    attempts++;
    const out = pick(strategies, rnd)();
    if (!out) continue;
    out.name = out.name.replace(/\s+/g, " ").trim();
    const key = out.name.toLowerCase();
    if (!seen.has(key) && out.name.length > 2) {
      seen.add(key);
      results.push(out);
    }
  }

  return results;
}
