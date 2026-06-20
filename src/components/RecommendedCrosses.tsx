import { useMemo, useState } from "react";
import { GitFork, Sparkles } from "lucide-react";
import { useVault } from "@/hooks/useVaultStore";
import { TRAIT_GOALS, type TraitGoal } from "@/lib/crossName";
import { recommendCrosses } from "@/lib/recommendedCrosses";
import { TypeBadge } from "@/components/TypeBadge";
import CollapsibleSection from "@/components/CollapsibleSection";

const RecommendedCrosses = () => {
  const { vaultSeeds, seedWithCount } = useVault();
  const [goals, setGoals] = useState<TraitGoal[]>([]);

  const counted = useMemo(() => vaultSeeds.map(seedWithCount), [vaultSeeds, seedWithCount]);

  const recommendations = useMemo(
    () => recommendCrosses(counted, goals, 6),
    [counted, goals],
  );

  const toggleGoal = (goal: TraitGoal) =>
    setGoals((current) =>
      current.includes(goal) ? current.filter((item) => item !== goal) : [...current, goal],
    );

  return (
    <CollapsibleSection
      title="Recommended crosses"
      icon={<GitFork className="h-5 w-5" />}
      description="Auto-scanned from your in-stock vault. Pairs are ranked by cross potential, keeper value, and breeder diversity — true-male donors are paired with strong receivers first. Pick trait goals to re-bias the results."
    >
      <div className="mb-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setGoals([])}
          className={`rounded-full border-2 px-3 py-1.5 text-xs font-bold transition ${
            goals.length === 0
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
          }`}
        >
          Any goal
        </button>
        {TRAIT_GOALS.map((goal) => {
          const active = goals.includes(goal);
          return (
            <button
              key={goal}
              type="button"
              onClick={() => toggleGoal(goal)}
              className={`rounded-full border-2 px-3 py-1.5 text-xs font-bold transition ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {goal}
            </button>
          );
        })}
      </div>

      {recommendations.length === 0 ? (
        <p className="rounded-2xl bg-muted/50 p-4 text-sm font-semibold text-muted-foreground">
          Not enough in-stock breeding stock to recommend crosses yet. Add seed counts to your vault and
          the planner will start ranking pairings.
        </p>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {recommendations.map((rec, index) => (
            <div key={rec.key} className="rounded-3xl border border-border bg-background p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-black text-primary">
                    {index + 1}
                  </span>
                  <div className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-black text-primary-foreground">
                    <Sparkles className="h-3.5 w-3.5" />
                    {rec.score}
                  </div>
                </div>
                <span className="text-[11px] font-bold text-muted-foreground">
                  {rec.overall}/100 potential
                </span>
              </div>

              <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                {[rec.parentA, rec.parentB].map((seed, i) => (
                  <div key={seed.id} className="contents">
                    <div className="rounded-2xl bg-card p-3">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <p className="font-display text-sm font-bold leading-tight">{seed.name}</p>
                        <TypeBadge type={seed.type} />
                      </div>
                      <p className="text-[11px] font-semibold text-muted-foreground">
                        {seed.breeder} · {seed.count ?? 0} seeds
                      </p>
                    </div>
                    {i === 0 && (
                      <span className="hidden place-self-center font-display text-lg font-black text-muted-foreground sm:block">
                        ×
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{rec.summary}</p>

              <ul className="mt-3 space-y-1.5">
                {rec.reasons.map((reason) => (
                  <li key={reason} className="flex items-start gap-2 text-xs font-semibold leading-relaxed">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </CollapsibleSection>
  );
};

export default RecommendedCrosses;
