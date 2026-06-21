import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Disc3 } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { TypeBadge } from "@/components/TypeBadge";
import { RarityBadge } from "@/components/RarityBadge";
import StrainName from "@/components/StrainName";
import BreederAvailability from "@/components/BreederAvailability";
import { useVault } from "@/hooks/useVaultStore";
import { getBreederInfo } from "@/lib/breederInfo";
import { getSeedRarity, rarityRank } from "@/lib/rarity";
import { SEED_TYPES, typeShort, typeStyles } from "@/lib/seedDisplay";

const BreederDetail = () => {
  const { breeder } = useParams<{ breeder: string }>();
  const decoded = decodeURIComponent(breeder ?? "");
  const { vaultSeeds, getSeedCount, seedWithCount } = useVault();
  const info = getBreederInfo(decoded);

  const strains = useMemo(
    () =>
      vaultSeeds
        .filter((seed) => seed.breeder === decoded)
        .sort((a, b) => rarityRank(getSeedRarity(seedWithCount(b)).tier) - rarityRank(getSeedRarity(seedWithCount(a)).tier)),
    [vaultSeeds, decoded, seedWithCount],
  );

  const total = strains.reduce((sum, seed) => sum + getSeedCount(seed), 0);
  const byType = SEED_TYPES.map((type) => ({
    type,
    total: strains.filter((seed) => seed.type === type).reduce((sum, seed) => sum + getSeedCount(seed), 0),
  })).filter((entry) => entry.total > 0);

  if (strains.length === 0) {
    return (
      <div className="container max-w-3xl py-16 text-center">
        <p className="font-display text-2xl font-black">Breeder not found</p>
        <Link to="/breeders" className="mt-4 inline-block text-primary underline">
          Back to breeders
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/70 bg-card/90 backdrop-blur">
        <div className="container flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <Disc3 className="h-6 w-6" />
            </span>
            <div>
              <p className="font-display text-2xl font-black tracking-tight">{decoded}</p>
              {info.origin && <p className="text-sm text-muted-foreground">{info.origin}</p>}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/breeders"
              className="inline-flex items-center gap-2 rounded-full border-2 border-border bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              All breeders
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container max-w-4xl pb-20 pt-8">
        <section className="rounded-[2rem] border-2 border-border bg-card p-5 shadow-sm sm:p-7">
          <p className="text-sm leading-relaxed text-muted-foreground">{info.blurb}</p>
          {info.knownFor.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {info.knownFor.map((tag) => (
                <span key={tag} className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-black text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">{strains.length} strains</span>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-black text-muted-foreground">{total} seeds</span>
            {byType.map((entry) => (
              <span key={entry.type} className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${typeStyles[entry.type]}`}>
                {typeShort[entry.type]}: {entry.total}
              </span>
            ))}
          </div>
        </section>

        <p className="mt-8 mb-3 text-xs font-black uppercase tracking-wide text-muted-foreground">Catalogue</p>
        <div className="space-y-2">
          {strains.map((seed) => {
            const count = getSeedCount(seed);
            return (
              <Link
                key={seed.id}
                to={`/strain/${encodeURIComponent(seed.id)}`}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary"
              >
                <div className="min-w-0 flex-1">
                  <StrainName name={seed.name} className="font-display text-base font-bold leading-tight" />
                  <p className="mt-1 text-[11px] font-bold text-muted-foreground">{count} seeds</p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                  <RarityBadge rarity={getSeedRarity(seedWithCount(seed))} />
                  <TypeBadge type={seed.type} />
                </div>
              </Link>
            );
          })}
        </div>

        <BreederAvailability breeder={decoded} />
      </main>
    </div>
  );
};

export default BreederDetail;