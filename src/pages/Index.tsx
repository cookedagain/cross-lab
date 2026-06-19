import { useMemo, useState } from "react";
import {
  ChevronDown,
  Dices,
  FlaskConical,
  Leaf,
  PackagePlus,
  PieChart as PieChartIcon,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
} from "lucide-react";
import SeedSelect from "@/components/SeedSelect";
import ThemeToggle from "@/components/ThemeToggle";
import VaultDonut from "@/components/VaultDonut";
import SeedProfileDialog from "@/components/SeedProfileDialog";
import CrossReportPanel from "@/components/CrossReportPanel";
import SavedCrosses from "@/components/SavedCrosses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BREEDERS, SEEDS, type Seed, type SeedType } from "@/data/seeds";
import {
  TRAIT_GOALS,
  crossKey,
  estimateSeedGrowth,
  generateCrossNames,
  getCrossReport,
  groupNamesByCategory,
  type TraitGoal,
} from "@/lib/crossName";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  PHENO_STATUSES,
  STORAGE_KEYS,
  type JournalEntry,
  type SavedCross,
} from "@/lib/storage";
import { showSuccess } from "@/utils/toast";
import { MadeWithDyad } from "@/components/made-with-dyad";

const typeShort: Record<SeedType, string> = {
  Feminized: "FEM",
  Regular: "REG",
  Autoflower: "AUTO",
  "Unknown Photo": "PHOTO ?",
};

const typeStyles: Record<SeedType, string> = {
  Feminized: "bg-pink-100 text-pink-800 border-pink-200",
  Regular: "bg-blue-100 text-blue-800 border-blue-200",
  Autoflower: "bg-lime-100 text-lime-800 border-lime-200",
  "Unknown Photo": "bg-slate-100 text-slate-700 border-slate-200",
};

const TypeBadge = ({ type }: { type: SeedType }) => (
  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${typeStyles[type]}`}>
    {typeShort[type]}
  </span>
);

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

type KeeperPriority = {
  score: number;
  level: "High" | "Medium" | "Low" | "Utility";
  tone: string;
  reasons: string[];
  seedPlan: string;
  pollenPlan: string;
};

const SOUGHT_AFTER_CUES = [
  { match: /end game|grandpa|lilac diesel|crescend/i, label: "Ethos cornerstone / hyped line" },
  { match: /temple|quattro|josh d|og kush|tk/i, label: "OG / kush breeding value" },
  { match: /cookies|gelato|permanent marker|cap junkie/i, label: "modern dessert / hype lineage" },
  { match: /diesel|chem91|gmo|nycd/i, label: "gas / Chem-Diesel value" },
  { match: /deep chunk|hash plant|afghan/i, label: "hashplant / old-school preservation value" },
  { match: /abc|mutant|quack|feral|croco/i, label: "rare mutant/ABC trait" },
  { match: /brothers grimm|cinderella|blueberry|tangie/i, label: "classic keeper-hunt value" },
];

const getKeeperPriority = (seed: Seed): KeeperPriority => {
  const count = seed.count ?? 0;
  const reasons: string[] = [];
  let score = 0;

  if (seed.breeder === "Burn Pile") {
    return {
      score: 0,
      level: "Utility",
      tone: "bg-orange-50 text-orange-800 border-orange-200",
      reasons: ["one-and-only run", "white-label / potentially mislabelled", "not breeding stock"],
      seedPlan: "Do not keep seed from Burn Pile plants. Run once for testing/smoke only, then close it out.",
      pollenPlan: "Do not save pollen from Burn Pile plants; the label confidence is too low to justify breeding work.",
    };
  }

  if (count <= 2) {
    score += 42;
    reasons.push("very low stock");
  } else if (count <= 3) {
    score += 34;
    reasons.push("low stock");
  } else if (count <= 6) {
    score += 18;
    reasons.push("limited stock");
  }

  for (const cue of SOUGHT_AFTER_CUES) {
    if (cue.match.test(`${seed.name} ${seed.breeder}`)) {
      score += 14;
      reasons.push(cue.label);
    }
  }

  if (seed.type === "Regular") {
    score += 10;
    reasons.push("can produce true male/female selections");
  }
  if (seed.type === "Autoflower") score += 4;
  if (/s1|bx|rbx|f\d/i.test(seed.name)) {
    score += 6;
    reasons.push("worked filial/backcross marker");
  }

  const level = score >= 42 ? "High" : score >= 24 ? "Medium" : "Low";
  const tone =
    level === "High"
      ? "bg-red-50 text-red-800 border-red-200"
      : level === "Medium"
        ? "bg-amber-50 text-amber-800 border-amber-200"
        : "bg-emerald-50 text-emerald-800 border-emerald-200";

  const seedPlan =
    level === "High"
      ? "Keep seed from standout females before spending the line in heavy outcrossing; this is preservation-worthy if a keeper appears."
      : level === "Medium"
        ? "Worth making a small backup seed lot if the plant proves special, but do not force it if the expression is average."
        : "Use normally; keep seed only from clear winners or crosses that fit a project goal.";

  const pollenPlan =
    seed.type === "Regular"
      ? level === "High"
        ? "If a male is exceptional, save pollen as a priority donor and test it lightly before using it broadly."
        : "Save pollen only from males that beat your structure, vigor, aroma-stem, and lineage standard."
      : seed.type === "Feminized"
        ? "Female-derived pollen is an advanced preservation/combining choice; reserve it for elite keepers rather than routine crosses."
        : seed.type === "Autoflower"
          ? "Auto pollen is worth keeping only when the auto trait and plant quality are both central to the project."
          : "Wait until sex and quality are known before deciding whether pollen is worth keeping.";

  return { score, level, tone, reasons: reasons.slice(0, 3), seedPlan, pollenPlan };
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

const statusTone: Record<string, string> = Object.fromEntries(PHENO_STATUSES.map((s) => [s.value, s.tone]));

const Index = () => {
  const [inventory, setInventory] = useLocalStorage<Record<string, number>>(
    STORAGE_KEYS.inventory,
    Object.fromEntries(SEEDS.map((seed) => [seed.id, seed.count ?? 0])),
  );
  const [journal, setJournal] = useLocalStorage<Record<string, JournalEntry>>(STORAGE_KEYS.journal, {});
  const [savedCrosses, setSavedCrosses] = useLocalStorage<SavedCross[]>(STORAGE_KEYS.savedCrosses, []);

  const effectiveSeeds = useMemo(
    () => SEEDS.map((seed) => ({ ...seed, count: inventory[seed.id] ?? seed.count ?? 0 })),
    [inventory],
  );
  const byId = useMemo(() => new Map(effectiveSeeds.map((seed) => [seed.id, seed])), [effectiveSeeds]);

  const [parentA, setParentA] = useState<Seed | null>(SEEDS[0] ?? null);
  const [parentB, setParentB] = useState<Seed | null>(SEEDS[1] ?? null);
  const [salt, setSalt] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState<TraitGoal[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<SeedType | "All">("All");
  const [openBreeders, setOpenBreeders] = useState<Record<string, boolean>>({});
  const [profileSeed, setProfileSeed] = useState<Seed | null>(null);

  const liveA = parentA ? byId.get(parentA.id) ?? parentA : null;
  const liveB = parentB ? byId.get(parentB.id) ?? parentB : null;

  const report = useMemo(() => {
    if (!liveA || !liveB) return null;
    return getCrossReport(liveA, liveB, selectedGoals);
  }, [liveA, liveB, selectedGoals]);

  const names = useMemo(() => {
    if (!liveA || !liveB) return [];
    return generateCrossNames(liveA, liveB, salt, selectedGoals);
  }, [liveA, liveB, salt, selectedGoals]);

  const groupedNames = useMemo(() => groupNamesByCategory(names), [names]);

  const typeTotals = useMemo(
    () =>
      (["Feminized", "Regular", "Autoflower", "Unknown Photo"] as SeedType[]).map((type) => {
        const seeds = effectiveSeeds.filter((seed) => seed.breeder !== "Burn Pile" && seed.type === type);
        return {
          type,
          total: seeds.reduce((sum, seed) => sum + (seed.count ?? 0), 0),
          strains: seeds.length,
        };
      }),
    [effectiveSeeds],
  );

  const mainTotal = useMemo(
    () => effectiveSeeds.filter((s) => s.breeder !== "Burn Pile").reduce((sum, s) => sum + (s.count ?? 0), 0),
    [effectiveSeeds],
  );
  const burnTotal = useMemo(
    () => effectiveSeeds.filter((s) => s.breeder === "Burn Pile").reduce((sum, s) => sum + (s.count ?? 0), 0),
    [effectiveSeeds],
  );
  const grandTotal = mainTotal + burnTotal;

  const breederGroups = useMemo(
    () =>
      BREEDERS.map((breeder) => {
        const seeds = effectiveSeeds.filter((seed) => seed.breeder === breeder);
        const byType = (["Feminized", "Regular", "Autoflower", "Unknown Photo"] as SeedType[])
          .map((type) => ({
            type,
            total: seeds.filter((seed) => seed.type === type).reduce((sum, seed) => sum + (seed.count ?? 0), 0),
          }))
          .filter((entry) => entry.total > 0);
        const strains = [...seeds].sort((a, b) => (b.count ?? 0) - (a.count ?? 0));
        return { breeder, total: seeds.reduce((sum, seed) => sum + (seed.count ?? 0), 0), byType, strains };
      }),
    [effectiveSeeds],
  );

  const preservationShortlist = useMemo(
    () =>
      effectiveSeeds
        .map((seed) => ({ seed, priority: getKeeperPriority(seed) }))
        .filter(({ priority }) => priority.level === "High" || priority.level === "Medium")
        .sort((a, b) => b.priority.score - a.priority.score)
        .slice(0, 8),
    [effectiveSeeds],
  );

  const searchActive = search.trim() !== "" || typeFilter !== "All";
  const matchStrain = (seed: Seed) => {
    const term = search.trim().toLowerCase();
    const typeOk = typeFilter === "All" || seed.type === typeFilter;
    const textOk =
      term === "" || seed.name.toLowerCase().includes(term) || seed.breeder.toLowerCase().includes(term);
    return typeOk && textOk;
  };

  const toggleBreeder = (breeder: string) =>
    setOpenBreeders((current) => ({ ...current, [breeder]: !current[breeder] }));

  const setSeedCount = (id: string, count: number) =>
    setInventory((current) => ({ ...current, [id]: Math.max(0, count) }));

  const updateJournal = (id: string, entry: JournalEntry) =>
    setJournal((current) => ({ ...current, [id]: entry }));

  const crossSaved = liveA && liveB ? savedCrosses.some((c) => c.key === crossKey(liveA, liveB)) : false;

  const saveCross = () => {
    if (!liveA || !liveB || !report) return;
    const key = crossKey(liveA, liveB);
    if (savedCrosses.some((c) => c.key === key)) return;
    const entry: SavedCross = {
      key,
      parentAId: liveA.id,
      parentBId: liveB.id,
      parentAName: liveA.name,
      parentBName: liveB.name,
      name: names[0]?.name ?? `${liveA.name} × ${liveB.name}`,
      score: report.scores.overall,
      goals: selectedGoals,
      savedAt: Date.now(),
    };
    setSavedCrosses((current) => [...current, entry]);
    showSuccess("Cross saved");
  };

  const removeCross = (key: string) => setSavedCrosses((current) => current.filter((c) => c.key !== key));

  const loadCross = (cross: SavedCross) => {
    const a = byId.get(cross.parentAId);
    const b = byId.get(cross.parentBId);
    if (a) setParentA(a);
    if (b) setParentB(b);
    if (cross.goals) setSelectedGoals(cross.goals);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const randomPair = () => {
    const a = effectiveSeeds[Math.floor(Math.random() * effectiveSeeds.length)];
    let b = effectiveSeeds[Math.floor(Math.random() * effectiveSeeds.length)];
    while (b.id === a.id) b = effectiveSeeds[Math.floor(Math.random() * effectiveSeeds.length)];
    setParentA(a);
    setParentB(b);
    setSalt((value) => value + 1);
  };

  const toggleGoal = (goal: TraitGoal) => {
    setSelectedGoals((current) => (current.includes(goal) ? current.filter((item) => item !== goal) : [...current, goal]));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/70 bg-card/90 backdrop-blur">
        <div className="container flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <Leaf className="h-6 w-6" />
            </span>
            <div>
              <p className="font-display text-2xl font-black tracking-tight">CrossLab</p>
              <p className="text-sm text-muted-foreground">Vault-aware breeder planning with FEM / REG / AUTO labels</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">Main vault {mainTotal}</span>
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-800">Burn pile {burnTotal}</span>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-black text-secondary-foreground">Grand total {grandTotal}</span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container max-w-6xl pb-20 pt-8">
        <section className="grid gap-4 md:grid-cols-3">
          {typeTotals.filter((entry) => entry.total > 0).map((entry) => (
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

        <section className="mt-8 rounded-[2rem] border-2 border-border bg-card p-5 shadow-sm sm:p-7">
          <div className="mb-5 flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-primary" />
            <h2 className="font-display text-2xl font-black">Vault composition</h2>
          </div>
          <VaultDonut data={typeTotals.map((entry) => ({ type: entry.type, total: entry.total }))} />
        </section>

        <section className="mt-8 rounded-[2rem] border-2 border-border bg-card p-5 shadow-sm sm:p-7">
          <div className="mb-5 flex items-start gap-3">
            <PackagePlus className="mt-1 h-5 w-5 text-primary" />
            <div>
              <h1 className="font-display text-3xl font-black tracking-tight">Revised vault breakdown</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Tap a breeder to expand its strains. Tap a strain for its full profile, yield estimate, grow journal, and to edit your live seed count.
              </p>
            </div>
          </div>

          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search strains or breeders…"
                className="h-11 rounded-2xl pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(["All", "Feminized", "Regular", "Autoflower", "Unknown Photo"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTypeFilter(option)}
                  className={`rounded-full border-2 px-3 py-1.5 text-xs font-bold transition ${
                    typeFilter === option
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary"
                  }`}
                >
                  {option === "All" ? "All" : typeShort[option]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {breederGroups.map((group) => {
              const filteredStrains = group.strains.filter(matchStrain);
              if (searchActive && filteredStrains.length === 0) return null;
              const isOpen = searchActive || (openBreeders[group.breeder] ?? false);
              return (
                <Collapsible
                  key={group.breeder}
                  open={isOpen}
                  onOpenChange={() => toggleBreeder(group.breeder)}
                  className="rounded-3xl border border-border bg-background p-4"
                >
                  <CollapsibleTrigger className="group flex w-full items-center justify-between gap-3 text-left" disabled={searchActive}>
                    <div className="min-w-0">
                      <h2 className="font-display text-lg font-bold leading-tight">{group.breeder}</h2>
                      <p className="text-xs font-semibold text-muted-foreground">
                        {searchActive
                          ? `${filteredStrains.length} matching`
                          : `${group.strains.length} ${group.strains.length === 1 ? "strain" : "strains"} · tap to ${isOpen ? "hide" : "view"}`}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-black text-muted-foreground">{group.total} seeds</span>
                      {!searchActive && (
                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      )}
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
                    {filteredStrains.map((seed) => {
                      const entry = journal[seed.id];
                      return (
                        <div key={seed.id} className="rounded-2xl bg-muted/50 p-3">
                          <button
                            type="button"
                            onClick={() => setProfileSeed(seed)}
                            className="flex w-full items-center justify-between gap-3 text-left"
                          >
                            <div className="flex min-w-0 items-center gap-2">
                              <p className="min-w-0 truncate text-sm font-semibold hover:text-primary">{seed.name}</p>
                              {entry && (
                                <span className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-black uppercase ${statusTone[entry.status]}`}>
                                  {entry.status}
                                </span>
                              )}
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <TypeBadge type={seed.type} />
                              <span className="rounded-full bg-card px-2 py-0.5 text-[11px] font-black text-muted-foreground">
                                {seed.count ?? 0}
                              </span>
                            </div>
                          </button>

                          <div className="mt-2.5">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="mb-1.5 inline-flex cursor-help items-center gap-1 text-[10px] font-black uppercase tracking-wide text-muted-foreground underline decoration-dotted">
                                  Est. dry yield · single plant
                                </p>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="text-xs leading-relaxed">
                                  Rough per-plant estimate inferred from the strain name (lineage, auto/mutant cues) — not a guarantee. Real results depend on pheno, training, and environment.
                                </p>
                              </TooltipContent>
                            </Tooltip>
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
                        </div>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>

          <div className="mt-5 rounded-3xl bg-orange-50 p-4 text-orange-800">
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
                <button
                  key={`${seed.id}-shortlist`}
                  type="button"
                  onClick={() => setProfileSeed(seed)}
                  className={`rounded-2xl border p-3 text-left transition hover:brightness-105 ${priority.tone}`}
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
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border-2 border-border bg-card p-5 shadow-sm sm:p-7">
          <div className="mb-5 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="font-display text-2xl font-black">Cross planner</h2>
          </div>

          <div className="grid items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
            <SeedSelect label="A" accent="green" value={liveA} onChange={setParentA} seeds={effectiveSeeds} seedCounts={inventory} />
            <div className="grid place-items-center">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-muted font-display text-xl font-black text-muted-foreground">×</span>
            </div>
            <SeedSelect label="B" accent="purple" value={liveB} onChange={setParentB} seeds={effectiveSeeds} seedCounts={inventory} />
          </div>

          {liveA && liveB && (
            <div className="mt-5 space-y-3 rounded-3xl bg-muted/50 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {[liveA, liveB].map((seed) => (
                  <div key={seed.id} className="rounded-2xl bg-card p-4">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="font-display text-lg font-bold leading-tight">{seed.name}</p>
                      <TypeBadge type={seed.type} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {seed.breeder} · {seed.type} · {seed.count ?? 0} seeds
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-primary/20 bg-card p-4">
                <p className="mb-2 text-xs font-black uppercase tracking-wide text-primary">Pollen / seed route advice</p>
                <p className="text-sm font-semibold leading-relaxed">{getPairingAdvice(liveA, liveB)}</p>
                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  {[liveA, liveB].map((seed) => {
                    const advice = seed.breeder === "Burn Pile"
                      ? {
                          ...SEED_TYPE_ADVICE[seed.type],
                          pollen: "Burn Pile route: one-and-only run only. Do not collect pollen or make seeds from white-label / potentially mislabelled stock.",
                          watch: "Watch-outs: evaluate only as personal smoke/test stock; do not use it as breeding evidence or preservation material.",
                        }
                      : SEED_TYPE_ADVICE[seed.type];
                    const priority = getKeeperPriority(seed);
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
                    {getPairingTips(liveA, liveB).map((tip) => (
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
        </section>

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
          </section>
        )}

        {liveA && liveB && report && (
          <CrossReportPanel
            parentA={liveA}
            parentB={liveB}
            report={report}
            names={names}
            isSaved={crossSaved}
            onSave={saveCross}
            onRemove={() => removeCross(crossKey(liveA, liveB))}
          />
        )}

        <SavedCrosses saved={savedCrosses} onLoad={loadCross} onRemove={removeCross} />
      </main>

      <SeedProfileDialog
        seed={profileSeed}
        open={profileSeed !== null}
        onOpenChange={(open) => !open && setProfileSeed(null)}
        count={profileSeed ? inventory[profileSeed.id] ?? profileSeed.count ?? 0 : 0}
        onCountChange={(count) => profileSeed && setSeedCount(profileSeed.id, count)}
        journal={profileSeed ? journal[profileSeed.id] : undefined}
        onJournalChange={(entry) => profileSeed && updateJournal(profileSeed.id, entry)}
      />

      <MadeWithDyad />
    </div>
  );
};

export default Index;
