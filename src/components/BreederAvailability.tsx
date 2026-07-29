import { useState } from "react";
import { ExternalLink, PackageSearch, RefreshCw, ShieldCheck } from "lucide-react";
import { fetchBreederAvailability, type BreederAvailability as Availability } from "@/lib/breederCatalog";
import { Button } from "@/components/ui/button";
import { cleanExternalText, PRIVACY_NOTICE, useExternalDataConsent } from "@/lib/privacy";

const dateLabel = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "";

const BreederAvailability = ({ breeder }: { breeder: string }) => {
  const { consent, accept } = useExternalDataConsent("breeder");
  const [data, setData] = useState<Availability | null>(null);
  const [loading, setLoading] = useState(false);
  const query = cleanExternalText(breeder, 120);

  const handleSearch = async () => {
    if (!consent || !query || loading) return;
    setLoading(true);
    try {
      setData(await fetchBreederAvailability(breeder));
    } finally {
      setLoading(false);
    }
  };

  if (!consent) {
    return (
      <section className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
        <p className="flex items-start gap-2 text-sm font-bold"><ShieldCheck className="mt-0.5 h-4 w-4" /> External catalog search is disabled.</p>
        <p className="mt-1 text-xs leading-relaxed">{PRIVACY_NOTICE}</p>
        <Button type="button" size="sm" className="mt-3 rounded-xl font-bold" onClick={accept}>Allow breeder catalog searches</Button>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <PackageSearch className="h-5 w-5 text-primary" />
          <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">Currently available</p>
        </div>
        {data?.syncedAt && !loading && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 text-[10px] font-bold text-muted-foreground">
            <RefreshCw className="h-3 w-3" />Synced {dateLabel(data.syncedAt)} · daily
          </span>
        )}
      </div>

      {!data && !loading && (
        <div className="rounded-2xl border border-border bg-muted/40 p-4">
          <p className="text-sm font-semibold text-muted-foreground">Ready to search the breeder catalog for “{query}”.</p>
          <Button type="button" className="mt-3 rounded-xl font-bold" onClick={handleSearch} disabled={!query}>Search this service</Button>
        </div>
      )}

      {loading && (
        <p className="rounded-2xl bg-muted/50 p-4 text-sm font-semibold text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><RefreshCw className="h-3.5 w-3.5 animate-spin" />Checking the breeder's store…</span>
        </p>
      )}

      {!loading && data && data.status !== "live" && (
        <div className="rounded-2xl border border-border bg-muted/40 p-4">
          <p className="text-sm font-semibold text-muted-foreground">{data.note}</p>
          {data.storeUrl && <a href={data.storeUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-xs font-black text-primary hover:underline">Browse store<ExternalLink className="h-3.5 w-3.5" /></a>}
          <Button type="button" variant="outline" size="sm" className="mt-3 rounded-xl border-2 font-bold" onClick={handleSearch}>Search again</Button>
        </div>
      )}

      {!loading && data?.status === "live" && (
        <>
          <div className="grid gap-2 sm:grid-cols-2">
            {data.items.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-card p-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold leading-tight">{item.title}</p>
                  {item.info.length > 0 && <div className="mt-1.5 flex flex-wrap gap-1">{item.info.map((tag) => <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-black text-muted-foreground">{tag}</span>)}</div>}
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${item.available ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200" : "bg-slate-100 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400"}`}>
                  {item.available ? "In stock" : "Sold out"}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] font-semibold leading-relaxed text-muted-foreground">{data.note}</p>
          <Button type="button" variant="outline" size="sm" className="mt-3 rounded-xl border-2 font-bold" onClick={handleSearch}>Search again</Button>
        </>
      )}
    </section>
  );
};

export default BreederAvailability;