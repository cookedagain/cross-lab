import { useMemo, useState } from "react";
import { Crown, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useVault } from "@/hooks/useVaultStore";
import {
  TRAIT_GOALS,
  estimateAdvancedMetrics,
  getSingleSeedProfile,
  type TraitGoal,
} from "@/lib/crossName";
import { getKeeperPriority } from "@/lib/keeper";
import { TypeBadge } from "@/components/TypeBadge";
import CollapsibleSection from "@/components/CollapsibleSection";
import type { Seed } from "@/data/seeds";

const scoreSeed = (seed: Seed, goal: TraitGoal | null) => {
  const adv = estimateAdvancedMetrics(seed);
  const profile = getSingleSeedProfile(seed, seed.count);
  const keeper = getKeeperPriority(seed);
  const goalBonus = goal && profile.goals.includes(goal) ? 28 : 0;
  return keeper.score + goalBonus + adv.terpeneIntensity * 2 + adv.resinDensity * 2;
};

const ParentColumn = ({
  title,
  subtitle,
  seeds,
  goal,
  accent,
}: {
  title: string;
  subtitle: string;
  seeds: Seed[];
  goal: TraitGoal | null;
  accent: string;
}) => {
  const ranked = useMemo(
    () =>
      [...seeds]
        .map((seed) => ({ seed, score: scoreSeed(seed, goal) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5),
    [seeds, goal],
  );

  return (
    <div className="rounded-3xl border border-border bg-background p-4">
      <div className="mb-3 flex items-center gap-2">
        <Crown className={`h-4 w-4 ${accent}`} />
        <div>
          <p className="font-display text-base font-bold leading-tight">{title}</p>
          <p className="text-xs font-semibold text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-2">
        {ranked.map(({ seed }, index) => (
          <Link
            key={seed.id}
            to={`/strain/${encodeURIComponent(seed.id)}`}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-primary"
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted text-xs font-black text-muted-foreground">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{seed.name}</p>
              <p className="truncate text-[11px] font-semibold text-muted-foreground">
                {seed.breeder} · {seed.count ?? 0} seeds
              </p>
            </div>
            <TypeBadge type={seed.type} />
          </Link>
        ))}
        {ranked.length === 0 && (
          <p className="rounded-2xl bg-muted/50 p-3 text-xs font-semibold text-muted-foreground">
            No matching stock in the vault.
          </p>
        )}
      </div>
    </div>
  );
};

const BestParents = () => {
  const { vaultSeeds, seedWithCount } = useVault();
  const [goal, setGoal] = useState<TraitGoal | null>(null);

  const counted = useMemo(
    () => vaultSeeds.filter((seed) => !seed.breeder.includes("Burn Pile")).map(seedWithCount),
    [vaultSeeds, seedWithCount],
  );

  const males = useMemo(() => counted.filter((seed) => seed.type === "Regular"), [counted]);
  const females = useMemo(() => counted.filter((seed) => seed.type === "Feminized"), [counted]);

  return (
    <CollapsibleSection
      title="Best parent finder"
      icon={<Sparkles className="h-5 w-5" />}
      description="Ranks vault stock for pollen and seed roles using keeper value, terpene and resin estimates. Pick a trait goal to bias the results."
    >
      <div className="mb-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setGoal(null)}
          className={`rounded-full border-2 px-3 py-1.5 text-xs font-bold transition ${
            goal === null
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
          }`}
        >
          Any goal
        </button>
        {TRAIT_GOALS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setGoal(item)}
            className={`rounded-full border-2 px-3 py-1.5 text-xs font-bold transition ${
              goal === item
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ParentColumn
          title="Best pollen donors"
          subtitle="Regular stock — true male candidates"
          seeds={males}
          goal={goal}
          accent="text-blue-500"
        />
        <ParentColumn
          title="Best seed receivers"
          subtitle="Feminized keepers — strong mothers"
          seeds={females}
          goal={goal}
          accent="text-pink-500"
        />
      </div>
    </CollapsibleSection>
  );
};

export default BestParents;