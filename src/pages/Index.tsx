import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Dices, FlaskConical, GitBranch, HelpCircle, Leaf, Minus, PackageCheck, PackagePlus, Pill, Plus, RotateCcw, Search, ShieldAlert, SlidersHorizontal, Sparkles, Target, Trash2, Undo2 } from "lucide-react";
import SeedSelect from "@/components/SeedSelect";
import ThemeToggle from "@/components/ThemeToggle";
import VaultBackup from "@/components/VaultBackup";
import VaultAnalytics from "@/components/VaultAnalytics";
import CollapsibleSection from "@/components/CollapsibleSection";
import BestParents from "@/components/BestParents";
import RecommendedCrosses from "@/components/RecommendedCrosses";
import RecommendedPickups from "@/components/RecommendedPickups";
import BreedingLots from "@/components/BreedingLots";
import { TypeBadge } from "@/components/TypeBadge";
import { RarityBadge } from "@/components/RarityBadge";
import StrainName from "@/components/StrainName";
import WebLineageLookup from "@/components/WebLineageLookup";
import GeneticsTree from "@/components/GeneticsTree";
import { buildCrossLineageTree, buildStrainLineageTree, lineageTreeDepth } from "@/lib/lineageTree";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SEEDS, VAULT_TOTALS, type Seed, type SeedType } from "@/data/seeds";
import { clampSeedCount, MULTIPASS_BREEDER, useVault } from "@/hooks/useVaultStore";
import { SEED_TYPES, typeShort, typeStyles } from "@/lib/seedDisplay";
import { getKeeperPriority } from "@/lib/keeper";
import { getSeedRarity } from "@/lib/rarity";
import {
  TRAIT_GOALS,
  estimateCannabinoids,
  estimateLineageSplit,
  estimateSeedGrowth,
  estimateAdvancedMetrics,
  generateCrossNames,
  getCrossReport,
  groupNamesByCategory,
  type TraitGoal,
} from "@/lib/crossName";
import { MadeWithDyad } from "@/components/made-with-dyad";

type SortMode =
  | "count"
  | "rarity-desc"
  | "yield-desc"
  | "yield-asc"
  | "height-desc"
  | "height-asc"
  | "sativa-desc"
  | "indica-desc"
  | "potency-desc"
  | "flowering-asc"
  | "flowering-desc"
  | "terpene-desc"
  | "resin-desc"
  | "ease-desc"
  | "stretch-desc"
  | "stress-desc"
  | "mold-desc"
  | "keeper-desc"
  | "name";

const SORT_OPTIONS: { mode: SortMode; label: string }[] = [
  { mode: "count", label: "Seed count" },
  { mode: "rarity-desc", label: "Rarity high → low" },
  { mode: "yield-desc", label: "Yield high → low" },
  { mode: "yield-asc", label: "Yield low → high" },
  { mode: "height-desc", label: "Height tall → short" },
  { mode: "height-asc", label: "Height short → tall" },
  { mode: "sativa-desc", label: "Sativa % high → low" },
  { mode: "indica-desc", label: "Indica % high → low" },
  { mode: "potency-desc", label: "Potency high → low" },
  { mode: "flowering-asc", label: "Flowering fast → slow" },
  { mode: "flowering-desc", label: "Flowering slow → fast" },
  { mode: "terpene-desc", label: "Terpene intensity" },
  { mode: "resin-desc", label: "Resin density" },
  { mode: "ease-desc", label: "Ease of grow" },
  { mode: "stretch-desc", label: "Stretch factor" },
  { mode: "stress-desc", label: "Stress resistance" },
  { mode: "mold-desc", label: "Mold resilience" },
  { mode: "keeper-desc", label: "Keeper priority" },
  { mode: "name", label: "Name A → Z" },
];

const seedYieldMetric = (seed: Seed) => {
  const estimates = estimateSeedGrowth(seed);
  const top = estimates[estimates.length - 1];
  return top ? top.yieldG.max : 0;
};

const seedHeightMetric = (seed: Seed) => {
  const estimates = estimateSeedGrowth(seed);
  const top = estimates[estimates.length - 1];
  return top ? top.heightCm.max : 0;
};

const seedSativaMetric = (seed: Seed) => estimateLineageSplit(seed).sativa;
const seedPotencyMetric = (seed: Seed) => estimateCannabinoids(seed).thc.max;

const ToggleChip = ({ goal, active, onClick }: { goal: TraitGoal; active: boolean; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full border-2 px-3 py-1.5 text-xs font-bold transition ${
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
    }`}
  >
    {goal}
  </button>
);

type SeedTypeAdvice = {
  pollen: string;
  seed: string;
  watch: string;
};

const SEED_TYPE_ADVICE: Record<SeedType, SeedTypeAdvice> = {
  Regular: {
    pollen: "Best pollen path: regular seed stock is the natural donor pool. Hunt for a strong male expression, then only keep donors that match your structure, vigor, aroma-stem, and lineage goals.",
    seed: "Best seed path: use a selected female as the receiver and a selected male as the donor. Expect mixed-sex offspring, which is useful when you want future pollen options.",
    watch: "Watch-outs: space is needed to sex and sort plants; avoid using a male just because it is male.",
  },
  Feminized: {
    pollen: "Best pollen path: fem stock is usually better treated as the seed parent. Feminized pollen requires reversal work, so keep that as an advanced, legal-compliance-only option rather than the default plan.",
    seed: "Best seed path: use the fem as the receiver when you want to preserve or combine a known female line without hunting males from that pack.",
    watch: "Watch-outs: do not spend low-count fem stock casually; preserve-first logic matters unless it is Burn Pile.",
  },
  Autoflower: {
    pollen: "Best pollen path: auto donors need early planning because the clock is fixed. Auto × auto is the cleanest route when the goal is auto offspring.",
    seed: "Best seed path: use autos when speed and compact plants matter. If crossed to photoperiods, expect the auto trait to need later selection before it is reliable.",
    watch: "Watch-outs: less time to evaluate a plant before breeding decisions; keep notes tight and avoid overcommitting rare auto stock.",
  },
  "Unknown Photo": {
    pollen: "Best pollen path: treat unknown-photo stock as unproven until sex is confirmed. It may become a donor, receiver, or cull depending on what it shows.",
    seed: "Best seed path: use only after the plant proves it has a reason to stay in the project.",
    watch: "Watch-outs: unknown sex means unknown workflow; keep expectations loose until the plant declares itself.",
  },
};

const getPairingAdvice = (parentA: Seed, parentB: Seed) => {
  if (parentA.breeder === "Burn Pile" || parentB.breeder === "Burn Pile") {
    return "Burn Pile involved: one-and-only run only. Do not plan pollen, seed making, preservation, or breeding work from white-label / potentially mislabelled stock.";
  }
  if (parentA.type === "Regular" || parentB.type === "Regular") {
    return "Regular stock gives the most straightforward path to true male pollen and mixed-sex seed lots.";
  }
  if (parentA.type === "Autoflower" || parentB.type === "Autoflower") {
    return "Auto genetics are best used intentionally: auto × auto for auto-focused work, photo × auto only if you are prepared for later selection.";
  }
  if (parentA.type === "Feminized" && parentB.type === "Feminized") {
    return "Fem × fem is best viewed as female-line combining unless you deliberately choose advanced reversal work.";
  }
  return "Confirm sex and project value before deciding which plant should donate pollen or receive seed.";
};

const getPairingTips = (parentA: Seed, parentB: Seed) => {
  const types = new Set([parentA.type, parentB.type]);
  if (parentA.breeder === "Burn Pile" || parentB.breeder === "Burn Pile") {
    return [
      "Treat the Burn Pile plant as a one-and-only run: grow it, evaluate it, consume or discard it, and do not carry it forward.",
      "Do not keep pollen or make seed from it; white-label / potentially mislabelled stock is not reliable enough for your breeding map.",
      "If a non-Burn-Pile parent is valuable, protect that parent and do not spend it on Burn Pile work.",
    ];
  }
  if (types.has("Regular")) {
    return [
      "Use the best selected regular male as the pollen source and a proven female as the receiver; avoid choosing donors on sex alone.",
      "Make a small test lot first when the pollen parent is unproven, then expand only if the offspring justify it.",
      "If both parents are valuable, keep backup seed from each side rather than spending all remaining stock on one cross.",
    ];
  }
  if (types.has("Autoflower")) {
    return [
      "Auto × auto is the cleanest route for auto offspring; photo × auto should be treated as longer-term selection work.",
      "Because autos move fast, decide the goal before pairing: speed, compact size, terpene, or trait preservation.",
      "Keep seed from only the most goal-matching auto expressions, not every quick plant.",
    ];
  }
  if (parentA.type === "Feminized" && parentB.type === "Feminized") {
    return [
      "Choose the stronger keeper as the seed receiver and only use female-derived pollen from a plant worth preserving or combining.",
      "Fem pollen work should stay targeted: one receiver, one clear goal, and careful offspring evaluation.",
      "Avoid using low-count fem lines casually; make backup seed first if the line is rare or highly desired.",
    ];
  }
  return [
    "Confirm sex, quality, and project role before assigning donor or receiver status.",
    "Keep the first seed lot small until the pairing proves it produces worthwhile offspring.",
  ];
};

const Index = () => {
  const {
    seedCounts,
    multipass,
    vaultSeeds,
    getSeedCount,
    seedWithCount,
    updateSeedCount,
    resetSeedCounts,
    addMultipass,
    removeMultipass,
    toggleArrived,
  } = useVault();

  const [parentA, setParentA] = useState<Seed | null>(null);
  const [parentB, setParentB] = useState<Seed | null>(null);
  const [salt, setSalt] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState<TraitGoal[]>([]);
  const [vaultSearch, setVaultSearch] = useState("");
  const [activeTypes, setActiveTypes] = useState<SeedType[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>("count");
  const [showFilters, setShowFilters] = useState(false);
  const [minThc, setMinThc] = useState(0);
  const [maxFlowering, setMaxFlowering] = useState(20);
  const [minResin, setMinResin] = useState(1);
  const [minTerpene, setMinTerpene] = useState(1);

  const [newPassName, setNewPassName] = useState("");
  const [newPassParentA, setNewPassParentA] = useState("");
  const [newPassParentB, setNewPassParentB] = useState("");
  const [newPassType, setNewPassType] = useState<SeedType>("Feminized");
  const [newPassCount, setNewPassCount] = useState(10);

  const handleAddMultipass = () => {
    const name = newPassName.trim();
    if (!name) return;
    addMultipass({
      name,
      parentA: newPassParentA.trim(),
      parentB: newPassParentB.trim(),
      type: newPassType,
      count: clampSeedCount(newPassCount),
    });
    setNewPassName("");
    setNewPassParentA("");
    setNewPassParentB("");
    setNewPassCount(10);
  };

  const incomingPasses = multipass.filter((entry) => !entry.arrived);
  const arrivedPasses = multipass.filter((entry) => entry.arrived);

  const toggleTypeFilter = (type: SeedType) => {
    setActiveTypes((current) => (current.includes(type) ? current.filter((item) => item !== type) : [...current, type]));
  };

  const filtersActive = minThc > 0 || maxFlowering < 20 || minResin > 1 || minTerpene > 1;

  const resetMetricFilters = () => {
    setMinThc(0);
    setMaxFlowering(20);
    setMinResin(1);
    setMinTerpene(1);
  };

  const report = useMemo(() => {
    if (!parentA || !parentB) return null;
    return getCrossReport(parentA, parentB, selectedGoals);
  }, [parentA, parentB, selectedGoals]);

  const names = useMemo(() => {
    if (!parentA || !parentB) return [];
    return generateCrossNames(parentA, parentB, salt, selectedGoals);
  }, [parentA, parentB, salt, selectedGoals]);

  const lineageTree = useMemo(() => {
    if (!parentA || !parentB) return null;
    return buildCrossLineageTree(parentA.name, parentB.name);
  }, [parentA, parentB]);

  const groupedNames = useMemo(() => groupNamesByCategory(names), [names]);

  const vaultTypeTotals = useMemo(
    () =>
      SEED_TYPES.map((type) => ({
        type,
        total: vaultSeeds.filter((seed) => seed.breeder !== "Burn Pile" && seed.type === type).reduce(
          (sum, seed) => sum + getSeedCount(seed),
          0,
        ),
        strains: vaultSeeds.filter((seed) => seed.breeder !== "Burn Pile" && seed.type === type).length,
      })),
    [seedCounts, vaultSeeds, getSeedCount],
  );

  const mainVaultTotal = useMemo(
    () => vaultSeeds.filter((seed) => seed.breeder !== "Burn Pile").reduce((sum, seed) => sum + getSeedCount(seed), 0),
    [seedCounts, vaultSeeds, getSeedCount],
  );
  const burnPileTotal = useMemo(
    () => vaultSeeds.filter((seed) => seed.breeder === "Burn Pile").reduce((sum, seed) => sum + getSeedCount(seed), 0),
    [seedCounts, vaultSeeds, getSeedCount],
  );
  const grandTotal = mainVaultTotal + burnPileTotal;

  const breederTypeTotals = useMemo(
    () => {
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
              case "rarity-desc":
                return getSeedRarity(seedWithCount(b)).score - getSeedRarity(seedWithCount(a)).score;
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
              case "stretch-desc": {
                const stretchVal = (s: string) => (s === "High" ? 3 : s === "Medium" ? 2 : 1);
                return stretchVal(advB.stretchFactor) - stretchVal(advA.stretchFactor);
              }
              case "stress-desc":
                return advB.stressResistance - advA.stressResistance;
              case "mold-desc":
                return advB.moldResilience - advA.moldResilience;
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
    },
    [activeTypes, seedCounts, vaultSearch, vaultSeeds, sortMode, minThc, maxFlowering, minResin, minTerpene, getSeedCount, seedWithCount],
  );

  const visibleStrainCount = breederTypeTotals.reduce((sum, group) => sum + group.strains.length, 0);

  const [openBreeders, setOpenBreeders] = useState<Record<string, boolean>>({});
  const toggleBreeder = (breeder: string) =>
    setOpenBreeders((current) => ({ ...current, [breeder]: !current[breeder] }));

  const preservationShortlist = useMemo(
    () =>
      vaultSeeds.map((seed) => {
        const countedSeed = seedWithCount(seed);
        return { seed: countedSeed, priority: getKeeperPriority(countedSeed) };
      })
        .filter(({ priority }) => priority.level === "High" || priority.level === "Medium")
        .sort((a, b) => b.priority.score - a.priority.score)
        .slice(0, 8),
    [seedCounts, vaultSeeds, seedWithCount],
  );

  const randomPair = () => {
    const a = vaultSeeds[Math.floor(Math.random() * vaultSeeds.length)];
    let b = vaultSeeds[Math.floor(Math.random() * vaultSeeds.length)];
    while (b.id === a.id) b = vaultSeeds[Math.floor(Math.random() * vaultSeeds.length)];
    setParentA(a);
    setParentB(b);
    setSalt((value) => value + 1);
  };

  const toggleGoal = (goal: TraitGoal) => {
    setSelectedGoals((current) => (current.includes(goal) ? current.filter((item) => item !== goal) : [...current, goal]));
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/70 bg-card/90 backdrop-blur">
        <div className="container flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <Leaf className="h-6 w-6" />
            </span>
            <div>
              <p className="font-display text-2xl font-black tracking-tight">Vault Lab</p>
              <p className="text-sm text-muted-foreground">Vault-aware breeder planning with FEM / REG / AUTO labels</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">Main vault {mainVaultTotal}</span>
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-800 dark:bg-orange-950/50 dark:text-orange-200">Burn pile {burnPileTotal}</span>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-black text-secondary-foreground">Grand total {grandTotal}</span>
            <Link
              to="/rotation"
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-border bg-card px-3 py-1.5 text-xs font-black text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Pill className="h-3.5 w-3.5" />
              Rotation
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container max-w-6xl pb-20 pt-8">
        <section className="grid gap-4 md:grid-cols-3">
          {vaultTypeTotals.filter((entry) => entry.total > 0).map((entry) => (
            <div key={entry.type} className={`rounded-[1.75rem] border-2 p-5 shadow-sm ${typeStyles[entry.type]}`}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-[0.22em]">{entry.type}</p>
                <TypeBadge type={entry.type} />
              </div>
              <p className="font-display text-4xl font-black">{entry.total}</p>
              <p className="mt-1 text-sm font-semibold opacity-80">{entry.strains} main-vault strains</p>
            </div>
          ))}
        </section>

        <div className="mt-6">
          <VaultBackup />
        </div>

        <VaultAnalytics />

        <CollapsibleSection
          title="Vault Breakdown"
          icon={<PackagePlus className="h-5 w-5" />}
          description={
            <>
              Every strain now carries a visible type tag: <b>FEM</b>, <b>REG</b>, <b>AUTO</b>, or <b>PHOTO ?</b>. Tap any strain to open its full detail page. Burn Pile remains separated from preservation pressure.
            </>
          }
        >

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
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl border-2 font-bold"
                  onClick={() => setShowFilters((value) => !value)}
                >
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
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl border-2 font-bold"
                  onClick={resetSeedCounts}
                >
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
              <span className="ml-auto text-xs font-bold text-muted-foreground">
                Showing {visibleStrainCount} strains
              </span>
            </div>

            {showFilters && (
              <div className="mt-3 grid gap-4 border-t border-border/60 pt-3 sm:grid-cols-2">
                <div>
                  <div className="mb-1 flex justify-between text-xs font-bold">
                    <span>Min THC</span>
                    <span>{minThc}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={30}
                    value={minThc}
                    onChange={(event) => setMinThc(Number(event.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-xs font-bold">
                    <span>Max flowering</span>
                    <span>{maxFlowering} wks</span>
                  </div>
                  <input
                    type="range"
                    min={6}
                    max={20}
                    value={maxFlowering}
                    onChange={(event) => setMaxFlowering(Number(event.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-xs font-bold">
                    <span>Min resin density</span>
                    <span>{minResin}★</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={minResin}
                    onChange={(event) => setMinResin(Number(event.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-xs font-bold">
                    <span>Min terpene intensity</span>
                    <span>{minTerpene}★</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={minTerpene}
                    onChange={(event) => setMinTerpene(Number(event.target.value))}
                    className="w-full accent-primary"
                  />
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
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid items-start gap-3 lg:grid-cols-2">
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
                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
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
                    {group.strains.map((seed) => {
                      const count = getSeedCount(seed);
                      const adv = estimateAdvancedMetrics(seed);
                      return (
                        <div key={seed.id} className="rounded-2xl bg-muted/50 p-3">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                              <Link
                                to={`/strain/${encodeURIComponent(seed.id)}`}
                                className="text-sm font-semibold hover:text-primary hover:underline"
                              >
                                <StrainName name={seed.name} />
                              </Link>
                              <p className="mt-1 text-[11px] font-bold text-muted-foreground">Inventory count</p>
                            </div>
                            <div className="flex shrink-0 flex-wrap items-center gap-2">
                              <RarityBadge rarity={getSeedRarity(seedWithCount(seed))} />
                              <TypeBadge type={seed.type} />
                              <div className="flex items-center rounded-full border border-border bg-card p-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-full"
                                  onClick={() => updateSeedCount(seed, count - 1)}
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </Button>
                                <Input
                                  type="number"
                                  min={0}
                                  value={count}
                                  onChange={(event) => updateSeedCount(seed, Number(event.target.value))}
                                  className="h-7 w-14 border-0 bg-transparent p-0 text-center text-xs font-black shadow-none focus-visible:ring-0"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-full"
                                  onClick={() => updateSeedCount(seed, count + 1)}
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          <WebLineageLookup name={seed.name} breeder={seed.breeder} compact />

                          <div className="mt-2.5">
                            <div className="mb-1.5 flex items-center gap-1.5">
                              <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">
                                Est. dry yield · single plant
                              </p>
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
                                    <span className="text-[10px] font-black uppercase tracking-wide text-primary">
                                      {env.wattage}
                                    </span>
                                    <span className="font-display text-sm font-black leading-none">
                                      {env.yieldG.min}–{env.yieldG.max}g
                                    </span>
                                  </div>
                                  <p className="mt-1 text-[10px] font-semibold leading-tight text-muted-foreground">
                                    {env.gear}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {(() => {
                            const split = estimateLineageSplit(seed);
                            const cannabinoids = estimateCannabinoids(seed);
                            const topHeight = seedHeightMetric(seed);
                            return (
                              <div className="mt-2.5">
                                <p className="mb-1.5 text-[10px] font-black uppercase tracking-wide text-muted-foreground">
                                  Est. lean · potency · height
                                </p>
                                <div className="mb-2 flex h-2 overflow-hidden rounded-full bg-muted">
                                  <div className="h-full bg-amber-400 dark:bg-amber-500" style={{ width: `${split.sativa}%` }} />
                                  <div className="h-full bg-violet-500" style={{ width: `${split.indica}%` }} />
                                </div>
                                <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold sm:grid-cols-4">
                                  <span className="rounded-lg bg-amber-100 px-2 py-1 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
                                    Sativa {split.sativa}%
                                  </span>
                                  <span className="rounded-lg bg-violet-100 px-2 py-1 text-violet-800 dark:bg-violet-950/50 dark:text-violet-200">
                                    Indica {split.indica}%
                                  </span>
                                  <span className="rounded-lg bg-emerald-100 px-2 py-1 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
                                    THC {cannabinoids.thc.min}–{cannabinoids.thc.max}%
                                  </span>
                                  <span className="rounded-lg bg-muted px-2 py-1 text-muted-foreground">
                                    ~{topHeight}cm tall
                                  </span>
                                </div>
                                <p className="mt-1.5 text-[10px] font-semibold leading-tight text-muted-foreground">
                                  CBD {cannabinoids.cbd.min}–{cannabinoids.cbd.max}% · CBG {cannabinoids.cbg.min}–{cannabinoids.cbg.max}% · CBN {cannabinoids.cbn.min}–{cannabinoids.cbn.max}% · total {cannabinoids.total.min}–{cannabinoids.total.max}%
                                </p>
                              </div>
                            );
                          })()}

                          {/* Advanced Metrics Readout */}
                          <div className="mt-3 border-t border-border/40 pt-2.5">
                            <p className="mb-1.5 text-[10px] font-black uppercase tracking-wide text-muted-foreground">
                              Advanced Breeder Metrics
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold sm:grid-cols-4">
                              <div className="rounded-lg bg-card p-2">
                                <span className="block text-[9px] font-black uppercase text-muted-foreground">Flowering</span>
                                <span className="font-bold text-foreground">{adv.floweringWeeks} weeks</span>
                              </div>
                              <div className="rounded-lg bg-card p-2">
                                <span className="block text-[9px] font-black uppercase text-muted-foreground">Terpene Intensity</span>
                                <span className="font-bold text-foreground">{"★".repeat(adv.terpeneIntensity)}{"☆".repeat(5 - adv.terpeneIntensity)}</span>
                              </div>
                              <div className="rounded-lg bg-card p-2">
                                <span className="block text-[9px] font-black uppercase text-muted-foreground">Resin Density</span>
                                <span className="font-bold text-foreground">{"★".repeat(adv.resinDensity)}{"☆".repeat(5 - adv.resinDensity)}</span>
                              </div>
                              <div className="rounded-lg bg-card p-2">
                                <span className="block text-[9px] font-black uppercase text-muted-foreground">Ease of Grow</span>
                                <span className="font-bold text-foreground">{"★".repeat(adv.easeOfGrow)}{"☆".repeat(5 - adv.easeOfGrow)}</span>
                              </div>
                              <div className="rounded-lg bg-card p-2">
                                <span className="block text-[9px] font-black uppercase text-muted-foreground">Stretch Factor</span>
                                <span className="font-bold text-foreground">{adv.stretchFactor}</span>
                              </div>
                              <div className="rounded-lg bg-card p-2">
                                <span className="block text-[9px] font-black uppercase text-muted-foreground">Stress Resistance</span>
                                <span className="font-bold text-foreground">{"★".repeat(adv.stressResistance)}{"☆".repeat(5 - adv.stressResistance)}</span>
                              </div>
                              <div className="rounded-lg bg-card p-2">
                                <span className="block text-[9px] font-black uppercase text-muted-foreground">Mold Resilience</span>
                                <span className="font-bold text-foreground">{"★".repeat(adv.moldResilience)}{"☆".repeat(5 - adv.moldResilience)}</span>
                              </div>
                              <div className="rounded-lg bg-card p-2">
                                <span className="block text-[9px] font-black uppercase text-muted-foreground">Keeper Priority</span>
                                <span className="font-bold text-foreground">{getKeeperPriority(seedWithCount(seed)).level}</span>
                              </div>
                            </div>
                          </div>

                          {(() => {
                            const tree = buildStrainLineageTree(seed.name);
                            if (lineageTreeDepth(tree) === 0) return null;
                            return (
                              <div className="mt-3 border-t border-border/40 pt-2.5">
                                <p className="mb-2 text-[10px] font-black uppercase tracking-wide text-muted-foreground">
                                  Genetics tree
                                </p>
                                <GeneticsTree root={tree} />
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })}
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

          <div className="mt-5 rounded-3xl border border-border bg-background p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-primary">Worth keeping seed / pollen for</p>
                <p className="text-sm text-muted-foreground">Auto-ranked by scarcity, breeder value, and sought-after lineage cues.</p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">Top {preservationShortlist.length}</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {preservationShortlist.map(({ seed, priority }) => (
                <Link
                  key={`${seed.id}-shortlist`}
                  to={`/strain/${encodeURIComponent(seed.id)}`}
                  className={`block rounded-2xl border p-3 transition-opacity hover:opacity-80 ${priority.tone}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-display text-base font-bold leading-tight">{seed.name}</p>
                      <p className="mt-1 text-xs font-semibold opacity-80">{seed.breeder} · {seed.count ?? 0} seeds</p>
                    </div>
                    <TypeBadge type={seed.type} />
                  </div>
                  <p className="mt-2 text-xs leading-relaxed">
                    <span className="font-black">{priority.level}:</span> {priority.reasons.join(" · ")}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </CollapsibleSection>

        <BestParents />

        <RecommendedCrosses />

        <RecommendedPickups />

        <CollapsibleSection
          title="Ethos Multipass — incoming additions"
          icon={<PackageCheck className="h-5 w-5" />}
          description={
            <>
              Pre-log packs coming later in the year. When one lands, hit <b>Mark arrived</b> and it drops straight into the vault under {MULTIPASS_BREEDER} — counted, searchable, and selectable in the cross planner.
            </>
          }
        >

          <div className="rounded-3xl border border-border bg-background p-4">
            <p className="mb-3 text-xs font-black uppercase tracking-wide text-primary">Add an incoming pack</p>
            <Input
              value={newPassName}
              onChange={(event) => setNewPassName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleAddMultipass();
              }}
              placeholder="Strain name (e.g. Crunch Berries)"
              className="mb-3 h-11 rounded-2xl font-semibold"
            />
            <div className="mb-3 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
              <Input
                value={newPassParentA}
                onChange={(event) => setNewPassParentA(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleAddMultipass();
                }}
                placeholder="Cross parent A (mother)"
                className="h-11 rounded-2xl font-semibold"
              />
              <span className="hidden text-center font-display text-lg font-black text-muted-foreground sm:block">×</span>
              <Input
                value={newPassParentB}
                onChange={(event) => setNewPassParentB(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleAddMultipass();
                }}
                placeholder="Cross parent B (father)"
                className="h-11 rounded-2xl font-semibold"
              />
            </div>
            <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-2xl border border-border bg-card p-1">
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setNewPassCount((value) => clampSeedCount(value - 1))}>
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <Input
                    type="number"
                    min={0}
                    value={newPassCount}
                    onChange={(event) => setNewPassCount(clampSeedCount(Number(event.target.value)))}
                    className="h-8 w-14 border-0 bg-transparent p-0 text-center text-sm font-black shadow-none focus-visible:ring-0"
                  />
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setNewPassCount((value) => clampSeedCount(value + 1))}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <Button type="button" className="h-11 rounded-2xl font-bold" onClick={handleAddMultipass} disabled={!newPassName.trim()}>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add
                </Button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground">Type:</span>
              {SEED_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setNewPassType(type)}
                  className={`rounded-full border px-3 py-1 text-xs font-black transition ${
                    newPassType === type ? typeStyles[type] : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {typeShort[type]}
                </button>
              ))}
            </div>
          </div>

          {incomingPasses.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-black uppercase tracking-wide text-muted-foreground">Incoming ({incomingPasses.length})</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {incomingPasses.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-primary/40 bg-background p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{entry.name}</p>
                      {(entry.parentA || entry.parentB) && (
                        <p className="mt-0.5 truncate text-[11px] font-semibold text-muted-foreground">
                          {entry.parentA || "?"} × {entry.parentB || "?"}
                        </p>
                      )}
                      <p className="mt-0.5 text-[11px] font-bold text-muted-foreground">{entry.count} seeds · expected</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <TypeBadge type={entry.type} />
                      <Button type="button" size="sm" className="h-8 rounded-full text-xs font-bold" onClick={() => toggleArrived(entry.id)}>
                        <PackageCheck className="mr-1 h-3.5 w-3.5" />
                        Arrived
                      </Button>
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive" onClick={() => removeMultipass(entry.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {arrivedPasses.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-black uppercase tracking-wide text-emerald-700 dark:text-emerald-300">In vault ({arrivedPasses.length})</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {arrivedPasses.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{entry.name}</p>
                      {(entry.parentA || entry.parentB) && (
                        <p className="mt-0.5 truncate text-[11px] font-semibold opacity-90">
                          {entry.parentA || "?"} × {entry.parentB || "?"}
                        </p>
                      )}
                      <p className="mt-0.5 text-[11px] font-bold opacity-80">added to {MULTIPASS_BREEDER}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <TypeBadge type={entry.type} />
                      <Button type="button" variant="outline" size="sm" className="h-8 rounded-full border-2 text-xs font-bold" onClick={() => toggleArrived(entry.id)}>
                        <Undo2 className="mr-1 h-3.5 w-3.5" />
                        Incoming
                      </Button>
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:text-destructive" onClick={() => removeMultipass(entry.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {multipass.length === 0 && (
            <p className="mt-4 rounded-2xl bg-muted/50 p-4 text-sm text-muted-foreground">
              No Multipass packs logged yet. Add the strains you expect to receive and they'll be ready to fold into the vault the moment they arrive.
            </p>
          )}
        </CollapsibleSection>

        <BreedingLots />

        <CollapsibleSection title="Cross planner" icon={<Sparkles className="h-5 w-5" />}>
          <div className="grid items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
            <SeedSelect label="A" accent="green" value={parentA} onChange={setParentA} onClear={() => setParentA(null)} seeds={vaultSeeds} seedCounts={seedCounts} />
            <div className="grid place-items-center">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-muted font-display text-xl font-black text-muted-foreground">×</span>
            </div>
            <SeedSelect label="B" accent="purple" value={parentB} onChange={setParentB} onClear={() => setParentB(null)} seeds={vaultSeeds} seedCounts={seedCounts} />
          </div>

          {parentA && parentB && (
            <div className="mt-5 space-y-3 rounded-3xl bg-muted/50 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {[parentA, parentB].map((seed) => (
                  <div key={seed.id} className="rounded-2xl bg-card p-4">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="font-display text-lg font-bold leading-tight">{seed.name}</p>
                      <TypeBadge type={seed.type} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {seed.breeder} · {seed.type} · {getSeedCount(seed)} seeds
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-primary/20 bg-card p-4">
                <p className="mb-2 text-xs font-black uppercase tracking-wide text-primary">Pollen / seed route advice</p>
                <p className="text-sm font-semibold leading-relaxed">{getPairingAdvice(parentA, parentB)}</p>
                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  {[parentA, parentB].map((seed) => {
                    const advice = seed.breeder === "Burn Pile"
                      ? {
                          ...SEED_TYPE_ADVICE[seed.type],
                          pollen: "Burn Pile route: one-and-only run only. Do not collect pollen or make seeds from white-label / potentially mislabelled stock.",
                          watch: "Watch-outs: evaluate only as personal smoke/test stock; do not use it as breeding evidence or preservation material.",
                        }
                      : SEED_TYPE_ADVICE[seed.type];
                    const countedSeed = seedWithCount(seed);
                    const priority = getKeeperPriority(countedSeed);
                    return (
                      <div key={`${seed.id}-advice`} className="rounded-2xl bg-muted/70 p-4">
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <p className="font-display text-base font-bold leading-tight">{seed.name}</p>
                          <TypeBadge type={seed.type} />
                        </div>
                        <div className={`mb-3 rounded-2xl border p-3 ${priority.tone}`}>
                          <p className="text-xs font-black uppercase tracking-wide">{priority.level} keep priority</p>
                          <p className="mt-1 text-xs leading-relaxed">
                            {priority.reasons.length ? priority.reasons.join(" · ") : "standard working stock"}
                          </p>
                        </div>
                        <div className="space-y-2 text-xs leading-relaxed text-muted-foreground">
                          <p><span className="font-bold text-foreground">Keep seed:</span> {priority.seedPlan}</p>
                          <p><span className="font-bold text-foreground">Keep pollen:</span> {priority.pollenPlan}</p>
                          <p><span className="font-bold text-foreground">Type route:</span> {advice.pollen}</p>
                          <p><span className="font-bold text-foreground">Watch:</span> {advice.watch}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 rounded-2xl bg-primary/10 p-4 text-primary">
                  <p className="text-xs font-black uppercase tracking-wide">Once pollen + receiver are chosen</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-xs font-semibold leading-relaxed">
                    {getPairingTips(parentA, parentB).map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="mt-5 rounded-3xl bg-muted/60 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <p className="text-sm font-black uppercase tracking-wide">Trait goals</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {TRAIT_GOALS.map((goal) => (
                <ToggleChip key={goal} goal={goal} active={selectedGoals.includes(goal)} onClick={() => toggleGoal(goal)} />
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button className="h-12 flex-1 rounded-2xl text-base font-bold" onClick={() => setSalt((value) => value + 1)}>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate names
            </Button>
            <Button variant="outline" className="h-12 rounded-2xl border-2 text-base font-bold" onClick={randomPair}>
              <Dices className="mr-2 h-4 w-4" />
              Random pair
            </Button>
          </div>
        </CollapsibleSection>

        {report && (
          <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] border-2 border-primary/20 bg-card p-5 shadow-sm sm:p-7">
              <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">Cross potential</p>
              <p className="font-display text-5xl font-black text-primary">{report.scores.overall}/100</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{report.breederNote}</p>
              <div className="mt-5 space-y-3">
                {report.profile.terpenes.map((terpene) => (
                  <div key={terpene.key}>
                    <div className="mb-1 flex items-center justify-between text-xs font-bold">
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

            <div className="rounded-[2rem] border-2 border-border bg-card p-5 shadow-sm sm:p-7">
              <div className="mb-4 flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-primary" />
                <h2 className="font-display text-xl font-black">Name ideas</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {groupedNames.map((group) => (
                  <div key={group.category} className="rounded-3xl bg-background p-4">
                    <p className="mb-3 text-xs font-black uppercase tracking-wide text-muted-foreground">{group.category}</p>
                    <div className="space-y-2">
                      {group.names.map((item) => (
                        <div key={item.name} className="rounded-2xl border border-border bg-card p-3">
                          <p className="font-display text-lg font-bold leading-tight">{item.name}</p>
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border-2 border-border bg-card p-5 shadow-sm sm:p-7 lg:col-span-2">
              <div className="mb-5">
                <p className="text-xs font-black uppercase tracking-wide text-primary">Full cross report</p>
                <h2 className="font-display text-2xl font-black tracking-tight">{parentA?.name} × {parentB?.name}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{report.profile.summary}</p>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-3xl bg-background p-4">
                  <p className="mb-3 text-xs font-black uppercase tracking-wide text-muted-foreground">Score breakdown</p>
                  <div className="space-y-2">
                    {[
                      ["Flavor synergy", report.scores.flavorSynergy],
                      ["Terpene contrast", report.scores.terpeneContrast],
                      ["Breeder interest", report.scores.breederInterest],
                      ["Name potential", report.scores.namePotential],
                      ["Goal match", report.scores.goalMatch],
                    ].map(([label, score]) => (
                      <div key={label}>
                        <div className="mb-1 flex justify-between text-xs font-bold">
                          <span>{label}</span>
                          <span>{score}/100</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${score}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl bg-background p-4 lg:col-span-2">
                  <p className="mb-3 text-xs font-black uppercase tracking-wide text-muted-foreground">Phenotype preview</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {report.phenotypes.map((pheno) => (
                      <div key={pheno.title} className="rounded-2xl border border-border bg-card p-3">
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black uppercase text-primary">
                          {pheno.likelihood}
                        </span>
                        <p className="mt-2 font-display text-base font-bold leading-tight">{pheno.title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{pheno.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {lineageTree && (
                  <div className="rounded-3xl bg-background p-4 lg:col-span-3">
                    <div className="mb-3 flex items-center gap-2">
                      <GitBranch className="h-4 w-4 text-primary" />
                      <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">Genetics tree</p>
                    </div>
                    <GeneticsTree root={lineageTree} />
                  </div>
                )}

                <div className="rounded-3xl bg-background p-4 lg:col-span-3">
                  <p className="mb-3 text-xs font-black uppercase tracking-wide text-muted-foreground">Cross size / dry-yield estimates</p>
                  <div className="grid gap-3 md:grid-cols-3">
                    {report.growthEstimates.map((estimate) => {
                      const gear = estimate.wattage === "<100W" ? "Vivosun VGrow smart box" : estimate.wattage === "220W" ? "AC Infinity 2×2" : "AC Infinity 4×4";
                      return (
                        <div key={estimate.wattage} className="rounded-2xl border border-border bg-card p-4">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-wide text-primary">{estimate.wattage}</p>
                              <p className="text-xs font-bold text-muted-foreground">{gear}</p>
                            </div>
                            <p className="font-display text-xl font-black">{estimate.yieldG.min}–{estimate.yieldG.max}g</p>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold text-muted-foreground">
                            <span>H: {estimate.heightCm.min}–{estimate.heightCm.max}cm</span>
                            <span>W: {estimate.widthCm.min}–{estimate.widthCm.max}cm</span>
                          </div>
                          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{estimate.note}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-3xl bg-background p-4 lg:col-span-2">
                  <p className="mb-3 text-xs font-black uppercase tracking-wide text-muted-foreground">Genetic notes</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {report.geneticNotes.map((note) => (
                      <div key={note.label} className="rounded-2xl border border-border bg-card p-3">
                        <p className="font-bold">{note.label}</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{note.note}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl bg-background p-4">
                  <p className="mb-3 text-xs font-black uppercase tracking-wide text-muted-foreground">Lineage map</p>
                  <div className="space-y-3">
                    {report.lineage.map((node) => (
                      <div key={node.parent} className="rounded-2xl border border-border bg-card p-3">
                        <p className="text-[10px] font-black uppercase text-primary">Parent {node.parent}</p>
                        <p className="mt-1 font-display text-base font-bold leading-tight">{node.name}</p>
                        <p className="mt-1 text-xs font-semibold text-muted-foreground">{node.breeder}</p>
                        {node.pieces.length > 0 && (
                          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{node.pieces.join(" × ")}</p>
                        )}
                        <WebLineageLookup name={node.name} breeder={node.breeder} compact />
                        {node.flags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {node.flags.map((flag) => (
                              <span key={flag} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-black text-muted-foreground">
                                {flag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

        <MadeWithDyad />
      </div>
    </TooltipProvider>
  );
};

export default Index;