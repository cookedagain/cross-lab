import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TypeBadge } from "@/components/TypeBadge";
import { RarityBadge } from "@/components/RarityBadge";
import CannabinoidPanel from "@/components/CannabinoidPanel";
import { useVault } from "@/hooks/useVaultStore";
import {
  estimateAdvancedMetrics,
  estimateLineageSplit,
  estimateSeedGrowth,
  getSingleSeedProfile,
} from "@/lib/crossName";
import { getKeeperPriority } from "@/lib/keeper";
import { getSeedRarity } from "@/lib/rarity";

const Stars = ({ value }: { value: number }) => (
  <span className="font-bold text-foreground">
    {"★".repeat(value)}
    {"☆".repeat(5 - value)}
  </span>
);

const StrainDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { vaultSeeds, getSeedCount, seedWithCount, updateSeedCount } = useVault();

  const seed = useMemo(() => vaultSeeds.find((item) => item.id === id) ?? null, [vaultSeeds, id]);

  if (!seed) {
    return (
      <div className="container max-w-3xl py-16 text-center">
        <p className="font-display text-2xl font-black">Strain not found</p>
        <Link to="/" className="mt-4 inline-block text-primary underline">
          Back to vault
        </Link>
      </div>
    );
  }

  const count = getSeedCount(seed);
  const counted = seedWithCount(seed);
  const profile = getSingleSeedProfile(seed, count);
  const adv = estimateAdvancedMetrics(seed);
  const split = estimateLineageSplit(seed);
  const keeper = getKeeperPriority(counted);
  const growth = estimateSeedGrowth(seed);
  const rarity = getSeedRarity(counted);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container max-w-4xl pb-20 pt-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          Back to vault
        </Link>

        <header className="mt-4 rounded-[2rem] border-2 border-border bg-card p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <TypeBadge type={seed.type} />
                <RarityBadge rarity={rarity} />
                <span className="text-sm font-semibold text-muted-foreground">{seed.breeder}</span>
              </div>
              <h1 className="font-display text-3xl font-black tracking-tight">{seed.name}</h1>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground">Inventory</span>
              <div className="flex items-center rounded-full border border-border bg-background p-1">
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateSeedCount(seed, count - 1)}>
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  min={0}
                  value={count}
                  onChange={(event) => updateSeedCount(seed, Number(event.target.value))}
                  className="h-8 w-16 border-0 bg-transparent p-0 text-center text-sm font-black shadow-none focus-visible:ring-0"
                />
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateSeedCount(seed, count + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className={`rounded-3xl border p-5 lg:col-span-2 ${rarity.tone}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wide">Rarity · {rarity.tier}</p>
                <p className="mt-1 text-sm leading-relaxed">
                  {rarity.reasons.length ? rarity.reasons.join(" · ") : "widely available stock"}
                </p>
              </div>
              <p className="font-display text-3xl font-black">{rarity.score}<span className="text-base">/100</span></p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
              <div className="h-full rounded-full bg-current opacity-70" style={{ width: `${rarity.score}%` }} />
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5">
            <p className="mb-2 text-xs font-black uppercase tracking-wide text-primary">Terpene read</p>
            <p className="text-sm leading-relaxed text-muted-foreground">{profile.terpeneBlurb}</p>
            <div className="mt-4 space-y-2">
              {profile.terpenes.map((terpene) => (
                <div key={terpene.key}>
                  <div className="mb-1 flex justify-between text-xs font-bold">
                    <span>{terpene.info.name}</span>
                    <span>{terpene.share}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full" style={{ width: `${terpene.share}%`, backgroundColor: terpene.info.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5">
            <p className="mb-2 text-xs font-black uppercase tracking-wide text-primary">Lineage & breeder</p>
            <p className="text-sm leading-relaxed text-muted-foreground">{profile.breederBlurb}</p>
            {profile.flags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {profile.flags.map((flag) => (
                  <span key={flag} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-black text-muted-foreground">
                    {flag}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-4">
              <div className="mb-2 flex h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-amber-400 dark:bg-amber-500" style={{ width: `${split.sativa}%` }} />
                <div className="h-full bg-violet-500" style={{ width: `${split.indica}%` }} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
                <span className="rounded-lg bg-amber-100 px-2 py-1 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">Sativa {split.sativa}%</span>
                <span className="rounded-lg bg-violet-100 px-2 py-1 text-violet-800 dark:bg-violet-950/50 dark:text-violet-200">Indica {split.indica}%</span>
              </div>
            </div>
          </div>

          <CannabinoidPanel seed={seed} />

          <div className="rounded-3xl border border-border bg-card p-5 lg:col-span-2">
            <p className="mb-3 text-xs font-black uppercase tracking-wide text-muted-foreground">Est. dry yield · single plant</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {growth.map((env) => (
                <div key={env.wattage} className="rounded-2xl border border-border bg-background p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wide text-primary">{env.wattage}</span>
                    <span className="font-display text-base font-black">{env.yieldG.min}–{env.yieldG.max}g</span>
                  </div>
                  <p className="mt-1 text-[10px] font-semibold text-muted-foreground">{env.gear}</p>
                  <p className="mt-1 text-[10px] font-semibold text-muted-foreground">
                    H {env.heightCm.min}–{env.heightCm.max}cm · W {env.widthCm.min}–{env.widthCm.max}cm
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 lg:col-span-2">
            <p className="mb-3 text-xs font-black uppercase tracking-wide text-muted-foreground">Advanced breeder metrics</p>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold sm:grid-cols-4">
              <div className="rounded-lg bg-background p-2"><span className="block text-[9px] font-black uppercase text-muted-foreground">Flowering</span>{adv.floweringWeeks} weeks</div>
              <div className="rounded-lg bg-background p-2"><span className="block text-[9px] font-black uppercase text-muted-foreground">Terpene</span><Stars value={adv.terpeneIntensity} /></div>
              <div className="rounded-lg bg-background p-2"><span className="block text-[9px] font-black uppercase text-muted-foreground">Resin</span><Stars value={adv.resinDensity} /></div>
              <div className="rounded-lg bg-background p-2"><span className="block text-[9px] font-black uppercase text-muted-foreground">Ease of grow</span><Stars value={adv.easeOfGrow} /></div>
              <div className="rounded-lg bg-background p-2"><span className="block text-[9px] font-black uppercase text-muted-foreground">Stretch</span>{adv.stretchFactor}</div>
              <div className="rounded-lg bg-background p-2"><span className="block text-[9px] font-black uppercase text-muted-foreground">Stress resist</span><Stars value={adv.stressResistance} /></div>
              <div className="rounded-lg bg-background p-2"><span className="block text-[9px] font-black uppercase text-muted-foreground">Mold resist</span><Stars value={adv.moldResilience} /></div>
              <div className="rounded-lg bg-background p-2"><span className="block text-[9px] font-black uppercase text-muted-foreground">Keeper</span>{keeper.level}</div>
            </div>
          </div>

          <div className={`rounded-3xl border p-5 lg:col-span-2 ${keeper.tone}`}>
            <p className="text-xs font-black uppercase tracking-wide">{keeper.level} keep priority</p>
            <p className="mt-1 text-sm leading-relaxed">{keeper.reasons.join(" · ") || "standard working stock"}</p>
            <div className="mt-3 space-y-2 text-sm leading-relaxed">
              <p><span className="font-black">Keep seed:</span> {keeper.seedPlan}</p>
              <p><span className="font-black">Keep pollen:</span> {keeper.pollenPlan}</p>
              <p><span className="font-black">Selfing:</span> {profile.selfing.note}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrainDetail;