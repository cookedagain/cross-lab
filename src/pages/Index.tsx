import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Boxes, ChevronDown, HelpCircle, Leaf, Library, Minus, PackageCheck, PackagePlus, Pill, Plus, RotateCcw, Search, ShieldAlert, SlidersHorizontal, Sprout, Trash2, Undo2, RefreshCw, ClipboardPaste, AlertCircle } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import AiVaultChat from "@/components/AiVaultChat";
import VaultBackup from "@/components/VaultBackup";
import VaultAnalytics from "@/components/VaultAnalytics";
import CollapsibleSection from "@/components/CollapsibleSection";
import RecommendedPickups from "@/components/RecommendedPickups";
import { TypeBadge } from "@/components/TypeBadge";
import { RarityBadge } from "@/components/RarityBadge";
import StrainName from "@/components/StrainName";
import WebLineageLookup from "@/components/WebLineageLookup";
import GeneticsTree from "@/components/GeneticsTree";
import { buildStrainLineageTree, lineageTreeDepth } from "@/lib/lineageTree";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type Seed, type SeedType } from "@/data/seeds";
import { clampSeedCount, MULTIPASS_BREEDER, useVault } from "@/hooks/useVaultStore";
import { SEED_TYPES, typeShort, typeStyles } from "@/lib/seedDisplay";
import { getKeeperPriority } from "@/lib/keeper";
import { getSeedRarity } from "@/lib/rarity";
import {
  estimateCannabinoids,
  estimateLineageSplit,
  estimateSeedGrowth,
  estimateAdvancedMetrics,
} from "@/lib/crossName";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { showSuccess, showError } from "@/utils/toast";

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

const parsePlaintextSeeds = (text: string): Omit<Seed, "id">[] => {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const parsed: Omit<Seed, "id">[] = [];

  for (const line of lines) {
    if (line.startsWith("#") || line.startsWith("//")) continue;

    let name = line;
    let breeder = "Custom";
    let type: SeedType = "Feminized";
    let count = 10;

    // 1. Extract count (e.g., "x 5", "x5", "- 5", "5 seeds", "5s")
    const countMatch = name.match(/(?:\s*[x×-]\s*|\s+)(\d+)(?:\s*seeds?|\s*s)?$/i);
    if (countMatch) {
      count = parseInt(countMatch[1], 10);
      name = name.slice(0, countMatch.index).trim();
    }

    // 2. Extract type (e.g., "(FEM)", "(REG)", "(AUTO)", "[FEM]", etc.)
    const typeMatch = name.match(/\((FEM|REG|AUTO|PHOTO\s*\?|Feminized|Regular|Autoflower|Unknown\s*Photo)\)/i) ||
                      name.match(/\[(FEM|REG|AUTO|PHOTO\s*\?|Feminized|Regular|Autoflower|Unknown\s*Photo)\]/i);
    if (typeMatch) {
      const tStr = typeMatch[1].toUpperCase();
      if (tStr.includes("FEM")) type = "Feminized";
      else if (tStr.includes("REG")) type = "Regular";
      else if (tStr.includes("AUTO")) type = "Autoflower";
      else if (tStr.includes("PHOTO")) type = "Unknown Photo";
      name = name.replace(typeMatch[0], "").trim();
    }

    // 3. Extract breeder (e.g., "Breeder - Strain", "Strain [Breeder]", "Breeder | Strain")
    const breederBracketMatch = name.match(/\[([^\]]+)\]/);
    if (breederBracketMatch) {
      breeder = breederBracketMatch[1].trim();
      name = name.replace(breederBracketMatch[0], "").trim();
    } else {
      const parts = name.split(/\s*[-|/]\s+/);
      if (parts.length >= 2) {
        breeder = parts[0].trim();
        name = parts.slice(1).join(" - ").trim();
      }
    }

    name = name.replace(/\s+/g, " ").trim();
    if (name) {
      parsed.push({ name, breeder, type, count });
    }
  }
  return parsed;
};

const Index = () => {
  const {
    customSeeds,
    seedCounts,
    multipass,
    vaultSeeds,
    getSeedCount,
    seedWithCount,
    addSeed,
    removeSeed,
    updateSeedCount,
    resetSeedCounts,
    addMultipass,
    removeMultipass,
    toggleArrived,
  } = useVault();

  const [vaultSearch, setVaultSearch] = useState("");
  const [activeTypes, setActiveTypes] = useState<SeedType[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>("count");
  const [showFilters, setShowFilters] = useState(false);
  const [minThc, setMinThc] = useState(0);
  const [maxFlowering, setMaxFlowering] = useState(20);
  const [minResin, setMinResin] = useState(1);
  const [minTerpene, setMinTerpene] = useState(1);

  // Add-a-seed form
  const [seedName, setSeedName] = useState("");
  const [seedBreeder, setSeedBreeder] = useState("");
  const [seedType, setSeedType] = useState<SeedType>("Feminized");
  const [seedCount, setSeedCount] = useState(10);

  // Plaintext Bulk Importer
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkSeedsText, setBulkSeedsText] = useState("");

  const [newPassName, setNewPassName] = useState("");
  const [newPassParentA, setNewPassParentA] = useState("");
  const [newPassParentB, setNewPassParentB] = useState("");
  const [newPassType, setNewPassType] = useState<SeedType>("Feminized");
  const [newPassCount, setNewPassCount] = useState(10);

  const customSeedIds = useMemo(() => new Set(customSeeds.map((seed) => seed.id)), [customSeeds]);
  const existingBreeders = useMemo(
    () => Array.from(new Set(vaultSeeds.map((seed) => seed.breeder))).sort(),
    [vaultSeeds],
  );

  const handleAddSeed = () => {
    const name = seedName.trim();
    const breeder = seedBreeder.trim();
    if (!name || !breeder) return;
    addSeed({ name, breeder, type: seedType, count: clampSeedCount(seedCount) });
    setSeedName("");
    setSeedCount(10);
  };

  const handleBulkImportSeeds = () => {
    const parsed = parsePlaintextSeeds(bulkSeedsText);
    if (parsed.length === 0) {
      showError("Could not parse any valid seeds from the pasted text.");
      return;
    }
    parsed.forEach((seed) => {
      addSeed(seed);
    });
    showSuccess(`Successfully imported ${parsed.length} seeds into your vault.`);
    setBulkSeedsText("");
    setShowBulkImport(false);
  };

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
      const breederNames = Array.from(new Set(vaultSeeds.map((seed) => seed.breeder)));
      return breederNames
        .map((breeder) => {
          const allSeeds = vaultSeeds.filter((seed) => seed.breeder === breeder);
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
          return { breeder, total, byType, strains };
        })
        .filter((group) => group.strains.length > 0)
        .sort((a, b) => b.strains.length - a.strains.length);
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
              to="/breeders"
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-border bg-card px-3 py-1.5 text-xs font-black text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Library className="h-3.5 w-3.5" />
              Breeders
            </Link>
            <Link
              to="/stations"
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-border bg-card px-3 py-1.5 text-xs font-black text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Boxes className="h-3.5 w-3.5" />
              Growing
            </Link>
            <Link
              to="/rotation"
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-border bg-card px-3 py-1.5 text-xs font-black text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Pill className="h-3.5 w-3.5" />
              Rotation
            </Link>
            <AiVaultChat />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-2xl border-2"
              onClick={() => window.location.reload()}
              title="Refresh page"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
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

        <CollapsibleSection
          title="Add a seed"
          icon={<Sprout className="h-5 w-5" />}
          description="Build your own vault. Seeds you add are saved locally on this device — your collection stays yours."
        >
          <div className="rounded-3xl border border-border bg-background p-4">
            <Input
              value={seedName}
              onChange={(event) => setSeedName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleAddSeed();
              }}
              placeholder="Strain name (e.g. Temple Kush F2 × Wedding Cake)"
              className="mb-3 h-11 rounded-2xl font-semibold"
            />
            <Input
              list="breeder-options"
              value={seedBreeder}
              onChange={(event) => setSeedBreeder(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleAddSeed();
              }}
              placeholder="Breeder (e.g. Ethos Genetics)"
              className="mb-3 h-11 rounded-2xl font-semibold"
            />
            <datalist id="breeder-options">
              {existingBreeders.map((breeder) => (
                <option key={breeder} value={breeder} />
              ))}
            </datalist>

            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground">Type:</span>
              {SEED_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSeedType(type)}
                  className={`rounded-full border px-3 py-1 text-xs font-black transition ${
                    seedType === type ? typeStyles[type] : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {typeShort[type]}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center rounded-2xl border border-border bg-card p-1">
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setSeedCount((value) => clampSeedCount(value - 1))}>
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <Input
                  type="number"
                  min={0}
                  value={seedCount}
                  onChange={(event) => setSeedCount(clampSeedCount(Number(event.target.value)))}
                  className="h-8 w-14 border-0 bg-transparent p-0 text-center text-sm font-black shadow-none focus-visible:ring-0"
                />
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setSeedCount((value) => clampSeedCount(value + 1))}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              <Button type="button" className="h-11 rounded-2xl font-bold" onClick={handleAddSeed} disabled={!seedName.trim() || !seedBreeder.trim()}>
                <Plus className="mr-1.5 h-4 w-4" />
                Add seed
              </Button>
              <Button type="button" variant="outline" className="h-11 rounded-2xl border-2 font-bold" onClick={() => setShowBulkImport(!showBulkImport)}>
                <ClipboardPaste className="mr-1.5 h-4 w-4" />
                Plaintext Bulk Import
              </Button>
            </div>

            {showBulkImport && (
              <div className="mt-4 border-t border-border/60 pt-4">
                <div className="mb-3 flex items-start gap-2 rounded-2xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-bold">Plaintext Bulk Importer</p>
                    <p className="mt-1 leading-relaxed">
                      Paste a list of strains (one per line). The parser will automatically extract the breeder, strain name, type, and seed count using smart fallback rules.
                    </p>
                    <p className="mt-2 font-mono text-[10px] leading-relaxed">
                      Examples:<br />
                      - Ethos Genetics - Lilac Diesel (FEM) x 5<br />
                      - Humboldt Seed Company - Squirt (AUTO) x 10<br />
                      - Brothers Grimm - Cinderella 99 (REG) x 12
                    </p>
                  </div>
                </div>
                <Textarea
                  value={bulkSeedsText}
                  onChange={(e) => setBulkSeedsText(e.target.value)}
                  placeholder="Paste your list of strains here..."
                  className="min-h-[150px] rounded-2xl font-mono text-xs leading-6"
                />
                <Button type="button" className="mt-3 h-11 rounded-2xl font-bold" onClick={handleBulkImportSeeds} disabled={!bulkSeedsText.trim()}>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Parse & Import Seeds
                </Button>
              </div>
            )}
          </div>
        </CollapsibleSection>

        <VaultAnalytics />

        <CollapsibleSection
          title="Vault Breakdown"
          icon={<PackagePlus className="h-5 w-5" />}
          description={
            <>
              Every strain carries a visible type tag: <b>FEM</b>, <b>REG</b>, <b>AUTO</b>, or <b>PHOTO ?</b>. Tap any strain to open its full detail page. Use the trash icon to remove a seed you added.
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

          {breederTypeTotals.length === 0 ? (
            <p className="rounded-3xl bg-muted/50 p-6 text-center text-sm font-semibold text-muted-foreground">
              Your vault is empty. Use <b>Add a seed</b> above to start building your collection.
            </p>
          ) : (
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
                        const isCustom = customSeedIds.has(seed.id);
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
                                {isCustom && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-full text-muted-foreground hover:text-destructive"
                                    onClick={() => removeSeed(seed.id)}
                                    title="Remove seed"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                )}
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
          )}

          <div className="mt-5 rounded-3xl bg-orange-50 p-4 text-orange-800 dark:bg-orange-950/40 dark:text-orange-200">
            <div className="flex items-start gap-2">
              <ShieldAlert className="mt-0.5 h-5 w-5" />
              <div>
                <p className="font-bold">Burn Pile rule</p>
                <p className="mt-1 text-sm leading-relaxed">
                  Add seeds under the breeder "Burn Pile" to mark them as one-and-only runs. They can be grown, failed, tossed, smoked/tested, or closed out — but they are treated as white-label / potentially mislabelled stock, so they are not breeding, pollen, seed-making, or preservation candidates.
                </p>
              </div>
            </div>
          </div>

          {preservationShortlist.length > 0 && (
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
          )}
        </CollapsibleSection>

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
      </main>

        <MadeWithDyad />
      </div>
    </TooltipProvider>
  );
};

export default Index;