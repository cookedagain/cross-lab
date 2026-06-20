// Recommends which Brotanical Gardens seeds to pick up next, scored against the
// gaps and goals in the user's current vault.

import type { Seed } from "@/data/seeds";
import type { BrotanicalItem } from "@/data/brotanical";
import { getSingleSeedProfile, TRAIT_GOALS, type TraitGoal } from "@/lib/crossName";
import { getKeeperPriority } from "@/lib/keeper";

export type PickupRecommendation = {
  item: BrotanicalItem;
  score: number;
  contribution: string;
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
  limit = 20,
): PickupRecommendation[] {
  const profile = buildVaultProfile(vaultSeeds);

  const recommendations = catalog.map((item) => {
    const reasons: string[] = [];
    const broughtTraits: TraitGoal[] = [];
    let score = 20; // base desirability

    // Breeder diversity — favour breeders not already in the vault.
    const newBreeder = !profile.breeders.has(item.breeder);
    if (newBreeder) {
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
      broughtTraits.push(...selectedHits);
    }

    // Fill trait gaps — reward traits that are thin in the current vault.
    for (const trait of item.traits) {
      const coverage = profile.goalCoverage[trait] ?? 0;
      if (coverage <= 2) {
        score += 14 - coverage * 4;
        broughtTraits.push(trait);
        if (!selectedHits.includes(trait)) {
          reasons.push(`Fills a thin trait: ${trait} (${coverage} in vault)`);
        }
      }
    }

    // Structural gaps in the breeding program.
    const structuralAdds: string[] = [];
    if (item.type === "Regular" && !profile.hasRegular) {
      score += 18;
      reasons.push("Adds regular/true-male stock for pollen work");
      structuralAdds.push("true-male pollen stock");
    }
    if (item.type === "Autoflower" && !profile.hasAuto) {
      score += 10;
      reasons.push("Adds autoflower genetics to the vault");
      structuralAdds.push("autoflower genetics");
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

    // Plain-language summary of what this pack would add to the vault.
    const uniqueBrought = Array.from(new Set(broughtTraits));
    const traitText =
      uniqueBrought.length > 0
        ? uniqueBrought.join(" + ")
        : item.traits.slice(0, 2).join(" + ");
    const breederText = newBreeder
      ? `${item.breeder} — a breeder you don't own yet`
      : `your existing ${item.breeder} line`;
    let contribution = `Brings ${traitText} genetics via ${breederText}.`;
    if (structuralAdds.length) {
      contribution += ` Also adds ${structuralAdds.join(" and ")}.`;
    }

    return {
      item,
      score: Math.round(score),
      contribution,
      reasons: reasons.slice(0, 4),
    };
  });

  return recommendations.sort((a, b) => b.score - a.score).slice(0, limit);
}
