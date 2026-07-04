import { useEffect, useMemo, useState } from "react";
import { ExternalLink, RefreshCw, ShoppingBag, Sparkles, Gem } from "lucide-react";
import { useVault } from "@/hooks/useVaultStore";
import { TRAIT_GOALS, type TraitGoal } from "@/lib/crossName";
import {
  BROTANICAL_SITE,
  fetchBrotanicalCatalog,
  type BrotanicalCatalog,
} from "@/data/brotanical";
import { recommendPickups, getMythicalSeedsToHunt, type MythicalSeed } from "@/lib/recommendedPickups";
import { TypeBadge } from "@/components/TypeBadge";
import CollapsibleSection from "@/components/CollapsibleSection";

const RecommendedPickups = () => {
  const { vaultSeeds, seedWithCount } = useVault();
  const mythicalSeeds = useMemo(() => getMythicalSeedsToHunt(), []);
  const [goals, setGoals] = useState<TraitGoal[]>([]);
  const [catalog, setCatalog] = useState<BrotanicalCatalog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchBrotanicalCatalog()
      .then((result) => {
        if (active) setCatalog(result);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const counted = useMemo(() => vaultSeeds.map(seedWithCount), [vaultSeeds, seedWithCount]);

  const recommendations = useMemo(() => {
    if (!catalog) return [];
    return recommendPickups(catalog.items, counted, goals, 20);
  }, [catalog, counted, goals]);

  const toggleGoal = (goal: TraitGoal) =>
    setGoals((current) =>
      current.includes(goal) ? current.filter((item) => item !== goal) : [...current, goal],
    );

  const syncedLabel = catalog
    ? new Date(catalog.syncedAt).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <CollapsibleSection
      title="Recommended seeds to pick up"
      icon={<ShoppingBag className="h-5 w-5" />}
      description="Brotanical Gardens picks ranked against your vault — favouring new breeders, thin trait areas, and your selected goals."
    >
      <div className="mb-8 rounded-3xl border border-fuchsia-500/50 bg-fuchsia-50/50 p-4 dark:bg-fuchsia-950/50">
        <p className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-fuchsia-700 dark:text-fuchsia-300">
          <Gem className="h-4 w-4" />
          Mythical Seeds to Hunt
        </p>
        <p className="mb-4 text-sm font-semibold text-fuchsia-900 dark:text-fuchsia-100">
          These are highly sought-after, Grail-tier genetics from various banks and collectors. They are
          essential for a complete vault, regardless of your current collection.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {mythicalSeeds.map((seed) => (
            <a
              key={seed.name}
              href={seed.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col justify-between rounded-xl border border-fuchsia-500/30 bg-white/50 p-3 transition hover:bg-white dark:bg-black/50 dark:hover:bg-black"
            >
              <div className="flex flex-col">
                <p className="text-sm font-bold">{seed.name}</p>
                <p className="text-xs font-semibold text-muted-foreground">
                  {seed.breeder} · <span className="font-black text-fuchsia-600 dark:text-fuchsia-400">{seed.source}</span>
                </p>
              </div>
              <p className="mt-2 text-xs font-medium italic text-fuchsia-800 dark:text-fuchsia-200">{seed.reason}</p>
            </a>
          ))}
        </div>
      </div>

      <a
        href={BROTANICAL_SITE}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-4 inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-black text-primary transition hover:bg-primary/20"
      >
        Visit shop
        <ExternalLink className="h-3.5 w-3.5" />
      </a>

      <div className="mb-4 flex items-center gap-2 rounded-2xl bg-muted/50 px-3 py-2 text-xs font-semibold text-muted-foreground">
        <RefreshCw className="h-3.5 w-3.5" />
        Catalog synced {syncedLabel} · refreshes daily
      </div>

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

      {loading ? (
        <p className="rounded-2xl bg-muted/50 p-4 text-sm font-semibold text-muted-foreground">
          Syncing the Brotanical Gardens catalog…
        </p>
      ) : recommendations.length === 0 ? (
        <p className="rounded-2xl bg-muted/50 p-4 text-sm font-semibold text-muted-foreground">
          No catalog items available right now. Try again after the next daily sync.
        </p>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {recommendations.map((rec, index) => (
            <div key={rec.item.id} className="rounded-3xl border border-border bg-background p-4">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-black text-primary">
                    {index + 1}
                  </span>
                  <div className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-black text-primary-foreground">
                    <Sparkles className="h-3.5 w-3.5" />
                    {rec.score}
                  </div>
                </div>
                <TypeBadge type={rec.item.type} />
              </div>

              <p className="font-display text-lg font-bold leading-tight">{rec.item.name}</p>
              <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
                {rec.item.breeder} · ~A${rec.item.priceAud}
              </p>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {rec.item.traits.map((trait) => (
                  <span
                    key={trait}
                    className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-black text-muted-foreground"
                  >
                    {trait}
                  </span>
                ))}
              </div>

              <div className="mt-3 rounded-2xl bg-primary/10 p-3">
                <p className="text-[10px] font-black uppercase tracking-wide text-primary">
                  What it brings to the vault
                </p>
                <p className="mt-1 text-xs font-semibold leading-relaxed text-foreground">
                  {rec.contribution}
                </p>
              </div>

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

export default RecommendedPickups;
