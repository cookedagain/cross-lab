// CrossLab analysis engine: grounded names, terpene estimates, cross scores,
// phenotype previews, breeder notes, genetic flags, and categorized suggestions.

import type { Seed } from "@/data/seeds";

const SUFFIX_JUNK =
  /^(F\d+|BX\d+|R\d+|S\d+|V\d+|RBX|RF\d+|MCV\d+|GPP|ABC|BX|Auto|Cross|#\d+|\d+)$/i;

const STOPWORDS = new Set(["the", "of", "de", "and", "&", "x", "×"]);

export type TraitGoal =
  | "Gas"
  | "Candy"
  | "Purple"
  | "Heavy resin"
  | "Citrus"
  | "Funk"
  | "Floral"
  | "Hashplant"
  | "Auto traits"
  | "Weird mutant traits";

export const TRAIT_GOALS: TraitGoal[] = [
  "Gas",
  "Candy",
  "Purple",
  "Heavy resin",
  "Citrus",
  "Funk",
  "Floral",
  "Hashplant",
  "Auto traits",
  "Weird mutant traits",
];

const GOAL_WORDS: Record<TraitGoal, string[]> = {
  Gas: ["Gas", "Fuel", "Octane", "Petrol"],
  Candy: ["Candy", "Sugar", "Rainbow", "Taffy"],
  Purple: ["Purple", "Violet", "Royal", "Grape"],
  "Heavy resin": ["Resin", "Frost", "Glue", "Trichome"],
  Citrus: ["Lemon", "Citrus", "Zest", "Tangerine"],
  Funk: ["Funk", "Garlic", "Cheese", "Skunk"],
  Floral: ["Lilac", "Bloom", "Petal", "Lavender"],
  Hashplant: ["Hash", "Charas", "Temple", "Afghan"],
  "Auto traits": ["Express", "Quick", "Auto", "Sprint"],
  "Weird mutant traits": ["Mutant", "Quack", "Feral", "Outlier"],
};

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

type Flavor = {
  match: string[];
  words: string[];
  terp: string;
  terpene: TerpeneKey;
  goals?: TraitGoal[];
};

const FLAVORS: Flavor[] = [
  { match: ["cherry"], words: ["Cherry", "Cordial", "Bing"], terp: "sweet cherry", terpene: "myrcene", goals: ["Candy"] },
  { match: ["lemon"], words: ["Lemon", "Limoncello", "Zest"], terp: "lemon zest", terpene: "limonene", goals: ["Citrus"] },
  { match: ["lime"], words: ["Lime", "Citrus", "Rickey"], terp: "lime", terpene: "limonene", goals: ["Citrus"] },
  { match: ["mandarin", "tangie", "orange"], words: ["Tangerine", "Orange Crush", "Citrus"], terp: "orange citrus", terpene: "limonene", goals: ["Citrus"] },
  { match: ["diesel", "fuel"], words: ["Fuel", "Gas", "Petrol"], terp: "diesel fuel", terpene: "caryophyllene", goals: ["Gas"] },
  { match: ["sour"], words: ["Sour", "Tart", "Acid"], terp: "sour funk", terpene: "caryophyllene", goals: ["Funk"] },
  { match: ["og", "kush"], words: ["Kush", "Pine", "Loud"], terp: "earthy pine", terpene: "myrcene", goals: ["Hashplant"] },
  { match: ["cookie"], words: ["Cookie", "Dough", "Batter"], terp: "doughy sweet", terpene: "caryophyllene", goals: ["Candy"] },
  { match: ["cake", "wedding"], words: ["Cake", "Frosting", "Vanilla"], terp: "creamy vanilla", terpene: "linalool", goals: ["Candy"] },
  { match: ["gelato"], words: ["Gelato", "Cream", "Sorbet"], terp: "creamy dessert", terpene: "caryophyllene", goals: ["Candy"] },
  { match: ["sherb", "sherbet"], words: ["Sherb", "Sorbet", "Fizz"], terp: "creamy citrus", terpene: "limonene", goals: ["Candy", "Citrus"] },
  { match: ["grape"], words: ["Grape", "Vino", "Jelly"], terp: "grape candy", terpene: "myrcene", goals: ["Candy", "Purple"] },
  { match: ["purple", "rozé", "roze", "violet"], words: ["Purple", "Royal", "Violet"], terp: "grape floral", terpene: "linalool", goals: ["Purple", "Floral"] },
  { match: ["lilac", "lavender"], words: ["Lilac", "Bloom", "Petal"], terp: "floral lilac", terpene: "linalool", goals: ["Floral"] },
  { match: ["banana"], words: ["Banana", "Foster", "Cream"], terp: "tropical banana", terpene: "myrcene", goals: ["Candy"] },
  { match: ["mango"], words: ["Mango", "Tropic", "Smile"], terp: "ripe mango", terpene: "myrcene", goals: ["Candy"] },
  { match: ["pineapple", "pina"], words: ["Pineapple", "Colada", "Tropic"], terp: "tropical pineapple", terpene: "ocimene", goals: ["Candy"] },
  { match: ["tropical"], words: ["Tropic", "Island", "Paradise"], terp: "tropical fruit", terpene: "ocimene", goals: ["Candy"] },
  { match: ["blueberry", "blue"], words: ["Blueberry", "Indigo", "Berry"], terp: "blueberry", terpene: "myrcene", goals: ["Candy", "Purple"] },
  { match: ["berry"], words: ["Berry", "Jam", "Bramble"], terp: "berry", terpene: "myrcene", goals: ["Candy"] },
  { match: ["apple"], words: ["Apple", "Orchard", "Cider"], terp: "crisp apple", terpene: "ocimene", goals: ["Candy"] },
  { match: ["peach"], words: ["Peach", "Cobbler", "Nectar"], terp: "stone fruit", terpene: "ocimene", goals: ["Candy"] },
  { match: ["marshmallow"], words: ["Marshmallow", "S'more", "Fluff"], terp: "toasted sugar", terpene: "linalool", goals: ["Candy"] },
  { match: ["mint", "mentha"], words: ["Mint", "Menthol", "Frost"], terp: "cooling menthol", terpene: "terpineol" },
  { match: ["garlic", "gmo"], words: ["Garlic", "Savory", "Funk"], terp: "savory funk (GMO)", terpene: "caryophyllene", goals: ["Funk", "Gas"] },
  { match: ["cheese", "exodus"], words: ["Cheese", "Funk", "Rind"], terp: "funky cheese", terpene: "caryophyllene", goals: ["Funk"] },
  { match: ["haze"], words: ["Haze", "Incense", "Spice"], terp: "spicy haze", terpene: "terpinolene" },
  { match: ["skunk"], words: ["Skunk", "Funk", "Loud"], terp: "skunky funk", terpene: "myrcene", goals: ["Funk"] },
  { match: ["runtz", "zkittlez", "skittlez", "candy"], words: ["Candy", "Rainbow", "Sugar"], terp: "candy sweet", terpene: "limonene", goals: ["Candy"] },
  { match: ["bubblegum", "gum"], words: ["Bubblegum", "Sugar", "Pop"], terp: "bubblegum", terpene: "limonene", goals: ["Candy"] },
  { match: ["hash", "temple", "charas"], words: ["Hash", "Temple", "Charas"], terp: "hashy spice", terpene: "humulene", goals: ["Hashplant"] },
  { match: ["gorilla", "glue"], words: ["Glue", "Resin", "Grip"], terp: "sticky resin", terpene: "caryophyllene", goals: ["Heavy resin"] },
  { match: ["chem"], words: ["Chem", "Gas", "Funk"], terp: "chem funk", terpene: "caryophyllene", goals: ["Gas", "Funk"] },
  { match: ["honey", "nectar"], words: ["Honey", "Nectar", "Amber"], terp: "honeyed sweet", terpene: "ocimene", goals: ["Candy"] },
  { match: ["pine"], words: ["Pine", "Forest", "Sap"], terp: "fresh pine", terpene: "pinene" },
  { match: ["afghan", "afghani"], words: ["Afghan", "Charas", "Hash"], terp: "hashplant", terpene: "myrcene", goals: ["Hashplant"] },
  { match: ["durban"], words: ["Spice", "Aniseed"], terp: "sweet spice", terpene: "terpinolene" },
  { match: ["widow", "white", "diamond", "platinum", "glam", "frost"], words: ["Frost", "Resin", "Snow"], terp: "frosty resin", terpene: "caryophyllene", goals: ["Heavy resin"] },
  { match: ["planet", "cosmic", "alien"], words: ["Cosmic", "Orbit", "Nebula"], terp: "spacey haze", terpene: "terpinolene" },
  { match: ["wombat", "downunder", "outback", "abc", "mutant", "quack"], words: ["Outback", "Mutant", "Feral"], terp: "earthy mutant", terpene: "humulene", goals: ["Weird mutant traits"] },
  { match: ["auto"], words: ["Express", "Quick", "Auto"], terp: "fast-flower selection", terpene: "ocimene", goals: ["Auto traits"] },
];

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
  "Burn Pile": ["Burn Pile", "House"],
};

const DESSERTS = ["Cake", "Sherbet", "Cream", "Pie", "Sundae", "Cobbler"];
const EFFECTS = ["Punch", "Knockout", "Express", "Storm", "Royale", "Drip", "Velvet"];
const RUNESCAPE_REFERENCES = [
  "Lumbridge",
  "Varrock",
  "Falador",
  "Abyssal Whip",
  "Dragon Scimmy",
  "Partyhat",
  "Gnome Stronghold",
  "Rune Plate",
];

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

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
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
  goals: TraitGoal[];
  lineage: string[];
};

function buildProfile(seed: Seed): Profile {
  const lower = seed.name.toLowerCase();
  const pool: string[] = [];
  const terps: string[] = [];
  const terpenes: TerpeneKey[] = [];
  const goals: TraitGoal[] = [];

  for (const f of FLAVORS) {
    if (f.match.some((m) => lower.includes(m))) {
      pool.push(...f.words);
      if (!terps.includes(f.terp)) terps.push(f.terp);
      terpenes.push(f.terpene);
      goals.push(...(f.goals ?? []));
    }
  }

  const lineage = significantWords(seed.name);
  const merged = unique([...pool, ...lineage]);

  return {
    pool: merged.length ? merged : ["Mystery"],
    terps,
    terpenes,
    flair: BREEDER_FLAIR[seed.breeder] ?? [],
    goals: unique(goals),
    lineage,
  };
}

function pick<T>(arr: T[], rnd: () => number): T {
  return arr[Math.floor(rnd() * arr.length)];
}

function shortName(name: string): string {
  return name.replace(/\([^)]*\)/g, "").trim();
}

function matchesGoal(word: string, goals: TraitGoal[]): boolean {
  const lower = word.toLowerCase();
  return goals.some((goal) => GOAL_WORDS[goal].some((w) => lower.includes(w.toLowerCase())));
}

function goalPool(base: string[], goals: TraitGoal[]): string[] {
  if (goals.length === 0) return base;
  const goalWords = goals.flatMap((g) => GOAL_WORDS[g]);
  return unique([...goalWords, ...base.filter((w) => matchesGoal(w, goals)), ...base]);
}

function splitLineage(name: string): string[] {
  return name
    .replace(/\([^)]*\)/g, "")
    .split(/×/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function detectFlags(seed: Seed): string[] {
  const lower = seed.name.toLowerCase();
  const flags: string[] = [];
  if (lower.includes("auto")) flags.push("Auto");
  if (lower.includes("abc") || lower.includes("mutant") || seed.breeder.includes("Mutant")) flags.push("Mutant/ABC");
  if (/\bS\d+\b/i.test(seed.name)) flags.push("S-line");
  if (/\bF\d+\b/i.test(seed.name)) flags.push("Filial");
  if (/\bBX\d*\b/i.test(seed.name) || lower.includes("rbx")) flags.push("Backcross");
  if (lower.includes("fem")) flags.push("Fem");
  return unique(flags);
}

function growthVigor(seed: Seed): number {
  const lower = seed.name.toLowerCase();
  let score = 1;
  if (lower.includes("auto")) score -= 0.18;
  if (lower.includes("haze") || lower.includes("durban") || lower.includes("tangie") || lower.includes("nycd")) score += 0.18;
  if (lower.includes("og") || lower.includes("kush") || lower.includes("afghan") || lower.includes("hash") || lower.includes("deep chunk")) score -= 0.08;
  if (lower.includes("abc") || lower.includes("mutant")) score -= 0.12;
  if (lower.includes("gorilla") || lower.includes("glue") || lower.includes("diesel")) score += 0.06;
  return Math.min(1.25, Math.max(0.72, score));
}

function yieldVigor(seed: Seed): number {
  const lower = seed.name.toLowerCase();
  let score = growthVigor(seed);
  if (lower.includes("heavy bud") || lower.includes("super bud") || lower.includes("big") || lower.includes("gorilla")) score += 0.14;
  if (lower.includes("cookies") || lower.includes("gelato") || lower.includes("runtz") || lower.includes("zkittlez")) score -= 0.04;
  if (lower.includes("deep chunk") || lower.includes("abc") || lower.includes("mutant")) score -= 0.1;
  if (lower.includes("auto")) score -= 0.06;
  return Math.min(1.28, Math.max(0.62, score));
}

function range(min: number, max: number, factor: number) {
  return {
    min: Math.round(min * factor),
    max: Math.round(max * factor),
  };
}

export type TerpeneStat = {
  key: TerpeneKey;
  info: TerpeneInfo;
  share: number;
};

export type CrossProfile = {
  terpenes: TerpeneStat[];
  flavors: string[];
  summary: string;
};

export type CrossName = {
  name: string;
  note: string;
  category: NameCategory;
};

export type NameCategory =
  | "Commercial"
  | "Terpene-Inspired"
  | "Breeder Tribute"
  | "Keeper Weirdos";

export type CrossScores = {
  overall: number;
  flavorSynergy: number;
  terpeneContrast: number;
  breederInterest: number;
  namePotential: number;
  goalMatch: number;
};

export type PhenotypePreview = {
  title: string;
  description: string;
  likelihood: string;
};

export type GeneticNote = {
  label: string;
  note: string;
};

export type LineageNode = {
  parent: "A" | "B";
  name: string;
  breeder: string;
  pieces: string[];
  flags: string[];
};

export type GrowthEstimate = {
  wattage: "<100W" | "220W" | "500W";
  heightCm: { min: number; max: number };
  widthCm: { min: number; max: number };
  yieldG: { min: number; max: number };
  note: string;
};

export type SelfingRecommendation = {
  priority: "High" | "Medium" | "Low";
  title: string;
  note: string;
  caution: string;
};

export type SingleSeedProfile = {
  seed: Seed;
  terpenes: TerpeneStat[];
  flavors: string[];
  heritage: string[];
  breederBlurb: string;
  terpeneBlurb: string;
  selfing: SelfingRecommendation;
  flags: string[];
  goals: TraitGoal[];
};

export type CrossReport = {
  profile: CrossProfile;
  scores: CrossScores;
  phenotypes: PhenotypePreview[];
  growthEstimates: GrowthEstimate[];
  breederNote: string;
  geneticNotes: GeneticNote[];
  lineage: LineageNode[];
  matchedGoals: TraitGoal[];
};

function estimateGrowth(parentA: Seed, parentB: Seed): GrowthEstimate[] {
  const sizeFactor = (growthVigor(parentA) + growthVigor(parentB)) / 2;
  const yieldFactor = (yieldVigor(parentA) + yieldVigor(parentB)) / 2;
  const flags = unique([...detectFlags(parentA), ...detectFlags(parentB)]);
  const autoNote = flags.includes("Auto") ? " Auto influence may keep some phenos shorter and faster." : "";
  const mutantNote = flags.includes("Mutant/ABC") ? " ABC/mutant influence may reduce lateral spread in some phenos." : "";

  return [
    {
      wattage: "<100W",
      heightCm: range(32, 58, sizeFactor),
      widthCm: range(24, 42, sizeFactor),
      yieldG: range(18, 45, yieldFactor),
      note: `Small-light / micro setup estimate. Expect tighter structure, reduced lateral spread and modest dry yield.${autoNote}${mutantNote}`,
    },
    {
      wattage: "220W",
      heightCm: range(55, 95, sizeFactor),
      widthCm: range(42, 72, sizeFactor),
      yieldG: range(70, 160, yieldFactor),
      note: `Mid-power indoor estimate with a more complete expression of branching, terpene potential and yield.${autoNote}${mutantNote}`,
    },
    {
      wattage: "500W",
      heightCm: range(82, 145, sizeFactor),
      widthCm: range(66, 115, sizeFactor),
      yieldG: range(170, 410, yieldFactor),
      note: `High-power estimate. Larger phenos may push beyond this if haze, diesel, Durban or heavy-yield influence dominates.${autoNote}${mutantNote}`,
    },
  ];
}

function getSelfingRecommendation(seed: Seed, seedCount?: number): SelfingRecommendation {
  const flags = detectFlags(seed);
  const countText = seedCount === undefined ? "unknown stock" : `${seedCount} seeds logged`;
  const isLowStock = seedCount === undefined || seedCount <= 3;
  const isMediumStock = seedCount !== undefined && seedCount > 3 && seedCount <= 6;

  if (seed.breeder === "Burn Pile") {
    return {
      priority: "Low",
      title: "One-and-only burn-pile run",
      note: `${seed.name} is in the Burn Pile. Run it once as smoke/test stock only, then close it out; it is not a preservation or breeding candidate.`,
      caution: "Do not save pollen or make seed from Burn Pile plants. White-label / potentially mislabelled stock is too unreliable for the breeding map.",
    };
  }

  if (isLowStock) {
    return {
      priority: "High",
      title: "Strong preservation candidate",
      note: `${seed.name} has ${countText}. If you find a standout keeper, self/S1 preservation may be worth considering before using it heavily in outcrosses.`,
      caution: flags.includes("S-line")
        ? "Already shows S-line/selfed material in the name, so expect more exposed recessives and select carefully."
        : "Treat S1 work as a preservation option, then select away from weak or unwanted expressions.",
    };
  }

  if (isMediumStock) {
    return {
      priority: "Medium",
      title: "Optional preservation backup",
      note: `${seed.name} has ${countText}. You have enough to hunt lightly, but self/S1 backup could protect a rare keeper.`,
      caution: flags.includes("Auto")
        ? "Auto influence may complicate selection goals, so keep notes on which traits you are preserving."
        : "Best used after you confirm the plant is actually worth preserving.",
    };
  }

  return {
    priority: "Low",
    title: "Breed/hunt first",
    note: `${seed.name} has ${countText}. Stock is healthy enough that hunting and normal breeding decisions can come first.`,
    caution: flags.includes("Mutant/ABC")
      ? "Mutant or ABC traits may still justify preservation if a rare morphology appears."
      : "S1 preservation is optional unless a special keeper shows up.",
  };
}

export function getSingleSeedProfile(seed: Seed, seedCount?: number): SingleSeedProfile {
  const profile = buildProfile(seed);
  const counts = new Map<TerpeneKey, number>();
  for (const terpene of profile.terpenes) {
    counts.set(terpene, (counts.get(terpene) ?? 0) + 1);
  }

  const total = Array.from(counts.values()).reduce((sum, value) => sum + value, 0) || 1;
  const terpenes: TerpeneStat[] = Array.from(counts.entries())
    .map(([key, value]) => ({
      key,
      info: TERPENES[key],
      share: Math.round((value / total) * 100),
    }))
    .sort((a, b) => b.share - a.share)
    .slice(0, 4);

  const dominant = terpenes[0]?.info;
  const heritage = splitLineage(seed.name);
  const flags = detectFlags(seed);
  const flavorText = profile.terps.length ? profile.terps.slice(0, 4).join(", ") : "less obvious from name alone";
  const terpeneBlurb = dominant
    ? `${seed.name} looks ${dominant.name}-leaning from its name cues, suggesting ${dominant.aroma} notes and a ${dominant.effect} style expression. Expected flavor direction: ${flavorText}.`
    : `${seed.name} does not expose a strong terpene cue from its name, so treat this as a hunt-first seed and log notes from actual phenos.`;

  const breederBlurb = `${seed.breeder} entry${heritage.length > 1 ? ` built from ${heritage.join(" × ")}` : ""}. ${
    flags.length ? `Detected markers: ${flags.join(", ")}.` : "No special auto/mutant/BX/S-line markers detected from the name."
  }`;

  return {
    seed,
    terpenes,
    flavors: profile.terps,
    heritage,
    breederBlurb,
    terpeneBlurb,
    selfing: getSelfingRecommendation(seed, seedCount),
    flags,
    goals: profile.goals,
  };
}

export function getCrossProfile(parentA: Seed, parentB: Seed): CrossProfile {
  const a = buildProfile(parentA);
  const b = buildProfile(parentB);
  const counts = new Map<TerpeneKey, number>();

  for (const t of [...a.terpenes, ...b.terpenes]) {
    counts.set(t, (counts.get(t) ?? 0) + 1);
  }

  const total = Array.from(counts.values()).reduce((s, n) => s + n, 0) || 1;
  const terpenes: TerpeneStat[] = Array.from(counts.entries())
    .map(([key, n]) => ({ key, info: TERPENES[key], share: Math.round((n / total) * 100) }))
    .sort((x, y) => y.share - x.share)
    .slice(0, 4);

  const flavors = unique([...a.terps, ...b.terps]).slice(0, 6);
  const dominant = terpenes[0]?.info;
  const summary = dominant
    ? `Likely ${dominant.name}-forward — expect a ${dominant.aroma} nose with ${dominant.effect} effects.`
    : "Flavor profile unknown — try a more descriptive pairing.";

  return { terpenes, flavors, summary };
}

export function getCrossReport(
  parentA: Seed,
  parentB: Seed,
  goals: TraitGoal[] = [],
): CrossReport {
  const a = buildProfile(parentA);
  const b = buildProfile(parentB);
  const profile = getCrossProfile(parentA, parentB);
  const sharedTerps = a.terpenes.filter((t) => b.terpenes.includes(t)).length;
  const uniqueTerps = unique([...a.terpenes, ...b.terpenes]).length;
  const sharedGoals = a.goals.filter((g) => b.goals.includes(g)).length;
  const matchedGoals = unique([...a.goals, ...b.goals].filter((g) => goals.includes(g)));

  const flavorSynergy = Math.min(98, 62 + sharedGoals * 13 + profile.flavors.length * 4);
  const terpeneContrast = Math.min(96, 58 + uniqueTerps * 8 - sharedTerps * 3);
  const breederInterest = Math.min(
    95,
    66 + (parentA.breeder === parentB.breeder ? 6 : 18) + unique([...a.flair, ...b.flair]).length * 3,
  );
  const namePotential = Math.min(98, 60 + unique([...a.pool, ...b.pool]).length * 3 + unique([...a.flair, ...b.flair]).length * 4);
  const goalMatch = goals.length === 0 ? 75 : Math.min(99, 50 + Math.round((matchedGoals.length / goals.length) * 45));
  const overall = Math.round(
    flavorSynergy * 0.28 + terpeneContrast * 0.2 + breederInterest * 0.16 + namePotential * 0.2 + goalMatch * 0.16,
  );

  const mainA = a.pool[0] ?? parentA.name;
  const mainB = b.pool[0] ?? parentB.name;
  const dominantTerp = profile.terpenes[0]?.info.name ?? "mixed terpene";
  const growthEstimates = estimateGrowth(parentA, parentB);
  const phenotypes: PhenotypePreview[] = [
    {
      title: `${mainA} ${mainB} pheno`,
      description: `A balanced expression carrying ${mainA.toLowerCase()} from ${shortName(parentA.name)} and ${mainB.toLowerCase()} from ${shortName(parentB.name)}.`,
      likelihood: "Common",
    },
    {
      title: `${dominantTerp} keeper`,
      description: `The most likely keeper direction if the cross expresses the ${profile.terpenes[0]?.info.aroma ?? "loud"} side strongly.`,
      likelihood: "Hunt for",
    },
    {
      title: `${parentA.breeder === parentB.breeder ? "Line-work" : "Outcross"} expression`,
      description:
        parentA.breeder === parentB.breeder
          ? `Same-breeder pairing should keep the line style more coherent while opening variation through the parents.`
          : `Outcrossing ${parentA.breeder} with ${parentB.breeder} may throw wider phenotypic spread and more surprise expressions.`,
      likelihood: "Variable",
    },
  ];

  const geneticNotes: GeneticNote[] = [];
  const flags = unique([...detectFlags(parentA), ...detectFlags(parentB)]);
  const includesBurnPile = parentA.breeder === "Burn Pile" || parentB.breeder === "Burn Pile";
  if (includesBurnPile) {
    geneticNotes.push({ label: "Burn Pile one-and-done", note: "This pairing includes Burn Pile stock. Treat it as a one-and-only smoke/test run; do not save pollen, make seed, or use it for breeding because the source is white-label / potentially mislabelled." });
  }
  if (flags.includes("Auto")) {
    geneticNotes.push({ label: "Auto traits", note: "Auto genetics detected. Expect segregation unless the auto trait is selected and stabilized in later generations." });
  }
  if (flags.includes("Mutant/ABC")) {
    geneticNotes.push({ label: "Mutant/ABC", note: "ABC or mutant influence detected. Leaf morphology can be recessive or inconsistent, so hunt multiple phenos." });
  }
  if (flags.includes("Backcross")) {
    geneticNotes.push({ label: "Backcross", note: "BX/RBX material may reinforce a target parent while still adding useful variation from the mate." });
  }
  if (flags.includes("S-line")) {
    geneticNotes.push({ label: "S-line", note: "Selfed material can expose recessives and may produce tighter but more revealing offspring variation." });
  }
  if (flags.includes("Filial")) {
    geneticNotes.push({ label: "Filial generation", note: "F-numbered parents can carry segregating traits; plan to select toward your target profile." });
  }
  if (geneticNotes.length === 0) {
    geneticNotes.push({ label: "Selection note", note: "No special auto/mutant/BX flags detected. Focus selection on terpene intensity, resin, structure, and vigor." });
  }

  const breederNote = includesBurnPile
    ? `This pairing includes Burn Pile stock. Treat it as a one-and-only smoke/test run only: grow it, fail it, toss it, or consume it, but do not save pollen, make seeds, preserve it, or use it for breeding because the source is white-label / potentially mislabelled.`
    : `This cross points toward ${profile.flavors.slice(0, 3).join(", ") || "mixed terpene"} expressions. ${parentA.breeder === parentB.breeder ? `Both parents come from ${parentA.breeder}, so the naming and selection can stay close to that breeder's style.` : `It combines ${parentA.breeder}'s ${shortName(parentA.name)} with ${parentB.breeder}'s ${shortName(parentB.name)}, which should make the hunt more varied and brandable.`}`;

  return {
    profile,
    scores: { overall, flavorSynergy, terpeneContrast, breederInterest, namePotential, goalMatch },
    phenotypes,
    growthEstimates,
    breederNote,
    geneticNotes,
    lineage: [
      { parent: "A", name: parentA.name, breeder: parentA.breeder, pieces: splitLineage(parentA.name), flags: detectFlags(parentA) },
      { parent: "B", name: parentB.name, breeder: parentB.breeder, pieces: splitLineage(parentB.name), flags: detectFlags(parentB) },
    ],
    matchedGoals,
  };
}

export function generateCrossNames(
  parentA: Seed,
  parentB: Seed,
  salt = 0,
  goals: TraitGoal[] = [],
): CrossName[] {
  const a = buildProfile(parentA);
  const b = buildProfile(parentB);
  const rnd = mulberry32(hashString(parentA.id + "|" + parentB.id + goals.join("|")) + salt * 8675309);
  const aName = shortName(parentA.name);
  const bName = shortName(parentB.name);
  const aPool = goalPool(a.pool, goals);
  const bPool = goalPool(b.pool, goals);
  const allFlair = unique([...a.flair, ...b.flair]);
  const terpLine = unique([...a.terps, ...b.terps]).length
    ? `Expected notes: ${unique([...a.terps, ...b.terps]).slice(0, 3).join(" + ")}.`
    : "";

  const strategies: (() => CrossName | null)[] = [
    () => {
      const wA = pick(aPool, rnd);
      const wB = pick(bPool, rnd);
      if (wA === wB) return null;
      return { name: `${wA} ${wB}`, category: "Commercial", note: `Pairs ${wA} from ${aName} with ${wB} from ${bName}. ${terpLine}`.trim() };
    },
    () => {
      const wA = pick(aPool, rnd);
      const wB = pick(bPool, rnd);
      if (wA === wB) return null;
      return { name: `${wB} ${wA}`, category: "Commercial", note: `A clean seedbank-style name leading with ${wB.toLowerCase()}, backed by ${wA.toLowerCase()}.` };
    },
    () => {
      const wA = pick(aPool, rnd);
      const wB = pick(bPool, rnd);
      const dessert = pick(DESSERTS, rnd);
      if (wA === wB) return null;
      return { name: `${wA} ${wB} ${dessert}`, category: "Commercial", note: `Dessert branding for ${aName} × ${bName}, with a ${dessert.toLowerCase()} finish.` };
    },
    () => {
      const terpOptions = unique([...a.terpenes, ...b.terpenes]);
      if (terpOptions.length === 0) return null;
      const terp = pick(terpOptions, rnd);
      const w = pick(rnd() > 0.5 ? aPool : bPool, rnd);
      return { name: `${TERPENES[terp].name} ${w}`, category: "Terpene-Inspired", note: `Built around ${TERPENES[terp].name}: ${TERPENES[terp].aroma}.` };
    },
    () => {
      const w = pick(rnd() > 0.5 ? aPool : bPool, rnd);
      const effect = pick(EFFECTS, rnd);
      return { name: `${w} ${effect}`, category: "Terpene-Inspired", note: `Highlights the ${w.toLowerCase()} side and gives it a strong keeper-name finish.` };
    },
    () => {
      if (allFlair.length === 0) return null;
      const flair = pick(allFlair, rnd);
      const w = pick(rnd() > 0.5 ? aPool : bPool, rnd);
      if (flair === w) return null;
      return { name: `${flair} ${w}`, category: "Breeder Tribute", note: `A breeder-aware name using ${flair} as the tribute hook.` };
    },
    () => {
      if (allFlair.length === 0) return null;
      const wA = pick(aPool, rnd);
      const wB = pick(bPool, rnd);
      const flair = pick(allFlair, rnd);
      const pieces = unique([flair, wA, wB]).slice(0, 3);
      if (pieces.length < 2) return null;
      return { name: pieces.join(" "), category: "Breeder Tribute", note: `Nods to breeder style while keeping the parent flavors visible.` };
    },
    () => {
      const weird = pick(["Octane", "Static", "Phantom", "Ritual", "Relic", "Artifact", "Oracle", "Gremlin"], rnd);
      const w = pick(rnd() > 0.5 ? aPool : bPool, rnd);
      return { name: `${w} ${weird}`, category: "Keeper Weirdos", note: `A less commercial keeper tag for the oddball pheno hunt.` };
    },
    () => {
      const words = unique([pick(aPool, rnd), pick(bPool, rnd), pick(rnd() > 0.5 ? aPool : bPool, rnd)]).slice(0, 3);
      if (words.length < 2) return null;
      return { name: words.join(" "), category: "Keeper Weirdos", note: `Stacks standout parent traits into a more unusual keeper-style name.` };
    },
  ];

  const seen = new Set<string>();
  const results: CrossName[] = [];
  const rareRuneScapeRoll = Math.floor(rnd() * 64) === 0;

  if (rareRuneScapeRoll) {
    const reference = pick(RUNESCAPE_REFERENCES, rnd);
    const parentWord = pick(rnd() > 0.5 ? aPool : bPool, rnd);
    const name = `${reference} ${parentWord}`.replace(/\s+/g, " ").trim();
    seen.add(name.toLowerCase());
    results.push({
      name,
      category: "Keeper Weirdos",
      note: "1/64 rare drop: a RuneScape easter egg rolled into this name set.",
    });
  }

  let attempts = 0;
  while (results.length < 10 && attempts < 220) {
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

export function groupNamesByCategory(names: CrossName[]) {
  const categories: NameCategory[] = ["Commercial", "Terpene-Inspired", "Breeder Tribute", "Keeper Weirdos"];
  return categories
    .map((category) => ({ category, names: names.filter((n) => n.category === category) }))
    .filter((group) => group.names.length > 0);
}

export function copyReportText(parentA: Seed, parentB: Seed, report: CrossReport, names: CrossName[]) {
  return [
    `${parentA.name} × ${parentB.name}`,
    `Cross potential: ${report.scores.overall}/100`,
    report.profile.summary,
    `Flavors: ${report.profile.flavors.join(", ") || "unknown"}`,
    `Terpenes: ${report.profile.terpenes.map((t) => `${t.info.name} ${t.share}%`).join(", ") || "unknown"}`,
    `Size/yield estimates: ${report.growthEstimates.map((g) => `${g.wattage}: ${g.heightCm.min}-${g.heightCm.max}cm H × ${g.widthCm.min}-${g.widthCm.max}cm W · ${g.yieldG.min}-${g.yieldG.max}g dry`).join("; ")}`,
    `Breeder note: ${report.breederNote}`,
    "Names:",
    ...names.map((n) => `- ${n.name} (${n.category})`),
  ].join("\n");
}

export function crossKey(parentA: Seed, parentB: Seed) {
  return [parentA.id, parentB.id].sort().join("::");
}

export function getSeedById(id: string, seeds: Seed[]) {
  return seeds.find((seed) => seed.id === id) ?? null;
}
