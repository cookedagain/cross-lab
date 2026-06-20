import { useEffect, useMemo, useState } from "react";
import { ExternalLink, RefreshCw, ShoppingBag, Sparkles } from "lucide-react";
import { useVault } from "@/hooks/useVaultStore";
import { TRAIT_GOALS, type TraitGoal } from "@/lib/crossName";
import {
  BROTANICAL_SITE,
  fetchBrotanicalCatalog,
  type BrotanicalCatalog,
} from "@/data/brotanical";
import { recommendPickups } from "@/lib/recommendedPickups";
import { TypeBadge } from "@/components/TypeBadge";
import { Button } from "@/components/ui/button";

const RecommendedPickups = () => {
  const { vaultSeeds, seedWithCount } = useVault();
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
    return recommendPickups(catalog.items, counted, goals, 6);
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
    <section className="mt-8 rounded-[2rem] border-2 border-border bg-card p-5 shadow-sm sm:p-7">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <ShoppingBag className="mt-1 h-5 w-5 text-primary" />
          <div>
            <h2 className="font-display text-2xl font-black tracking-tight">Recommended seeds to pick up</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Brotanical Gardens picks ranked against your vault — favouring new breeders, thin trait
              areas, and your selected goals.
            </p>
          </div>
        </div>
        <a
          href={BROTANICAL_SITE}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-black text-primary transition hover:bg-primary/20"
        >
          Visit shop
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

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

              <ul className="mt-3 space-y-1.5">
                {rec.reasons.map((reason) => (
                  <li key={reason} className="flex items-start gap-2 text-xs font-semibold leading-relaxed">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {reason}
                  </li>
                ))}
              </ul>

              <a
                href={rec.item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-2xl border-2 border-border px-3 py-2 text-xs font-bold transition hover:border-primary hover:text-primary"
              >
                View on Brotanical Gardens
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default RecommendedPickups;
