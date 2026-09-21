// Turns Vault Lab's structured data into compact text the model can read.
// Everything here is derived from the existing estimation engines so the AI
// stays grounded in the user's actual vault rather than inventing facts.

import type { Seed } from "@/data/seeds";
import {
  estimateAdvancedMetrics,
  estimateCannabinoids,
  estimateLineageSplit,
  estimateSeedGrowth,
  getCrossProfile,
  getSingleSeedProfile,
  type TraitGoal,
} from "@/lib/crossName";
import { getKeeperPriority } from "@/lib/keeper";

export const SYSTEM_PROMPT =
  "You are the in-app assistant for CrossLab Seed Vault, the personal, non-commercial Manning Madness archive. " +
  "Only discuss cannabis genetics, terpenes, preservation, breeding, extraction, and cultivation. If asked about anything " +
  "off-topic, politely steer back to the vault. Treat the supplied physical vault data as ground truth and never invent " +
  "breeders, lineages, sex, counts, provenance, stock status, order status, wash yield, or plant performance. Keep physical, " +
  "incoming-known, incoming-TBD, proposed, and hypothetical states separate; unknown and TBD counts contribute zero. " +
  "The 21 September physical roster is a 1,961-seed working ledger, provisional pending recount of the 71-seed Pixie65 outbound record. " +
  "Preserve at least five seeds per cultivar when proposing gifts unless a named exception is explicitly approved; favor provenance, terpene identity, effect, resin quality, " +
  "clone-worthiness, and useful breeding traits before headline THC. All potency, yield, and trait figures are rough "
  "name/lineage-based estimates for planning, not lab results. A cultivar is not a proven washer until a cloned individual " +
  "has been harvested and test-washed. Label uncertainty clearly, give the conclusion first, and stay practical and concise.";

// A single grounded fact sheet for one strain.
export function seedFactSheet(seed: Seed, count: number): string {
  const profile = getSingleSeedProfile(seed, count);
  const adv = estimateAdvancedMetrics(seed);
  const cann = estimateCannabinoids(seed);
  const split = estimateLineageSplit(seed);
  const keeper = getKeeperPriority({ ...seed, count });
  const growth = estimateSeedGrowth(seed);
  const topTerps = profile.terpenes.map((t) => `${t.info.name} ${t.share}%`).join(", ") || "unclear from name";
  const growthLine = growth
    .map((g) => `${g.wattage} (${g.gear}): ${g.yieldG.min}-${g.yieldG.max}g dry, ${g.heightCm.min}-${g.heightCm.max}cm tall`)
    .join("; ");

  return [
    `Strain: ${seed.name}`,
    `Breeder: ${seed.breeder}`,
    `Seed type: ${seed.type}`,
    `Inventory: ${count} seeds`,
    `Estimated lean: ${split.sativa}% sativa / ${split.indica}% indica`,
    `Estimated THC: ${cann.thc.min}-${cann.thc.max}% (CBD ${cann.cbd.min}-${cann.cbd.max}%)`,
    `Flowering: ~${adv.floweringWeeks} weeks`,
    `Stretch factor: ${adv.stretchFactor}`,
    `Terpene intensity: ${adv.terpeneIntensity}/5, Resin density: ${adv.resinDensity}/5`,
    `Ease of grow: ${adv.easeOfGrow}/5, Stress resistance: ${adv.stressResistance}/5, Mold resilience: ${adv.moldResilience}/5`,
    `Likely terpenes: ${topTerps}`,
    `Flavor cues: ${profile.flavors.join(", ") || "hunt-first / unclear"}`,
    `Genetic flags: ${profile.flags.join(", ") || "none detected"}`,
    `Keeper priority: ${keeper.level}`,
    `Single-plant yield by setup: ${growthLine}`,
  ].join("\n");
}

// One compact line per strain for the whole-vault chat roster.
function seedRosterLine(seed: Seed, count: number): string {
  const adv = estimateAdvancedMetrics(seed);
  const cann = estimateCannabinoids(seed);
  const split = estimateLineageSplit(seed);
  const keeper = getKeeperPriority({ ...seed, count });
  return (
    `- ${seed.name} [${seed.breeder}] · ${seed.type} · ${count} seeds · ` +
    `${cann.thc.min}-${cann.thc.max}% THC · ~${adv.floweringWeeks}wk flower · ` +
    `${split.sativa}/${split.indica} sat/ind · terp ${adv.terpeneIntensity}/5 · resin ${adv.resinDensity}/5 · ` +
    `ease ${adv.easeOfGrow}/5 · mold ${adv.moldResilience}/5 · keeper ${keeper.level}`
  );
}

export function buildVaultRoster(seeds: Seed[], getCount: (seed: Seed) => number): string {
  const active = seeds.filter((seed) => getCount(seed) > 0);
  const main = active.filter((seed) => !seed.breeder.includes("Burn Pile"));
  const burn = active.filter((seed) => seed.breeder.includes("Burn Pile"));

  const lines: string[] = [];
  lines.push(`MAIN VAULT (${main.length} strains):`);
  for (const seed of main) lines.push(seedRosterLine(seed, getCount(seed)));

  if (burn.length) {
    lines.push("");
    lines.push(
      `BURN PILE (${burn.length} strains) — one-and-only smoke/test runs, NOT for breeding/preservation:`,
    );
    for (const seed of burn) lines.push(seedRosterLine(seed, getCount(seed)));
  }

  return lines.join("\n");
}

// Context for the AI cross-name generator.
export function buildCrossNameContext(parentA: Seed, parentB: Seed, goals: TraitGoal[]): string {
  const profile = getCrossProfile(parentA, parentB);
  const a = getSingleSeedProfile(parentA);
  const b = getSingleSeedProfile(parentB);
  const terps = profile.terpenes.map((t) => `${t.info.name} (${t.info.aroma})`).join(", ") || "mixed";

  return [
    `Parent A: ${parentA.name} — ${parentA.breeder} (${parentA.type})`,
    `  flavor cues: ${a.flavors.join(", ") || "unclear"}`,
    `Parent B: ${parentB.name} — ${parentB.breeder} (${parentB.type})`,
    `  flavor cues: ${b.flavors.join(", ") || "unclear"}`,
    `Predicted cross flavors: ${profile.flavors.join(", ") || "mixed / hunt-first"}`,
    `Dominant terpenes: ${terps}`,
    `Profile summary: ${profile.summary}`,
    `Breeding goals to lean into: ${goals.length ? goals.join(", ") : "none specified — keep it broadly appealing"}`,
  ].join("\n");
}
