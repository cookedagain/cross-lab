import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Library, ChevronRight, RefreshCw } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { TypeBadge } from "@/components/TypeBadge";
import { useVault } from "@/hooks/useVaultStore";
import { getBreederInfo } from "@/lib/breederInfo";
import { SEED_TYPES, typeShort, typeStyles } from "@/lib/seedDisplay";
import { Button } from "@/components/ui/button";

const Breeders = () => {
  const { vaultSeeds, getSeedCount } = useVault();

  const breeders = useMemo(() => {
    const map = new Map<string, typeof vaultSeeds>();
    for (const seed of vaultSeeds) {
      if (!map.has(seed.breeder)) map.set(seed.breeder, []);
      map.get(seed.breeder)!.push(seed);
    }
    return Array.from(map.entries())
      .map(([breeder, seeds]) => {
        const total = seeds.reduce((sum, seed) => sum + getSeedCount(seed), 0);
        const byType = SEED_TYPES.map((type) => ({
          type,
          total: seeds.filter((seed) => seed.type === type).reduce((sum, seed) => sum + getSeedCount(seed), 0),
        })).filter((entry) => entry.total > 0);
        return { breeder, seeds, total, byType, info: getBreederInfo(breeder) };
      })
      .sort((a, b) => b.seeds.length - a.seeds.length);
  }, [vaultSeeds, getSeedCount]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/70 bg-card/90 backdrop-blur">
        <div className="container flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <Library className="h-6 w-6" />
            </span>
            <div>
              <p className="font-display text-2xl font-black tracking-tight">Breeders</p>
              <p className="text-sm text-muted-foreground">A discography of every breeder in your vault</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border-2 border-border bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Seed vault
            </Link>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-2xl border-2"
              onClick={() => window.location.reload()}
              title="Refresh page"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container max-w-5xl pb-20 pt-8">
        <div className="grid gap-4 md:grid-cols-2">
          {breeders.map((group) => (
            <Link
              key={group.breeder}
              to={`/breeders/${encodeURIComponent(group.breeder)}`}
              className="group rounded-[1.75rem] border-2 border-border bg-card p-5 shadow-sm transition-colors hover:border-primary"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-display text-xl font-black leading-tight">{group.breeder}</h2>
                  {group.info.origin && (
                    <p className="mt-0.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      {group.info.origin}
                    </p>
                  )}
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{group.info.blurb}</p>

              {group.info.knownFor.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {group.info.knownFor.map((tag) => (
                    <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-black text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
                  {group.seeds.length} strains
                </span>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-black text-muted-foreground">
                  {group.total} seeds
                </span>
                {group.byType.map((entry) => (
                  <span key={entry.type} className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${typeStyles[entry.type]}`}>
                    {typeShort[entry.type]}: {entry.total}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Breeders;