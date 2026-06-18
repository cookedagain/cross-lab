// Creative cannabis cross-name generator.
// Names are built from each parent's flavor/terpene profile, its lineage
// (the real words in the strain name) and a nod to the breeders — never
// random letter mash-ups.

import type { Seed } from "@/data/seeds";

const SUFFIX_JUNK =
  /^(F\d+|BX\d+|R\d+|S\d+|V\d+|RBX|RF\d+|MCV\d+|GPP|ABC|BX|Auto|Cross|#\d+|\d+)$/i;

const STOPWORDS = new Set(["the", "of", "de", "and", "&", "x", "×"]);

// Detect a flavor / terpene theme from the parent name and map it to
// evocative, on-theme descriptor words.
type Flavor = { match: string[]; words: string[]; terp: string };

const FLAVORS: Flavor[] = [
  { match: ["cherry"], words: ["Cherry", "Cordial", "Bing"], terp: "sweet cherry" },
  { match: ["lemon"], words: ["Lemon", "Limoncello", "Zest"], terp: "citrus (limonene)" },
  { match: ["lime"], words: ["Lime", "Citrus", "Rickey"], terp: "citrus (limonene)" },
  { match: ["mandarin", "tangie", "orange"], words: ["Tangerine", "Orange Crush", "Citrus"], terp: "citrus (limonene)" },
  { match: ["diesel", "fuel"], words: ["Fuel", "Gas", "Petrol"], terp: "fuel (caryophyllene)" },
  { match: ["sour"], words: ["Sour", "Tart", "Acid"], terp: "sour funk" },
  { match: ["og", "kush"], words: ["Kush", "Pine", "Loud"], terp: "earthy pine (myrcene)" },
  { match: ["cookie"], words: ["Cookie", "Dough", "Batter"], terp: "doughy sweet" },
  { match: ["cake", "wedding"], words: ["Cake", "Frosting", "Vanilla"], terp: "creamy vanilla" },
  { match: ["gelato"], words: ["Gelato", "Cream", "Sorbet"], terp: "creamy dessert" },
  { match: ["sherb", "sherbet"], words: ["Sherb", "Sorbet", "Fizz"], terp: "creamy citrus" },
  { match: ["grape"], words: ["Grape", "Vino", "Jelly"], terp: "grape candy" },
  { match: ["purple", "rozé", "roze", "violet"], words: ["Purple", "Royal", "Violet"], terp: "grape (linalool)" },
  { match: ["lilac", "lavender"], words: ["Lilac", "Bloom", "Petal"], terp: "floral (linalool)" },
  { match: ["banana"], words: ["Banana", "Foster", "Cream"], terp: "tropical banana" },
  { match: ["mango"], words: ["Mango", "Tropic", "Smile"], terp: "tropical (myrcene)" },
  { match: ["pineapple", "pina"], words: ["Pineapple", "Colada", "Tropic"], terp: "tropical sweet" },
  { match: ["tropical"], words: ["Tropic", "Island", "Paradise"], terp: "tropical fruit" },
  { match: ["blueberry", "blue"], words: ["Blueberry", "Indigo", "Berry"], terp: "blueberry (myrcene)" },
  { match: ["berry"], words: ["Berry", "Jam", "Bramble"], terp: "berry" },
  { match: ["apple"], words: ["Apple", "Orchard", "Cider"], terp: "crisp apple" },
  { match: ["peach"], words: ["Peach", "Cobbler", "Nectar"], terp: "stone fruit" },
  { match: ["marshmallow"], words: ["Marshmallow", "S'more", "Fluff"], terp: "toasted sugar" },
  { match: ["mint", "mentha"], words: ["Mint", "Menthol", "Frost"], terp: "cooling menthol" },
  { match: ["garlic", "gmo"], words: ["Garlic", "Savory", "Funk"], terp: "savory funk (GMO)" },
  { match: ["cheese", "exodus"], words: ["Cheese", "Funk", "Rind"], terp: "funky cheese" },
  { match: ["haze"], words: ["Haze", "Incense", "Spice"], terp: "spicy haze (terpinolene)" },
  { match: ["skunk"], words: ["Skunk", "Funk", "Loud"], terp: "skunky funk" },
  { match: ["runtz", "zkittlez", "skittlez", "candy"], words: ["Candy", "Rainbow", "Sugar"], terp: "candy sweet" },
  { match: ["bubblegum", "gum"], words: ["Bubblegum", "Sugar", "Pop"], terp: "bubblegum" },
  { match: ["choco", "chocolate"], words: ["Cocoa", "Truffle", "Mocha"], terp: "chocolate" },
  { match: ["coffee", "espresso"], words: ["Mocha", "Espresso", "Roast"], terp: "roasted coffee" },
  { match: ["hash", "temple", "charas"], words: ["Hash", "Temple", "Charas"], terp: "hashy spice" },
  { match: ["gorilla", "glue"], words: ["Glue", "Resin", "Grip"], terp: "sticky resin" },
  { match: ["chem", "gmo"], words: ["Chem", "Gas", "Funk"], terp: "chem funk" },
  { match: ["cream", "custard"], words: ["Cream", "Custard", "Velvet"], terp: "creamy" },
  { match: ["honey", "nectar"], words: ["Honey", "Nectar", "Amber"], terp: "honeyed sweet" },
  { match: ["pine"], words: ["Pine", "Forest", "Sap"], terp: "pine (pinene)" },
  { match: ["coconut"], words: ["Coconut", "Colada"], terp: "coconut" },
  { match: ["vanilla"], words: ["Vanilla", "Custard"], terp: "vanilla" },
  { match: ["jealousy"], words: ["Envy", "Jealousy"], terp: "creamy gas" },
  { match: ["sauce"], words: ["Sauce", "Drip", "Sticky"], terp: "terpy sauce" },
  { match: ["afghan", "afghani"], words: ["Afghan", "Charas", "Hash"], terp: "hashplant" },
  { match: ["durban"], words: ["Spice", "Aniseed"], terp: "sweet spice" },
  { match: ["northern lights", "aurora"], words: ["Aurora", "Frost", "Borealis"], terp: "earthy sweet" },
  { match: ["widow", "white"], words: ["Frost", "Resin", "Snow"], terp: "frosty resin" },
  { match: ["diamond", "platinum", "glam", "glitter"], words: ["Diamond", "Glitz", "Frost"], terp: "frosty resin" },
  { match: ["moon"], words: ["Moon", "Lunar", "Eclipse"], terp: "mystic" },
  { match: ["planet", "cosmic", "alien", "ufo"], words: ["Cosmic", "Orbit", "Nebula"], terp: "spacey" },
  { match: ["yeti", "frozen", "ice", "frost", "glacier"], words: ["Frost", "Glacier", "Ice"], terp: "frosty" },
  { match: ["dog", "chunk", "deep"], words: ["Deep", "Hound", "Earth"], terp: "earthy indica" },
  { match: ["wombat", "downunder", "outback"], words: ["Outback", "Bush", "Gum"], terp: "earthy" },
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
  pool: string[]; // descriptor words to build names from
  terps: string[]; // human-readable terpene/flavor notes
  flair: string[]; // breeder flair words
};

function buildProfile(seed: Seed): Profile {
  const lower = seed.name.toLowerCase();
  const pool: string[] = [];
  const terps: string[] = [];

  for (const f of FLAVORS) {
    if (f.match.some((m) => lower.includes(m))) {
      pool.push(...f.words);
      if (!terps.includes(f.terp)) terps.push(f.terp);
    }
  }

  // Always keep the real lineage words so names stay grounded in the strain.
  const lineage = significantWords(seed.name);
  const merged = Array.from(new Set([...pool, ...lineage]));

  return {
    pool: merged.length ? merged : lineage.length ? lineage : ["Mystery"],
    terps,
    flair: BREEDER_FLAIR[seed.breeder] ?? [],
  };
}

function pick<T>(arr: T[], rnd: () => number): T {
  return arr[Math.floor(rnd() * arr.length)];
}

function shortName(name: string): string {
  return name.replace(/\([^)]*\)/g, "").trim();
}

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
    // Flavor of A meets flavor of B
    () => {
      const wA = pick(a.pool, rnd);
      const wB = pick(b.pool, rnd);
      if (wA === wB) return null;
      return {
        name: `${wA} ${wB}`,
        note: `Pairs ${wA} from ${aName} with ${wB} from ${bName}. ${terpLine}`.trim(),
      };
    },
    // Reversed pairing
    () => {
      const wA = pick(a.pool, rnd);
      const wB = pick(b.pool, rnd);
      if (wA === wB) return null;
      return {
        name: `${wB} ${wA}`,
        note: `Leads with ${wB} from ${bName}, backed by ${wA} from ${aName}. ${terpLine}`.trim(),
      };
    },
    // Two flavors finished with a dessert
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
    // Flavor + effect
    () => {
      const wA = pick(rnd() > 0.5 ? a.pool : b.pool, rnd);
      const eff = pick(EFFECTS, rnd);
      return {
        name: `${wA} ${eff}`,
        note: `Highlights the ${wA.toLowerCase()} side of the ${aName} × ${bName} cross.`,
      };
    },
    // Breeder nod
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
    // Three-word flavor stack
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
