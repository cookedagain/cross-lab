import { useEffect, useState } from "react";
import { ExternalLink, PackageSearch, RefreshCw } from "lucide-react";
import { fetchBreederAvailability, type BreederAvailability as Availability } from "@/lib/breederCatalog";
import { Button } from "@/components/ui/button";

const dateLabel = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "";

const BreederAvailability = ({ breeder }: { breeder: string }) => {
  const [data, setData] = useState<Availability | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchBreederAvailability(breeder)
      .then((result) => {
        if (active) setData(result);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [breeder]);

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <PackageSearch className="h-5 w-5 text-primary" />
          <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">Currently available</p>
        </div>
        {data?.syncedAt && !loading && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 text-[10px] font-bold text-muted-foreground">
            <RefreshCw className="h-3 w-3" />
            Synced {dateLabel(data.syncedAt)} · daily
          </span>
        )}
      </div>

      {loading ? (
        <p className="rounded-2xl bg-muted/50 p-4 text-sm font-semibold text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            Checking the breeder's store…
          </span>
        </p>
      ) : !data || data.status !== "live" ? (
        <div className="rounded-2xl border border-border bg-muted/40 p-4">
          <p className="text-sm font-semibold text-muted-foreground">{data?.note}</p>
          {data?.storeUrl && (
            <a
              href={data.storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-black text-primary hover:underline"
            >
              Visit store
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-2 sm:grid-cols-2">
            {data.items.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-primary"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold leading-tight">{item.title}</p>
                  {item.price && Number(item.price) > 0 && (
                    <p className="mt-0.5 text-[11px] font-semibold text-muted-foreground">${item.price}</p>
                  )}
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
                    item.available
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400"
                  }`}
                >
                  {item.available ? "In stock" : "Sold out"}
                </span>
              </a>
            ))}
          </div>
          <p className="mt-3 text-[11px] font-semibold leading-relaxed text-muted-foreground">{data.note}</p>
        </>
      )}
    </section>
  );
};

export default BreederAvailability;
