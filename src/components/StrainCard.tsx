import { Link } from "react-router-dom";
import { HelpCircle, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TypeBadge } from "@/components/TypeBadge";
import ExtractionPanel from "@/components/ExtractionPanel";
import { useVault } from "@/hooks/useVaultStore";
import { getKeeperPriority } from "@/lib/keeper";
import { seedHeightMetric } from "@/lib/vaultMetrics";
import {
  estimateAdvancedMetrics,
  estimateCannabinoids,
  estimateLineageSplit,
  estimateSeedGrowth,
} from "@/lib/crossName";
import type { Seed } from "@/data/seeds";

const Stars = ({ value }: { value: number }) => (
  <span className="font-bold text-foreground">
    {"★".repeat(value)}
    {"☆".repeat(5 - value)}
  </span>
);

const StrainCard = ({ seed }: { seed: Seed }) => {
  const { getSeedCount, updateSeedCount, seedWithCount } = useVault();
  const count = getSeedCount(seed);
  const adv = estimateAdvancedMetrics(seed);
  const split = estimateLineageSplit(seed);
  const cannabinoids = estimateCannabinoids(seed);
  const topHeight = seedHeightMetric(seed);
  const keeperLevel = getKeeperPriority(seedWithCount(seed)).level;

  return (
    <div className="rounded-2xl bg-muted/50 p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Link
            to={`/strain/${encodeURIComponent(seed.id)}`}
            className="truncate text-sm font-semibold hover:text-primary hover:underline"
          >
            {seed.name}
          </Link>
          <p className="mt-1 text-[11px] font-bold text-muted-foreground">Inventory count</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <TypeBadge type={seed.type} />
          <div className="flex items-center rounded-full border border-border bg-card p-1">
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => updateSeedCount(seed, count - 1)}>
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <Input
              type="number"
              min={0}
              value={count}
              onChange={(event) => updateSeedCount(seed, Number(event.target.value))}
              className="h-7 w-14 border-0 bg-transparent p-0 text-center text-xs font-black shadow-none focus-visible:ring-0"
            />
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => updateSeedCount(seed, count + 1)}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-2.5">
        <div className="mb-1.5 flex items-center gap-1.5">
          <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">Est. dry yield · single plant</p>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="text-muted-foreground hover:text-primary">
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs leading-relaxed">
              Estimates are single-plant dry-yield ranges based on name/lineage cues for vigor, structure, auto or mutant traits, and each listed grow environment. They are planning ranges, not guarantees.
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="grid gap-1.5 sm:grid-cols-3">
          {estimateSeedGrowth(seed).map((env) => (
            <div key={env.wattage} className="rounded-xl bg-card px-2.5 py-2">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-black uppercase tracking-wide text-primary">{env.wattage}</span>
                <span className="font-display text-sm font-black leading-none">
                  {env.yieldG.min}–{env.yieldG.max}g
                </span>
              </div>
              <p className="mt-1 text-[10px] font-semibold leading-tight text-muted-foreground">{env.gear}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2.5">
        <p className="mb-1.5 text-[10px] font-black uppercase tracking-wide text-muted-foreground">Est. lean · potency · height</p>
        <div className="mb-2 flex h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-amber-400 dark:bg-amber-500" style={{ width: `${split.sativa}%` }} />
          <div className="h-full bg-violet-500" style={{ width: `${split.indica}%` }} />
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold sm:grid-cols-4">
          <span className="rounded-lg bg-amber-100 px-2 py-1 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">Sativa {split.sativa}%</span>
          <span className="rounded-lg bg-violet-100 px-2 py-1 text-violet-800 dark:bg-violet-950/50 dark:text-violet-200">Indica {split.indica}%</span>
          <span className="rounded-lg bg-emerald-100 px-2 py-1 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">THC {cannabinoids.thc.min}–{cannabinoids.thc.max}%</span>
          <span className="rounded-lg bg-muted px-2 py-1 text-muted-foreground">~{topHeight}cm tall</span>
        </div>
        <p className="mt-1.5 text-[10px] font-semibold leading-tight text-muted-foreground">
          CBD {cannabinoids.cbd.min}–{cannabinoids.cbd.max}% · CBG {cannabinoids.cbg.min}–{cannabinoids.cbg.max}% · CBN {cannabinoids.cbn.min}–{cannabinoids.cbn.max}% · total {cannabinoids.total.min}–{cannabinoids.total.max}%
        </p>
      </div>

      <div className="mt-3 border-t border-border/40 pt-2.5">
        <p className="mb-1.5 text-[10px] font-black uppercase tracking-wide text-muted-foreground">Advanced Breeder Metrics</p>
        <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold sm:grid-cols-4">
          <div className="rounded-lg bg-card p-2">
            <span className="block text-[9px] font-black uppercase text-muted-foreground">Flowering</span>
            <span className="font-bold text-foreground">{adv.floweringWeeks} weeks</span>
          </div>
          <div className="rounded-lg bg-card p-2">
            <span className="block text-[9px] font-black uppercase text-muted-foreground">Terpene Intensity</span>
            <Stars value={adv.terpeneIntensity} />
          </div>
          <div className="rounded-lg bg-card p-2">
            <span className="block text-[9px] font-black uppercase text-muted-foreground">Resin Density</span>
            <Stars value={adv.resinDensity} />
          </div>
          <div className="rounded-lg bg-card p-2">
            <span className="block text-[9px] font-black uppercase text-muted-foreground">Ease of Grow</span>
            <Stars value={adv.easeOfGrow} />
          </div>
          <div className="rounded-lg bg-card p-2">
            <span className="block text-[9px] font-black uppercase text-muted-foreground">Stretch Factor</span>
            <span className="font-bold text-foreground">{adv.stretchFactor}</span>
          </div>
          <div className="rounded-lg bg-card p-2">
            <span className="block text-[9px] font-black uppercase text-muted-foreground">Stress Resistance</span>
            <Stars value={adv.stressResistance} />
          </div>
          <div className="rounded-lg bg-card p-2">
            <span className="block text-[9px] font-black uppercase text-muted-foreground">Mold Resilience</span>
            <Stars value={adv.moldResilience} />
          </div>
          <div className="rounded-lg bg-card p-2">
            <span className="block text-[9px] font-black uppercase text-muted-foreground">Keeper Priority</span>
            <span className="font-bold text-foreground">{keeperLevel}</span>
          </div>
        </div>
      </div>

      <ExtractionPanel seed={seed} />
    </div>
  );
};

export default StrainCard;