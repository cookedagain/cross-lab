import { useMemo, useState } from "react";
import { Beaker, Dna, FlaskConical, GitBranch, HeartPulse, Sparkles, Target, WandSparkles } from "lucide-react";
import SeedSelect from "@/components/SeedSelect";
import CollapsibleSection from "@/components/CollapsibleSection";
import { TypeBadge } from "@/components/TypeBadge";
import { useVault } from "@/hooks/useVaultStore";
import { GROW_STATIONS, scaleYieldForStation } from "@/lib/growStations";
import {
  TRAIT_GOALS,
  generateCrossNames,
  getCrossReport,
  type TraitGoal,
} from "@/lib/crossName";
import { getKeeperPriority } from "@/lib/keeper";
import type { Seed } from "@/data/seeds";

const scoreTone = (score: number) => {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-300";
  if (score >= 65) return "text-amber-600 dark:text-amber-300";
  return "text-muted-foreground";
};

const getBreedingRoute = (a: Seed, b: Seed) => {
  if (a.breeder === "Burn Pile" || b.breeder === "Burn Pile") {
    return "Burn Pile genetics should stay test/smoke-only. Avoid using this pairing for preservation or breeding records.";
  }
  if (a.type === "Regular" || b.type === "Regular") {
    return "Best route: hunt the regular side for a strong male donor, then use the stronger female as the seed receiver.";
  }
  if (a.type === "Autoflower" || b.type === "Autoflower") {
    return "Auto route: keep this as a speed/compactness project. Auto × auto is cleaner than photo × auto if the goal is stable auto offspring.";
  }
  return "Fem route: treat this as a targeted female-line combination or advanced reversal project. Keep it small and goal-focused.";
};

const getStockCaution = (seed: Seed, count: number) => {
  if (count <= 3) return `${seed.name}: very low stock — preserve before spending heavily.`;
  if (count <= 5) return `${seed.name}: low stock — make only a small test lot first.`;
  return `${seed.name}: enough stock for normal testing.`;
};

const InteractiveBreedingLab = () => {
  const { vaultSeeds, seedCounts, getSeedCount, seedWithCount } = useVault();
  const [parentA, setParentA] = useState<Seed | null>(null);
  const [parentB, setParentB] = useState<Seed | null>(null);
  const [selectedGoals, setSelectedGoals] = useState<TraitGoal[]>(["Heavy resin"]);
  const [stationId, setStationId] = useState("ac4x4");
  const [salt, setSalt] = useState(0);

  const usableSeeds = useMemo(
    () => vaultSeeds.filter((seed) => seed.breeder !== "Burn Pile" && getSeedCount(seed) > 0),
    [vaultSeeds, getSeedCount],
  );

  const selectedStation = useMemo(
    () => GROW_STATIONS.find((station) => station.id === stationId) ?? GROW_STATIONS[2],
    [stationId],
  );

  const report = useMemo(() => {
    if (!parentA || !parentB) return null;
    return getCrossReport(parentA, parentB, selectedGoals);
  }, [parentA, parentB, selectedGoals]);

  const names = useMemo(() => {
    if (!parentA || !parentB) return [];
    return generateCrossNames(parentA, parentB, salt, selectedGoals).slice(0, 6);
  }, [parentA, parentB, salt, selectedGoals]);

  const selectedGrowth = useMemo(() => {
    if (!report) return null;
    return report.growthEstimates.find((estimate) => estimate.wattage === selectedStation.category) ?? report.growthEstimates[1];
  }, [report, selectedStation]);

  const selectedStationYield = useMemo(() => {
    if (!selectedGrowth) return null;
    return scaleYieldForStation(selectedGrowth.yieldG, selectedStation.category);
  }, [selectedGrowth, selectedStation]);

  const toggleGoal = (goal: TraitGoal) => {
    setSelectedGoals((current) =>
      current.includes(goal) ? current.filter((item) => item !== goal) : [...current, goal],
    );
  };

  const randomPair = () => {
    if (usableSeeds.length < 2) return;
    const a = usableSeeds[Math.floor(Math.random() * usableSeeds.length)];
    let b = usableSeeds[Math.floor(Math.random() * usableSeeds.length)];
    while (b.id === a.id) b = usableSeeds[Math.floor(Math.random() * usableSeeds.length)];
    setParentA(a);
    setParentB(b);
    setSalt((value) => value + 1);
  };

  return (
    <CollapsibleSection
      title="Interactive Breeding Lab"
      icon={<Dna className="h-5 w-5" />}
      description="Simulate parent pairings, trait goals, offspring phenotypes, cross names, and station-specific offspring estimates."
    >
      <div className="grid items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <SeedSelect
          label="A"
          accent="green"
          title="Parent A"
          value={parentA}
          onChange={setParentA}
          onClear={() => setParentA(null)}
          seeds={usableSeeds}
          seedCounts={seedCounts}
        />
        <div className="grid place-items-center gap-2">
          <button
            type="button"
            onClick={randomPair}
            className="inline-flex items-center gap-2 rounded-full border-2 border-border bg-card px-3 py-2 text-xs font-black text-muted-foreground transition hover:border-primary hover:text-primary"
          >
            <FlaskConical className="h-4 w-4" /> Random pair
          </button>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-muted font-display text-xl font-black text-muted-foreground">×</span>
        </div>
        <SeedSelect
          label="B"
          accent="purple"
          title="Parent B"
          value={parentB}
          onChange={setParentB}
          onClear={() => setParentB(null)}
          seeds={usableSeeds}
          seedCounts={seedCounts}
        />
      </div>

      <div className="mt-5 rounded-3xl bg-muted/60 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <p className="text-xs font-black uppercase tracking-wide text-primary">Trait goals</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {TRAIT_GOALS.map((goal) => (
            <button
              key={goal}
              type="button"
              onClick={() => toggleGoal(goal)}
              className={`rounded-full border-2 px-3 py-1.5 text-xs font-bold transition ${
                selectedGoals.includes(goal)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {goal}
            </button>
          ))}
        </div>
      </div>

      {parentA && parentB && report && selectedGrowth && selectedStationYield ? (
        <div className="mt-5 space-y-4">
          <div className="grid gap-3 lg:grid-cols-3">
            {[parentA, parentB].map((seed) => {
              const count = getSeedCount(seed);
              const keeper = getKeeperPriority(seedWithCount(seed));
              return (
                <div key={seed.id} className="rounded-3xl border border-border bg-background p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="font-display text-lg font-black leading-tight">{seed.name}</p>
                    <TypeBadge type={seed.type} />
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground">{seed.breeder} · {count} seeds</p>
                  <div className={`mt-3 rounded-2xl border p-3 ${keeper.tone}`}>
                    <p className="text-[10px] font-black uppercase tracking-wide">{keeper.level} keeper priority</p>
                    <p className="mt-1 text-xs font-semibold leading-relaxed">{keeper.reasons.join(" · ") || "standard working stock"}</p>
                  </div>
                </div>
              );
            })}

            <div className="rounded-3xl border-2 border-primary/20 bg-primary/5 p-4">
              <p className="text-[10px] font-black uppercase tracking-wide text-primary">Cross potential</p>
              <p className={`mt-1 font-display text-5xl font-black ${scoreTone(report.scores.overall)}`}>{report.scores.overall}</p>
              <p className="text-xs font-bold text-muted-foreground">overall score / 100</p>
              <p className="mt-3 text-sm font-semibold leading-relaxed">{report.profile.summary}</p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {Object.entries(report.scores).map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-card p-3">
                <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">{label.replace(/([A-Z])/g, " $1")}</p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
                </div>
                <p className="mt-1 text-xs font-black text-primary">{value}/100</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl border border-border bg-background p-4">
              <div className="mb-3 flex items-center gap-2">
                <WandSparkles className="h-4 w-4 text-primary" />
                <p className="text-xs font-black uppercase tracking-wide text-primary">Name candidates</p>
              </div>
              <div className="grid gap-2">
                {names.map((name) => (
                  <div key={`${name.name}-${name.category}`} className="rounded-2xl bg-card p-3">
                    <p className="font-display text-lg font-black">{name.name}</p>
                    <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">{name.category}</p>
                    <p className="mt-1 text-xs font-semibold leading-relaxed text-muted-foreground">{name.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-background p-4">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="text-xs font-black uppercase tracking-wide text-primary">Phenotype preview</p>
              </div>
              <div className="grid gap-3">
                {report.phenotypes.map((pheno) => (
                  <div key={pheno.title} className="rounded-2xl bg-card p-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-bold leading-tight">{pheno.title}</p>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">{pheno.likelihood}</span>
                    </div>
                    <p className="mt-1 text-xs font-semibold leading-relaxed text-muted-foreground">{pheno.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-border bg-background p-4">
              <div className="mb-3 flex items-center gap-2">
                <Beaker className="h-4 w-4 text-primary" />
                <p className="text-xs font-black uppercase tracking-wide text-primary">Offspring grow estimate</p>
              </div>
              <div className="mb-3 flex flex-wrap gap-2">
                {GROW_STATIONS.map((station) => (
                  <button
                    key={station.id}
                    type="button"
                    onClick={() => setStationId(station.id)}
                    className={`rounded-full border px-3 py-1.5 text-[11px] font-black transition ${stationId === station.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary"}`}
                  >
                    {station.category}
                  </button>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-card p-3">
                  <p className="text-[10px] font-black uppercase text-muted-foreground">Height</p>
                  <p className="mt-1 font-display text-lg font-black">{selectedGrowth.heightCm.min}–{selectedGrowth.heightCm.max}cm</p>
                </div>
                <div className="rounded-2xl bg-card p-3">
                  <p className="text-[10px] font-black uppercase text-muted-foreground">Width</p>
                  <p className="mt-1 font-display text-lg font-black">{selectedGrowth.widthCm.min}–{selectedGrowth.widthCm.max}cm</p>
                </div>
                <div className="rounded-2xl bg-card p-3">
                  <p className="text-[10px] font-black uppercase text-muted-foreground">Full-station yield</p>
                  <p className="mt-1 font-display text-lg font-black">{selectedStationYield.min}–{selectedStationYield.max}g</p>
                  <p className="text-[10px] font-bold text-muted-foreground">dry flower estimate</p>
                </div>
              </div>
              <p className="mt-3 text-xs font-semibold leading-relaxed text-muted-foreground">{selectedGrowth.note}</p>
            </div>

            <div className="rounded-3xl border border-border bg-background p-4">
              <div className="mb-3 flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-primary" />
                <p className="text-xs font-black uppercase tracking-wide text-primary">Breeding route</p>
              </div>
              <p className="text-sm font-bold leading-relaxed">{getBreedingRoute(parentA, parentB)}</p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-xs font-semibold leading-relaxed text-muted-foreground">
                <li>{getStockCaution(parentA, getSeedCount(parentA))}</li>
                <li>{getStockCaution(parentB, getSeedCount(parentB))}</li>
                <li>{report.matchedGoals.length ? `Matched goals: ${report.matchedGoals.join(", ")}` : "No selected goal is strongly matched yet — try different parents or goals."}</li>
                <li>{report.breederNote}</li>
              </ul>
            </div>
          </div>

          {report.geneticNotes.length > 0 && (
            <div className="rounded-3xl bg-muted/60 p-4">
              <div className="mb-3 flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-primary" />
                <p className="text-xs font-black uppercase tracking-wide text-primary">Genetic notes</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {report.geneticNotes.map((note) => (
                  <div key={note.label} className="rounded-2xl bg-card p-3">
                    <p className="text-xs font-black uppercase tracking-wide text-foreground">{note.label}</p>
                    <p className="mt-1 text-xs font-semibold leading-relaxed text-muted-foreground">{note.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-5 rounded-3xl bg-muted/60 p-5 text-sm font-semibold text-muted-foreground">
          Choose two in-stock parents to simulate cross potential, offspring phenotypes, names, grow estimates, and preservation cautions.
        </div>
      )}
    </CollapsibleSection>
  );
};

export default InteractiveBreedingLab;
