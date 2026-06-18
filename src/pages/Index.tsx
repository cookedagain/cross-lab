import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Check,
  ClipboardList,
  Copy,
  Dices,
  FlaskConical,
  Heart,
  Leaf,
  Moon,
  PackagePlus,
  Ruler,
  Save,
  Sparkles,
  Sun,
  Target,
  Trash2,
  TreePine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import SeedSelect from "@/components/SeedSelect";
import {
  BURN_PILE_TOTAL,
  DEFAULT_SEED_COUNTS,
  GRAND_TOTAL,
  MAIN_VAULT_TOTAL,
  SEEDS,
  VAULT_TOTALS,
  type Seed,
} from "@/data/seeds";
import {
  TRAIT_GOALS,
  copyReportText,
  crossKey,
  generateCrossNames,
  getCrossReport,
  getSeedById,
  groupNamesByCategory,
  type CrossName,
  type CrossReport,
  type NameCategory,
  type TraitGoal,
} from "@/lib/crossName";
import { MadeWithDyad } from "@/components/made-with-dyad";

const FAVORITES_KEY = "crosslab:favorites";
const JOURNAL_KEY = "crosslab:journal";
const CUSTOM_SEEDS_KEY = "crosslab:ethos-multipass";
const SEED_COUNTS_KEY = "crosslab:seed-counts";
const THEME_KEY = "crosslab:theme";
const MULTIPASS_BREEDER = "Ethos Multipass";

type FavoriteName = {
  id: string;
  name: string;
  note: string;
  category: NameCategory;
  parentAId: string;
  parentBId: string;
  parentAName: string;
  parentBName: string;
};

type JournalEntry = {
  id: string;
  parentAId: string;
  parentBId: string;
  parentAName: string;
  parentBName: string;
  status: "Considering" | "Planned" | "Made";
  goal: string;
  score: number;
  createdAt: string;
};

function loadStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function stockStatus(count: number | undefined) {
  if (count === undefined) return { label: "Unknown", tone: "bg-muted text-muted-foreground", advice: "Treat as preserve-first until counted." };
  if (count <= 3) return { label: "Preserve", tone: "bg-red-100 text-red-700", advice: "3 or fewer seeds — keep or hunt before breeding." };
  if (count <= 6) return { label: "Cautious", tone: "bg-amber-100 text-amber-800", advice: "Limited stock — breed only if the cross is a priority." };
  return { label: "Breed", tone: "bg-primary/10 text-primary", advice: "Good stock level for breeding work." };
}

const ScoreBar = ({ label, value }: { label: string; value: number }) => (
  <div>
    <div className="mb-1 flex items-center justify-between text-xs">
      <span className="font-semibold text-foreground/80">{label}</span>
      <span className="font-bold text-primary">{value}</span>
    </div>
    <div className="h-2 overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

const TraitChip = ({
  goal,
  active,
  onClick,
}: {
  goal: TraitGoal;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition-all ${
      active
        ? "border-primary bg-primary text-primary-foreground shadow-sm"
        : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
    }`}
  >
    {goal}
  </button>
);

const TerpenePanel = ({ report }: { report: CrossReport }) => (
  <div className="rounded-3xl border-2 border-border bg-card p-5 shadow-sm sm:p-7">
    <div className="mb-4 flex items-center gap-2">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-secondary text-accent">
        <FlaskConical className="h-4 w-4" />
      </span>
      <h2 className="font-display text-lg font-bold">Expected terpene profile</h2>
    </div>

    <p className="mb-5 text-sm text-foreground/80">{report.profile.summary}</p>

    {report.profile.terpenes.length > 0 ? (
      <div className="space-y-3">
        {report.profile.terpenes.map((t) => (
          <div key={t.key}>
            <div className="mb-1 flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <span
                  className="mt-1 h-3 w-3 rounded-full"
                  style={{ backgroundColor: t.info.color }}
                />
                <div>
                  <span className="text-sm font-semibold">{t.info.name}</span>
                  <p className="text-xs text-muted-foreground">
                    {t.info.aroma} · {t.info.effect}
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">
                {t.share}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${t.share}%`, backgroundColor: t.info.color }}
              />
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-sm text-muted-foreground">
        Not enough flavor data on these parents to estimate terpenes.
      </p>
    )}

    {report.profile.flavors.length > 0 && (
      <div className="mt-5 flex flex-wrap gap-2">
        {report.profile.flavors.map((f) => (
          <span
            key={f}
            className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
          >
            {f}
          </span>
        ))}
      </div>
    )}

    <p className="mt-4 text-[11px] leading-snug text-muted-foreground">
      Estimated from parent flavor and lineage cues — actual terpenes vary by phenotype and grow.
    </p>
  </div>
);

const Index = () => {
  const [parentA, setParentA] = useState<Seed | null>(null);
  const [parentB, setParentB] = useState<Seed | null>(null);
  const [salt, setSalt] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(() =>
    typeof window !== "undefined" &&
    (window.localStorage.getItem(THEME_KEY) === "dark" ||
      (!window.localStorage.getItem(THEME_KEY) && window.matchMedia("(prefers-color-scheme: dark)").matches)),
  );
  const [selectedGoals, setSelectedGoals] = useState<TraitGoal[]>([]);
  const [multipassName, setMultipassName] = useState("");
  const [multipassCount, setMultipassCount] = useState("");
  const [customSeeds, setCustomSeeds] = useState<Seed[]>(() =>
    loadStored<Seed[]>(CUSTOM_SEEDS_KEY, []),
  );
  const [seedCounts, setSeedCounts] = useState<Record<string, number>>(() => ({
    ...DEFAULT_SEED_COUNTS,
    ...loadStored<Record<string, number>>(SEED_COUNTS_KEY, {}),
  }));
  const [favorites, setFavorites] = useState<FavoriteName[]>(() =>
    loadStored<FavoriteName[]>(FAVORITES_KEY, []),
  );
  const [journal, setJournal] = useState<JournalEntry[]>(() =>
    loadStored<JournalEntry[]>(JOURNAL_KEY, []),
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    window.localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    window.localStorage.setItem(CUSTOM_SEEDS_KEY, JSON.stringify(customSeeds));
  }, [customSeeds]);

  useEffect(() => {
    window.localStorage.setItem(SEED_COUNTS_KEY, JSON.stringify(seedCounts));
  }, [seedCounts]);

  useEffect(() => {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    window.localStorage.setItem(JOURNAL_KEY, JSON.stringify(journal));
  }, [journal]);

  const allSeeds = useMemo(() => [...SEEDS, ...customSeeds], [customSeeds]);

  const inventory = useMemo(() => {
    const knownIds = allSeeds.filter((seed) => seedCounts[seed.id] !== undefined);
    const preserve = knownIds.filter((seed) => seedCounts[seed.id] <= 3).length;
    const cautious = knownIds.filter((seed) => seedCounts[seed.id] > 3 && seedCounts[seed.id] <= 6).length;
    const breedable = knownIds.filter((seed) => seedCounts[seed.id] > 6).length;
    return {
      totalStrains: allSeeds.length,
      knownSeeds: allSeeds.reduce((sum, seed) => sum + (seedCounts[seed.id] ?? 0), 0),
      unknown: allSeeds.length - knownIds.length,
      preserve,
      cautious,
      breedable,
      multipass: customSeeds.length,
    };
  }, [allSeeds, customSeeds.length, seedCounts]);

  const names = useMemo(() => {
    if (!parentA || !parentB) return [];
    return generateCrossNames(parentA, parentB, salt, selectedGoals);
  }, [parentA, parentB, salt, selectedGoals]);

  const report = useMemo(() => {
    if (!parentA || !parentB) return null;
    return getCrossReport(parentA, parentB, selectedGoals);
  }, [parentA, parentB, selectedGoals]);

  const groupedNames = useMemo(() => groupNamesByCategory(names), [names]);
  const ready = Boolean(parentA && parentB);

  const surprise = () => {
    const a = allSeeds[Math.floor(Math.random() * allSeeds.length)];
    let b = allSeeds[Math.floor(Math.random() * allSeeds.length)];
    while (b.id === a.id) b = allSeeds[Math.floor(Math.random() * allSeeds.length)];
    setParentA(a);
    setParentB(b);
    setSalt((s) => s + 1);
  };

  const addMultipassSeed = () => {
    const name = multipassName.trim();
    const count = Number(multipassCount);
    if (!name) {
      toast.error("Add a strain name first");
      return;
    }
    if (!Number.isFinite(count) || count < 0) {
      toast.error("Seed count must be 0 or higher");
      return;
    }
    const seed: Seed = {
      id: `ethos-multipass-${makeId()}-${name}`,
      name,
      breeder: MULTIPASS_BREEDER,
      count,
    };
    setCustomSeeds((list) => [seed, ...list]);
    setSeedCounts((counts) => ({ ...counts, [seed.id]: count }));
    setMultipassName("");
    setMultipassCount("");
    toast.success("Ethos Multipass strain added", { description: `${name} · ${count} seeds` });
  };

  const updateSeedCount = (seed: Seed, value: string) => {
    const count = Number(value);
    if (!Number.isFinite(count) || count < 0) return;
    setSeedCounts((counts) => ({ ...counts, [seed.id]: count }));
  };

  const removeMultipassSeed = (seed: Seed) => {
    setCustomSeeds((list) => list.filter((item) => item.id !== seed.id));
    setSeedCounts((counts) => {
      const next = { ...counts };
      delete next[seed.id];
      return next;
    });
    if (parentA?.id === seed.id) setParentA(null);
    if (parentB?.id === seed.id) setParentB(null);
  };

  const copy = async (value: string, description = value) => {
    await navigator.clipboard.writeText(value);
    setCopied(description);
    toast.success("Copied to clipboard", { description });
    setTimeout(() => setCopied(null), 1500);
  };

  const toggleGoal = (goal: TraitGoal) => {
    setSelectedGoals((current) =>
      current.includes(goal) ? current.filter((g) => g !== goal) : [...current, goal],
    );
  };

  const isFavorite = (name: string) =>
    Boolean(parentA && parentB && favorites.some((f) => f.name === name && f.parentAId === parentA.id && f.parentBId === parentB.id));

  const toggleFavorite = (item: CrossName) => {
    if (!parentA || !parentB) return;
    const existing = favorites.find(
      (f) => f.name === item.name && f.parentAId === parentA.id && f.parentBId === parentB.id,
    );
    if (existing) {
      setFavorites((list) => list.filter((f) => f.id !== existing.id));
      toast("Removed favorite", { description: item.name });
      return;
    }
    setFavorites((list) => [
      {
        id: makeId(),
        name: item.name,
        note: item.note,
        category: item.category,
        parentAId: parentA.id,
        parentBId: parentB.id,
        parentAName: parentA.name,
        parentBName: parentB.name,
      },
      ...list,
    ]);
    toast.success("Saved favorite", { description: item.name });
  };

  const saveJournal = (status: JournalEntry["status"]) => {
    if (!parentA || !parentB || !report) return;
    const key = crossKey(parentA, parentB);
    const existing = journal.find((entry) => crossKey({ id: entry.parentAId } as Seed, { id: entry.parentBId } as Seed) === key);
    const entry: JournalEntry = {
      id: existing?.id ?? makeId(),
      parentAId: parentA.id,
      parentBId: parentB.id,
      parentAName: parentA.name,
      parentBName: parentB.name,
      status,
      goal: selectedGoals.length ? selectedGoals.join(", ") : "Open hunt",
      score: report.scores.overall,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    setJournal((list) => [entry, ...list.filter((item) => item.id !== entry.id)]);
    toast.success("Cross saved to journal", { description: `${parentA.name} × ${parentB.name}` });
  };

  const loadJournalEntry = (entry: JournalEntry) => {
    setParentA(getSeedById(entry.parentAId, allSeeds));
    setParentB(getSeedById(entry.parentBId, allSeeds));
    setSalt((s) => s + 1);
  };

  const copyFullReport = () => {
    if (!parentA || !parentB || !report) return;
    copy(copyReportText(parentA, parentB, report, names), "Full cross report");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-card/80 backdrop-blur">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <Leaf className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <p className="font-display text-xl font-extrabold tracking-tight">CrossLab</p>
              <p className="text-xs text-muted-foreground">Breeder planning workspace</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
              {inventory.totalStrains} strains
            </span>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {inventory.knownSeeds} seeds
            </span>
            <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
              {favorites.length} favorites
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsDark((value) => !value)}
            className="ml-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-border bg-card text-foreground shadow-sm transition-colors hover:border-primary hover:text-primary"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <main className="container max-w-6xl pb-24 pt-8">
        <div className="mb-8 text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-secondary px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            Cross report, names, notes & journal
          </span>
          <h1 className="font-display text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            Plan the whole <span className="text-primary">cross</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground">
            Pick two parents, set your breeding goals, and get a scored cross report with terpene estimates,
            phenotype previews, breeder notes, categorized names, favorites, and a saved journal.
          </p>
        </div>

        <section className="rounded-[2rem] border-2 border-border bg-card p-5 shadow-sm sm:p-7">
          <div className="grid items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
            <SeedSelect
              label="A"
              accent="green"
              value={parentA}
              onChange={setParentA}
              seeds={allSeeds}
              seedCounts={seedCounts}
            />
            <div className="flex items-center justify-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-display text-lg font-bold text-muted-foreground">
                ×
              </span>
            </div>
            <SeedSelect
              label="B"
              accent="purple"
              value={parentB}
              onChange={setParentB}
              seeds={allSeeds}
              seedCounts={seedCounts}
            />
          </div>

          <div className="mt-6 rounded-3xl bg-muted/60 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-wide text-foreground/80">Trait goals</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {TRAIT_GOALS.map((goal) => (
                <TraitChip
                  key={goal}
                  goal={goal}
                  active={selectedGoals.includes(goal)}
                  onClick={() => toggleGoal(goal)}
                />
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="h-12 flex-1 rounded-2xl text-base font-semibold"
              disabled={!ready}
              onClick={() => setSalt((s) => s + 1)}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {names.length ? "Regenerate report" : "Generate report"}
            </Button>
            <Button size="lg" variant="outline" className="h-12 rounded-2xl border-2 text-base font-semibold" onClick={surprise}>
              <Dices className="mr-2 h-4 w-4" />
              Surprise me
            </Button>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border-2 border-border bg-card p-5 shadow-sm sm:p-7">
          <div className="mb-5 flex items-center gap-2">
            <PackagePlus className="h-5 w-5 text-primary" />
            <div>
              <h2 className="font-display text-xl font-bold">Ethos Multipass & seed counts</h2>
              <p className="text-sm text-muted-foreground">
                Updated vault loaded: {MAIN_VAULT_TOTAL} main-vault seeds + {BURN_PILE_TOTAL} burn-pile seeds = {GRAND_TOTAL} total.
                Unknown custom counts are treated as preserve-first.
              </p>
            </div>
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            {VAULT_TOTALS.map((group) => (
              <span
                key={group.breeder}
                className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground"
              >
                {group.breeder}: {group.total}
              </span>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-5">
            <input
              value={multipassName}
              onChange={(event) => setMultipassName(event.target.value)}
              placeholder="Multipass strain name"
              className="rounded-2xl border-2 border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary sm:col-span-3"
            />
            <input
              value={multipassCount}
              onChange={(event) => setMultipassCount(event.target.value)}
              placeholder="Seed count"
              inputMode="numeric"
              type="number"
              min="0"
              className="rounded-2xl border-2 border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
            />
            <Button className="h-12 rounded-2xl" onClick={addMultipassSeed}>
              Add strain
            </Button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-2xl bg-muted p-4">
              <p className="text-xs font-bold uppercase text-muted-foreground">Strains logged</p>
              <p className="font-display text-2xl font-black">{inventory.totalStrains}</p>
            </div>
            <div className="rounded-2xl bg-muted p-4">
              <p className="text-xs font-bold uppercase text-muted-foreground">Known seed total</p>
              <p className="font-display text-2xl font-black">{inventory.knownSeeds}</p>
            </div>
            <div className="rounded-2xl bg-red-50 p-4 text-red-700">
              <p className="text-xs font-bold uppercase">Preserve first</p>
              <p className="font-display text-2xl font-black">{inventory.preserve + inventory.unknown}</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-4 text-amber-800">
              <p className="text-xs font-bold uppercase">Use cautiously</p>
              <p className="font-display text-2xl font-black">{inventory.cautious}</p>
            </div>
            <div className="rounded-2xl bg-primary/10 p-4 text-primary">
              <p className="text-xs font-bold uppercase">Breedable</p>
              <p className="font-display text-2xl font-black">{inventory.breedable}</p>
            </div>
          </div>

          {customSeeds.length > 0 && (
            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              {customSeeds.map((seed) => {
                const status = stockStatus(seedCounts[seed.id]);
                return (
                  <div key={seed.id} className="rounded-2xl border border-border bg-background p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-display text-lg font-bold">{seed.name}</p>
                        <p className="text-xs text-muted-foreground">{MULTIPASS_BREEDER}</p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${status.tone}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        value={seedCounts[seed.id] ?? ""}
                        onChange={(event) => updateSeedCount(seed, event.target.value)}
                        placeholder="Count"
                        inputMode="numeric"
                        type="number"
                        min="0"
                        className="w-28 rounded-xl border-2 border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                      />
                      <p className="flex-1 text-xs text-muted-foreground">{status.advice}</p>
                      <button
                        type="button"
                        onClick={() => removeMultipassSeed(seed)}
                        className="rounded-full bg-muted p-2 text-muted-foreground transition-colors hover:text-destructive"
                        aria-label="Remove Multipass strain"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {ready && parentA && parentB && report && (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-[2rem] border-2 border-primary/20 bg-card p-5 shadow-sm sm:p-7">
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cross potential</p>
                  <h2 className="font-display text-3xl font-black text-primary">{report.scores.overall}/100</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" className="rounded-2xl border-2" onClick={copyFullReport}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy report
                  </Button>
                  <Button className="rounded-2xl" onClick={() => saveJournal("Considering")}>
                    <Save className="mr-2 h-4 w-4" />
                    Save cross
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <ScoreBar label="Flavor synergy" value={report.scores.flavorSynergy} />
                <ScoreBar label="Terpene contrast" value={report.scores.terpeneContrast} />
                <ScoreBar label="Breeder interest" value={report.scores.breederInterest} />
                <ScoreBar label="Name potential" value={report.scores.namePotential} />
                <ScoreBar label="Goal match" value={report.scores.goalMatch} />
              </div>

              <div className="mt-6 rounded-3xl bg-secondary p-5 text-secondary-foreground">
                <h3 className="mb-2 font-display text-xl font-bold">Breeder note</h3>
                <p className="text-sm leading-relaxed">{report.breederNote}</p>
                {report.matchedGoals.length > 0 && (
                  <p className="mt-3 text-xs font-semibold">
                    Goal alignment: {report.matchedGoals.join(", ")}
                  </p>
                )}
              </div>

              <div className="mt-6 rounded-3xl border border-border bg-background p-5">
                <h3 className="mb-3 font-display text-lg font-bold">Breeding stock recommendation</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[parentA, parentB].map((seed) => {
                    const count = seedCounts[seed.id];
                    const status = stockStatus(count);
                    return (
                      <div key={seed.id} className="rounded-2xl bg-muted p-4">
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold uppercase text-muted-foreground">{seed.name}</p>
                            <p className="text-xs text-muted-foreground">{count === undefined ? "Unknown count" : `${count} seeds`}</p>
                          </div>
                          <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${status.tone}`}>{status.label}</span>
                        </div>
                        <div className="mb-2 flex items-center gap-2">
                          <input
                            value={count ?? ""}
                            onChange={(event) => updateSeedCount(seed, event.target.value)}
                            placeholder="Count"
                            inputMode="numeric"
                            type="number"
                            min="0"
                            className="w-28 rounded-xl border-2 border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                          />
                          <span className="text-xs text-muted-foreground">Update stock</span>
                        </div>
                        <p className="text-xs leading-relaxed text-muted-foreground">{status.advice}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-border bg-background p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-primary" />
                  <h3 className="font-display text-lg font-bold">Estimated plant size by light power</h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {report.growthEstimates.map((estimate) => (
                    <div key={estimate.wattage} className="rounded-2xl bg-muted p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-primary">{estimate.wattage}</p>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-[10px] font-bold uppercase text-muted-foreground">Height</p>
                          <p className="font-display text-lg font-black">
                            {estimate.heightCm.min}–{estimate.heightCm.max}cm
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase text-muted-foreground">Width</p>
                          <p className="font-display text-lg font-black">
                            {estimate.widthCm.min}–{estimate.widthCm.max}cm
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">{estimate.note}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[11px] leading-snug text-muted-foreground">
                  Estimates assume typical indoor expression; training, container size, veg time, phenotype and environment can shift final size.
                </p>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {report.phenotypes.map((pheno) => (
                  <div key={pheno.title} className="rounded-3xl border border-border bg-background p-4">
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">
                      {pheno.likelihood}
                    </span>
                    <h3 className="mt-3 font-display text-lg font-bold leading-tight">{pheno.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{pheno.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <TerpenePanel report={report} />

            <section className="rounded-[2rem] border-2 border-border bg-card p-5 shadow-sm sm:p-7 lg:col-span-2">
              <div className="mb-5 flex items-center gap-2">
                <TreePine className="h-5 w-5 text-primary" />
                <h2 className="font-display text-xl font-bold">Lineage & genetic notes</h2>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {report.lineage.map((node) => (
                  <div key={node.parent} className="rounded-3xl border border-border bg-background p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Parent {node.parent}</p>
                        <h3 className="font-display text-lg font-bold">{node.name}</h3>
                        <p className="text-xs text-muted-foreground">{node.breeder}</p>
                      </div>
                      <div className="flex flex-wrap justify-end gap-1">
                        {node.flags.map((flag) => (
                          <span key={flag} className="rounded-full bg-secondary px-2 py-1 text-[10px] font-bold text-secondary-foreground">
                            {flag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {node.pieces.map((piece) => (
                        <div key={piece} className="rounded-2xl bg-muted px-3 py-2 text-sm font-medium">
                          {piece}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {report.geneticNotes.map((note) => (
                  <div key={note.label} className="rounded-2xl bg-muted p-4">
                    <p className="font-bold text-sm">{note.label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{note.note}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {ready && names.length > 0 && (
          <section className="mt-8 rounded-[2rem] border-2 border-border bg-card p-5 shadow-sm sm:p-7">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-black">Categorized name suggestions</h2>
                <p className="text-sm text-muted-foreground">10 names split into commercial, terpene, breeder tribute, and keeper-weirdo directions.</p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{names.length} ideas</span>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {groupedNames.map((group) => (
                <div key={group.category} className="rounded-3xl bg-background p-4">
                  <h3 className="mb-3 font-display text-lg font-bold">{group.category}</h3>
                  <div className="space-y-3">
                    {group.names.map((item) => (
                      <div key={item.name} className="rounded-2xl border border-border bg-card p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="font-display text-lg font-bold leading-tight">{item.name}</h4>
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.note}</p>
                          </div>
                          <div className="flex shrink-0 gap-1">
                            <button
                              type="button"
                              onClick={() => toggleFavorite(item)}
                              className={`rounded-full p-2 transition-colors ${isFavorite(item.name) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-primary"}`}
                              aria-label="Save favorite"
                            >
                              <Heart className={`h-4 w-4 ${isFavorite(item.name) ? "fill-current" : ""}`} />
                            </button>
                            <button
                              type="button"
                              onClick={() => copy(item.name)}
                              className="rounded-full bg-muted p-2 text-muted-foreground transition-colors hover:text-primary"
                              aria-label="Copy name"
                            >
                              {copied === item.name ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-[2rem] border-2 border-border bg-card p-5 shadow-sm sm:p-7">
            <div className="mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-bold">Saved name favorites</h2>
            </div>
            {favorites.length > 0 ? (
              <div className="space-y-3">
                {favorites.slice(0, 8).map((fav) => (
                  <div key={fav.id} className="rounded-2xl bg-muted p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-display text-lg font-bold">{fav.name}</p>
                        <p className="text-xs text-muted-foreground">{fav.parentAName} × {fav.parentBName}</p>
                      </div>
                      <button type="button" onClick={() => setFavorites((list) => list.filter((f) => f.id !== fav.id))} className="text-xs font-bold text-muted-foreground hover:text-destructive">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Heart names to build a shortlist for your keeper labels.</p>
            )}
          </section>

          <section className="rounded-[2rem] border-2 border-border bg-card p-5 shadow-sm sm:p-7">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                <h2 className="font-display text-xl font-bold">Cross journal</h2>
              </div>
              {ready && (
                <div className="hidden gap-2 sm:flex">
                  <Button size="sm" variant="outline" className="rounded-xl" onClick={() => saveJournal("Planned")}>Planned</Button>
                  <Button size="sm" variant="outline" className="rounded-xl" onClick={() => saveJournal("Made")}>Made</Button>
                </div>
              )}
            </div>
            {journal.length > 0 ? (
              <div className="space-y-3">
                {journal.slice(0, 8).map((entry) => (
                  <div key={entry.id} className="rounded-2xl bg-muted p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="rounded-full bg-card px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">{entry.status}</span>
                        <p className="mt-2 font-display text-base font-bold leading-tight">{entry.parentAName} × {entry.parentBName}</p>
                        <p className="mt-1 text-xs text-muted-foreground">Goal: {entry.goal} · Score {entry.score}/100</p>
                      </div>
                      <div className="flex shrink-0 flex-col gap-2">
                        <button type="button" onClick={() => loadJournalEntry(entry)} className="text-xs font-bold text-primary">Load</button>
                        <button type="button" onClick={() => setJournal((list) => list.filter((j) => j.id !== entry.id))} className="text-xs font-bold text-muted-foreground hover:text-destructive">Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
                <BookOpen className="mb-2 h-5 w-5" />
                Save a cross to track planned, made, or interesting pairings locally in this browser.
              </div>
            )}
          </section>
        </div>

        {!ready && (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Choose both parents to generate a full cross report.
          </p>
        )}
      </main>

      <MadeWithDyad />
    </div>
  );
};

export default Index;
