import { useMemo, useState } from "react";
import { Dices, FlaskConical, Leaf, PackagePlus, ShieldAlert, Sparkles, Target } from "lucide-react";
import SeedSelect from "@/components/SeedSelect";
import { Button } from "@/components/ui/button";
import {
  BURN_PILE_TOTAL,
  DEFAULT_SEED_COUNTS,
  GRAND_TOTAL,
  MAIN_VAULT_TOTAL,
  SEEDS,
  VAULT_TOTALS,
  VAULT_TYPE_TOTALS,
  type Seed,
  type SeedType,
} from "@/data/seeds";
import {
  TRAIT_GOALS,
  generateCrossNames,
  getCrossReport,
  groupNamesByCategory,
  type TraitGoal,
} from "@/lib/crossName";
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
    return "Burn Pile involved: treat any pollen or seed work as a rare one-off experiment, not preservation work.";
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

const Index = () => {
  const [parentA, setParentA] = useState<Seed | null>(SEEDS[0] ?? null);
  const [parentB, setParentB] = useState<Seed | null>(SEEDS[1] ?? null);
  const [salt, setSalt] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState<TraitGoal[]>([]);

  const report = useMemo(() => {
    if (!parentA || !parentB) return null;
    return getCrossReport(parentA, parentB, selectedGoals);
  }, [parentA, parentB, selectedGoals]);

  const names = useMemo(() => {
    if (!parentA || !parentB) return [];
    return generateCrossNames(parentA, parentB, salt, selectedGoals);
  }, [parentA, parentB, salt, selectedGoals]);

  const groupedNames = useMemo(() => groupNamesByCategory(names), [names]);

  const breederTypeTotals = useMemo(
    () =>
      VAULT_TOTALS.map((group) => {
        const seeds = SEEDS.filter((seed) => seed.breeder === group.breeder);
        const byType = (["Feminized", "Regular", "Autoflower", "Unknown Photo"] as SeedType[])
          .map((type) => ({
            type,
            total: seeds.filter((seed) => seed.type === type).reduce((sum, seed) => sum + (seed.count ?? 0), 0),
          }))
          .filter((entry) => entry.total > 0);
        return { ...group, byType };
      }),
    [],
  );

  const randomPair = () => {
    const a = SEEDS[Math.floor(Math.random() * SEEDS.length)];
    let b = SEEDS[Math.floor(Math.random() * SEEDS.length)];
    while (b.id === a.id) b = SEEDS[Math.floor(Math.random() * SEEDS.length)];
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
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">Main vault {MAIN_VAULT_TOTAL}</span>
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-800">Burn pile {BURN_PILE_TOTAL}</span>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-black text-secondary-foreground">Grand total {GRAND_TOTAL}</span>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl pb-20 pt-8">
        <section className="grid gap-4 md:grid-cols-3">
          {VAULT_TYPE_TOTALS.filter((entry) => entry.total > 0).map((entry) => (
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
          <div className="mb-5 flex items-start gap-3">
            <PackagePlus className="mt-1 h-5 w-5 text-primary" />
            <div>
              <h1 className="font-display text-3xl font-black tracking-tight">Revised vault breakdown</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Every strain now carries a visible type tag: <b>FEM</b>, <b>REG</b>, <b>AUTO</b>, or <b>PHOTO ?</b>. Burn Pile remains separated from preservation pressure.
              </p>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {breederTypeTotals.map((group) => (
              <div key={group.breeder} className="rounded-3xl border border-border bg-background p-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-lg font-bold">{group.breeder}</h2>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-black text-muted-foreground">{group.total} seeds</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {group.byType.map((entry) => (
                    <span key={entry.type} className={`rounded-full border px-3 py-1 text-xs font-black ${typeStyles[entry.type]}`}>
                      {typeShort[entry.type]}: {entry.total}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-3xl bg-orange-50 p-4 text-orange-800">
            <div className="flex items-start gap-2">
              <ShieldAlert className="mt-0.5 h-5 w-5" />
              <div>
                <p className="font-bold">Burn Pile rule</p>
                <p className="mt-1 text-sm leading-relaxed">
                  Burn Pile seeds are utility stock. They can be grown, failed, tossed, or very rarely bred if something earns the space — they are not preservation candidates.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border-2 border-border bg-card p-5 shadow-sm sm:p-7">
          <div className="mb-5 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="font-display text-2xl font-black">Cross planner</h2>
          </div>

          <div className="grid items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
            <SeedSelect label="A" accent="green" value={parentA} onChange={setParentA} seeds={SEEDS} seedCounts={DEFAULT_SEED_COUNTS} />
            <div className="grid place-items-center">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-muted font-display text-xl font-black text-muted-foreground">×</span>
            </div>
            <SeedSelect label="B" accent="purple" value={parentB} onChange={setParentB} seeds={SEEDS} seedCounts={DEFAULT_SEED_COUNTS} />
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
                      {seed.breeder} · {seed.type} · {seed.count ?? 0} seeds
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-primary/20 bg-card p-4">
                <p className="mb-2 text-xs font-black uppercase tracking-wide text-primary">Pollen / seed route advice</p>
                <p className="text-sm font-semibold leading-relaxed">{getPairingAdvice(parentA, parentB)}</p>
                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  {[parentA, parentB].map((seed) => {
                    const advice = SEED_TYPE_ADVICE[seed.type];
                    return (
                      <div key={`${seed.id}-advice`} className="rounded-2xl bg-muted/70 p-4">
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <p className="font-display text-base font-bold leading-tight">{seed.name}</p>
                          <TypeBadge type={seed.type} />
                        </div>
                        <div className="space-y-2 text-xs leading-relaxed text-muted-foreground">
                          <p><span className="font-bold text-foreground">Pollen:</span> {advice.pollen}</p>
                          <p><span className="font-bold text-foreground">Seeds:</span> {advice.seed}</p>
                          <p><span className="font-bold text-foreground">Watch:</span> {advice.watch}</p>
                        </div>
                      </div>
                    );
                  })}
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
      </main>

      <MadeWithDyad />
    </div>
  );
};

export default Index;
