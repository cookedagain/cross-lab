import { useMemo, useState } from "react";
import { CalendarDays, Flower2, Gauge, Leaf, Ruler, Sprout, SunMedium, Timer, Trophy } from "lucide-react";
import SeedSelect from "@/components/SeedSelect";
import CollapsibleSection from "@/components/CollapsibleSection";
import { TypeBadge } from "@/components/TypeBadge";
import { useVault } from "@/hooks/useVaultStore";
import { GROW_STATIONS, scaleYieldForStation } from "@/lib/growStations";
import { estimateAdvancedMetrics, estimateLineageSplit, estimateSeedGrowth } from "@/lib/crossName";
import type { Seed } from "@/data/seeds";

type Season = "Spring" | "Summer" | "Autumn" | "Winter";

const SEASONS: Season[] = ["Spring", "Summer", "Autumn", "Winter"];

const seasonTone: Record<Season, string> = {
  Spring: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
  Summer: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
  Autumn: "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-200",
  Winter: "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200",
};

const getVegWeeks = (seed: Seed, category: string) => {
  if (seed.type === "Autoflower") return 3;
  if (category === "<100W") return 3;
  if (category === "280W") return 4;
  return 5;
};

const getSeasonAdjustment = (season: Season, moldResilience: number, stressResistance: number) => {
  if (season === "Summer") return moldResilience >= 4 ? 0 : 1;
  if (season === "Winter") return stressResistance >= 4 ? 0 : 1;
  return 0;
};

const GrowSimulator = () => {
  const { vaultSeeds, seedCounts, getSeedCount } = useVault();
  const [seed, setSeed] = useState<Seed | null>(null);
  const [stationId, setStationId] = useState("ac2x4");
  const [season, setSeason] = useState<Season>("Spring");

  const selectableSeeds = useMemo(
    () => vaultSeeds.filter((item) => !item.breeder.includes("Burn Pile") && getSeedCount(item) > 0),
    [vaultSeeds, getSeedCount],
  );

  const selectedStation = useMemo(
    () => GROW_STATIONS.find((station) => station.id === stationId) ?? GROW_STATIONS[1],
    [stationId],
  );

  const simulation = useMemo(() => {
    if (!seed) return null;

    const adv = estimateAdvancedMetrics(seed);
    const split = estimateLineageSplit(seed);
    const growth = estimateSeedGrowth(seed).find((item) => item.wattage === selectedStation.category) ?? estimateSeedGrowth(seed)[1];
    const projectedYield = scaleYieldForStation(growth.yieldG, selectedStation.category);
    const vegWeeks = getVegWeeks(seed, selectedStation.category);
    const flowerWeeks = Math.ceil(adv.floweringWeeks + getSeasonAdjustment(season, adv.moldResilience, adv.stressResistance));
    const totalWeeks = seed.type === "Autoflower" ? Math.max(10, flowerWeeks + 2) : vegWeeks + flowerWeeks + 2;

    const phases = [
      {
        label: "Start / seedling",
        weeks: "Week 1",
        icon: <Sprout className="h-4 w-4" />,
        note: "Gentle start, watch vigor, and decide if it earns the space.",
      },
      {
        label: seed.type === "Autoflower" ? "Auto structure set" : "Veg + training window",
        weeks: seed.type === "Autoflower" ? "Weeks 2–3" : `Weeks 2–${vegWeeks}`,
        icon: <Leaf className="h-4 w-4" />,
        note:
          selectedStation.category === "<100W"
            ? "Keep the canopy compact; this station favors low stretch and early shape control."
            : selectedStation.category === "280W"
              ? "Use the 2×4 for a controlled two-plant canopy, quarantine, or reproduction work."
              : "Use the 4×4 space for fuller structure and bigger lateral spread.",
      },
      {
        label: "Flower / bulk phase",
        weeks: seed.type === "Autoflower" ? `Weeks 4–${Math.max(8, flowerWeeks + 2)}` : `Weeks ${vegWeeks + 1}–${vegWeeks + flowerWeeks}`,
        icon: <Flower2 className="h-4 w-4" />,
        note: `${adv.floweringWeeks} week genetic estimate; ${season} adds ${getSeasonAdjustment(season, adv.moldResilience, adv.stressResistance)} caution week(s).`,
      },
      {
        label: "Harvest + cure planning",
        weeks: `~Week ${totalWeeks}`,
        icon: <Trophy className="h-4 w-4" />,
        note: "Use this as a planning estimate; final timing still depends on plant expression and maturity checks.",
      },
    ];

    const riskNotes = [
      adv.stretchFactor === "High" && selectedStation.category === "<100W" ? "High stretch risk in VGrow — choose another station if possible." : "Stretch risk is manageable for the selected station.",
      season === "Summer" && adv.moldResilience < 4 ? "Summer run: prioritize airflow and avoid dense, stagnant canopy zones." : "Season fit looks reasonable.",
      getSeedCount(seed) <= 5 ? "Low stock: consider preserving remaining seeds before repeated runs." : "Stock level supports a normal run.",
    ];

    return { adv, split, growth, projectedYield, vegWeeks, flowerWeeks, totalWeeks, phases, riskNotes };
  }, [seed, selectedStation, season, getSeedCount]);

  return (
    <CollapsibleSection
      title="Simulate Grow"
      icon={<CalendarDays className="h-5 w-5" />}
      description="Pick a seed, grow station, and season to preview timeline, size, yield, and risk notes before you pop anything."
    >
      <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <SeedSelect
          label="S"
          accent="green"
          title="Seed to simulate"
          value={seed}
          onChange={setSeed}
          onClear={() => setSeed(null)}
          seeds={selectableSeeds}
          seedCounts={seedCounts}
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-2xl border border-border bg-background p-3">
            <p className="mb-2 text-[10px] font-black uppercase tracking-wide text-primary">Grow station</p>
            <div className="grid gap-2">
              {GROW_STATIONS.map((station) => (
                <button
                  key={station.id}
                  type="button"
                  onClick={() => setStationId(station.id)}
                  className={`rounded-xl border-2 p-2.5 text-left text-xs font-bold transition ${
                    stationId === station.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {station.name}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background p-3">
            <p className="mb-2 text-[10px] font-black uppercase tracking-wide text-primary">Season</p>
            <div className="grid grid-cols-2 gap-2">
              {SEASONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSeason(item)}
                  className={`rounded-xl border px-3 py-2 text-xs font-black transition ${season === item ? seasonTone[item] : "border-border bg-card text-muted-foreground hover:border-primary/50"}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {seed && simulation ? (
        <div className="mt-5 space-y-4">
          <div className="rounded-3xl border-2 border-primary/20 bg-primary/5 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wide text-primary">Simulation result</p>
                <h3 className="mt-1 font-display text-2xl font-black">{seed.name}</h3>
                <p className="text-xs font-semibold text-muted-foreground">{seed.breeder} · {getSeedCount(seed)} seeds in stock</p>
              </div>
              <TypeBadge type={seed.type} />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              <div className="rounded-2xl bg-card p-3">
                <p className="flex items-center gap-1 text-[10px] font-black uppercase text-muted-foreground"><Timer className="h-3 w-3" />Total</p>
                <p className="mt-1 font-display text-xl font-black">~{simulation.totalWeeks} weeks</p>
              </div>
              <div className="rounded-2xl bg-card p-3">
                <p className="flex items-center gap-1 text-[10px] font-black uppercase text-muted-foreground"><Ruler className="h-3 w-3" />Height</p>
                <p className="mt-1 font-display text-xl font-black">{simulation.growth.heightCm.min}–{simulation.growth.heightCm.max}cm</p>
              </div>
              <div className="rounded-2xl bg-card p-3">
                <p className="flex items-center gap-1 text-[10px] font-black uppercase text-muted-foreground"><Trophy className="h-3 w-3" />Full-station yield</p>
                <p className="mt-1 font-display text-xl font-black">{simulation.projectedYield.min}–{simulation.projectedYield.max}g</p>
                <p className="text-[10px] font-bold text-muted-foreground">dry flower estimate</p>
              </div>
              <div className="rounded-2xl bg-card p-3">
                <p className="flex items-center gap-1 text-[10px] font-black uppercase text-muted-foreground"><Gauge className="h-3 w-3" />Lean</p>
                <p className="mt-1 font-display text-xl font-black">{simulation.split.sativa}/{simulation.split.indica}</p>
                <p className="text-[10px] font-bold text-muted-foreground">Sativa / Indica</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-4">
            {simulation.phases.map((phase) => (
              <div key={phase.label} className="rounded-2xl border border-border bg-background p-4">
                <div className="mb-2 flex items-center gap-2 text-primary">
                  {phase.icon}
                  <p className="text-[10px] font-black uppercase tracking-wide">{phase.weeks}</p>
                </div>
                <p className="font-bold leading-tight">{phase.label}</p>
                <p className="mt-2 text-xs font-semibold leading-relaxed text-muted-foreground">{phase.note}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-2xl bg-muted/60 p-4">
              <p className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-primary"><SunMedium className="h-4 w-4" />Environment read</p>
              <ul className="list-disc space-y-1 pl-5 text-xs font-semibold leading-relaxed text-muted-foreground">
                {simulation.riskNotes.map((note) => <li key={note}>{note}</li>)}
              </ul>
            </div>
            <div className="rounded-2xl bg-muted/60 p-4">
              <p className="mb-2 text-xs font-black uppercase tracking-wide text-primary">Trait ratings</p>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-muted-foreground">
                <span>Terps: {simulation.adv.terpeneIntensity}/5</span>
                <span>Resin: {simulation.adv.resinDensity}/5</span>
                <span>Ease: {simulation.adv.easeOfGrow}/5</span>
                <span>Stretch: {simulation.adv.stretchFactor}</span>
                <span>Stress: {simulation.adv.stressResistance}/5</span>
                <span>Mold: {simulation.adv.moldResilience}/5</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-3xl bg-muted/60 p-5 text-sm font-semibold text-muted-foreground">
          Choose a seed to generate the grow timeline and station-specific estimates.
        </div>
      )}
    </CollapsibleSection>
  );
};

export default GrowSimulator;
