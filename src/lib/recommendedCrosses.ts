// Recommended crosses engine: scans the vault and suggests the strongest
// donor × receiver pairings using the existing cross-report scoring, keeper
// value, breeder diversity, and selected trait goals.

import type { Seed } from "@/data/seeds";
import { crossKey, getCrossReport, type TraitGoal } from "@/lib/crossName";
import { getKeeperPriority } from "@/lib/keeper";

export type CrossRecommendation = {
  key: string;
  parentA: Seed;
  parentB: Seed;
  score: number;
  overall: number;
  matchedGoals: TraitGoal[];
  summary: string;
  reasons: string[];
};

const topByKeeper = (seeds: Seed[], limit: number) =>
  [...seeds]
    .map((seed) => ({ seed, keeper: getKeeperPriority(seed).score }))
    .sort((a, b) => b.keeper - a.keeper)
    .slice(0, limit)
    .map((entry) => entry.seed);

export function recommendCrosses(
  seeds: Seed[],
  goals: TraitGoal[] = [],
  limit = 6,
): CrossRecommendation[] {
  const usable = seeds.filter((seed) => !seed.breeder.includes("Burn Pile") && (seed.count ?? 0) > 0);

  let donors = usable.filter((seed) => seed.type === "Regular");
  const receivers = usable.filter((seed) => seed.type === "Feminized" || seed.type === "Regular");

  // No true-male stock? Fall back to feminized line-combining candidates.
  if (donors.length === 0) {
    donors = usable.filter((seed) => seed.type === "Feminized");
  }

  // Cap the candidate pools so the pairwise scan stays fast.
  const donorPool = topByKeeper(donors, 14);
  const receiverPool = topByKeeper(receivers, 16);

  const seen = new Set<string>();
  const recommendations: CrossRecommendation[] = [];

  for (const donor of donorPool) {
    for (const receiver of receiverPool) {
      if (donor.id === receiver.id) continue;
      const key = crossKey(donor, receiver);
      if (seen.has(key)) continue;
      seen.add(key);

      const report = getCrossReport(donor, receiver, goals);
      const keeperA = getKeeperPriority(donor);
      const keeperB = getKeeperPriority(receiver);

      const goalBonus = goals.length ? report.matchedGoals.length * 12 : 0;
      const diversityBonus = donor.breeder !== receiver.breeder ? 6 : 0;
      const keeperBonus = (keeperA.score + keeperB.score) * 0.15;

      const score = report.scores.overall + goalBonus + diversityBonus + keeperBonus;

      const reasons: string[] = [];
      if (report.matchedGoals.length) {
        reasons.push(`Hits your goals: ${report.matchedGoals.join(", ")}`);
      }
      reasons.push(`Terpene direction: ${report.profile.flavors.slice(0, 3).join(", ") || "mixed / hunt-first"}`);
      if (donor.type === "Regular") {
        reasons.push("True-male donor available for clean pollen work");
      } else {
        reasons.push("Feminized line-combining (reversal/preservation route)");
      }
      if (donor.breeder !== receiver.breeder) {
        reasons.push(`Outcross: ${donor.breeder} × ${receiver.breeder} widens the hunt`);
      }
      if (keeperA.level === "High" || keeperB.level === "High") {
        reasons.push("Includes a high-priority keeper — back up seed before spending it");
      }

      recommendations.push({
        key,
        parentA: donor,
        parentB: receiver,
        score: Math.round(score),
        overall: report.scores.overall,
        matchedGoals: report.matchedGoals,
        summary: report.profile.summary,
        reasons: reasons.slice(0, 4),
      });
    }
  }

  return recommendations.sort((a, b) => b.score - a.score).slice(0, limit);
}
