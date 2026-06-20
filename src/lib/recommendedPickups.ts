// Recommends which Brotanical Gardens seeds to pick up next, scored against the
// gaps and goals in the user's current vault.

import type { Seed } from "@/data/seeds";
import type { BrotanicalItem } from "@/data/brotanical";
import { getSingleSeedProfile, TRAIT_GOALS, type TraitGoal } from "@/lib/crossName";
import { getKeeperPriority } from "@/lib/keeper";

export type PickupRecommendation = {
  item: BrotanicalItem;
  score: number;
  reasons: string[];
};

type VaultProfile = {
  breeders: Set<string>;
  goalCoverage: Record<TraitGoal, number>;
  hasRegular: boolean;
  hasAuto: boolean;
};

const buildVaultProfile = (seeds: Seed[]): VaultProfile => {
  const breeders = new Set<string>();
  const goalCoverage = Object.fromEntries(TRAIT_GOALS.map((goal) => [goal, 0])) as Record<TraitGoal, number>;
  let hasRegular = false;
  let hasAuto = false;

  for (const seed of seeds) {
    if (seed.breeder === "Burn Pile") continue;
    breeders.add(seed.breeder);
    if (seed.type === "Regular") hasRegular = true;
    if (seed.type === "Autoflower") hasAuto = true;
    for (const goal of getSingleSeedProfile(seed).goals) {
      goalCoverage[goal] += 1;
    }
  }

  return { breeders, goalCoverage, hasRegular, hasAuto };
};

export function recommendPickups(
  catalog: BrotanicalItem[],
  vaultSeeds: Seed[],
  goals: TraitGoal[] = [],
  limit = 6,
): PickupRecommendation[] {
  const profile = buildVaultProfile(vaultSeeds);

  const recommendations = catalog.map((item) => {
    const reasons: string[] = [];
    let score = 20; // base desirability

    // Breeder diversity — favour breeders not already in the vault.
    if (!profile.breeders.has(item.breeder)) {
      score += 22;
      reasons.push(`New breeder for your vault: ${item.breeder}`);
    } else {
      score += 4;
    }

    // Selected goals are the strongest signal.
    const selectedHits = item.traits.filter((trait) => goals.includes(trait));
    if (goals.length && selectedHits.length) {
      score += selectedHits.length * 26;
      reasons.push(`Matches your goals: ${selectedHits.join(", ")}`);
    }

    // Fill trait gaps — reward traits that are thin in the current vault.
    for (const trait of item.traits) {
      const coverage = profile.goalCoverage[trait] ?? 0;
      if (coverage <= 2) {
        score += 14 - coverage * 4;
        if (!selectedHits.includes(trait)) {
          reasons.push(`Fills a thin trait: ${trait} (${coverage} in vault)`);
        }
      }
    }

    // Structural gaps in the breeding program.
    if (item.type === "Regular" && !profile.hasRegular) {
      score += 18;
      reasons.push("Adds regular/true-male stock for pollen work");
    }
    if (item.type === "Autoflower" && !profile.hasAuto) {
      score += 10;
      reasons.push("Adds autoflower genetics to the vault");
    }

    // Hype / proven lineage cue using the keeper engine.
    const keeper = getKeeperPriority({
      id: item.id,
      name: item.name,
      breeder: item.breeder,
      type: item.type,
      count: 10,
    });
    if (keeper.reasons.length) {
      score += 8;
      reasons.push(`Sought-after lineage: ${keeper.reasons[0]}`);
    }

    return {
      item,
      score: Math.round(score),
      reasons: reasons.slice(0, 4),
    };
  });

  return recommendations.sort((a, b) => b.score - a.score).slice(0, limit);
}
