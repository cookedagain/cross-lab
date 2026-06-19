import { useMemo } from "react";
import { Droplets, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useVault } from "@/hooks/useVaultStore";
import { estimateExtractionProfile } from "@/lib/extraction";
import { seedCartMetric, seedRosinMetric } from "@/lib/vaultMetrics";
import { TypeBadge } from "@/components/TypeBadge";
import type { Seed } from "@/data/seeds";

const Stars = ({ value }: { value: number }) => (
  <span className="font-bold text-foreground">
    {"★".repeat(value)}
    {"☆".repeat(5 - value)}
  </span>
);

const PickColumn = ({
  title,
  subtitle,
  ranked,
  accent,
  badge,
}: {
  title: string;
  subtitle: string;
  ranked: { seed: Seed; label: string; value: number }[];
  accent: string;
  badge: (seed: Seed) => number;
}) => (
  <div className="rounded-3xl border border-border bg-background p-4">
    <div className="mb-3 flex items-center gap-2">
      <Droplets className={`h-4 w-4 ${accent}`} />
      <div>
        <p className="font-display text-base font-bold leading-tight">{title}</p>
        <p className="text-xs font-semibold text-muted-foreground">{subtitle}</p>
      </div>
    </div>
    <div className="space-y-2">
      {ranked.map(({ seed, label }, index) => (
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
              {seed.breeder} · {label}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <TypeBadge type={seed.type} />
            <Stars value={badge(seed)} />
          </div>
        </Link>
      ))}
      {ranked.length === 0 && (
        <p className="rounded-2xl bg-muted/50 p-3 text-xs font-semibold text-muted-foreground">
          No matching stock in the vault.
        </p>
      )}
    </div>
  );
};

const ExtractionPicks = () => {
  const { vaultSeeds, seedWithCount } = useVault();

  const counted = useMemo(
    () => vaultSeeds.filter((seed) => seed.breeder !== "Burn Pile").map(seedWithCount),
    [vaultSeeds, seedWithCount],
  );

  const hashPicks = useMemo(
    () =>
      [...counted]
        .map((seed) => ({ seed, value: seedRosinMetric(seed), label: "hash / rosin yield" }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5),
    [counted],
  );

  const cartPicks = useMemo(
    () =>
      [...counted]
        .map((seed) => ({ seed, value: seedCartMetric(seed), label: "510 cart suitability" }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5),
    [counted],
  );

  return (
    <section className="mt-8 rounded-[2rem] border-2 border-border bg-card p-5 shadow-sm sm:p-7">
      <div className="mb-5 flex items-center gap-2">
        <Zap className="h-5 w-5 text-primary" />
        <h2 className="font-display text-2xl font-black">Top extraction & cart picks</h2>
      </div>
      <p className="mb-5 text-sm text-muted-foreground">
        Ranks vault stock for solventless pressing (flower, dry sift, bubble hash) and for filling 510 cartridges, based on resin, terpene, and lineage cues.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <PickColumn
          title="Best for hash & rosin"
          subtitle="Highest combined pressability"
          ranked={hashPicks}
          accent="text-amber-500"
          badge={(seed) => estimateExtractionProfile(seed).rosin.bubbleHash}
        />
        <PickColumn
          title="Best for 510 carts"
          subtitle="Cleanest cart-fill candidates"
          ranked={cartPicks}
          accent="text-sky-500"
          badge={(seed) => estimateExtractionProfile(seed).cart.liveResin}
        />
      </div>
    </section>
  );
};

export default ExtractionPicks;