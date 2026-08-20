"use client";

import React, { useMemo } from "react";
import { Sparkles, Sprout, Flame, HelpCircle } from "lucide-react";
import { useVault } from "@/hooks/useVaultStore";
import { estimateAdvancedMetrics, estimateCannabinoids } from "@/lib/crossName";
import { getSeedRarity } from "@/lib/rarity";
import { TypeBadge } from "@/components/TypeBadge";
import { Link } from "react-router-dom";
import type { Seed } from "@/data/seeds";

type Props = {
  category: "<100W" | "220W" | "500W";
};

export const StationSeedRecommendations = ({ category }: Props) => {
  const { vaultSeeds, getSeedCount, seedWithCount } = useVault();

  const recommendations = useMemo(() => {
    const inStock = vaultSeeds.filter(
      (seed) => !seed.breeder.includes("Burn Pile") && getSeedCount(seed) > 0
    );

    if (inStock.length === 0) return [];

    return inStock
      .map((seed) => {
        const count = getSeedCount(seed);
        const countedSeed = seedWithCount(seed);
        const adv = estimateAdvancedMetrics(seed);
        const cann = estimateCannabinoids(seed);
        const rarity = getSeedRarity(countedSeed);

        let score = 0;
        const reasons: string[] = [];

        if (category === "<100W") {
          // VGrow Smart Box (DWC, micro/solo, compact)
          if (seed.type === "Autoflower") {
            score += 60;
            reasons.push("Autoflower structure is perfect for micro-box height limits");
          }
          if (adv.stretchFactor === "Low") {
            score += 30;
            reasons.push("Low stretch prevents plants from outgrowing the box");
          } else if (adv.stretchFactor === "Medium") {
            score += 15;
            reasons.push("Manageable medium stretch");
          } else {
            score -= 40; // High stretch is tough in a micro box
          }
          if (adv.easeOfGrow >= 4) {
            score += 20;
            reasons.push("High ease of grow suits automated box environments");
          }
          if (adv.floweringWeeks <= 9) {
            score += 15;
            reasons.push("Fast flowering cycle");
          }
        } else if (category === "220W") {
          // AC Infinity 2x2 (2-plant, 220W, coco/soil)
          if (adv.stretchFactor === "Medium" || adv.stretchFactor === "Low") {
            score += 30;
            reasons.push("Compact-to-medium stretch fits 120cm tent height perfectly");
          }
          if (adv.easeOfGrow >= 4) {
            score += 25;
            reasons.push("Forgiving growth profile for hand-fed coco/soil");
          }
          if (seed.type === "Feminized") {
            score += 15;
            reasons.push("Feminized seeds guarantee female plants in a 2-plant setup");
          }
          if (cann.thc.max >= 22) {
            score += 15;
          }
        } else {
          // AC Infinity 4x4 (4-plant, 500W/730W, coco/soil)
          score += 10; // Base
          if (rarity.tier === "Grail" || rarity.tier === "Very Rare") {
            score += 35;
            reasons.push(`Premium ${rarity.tier} genetics deserve the flagship 730W IonFrame light`);
          }
          if (adv.stretchFactor === "High") {
            score += 20;
            reasons.push("Tall stretch can fully express in the 200cm tent height");
          }
          if (cann.thc.max >= 25) {
            score += 20;
            reasons.push("High potency potential");
          }
          if (seed.type === "Regular") {
            score += 15;
            reasons.push("Regular seeds are great for hunting/sexing in a larger 4-plant space");
          }
        }

        return {
          seed,
          score,
          reasons: reasons.slice(0, 2),
          count,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .filter((item) => item.score > 0);
  }, [vaultSeeds, getSeedCount, category, seedWithCount]);

  if (recommendations.length === 0) {
    return (
      <div className="mt-4 rounded-2xl bg-muted/40 p-3 text-xs text-muted-foreground">
        No matching in-stock seeds in your main vault to recommend.
      </div>
    );
  }

  return (
    <div className="mt-4 border-t border-border/60 pt-4">
      <div className="mb-2 flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <p className="text-[10px] font-black uppercase tracking-wide text-primary">
          Recommended seeds to pop
        </p>
      </div>
      <div className="space-y-2">
        {recommendations.map(({ seed, reasons, count }) => (
          <Link
            key={seed.id}
            to={`/strain/${encodeURIComponent(seed.id)}`}
            className="block rounded-2xl border border-border bg-background p-3 transition-colors hover:border-primary"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-foreground">{seed.name}</p>
                <p className="truncate text-[10px] font-semibold text-muted-foreground">
                  {seed.breeder} · {count} seeds left
                </p>
              </div>
              <TypeBadge type={seed.type} />
            </div>
            {reasons.length > 0 && (
              <div className="mt-2 space-y-1">
                {reasons.map((reason, idx) => (
                  <div key={idx} className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                    <span className="h-1 w-1 rounded-full bg-primary shrink-0" />
                    <span className="truncate">{reason}</span>
                  </div>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};