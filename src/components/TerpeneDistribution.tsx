import { useMemo } from "react";
import { FlaskConical } from "lucide-react";
import { useVault } from "@/hooks/useVaultStore";
import { getSingleSeedProfile, TERPENES, type TerpeneKey } from "@/lib/crossName";

const TerpeneDistribution = () => {
  const { vaultSeeds } = useVault();

  const data = useMemo(() => {
    const totals = new Map<TerpeneKey, number>();
    for (const seed of vaultSeeds) {
      if (seed.breeder === "Burn Pile") continue;
      for (const stat of getSingleSeedProfile(seed).terpenes) {
        totals.set(stat.key, (totals.get(stat.key) ?? 0) + stat.share);
      }
    }
    const sum = Array.from(totals.values()).reduce((acc, value) => acc + value, 0) || 1;
    return Array.from(totals.entries())
      .map(([key, value]) => ({ key, info: TERPENES[key], percent: Math.round((value / sum) * 100) }))
      .sort((a, b) => b.percent - a.percent);
  }, [vaultSeeds]);

  return (
    <section className="mt-8 rounded-[2rem] border-2 border-border bg-card p-5 shadow-sm sm:p-7">
      <div className="mb-5 flex items-center gap-2">
        <FlaskConical className="h-5 w-5 text-primary" />
        <h2 className="font-display text-2xl font-black">Terpene distribution</h2>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        The dominant aroma directions across your whole vault, aggregated from each strain's estimated terpene read.
      </p>

      {data.length > 0 ? (
        <div className="space-y-3 rounded-3xl border border-border bg-background p-4">
          {data.map((entry) => (
            <div key={entry.key}>
              <div className="mb-1 flex items-center justify-between gap-2 text-xs font-bold">
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.info.color }} />
                  {entry.info.name}
                  <span className="font-semibold text-muted-foreground">· {entry.info.aroma}</span>
                </span>
                <span>{entry.percent}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full" style={{ width: `${entry.percent}%`, backgroundColor: entry.info.color }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl bg-muted/50 p-4 text-sm text-muted-foreground">
          No terpene cues detected yet. Add strains with descriptive names to build the distribution.
        </p>
      )}
    </section>
  );
};

export default TerpeneDistribution;