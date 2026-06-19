import { useMemo, useState } from "react";
import { ChevronDown, PackagePlus, RotateCcw, Search, ShieldAlert, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import StrainCard from "@/components/StrainCard";
import PreservationShortlist from "@/components/PreservationShortlist";
import { useVault } from "@/hooks/useVaultStore";
import { VAULT_TOTALS, type SeedType } from "@/data/seeds";
import { SEED_TYPES, typeShort, typeStyles } from "@/lib/seedDisplay";
import { getKeeperPriority } from "@/lib/keeper";
import {
  SORT_OPTIONS,
  seedCartMetric,
  seedHeightMetric,
  seedLiveRosinMetric,
  seedPotencyMetric,
  seedRosinMetric,
  seedSativaMetric,
  seedYieldMetric,
  stretchValue,
  type SortMode,
} from "@/lib/vaultMetrics";
import { estimateAdvancedMetrics } from "@/lib/crossName";

const VaultBreakdown = () => {
  const { vaultSeeds, getSeedCount, seedWithCount, resetSeedCounts } = useVault();

  const [vaultSearch, setVaultSearch] = useState("");
  const [activeTypes, setActiveTypes] = useState<SeedType[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>("count");
  const [showFilters, setShowFilters] = useState(false);
  const [minThc, setMinThc] = useState(0);
  const [maxFlowering, setMaxFlowering] = useState(20);
  const [minResin, setMinResin] = useState(1);
  const [minTerpene, setMinTerpene] = useState(1);
  const [openBreeders, setOpenBreeders] = useState<Record<string, boolean>>({});

  const toggleTypeFilter = (type: SeedType) =>
    setActiveTypes((current) => (current.includes(type) ? current.filter((item) => item !== type) : [...current, type]));

  const toggleBreeder = (breeder: string) =>
    setOpenBreeders((current) => ({ ...current, [breeder]: !current[breeder] }));

  const filtersActive = minThc > 0 || maxFlowering < 20 || minResin > 1 || minTerpene > 1;

  const resetMetricFilters = () => {
    setMinThc(0);
    setMaxFlowering(20);
    setMinResin(1);
    setMinTerpene(1);
  };

  const breederTypeTotals = useMemo(() => {
    const search = vaultSearch.trim().toLowerCase();
    return VAULT_TOTALS.map((group) => {
      const allSeeds = vaultSeeds.filter((seed) => seed.breeder === group.breeder);
      const strains = allSeeds
        .filter((seed) => {
          const matchesSearch = !search || `${seed.name} ${seed.breeder}`.toLowerCase().includes(search);
          const matchesType = activeTypes.length === 0 || activeTypes.includes(seed.type);
          const adv = estimateAdvancedMetrics(seed);
          const matchesThc = seedPotencyMetric(seed) >= minThc;
          const matchesFlowering = adv.floweringWeeks <= maxFlowering;
          const matchesResin = adv.resinDensity >= minResin;
          const matchesTerpene = adv.terpeneIntensity >= minTerpene;
          return matchesSearch && matchesType && matchesThc && matchesFlowering && matchesResin && matchesTerpene;
        })
        .sort((a, b) => {
          const advA = estimateAdvancedMetrics(a);
          const advB = estimateAdvancedMetrics(b);
          const priorityA = getKeeperPriority(seedWithCount(a)).score;
          const priorityB = getKeeperPriority(seedWithCount(b)).score;

          switch (sortMode) {
            case "yield-desc":
              return seedYieldMetric(b) - seedYieldMetric(a);
            case "yield-asc":
              return seedYieldMetric(a) - seedYieldMetric(b);
            case "height-desc":
              return seedHeightMetric(b) - seedHeightMetric(a);
            case "height-asc":
              return seedHeightMetric(a) - seedHeightMetric(b);
            case "sativa-desc":
              return seedSativaMetric(b) - seedSativaMetric(a);
            case "indica-desc":
              return seedSativaMetric(a) - seedSativaMetric(b);
            case "potency-desc":
              return seedPotencyMetric(b) - seedPotencyMetric(a);
            case "flowering-asc":
              return advA.floweringWeeks - advB.floweringWeeks;
            case "flowering-desc":
              return advB.floweringWeeks - advA.floweringWeeks;
            case "terpene-desc":
              return advB.terpeneIntensity - advA.terpeneIntensity;
            case "resin-desc":
              return advB.resinDensity - advA.resinDensity;
            case "ease-desc":
              return advB.easeOfGrow - advA.easeOfGrow;
            case "stretch-desc":
              return stretchValue(advB.stretchFactor) - stretchValue(advA.stretchFactor);
            case "stress-desc":
              return advB.stressResistance - advA.stressResistance;
            case "mold-desc":
              return advB.moldResilience - advA.moldResilience;
            case "rosin-desc":
              return seedRosinMetric(b) - seedRosinMetric(a);
            case "liverosin-desc":
              return seedLiveRosinMetric(b) - seedLiveRosinMetric(a);
            case "cart-desc":
              return seedCartMetric(b) - seedCartMetric(a);
            case "keeper-desc":
              return priorityB - priorityA;
            case "name":
              return a.name.localeCompare(b.name);
            case "count":
            default:
              return getSeedCount(b) - getSeedCount(a);
          }
        });
      const byType = SEED_TYPES.map((type) => ({
        type,
        total: strains.filter((seed) => seed.type === type).reduce((sum, seed) => sum + getSeedCount(seed), 0),
      })).filter((entry) => entry.total > 0);
      const total = strains.reduce((sum, seed) => sum + getSeedCount(seed), 0);
      return { ...group, total, byType, strains };
    }).filter((group) => group.strains.length > 0);
  }, [activeTypes, vaultSearch, vaultSeeds, sortMode, minThc, maxFlowering, minResin, minTerpene, getSeedCount, seedWithCount]);

  const visibleStrainCount = breederTypeTotals.reduce((sum, group) => sum + group.strains.length, 0);

  return (
    <section className="mt-8 rounded-[2rem] border-2 border-border bg-card p-5 shadow-sm sm:p-7">
      <div className="mb-5 flex items-start gap-3">
        <PackagePlus className="mt-1 h-5 w-5 text-primary" />
        <div>
          <h1 className="font-display text-3xl font-black tracking-tight">Revised vault breakdown</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every strain now carries a visible type tag: <b>FEM</b>, <b>REG</b>, <b>AUTO</b>, or <b>PHOTO ?</b>. Tap any strain to open its full detail page. Burn Pile remains separated from preservation pressure.
          </p>
        </div>
      </div>

      <div className="mb-5 rounded-3xl border border-border bg-background p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={vaultSearch}
              onChange={(event) => setVaultSearch(event.target.value)}
              placeholder="Search strains or breeders…"
              className="h-11 rounded-2xl pl-9 font-semibold"
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" variant="outline" className="rounded-2xl border-2 font-bold" onClick={() => setShowFilters((value) => !value)}>
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters{filtersActive ? " •" : ""}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl border-2 font-bold"
              onClick={() => {
                setVaultSearch("");
                setActiveTypes([]);
                resetMetricFilters();
              }}
            >
              Clear filters
            </Button>
            <Button type="button" variant="outline" className="rounded-2xl border-2 font-bold" onClick={resetSeedCounts}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset counts
            </Button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {SEED_TYPES.map((type) => {
            const active = activeTypes.includes(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleTypeFilter(type)}
                className={`rounded-full border px-3 py-1 text-xs font-black transition ${
                  active ? typeStyles[type] : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {typeShort[type]}
              </button>
            );
          })}
          <span className="ml-auto text-xs font-bold text-muted-foreground">Showing {visibleStrainCount} strains</span>
        </div>

        {showFilters && (
          <div className="mt-3 grid gap-4 border-t border-border/60 pt-3 sm:grid-cols-2">
            <div>
              <div className="mb-1 flex justify-between text-xs font-bold">
                <span>Min THC</span>
                <span>{minThc}%</span>
              </div>
              <input type="range" min={0} max={30} value={minThc} onChange={(event) => setMinThc(Number(event.target.value))} className="w-full accent-primary" />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs font-bold">
                <span>Max flowering</span>
                <span>{maxFlowering} wks</span>
              </div>
              <input type="range" min={6} max={20} value={maxFlowering} onChange={(event) => setMaxFlowering(Number(event.target.value))} className="w-full accent-primary" />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs font-bold">
                <span>Min resin density</span>
                <span>{minResin}★</span>
              </div>
              <input type="range" min={1} max={5} value={minResin} onChange={(event) => setMinResin(Number(event.target.value))} className="w-full accent-primary" />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs font-bold">
                <span>Min terpene intensity</span>
                <span>{minTerpene}★</span>
              </div>
              <input type="range" min={1} max={5} value={minTerpene} onChange={(event) => setMinTerpene(Number(event.target.value))} className="w-full accent-primary" />
            </div>
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
          <span className="text-xs font-black uppercase tracking-wide text-muted-foreground">Sort:</span>
          {SORT_OPTIONS.map((option) => {
            const active = sortMode === option.mode;
            return (
              <button
                key={option.mode}
                type="button"
                onClick={() => setSortMode(option.mode)}
                className={`inline-flex items-center gap-1 rounded-full border-2 px-3 py-1 text-xs font-bold transition ${
                  active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {breederTypeTotals.map((group) => {
          const isOpen = openBreeders[group.breeder] ?? false;
          return (
            <Collapsible
              key={group.breeder}
              open={isOpen}
              onOpenChange={() => toggleBreeder(group.breeder)}
              className="rounded-3xl border border-border bg-background p-4"
            >
              <CollapsibleTrigger className="group flex w-full items-center justify-between gap-3 text-left">
                <div className="min-w-0">
                  <h2 className="font-display text-lg font-bold leading-tight">{group.breeder}</h2>
                  <p className="text-xs font-semibold text-muted-foreground">
                    {group.strains.length} {group.strains.length === 1 ? "strain" : "strains"} · tap to {isOpen ? "hide" : "view"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-black text-muted-foreground">{group.total} seeds</span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </div>
              </CollapsibleTrigger>

              <div className="mt-3 flex flex-wrap gap-2">
                {group.byType.map((entry) => (
                  <span key={entry.type} className={`rounded-full border px-3 py-1 text-xs font-black ${typeStyles[entry.type]}`}>
                    {typeShort[entry.type]}: {entry.total}
                  </span>
                ))}
              </div>

              <CollapsibleContent className="mt-3 space-y-2 border-t border-border/70 pt-3">
                {group.strains.map((seed) => (
                  <StrainCard key={seed.id} seed={seed} />
                ))}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>

      <div className="mt-5 rounded-3xl bg-orange-50 p-4 text-orange-800 dark:bg-orange-950/40 dark:text-orange-200">
        <div className="flex items-start gap-2">
          <ShieldAlert className="mt-0.5 h-5 w-5" />
          <div>
            <p className="font-bold">Burn Pile rule</p>
            <p className="mt-1 text-sm leading-relaxed">
              Burn Pile seeds are one-and-only runs. They can be grown, failed, tossed, smoked/tested, or closed out — but they are white-label / potentially mislabelled stock, so they are not breeding, pollen, seed-making, or preservation candidates.
            </p>
          </div>
        </div>
      </div>

      <PreservationShortlist />
    </section>
  );
};

export default VaultBreakdown;