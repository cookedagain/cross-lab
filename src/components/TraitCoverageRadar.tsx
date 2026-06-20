import { useMemo } from "react";
import { Radar as RadarIcon } from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
} from "recharts";
import { useVault } from "@/hooks/useVaultStore";
import { getSingleSeedProfile, TRAIT_GOALS, type TraitGoal } from "@/lib/crossName";

const TraitCoverageRadar = () => {
  const { vaultSeeds } = useVault();

  const data = useMemo(() => {
    const counts = Object.fromEntries(TRAIT_GOALS.map((goal) => [goal, 0])) as Record<TraitGoal, number>;
    for (const seed of vaultSeeds) {
      if (seed.breeder === "Burn Pile") continue;
      for (const goal of getSingleSeedProfile(seed).goals) {
        counts[goal] += 1;
      }
    }
    return TRAIT_GOALS.map((goal) => ({ goal, count: counts[goal] }));
  }, [vaultSeeds]);

  const thin = data.filter((entry) => entry.count <= 2).map((entry) => entry.goal);

  return (
    <section className="mt-8 rounded-[2rem] border-2 border-border bg-card p-5 shadow-sm sm:p-7">
      <div className="mb-5 flex items-center gap-2">
        <RadarIcon className="h-5 w-5 text-primary" />
        <h2 className="font-display text-2xl font-black">Trait coverage</h2>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        How many strains in your vault express each trait goal, based on name and lineage cues. Thin areas are good
        targets for your next pickups.
      </p>

      <div className="rounded-3xl border border-border bg-background p-4">
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={data} outerRadius="75%">
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="goal" tick={{ fontSize: 11, fontWeight: 700 }} />
            <RTooltip />
            <Radar dataKey="count" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.4} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {thin.length > 0 && (
        <div className="mt-4 rounded-2xl bg-muted/50 p-4">
          <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">Thin trait areas</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {thin.map((goal) => (
              <span key={goal} className="rounded-full border border-border bg-card px-3 py-1 text-xs font-bold text-muted-foreground">
                {goal}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default TraitCoverageRadar;