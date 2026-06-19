import type { Seed } from "@/data/seeds";

export type RarityTier = "Common" | "Uncommon" | "Rare" | "Very Rare" | "Grail";

export const RARITY_TIERS: RarityTier[] = ["Common", "Uncommon", "Rare", "Very Rare", "Grail"];

export const rarityRank = (tier: RarityTier) => RARITY_TIERS.indexOf(tier);

export type SeedRarity = {
  score: number;
  tier: RarityTier;
  tone: string;
  reasons: string[];
};

const BREEDER_RARITY: Record<string, number> = {
  "Binchickens Genetics": 30,
  "Terpyz Mutant Genetics": 28,
  "WolfPack Selections": 26,
  "Happy Valley Genetics": 24,
  "Black Leaf Genetics": 22,
  "Brothers Grimm": 20,
  "Greenspace AU": 18,
  "In-House Genetics": 16,
  "Ethos Genetics": 14,
  "Humboldt Seed Company": 12,
  "Burn Pile": 0,
};

const HYPE_CUES = [
  { match: /end game|grandpa|crescend|cap junkie|permanent marker/i, label: "hyped flagship lineage" },
  { match: /josh d|temple|quattro|deep chunk/i, label: "sought-after cut lineage" },
  { match: /banksia tar|wombat|dog downunder/i, label: "limited regional drop" },
];

export const getSeedRarity = (seed: Seed): SeedRarity => {
  const reasons: string[] = [];

  if (seed.breeder === "Burn Pile") {
    return {
      score: 0,
      tier: "Common",
      tone: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700",
      reasons: ["burn pile · utility stock"],
    };
  }

  const breederScore = BREEDER_RARITY[seed.breeder] ?? 14;
  let score = breederScore;

  if (breederScore >= 24) reasons.push(`${seed.breeder} · limited breeder`);
  else if (breederScore >= 16) reasons.push(`${seed.breeder} · boutique breeder`);

  const count = seed.count ?? 0;
  if (count <= 2) {
    score += 38;
    reasons.push("almost gone (≤2 seeds)");
  } else if (count <= 3) {
    score += 30;
    reasons.push("very low stock");
  } else if (count <= 6) {
    score += 18;
    reasons.push("limited stock");
  } else if (count <= 10) {
    score += 8;
  }

  for (const cue of HYPE_CUES) {
    if (cue.match.test(`${seed.name} ${seed.breeder}`)) {
      score += 12;
      reasons.push(cue.label);
    }
  }

  if (/\bs\d+\b/i.test(seed.name)) {
    score += 8;
    reasons.push("selfed / S-line");
  }

  if (/abc|mutant|quack|feral|croco/i.test(`${seed.name} ${seed.breeder}`)) {
    score += 10;
    reasons.push("rare mutant trait");
  }

  if (seed.type === "Regular") {
    score += 4;
    reasons.push("regular seed");
  }

  score = Math.min(100, score);

  const tier: RarityTier =
    score >= 80 ? "Grail" : score >= 62 ? "Very Rare" : score >= 44 ? "Rare" : score >= 26 ? "Uncommon" : "Common";

  const tone =
    tier === "Grail"
      ? "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 dark:bg-fuchsia-950/40 dark:text-fuchsia-200 dark:border-fuchsia-900"
      : tier === "Very Rare"
        ? "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/40 dark:text-violet-200 dark:border-violet-900"
        : tier === "Rare"
          ? "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-900"
          : tier === "Uncommon"
            ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-900"
            : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700";

  return { score, tier, tone, reasons: reasons.slice(0, 3) };
};
