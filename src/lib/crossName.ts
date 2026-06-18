// Creative cannabis cross-name generator.
// Given two parent strain names, suggest fun, plausible offspring names.

const SUFFIX_JUNK =
  /^(F\d+|BX\d+|R\d+|S\d+|V\d+|RBX|RF\d+|MCV\d+|GPP|ABC|BX|Auto|Cross|#\d+|\d+)$/i;

const STOPWORDS = new Set(["the", "of", "de", "and", "&", "x", "×"]);

// Flavor / vibe word banks used to spice up suggestions.
const VIBES = [
  "Frosted",
  "Royal",
  "Midnight",
  "Cosmic",
  "Electric",
  "Velvet",
  "Golden",
  "Sticky",
  "Dank",
  "Sunset",
  "Frozen",
  "Wild",
];

const NOUNS = [
  "Punch",
  "Crush",
  "Cake",
  "Funk",
  "Haze",
  "Glue",
  "Sherbet",
  "Dream",
  "Storm",
  "Candy",
  "Sauce",
  "Nectar",
  "Frost",
  "Breath",
];

// A tiny deterministic PRNG so a given seed produces repeatable results,
// but a new seed (regenerate) shuffles everything.
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
  if (!w) return w;
  return w.charAt(0).toUpperCase() + w.slice(1);
}

// Pull the meaningful words out of a strain name.
function significantWords(name: string): string[] {
  return name
    .replace(/\([^)]*\)/g, " ") // drop parenthetical notes
    .split(/[\s×]+/)
    .map((w) => w.replace(/[#.,]/g, "").trim())
    .filter((w) => w.length > 1 && !SUFFIX_JUNK.test(w) && !STOPWORDS.has(w.toLowerCase()));
}

// Blend two words into a portmanteau, e.g. Cherry + Diesel -> Chersel.
function portmanteau(a: string, b: string): string {
  const aLow = a.toLowerCase();
  const bLow = b.toLowerCase();
  const aCut = Math.max(2, Math.ceil(aLow.length / 2));
  // find a vowel start in the back half of b for a smoother join
  let bCut = Math.floor(bLow.length / 2);
  for (let i = 1; i < bLow.length; i++) {
    if ("aeiou".includes(bLow[i])) {
      bCut = i;
      break;
    }
  }
  const blend = aLow.slice(0, aCut) + bLow.slice(bCut);
  return capitalize(blend);
}

function pick<T>(arr: T[], rnd: () => number): T {
  return arr[Math.floor(rnd() * arr.length)];
}

export function generateCrossNames(
  parentA: string,
  parentB: string,
  salt = 0,
): string[] {
  const wordsA = significantWords(parentA);
  const wordsB = significantWords(parentB);

  if (wordsA.length === 0 || wordsB.length === 0) return [];

  const rnd = mulberry32(hashString(parentA + "|" + parentB) + salt * 8675309);
  const results: string[] = [];

  const aFirst = wordsA[0];
  const aLast = wordsA[wordsA.length - 1];
  const bFirst = wordsB[0];
  const bLast = wordsB[wordsB.length - 1];

  const strategies: (() => string)[] = [
    // Front of A + back of B
    () => `${aFirst} ${bLast}`,
    // Back of A + front of B
    () => `${aLast} ${bFirst}`,
    // Portmanteau of two notable words
    () => portmanteau(pick(wordsA, rnd), pick(wordsB, rnd)),
    // Vibe + word from B
    () => `${pick(VIBES, rnd)} ${pick(wordsB, rnd)}`,
    // Word from A + noun
    () => `${pick(wordsA, rnd)} ${pick(NOUNS, rnd)}`,
    // Word A + Word B + noun
    () => `${pick(wordsA, rnd)} ${pick(wordsB, rnd)} ${pick(NOUNS, rnd)}`,
    // Vibe + portmanteau
    () => `${pick(VIBES, rnd)} ${portmanteau(pick(wordsA, rnd), pick(wordsB, rnd))}`,
    // Two-word mashup
    () => `${pick(wordsB, rnd)} ${pick(wordsA, rnd)}`,
  ];

  const seen = new Set<string>();
  let attempts = 0;
  while (results.length < 6 && attempts < 60) {
    attempts++;
    const name = pick(strategies, rnd)().replace(/\s+/g, " ").trim();
    const key = name.toLowerCase();
    if (!seen.has(key) && name.length > 2) {
      seen.add(key);
      results.push(name);
    }
  }

  return results;
}
