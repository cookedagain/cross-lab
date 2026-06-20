import { useMemo } from "react";
import { Gem, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { useVault } from "@/hooks/useVaultStore";
import { getSeedRarity, RARITY_TIERS, type RarityTier } from "@/lib/rarity";
import { TypeBadge } from "@/components/TypeBadge";
import { RarityBadge } from "@/components/RarityBadge";

const TIER_COLOR: Record<RarityTier, string> = {
  Common: "#94a3b8",
  Uncommon: "#10b981",
  Rare: "#3b82f6",
  "Very Rare": "#8b5cf6",
  Grail: "#d946ef",
};

const RarityDashboard = () => {
  const { vaultSeeds, seedWithCount } = useVault();

  const data = useMemo(() => {
    const rated = vaultSeeds
      .filter((seed) => seed.breeder !== "Burn Pile")
      .map((seed) => {
        const counted = seedWithCount(seed);
        return { seed: counted, rarity: getSeedRarity(counted) };
      });

    const tierCounts = Object.fromEntries(RARITY_TIERS.map((tier) => [tier, 0])) as Record<RarityTier, number>;
    let scoreSum = 0;
    for (const entry of rated) {
      tierCounts[entry.rarity.tier] += 1;
      scoreSum += entry.rarity.score;
    }

    const avgScore = rated.length ? Math.round(scoreSum / rated.length) : 0;
    const grailCount = tierCounts.Grail + tierCounts["Very Rare"];
    const top = [...rated].sort((a, b) => b.rarity.score - a.rarity.score).slice(0, 6);

    return { rated, tierCounts, avgScore, grailCount, top };
  }, [vaultSeeds, seedWithCount]);

  const total = data.rated.length || 1;

  return (
    <section className="mt-8 rounded-[2rem] border-2 border-border bg-card p-5 shadow-sm sm:p-7">
      <div className="mb-5 flex items-center gap-2">
        <Gem className="h-5 w-5 text-primary" />
        <h2 className="font-display text-2xl font-black">Vault value & rarity</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-background p-4">
          <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">Avg rarity score</p>
          <p className="mt-1 font-display text-3xl font-black">{data.avgScore}<span className="text-base">/100</span></p>
        </div>
        <div className="rounded-2xl border border-border bg-background p-4">
          <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">Grail + Very Rare</p>
          <p className="mt-1 font-display text-3xl font-black">{data.grailCount}</p>
        </div>
        <div className="rounded-2xl border border-border bg-background p-4">
          <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">Rated strains</p>
          <p className="mt-1 font-display text-3xl font-black">{data.rated.length}</p>
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-border bg-background p-4">
        <p className="mb-3 text-xs font-black uppercase tracking-wide text-muted-foreground">Rarity distribution</p>
        <div className="flex h-4 overflow-hidden rounded-full bg-muted">
          {RARITY_TIERS.map((tier) =>
            data.tierCounts[tier] > 0 ? (
              <div
                key={tier}
                className="h-full"
                style={{ width: `${(data.tierCounts[tier] / total) * 100}%`, backgroundColor: TIER_COLOR[tier] }}
              />
            ) : null,
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          {RARITY_TIERS.map((tier) => (
            <div key={tier} className="flex items-center gap-1.5 text-xs font-bold">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: TIER_COLOR[tier] }} />
              <span>{tier}</span>
              <span className="text-muted-foreground">{data.tierCounts[tier]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center gap-2">
          <Crown className="h-4 w-4 text-fuchsia-500" />
          <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">Most valuable in vault</p>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          {data.top.map(({ seed, rarity }) => (
            <Link
              key={seed.id}
              to={`/strain/${encodeURIComponent(seed.id)}`}
              className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3 transition-colors hover:border-primary"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{seed.name}</p>
                <p className="truncate text-[11px] font-semibold text-muted-foreground">
                  {seed.breeder} · {seed.count ?? 0} seeds
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <RarityBadge rarity={rarity} />
                <TypeBadge type={seed.type} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RarityDashboard;