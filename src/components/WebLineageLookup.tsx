import { useEffect, useState } from "react";
import { RefreshCw, SearchCheck, SearchX } from "lucide-react";
import { lookupWebLineage, type WebLineageResult } from "@/lib/lineageScraper";
import { Button } from "@/components/ui/button";

type WebLineageLookupProps = {
  name: string;
  breeder?: string;
  compact?: boolean;
};

const dateLabel = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
      })
    : "";

const WebLineageLookup = ({ name, breeder, compact = false }: WebLineageLookupProps) => {
  const [result, setResult] = useState<WebLineageResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    lookupWebLineage(name, breeder)
      .then((next) => {
        if (active) setResult(next);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [name, breeder, nonce]);

  if (result?.status === "explicit-cross") return null;

  if (compact) {
    return (
      <div className="mt-2 rounded-xl bg-muted/70 p-2 text-[11px] font-semibold text-muted-foreground">
        {loading ? (
          <span className="inline-flex items-center gap-1.5">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Looking up web lineage…
          </span>
        ) : result?.status === "resolved" && result.parents ? (
          <span>
            Web lineage: <b className="text-foreground">{result.parents[0]} × {result.parents[1]}</b>
          </span>
        ) : (
          <span>No confident web lineage found.</span>
        )}
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-2xl border border-primary/30 bg-primary/5 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide text-primary">
            {result?.status === "resolved" ? <SearchCheck className="h-3.5 w-3.5" /> : <SearchX className="h-3.5 w-3.5" />}
            Web-scraped lineage lookup
          </p>
          {loading ? (
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Searching public lineage results…
            </p>
          ) : result?.status === "resolved" && result.parents ? (
            <>
              <p className="mt-1 font-display text-base font-bold leading-tight">
                {result.parents[0]} × {result.parents[1]}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-muted-foreground">
                {result.note} Last checked {dateLabel(result.syncedAt)}.
              </p>
            </>
          ) : (
            <p className="mt-1 text-xs font-semibold leading-relaxed text-muted-foreground">
              {result?.note ?? "No lookup result yet."}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 rounded-full"
          onClick={() => setNonce((value) => value + 1)}
          title="Re-check lineage"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>
    </div>
  );
};

export default WebLineageLookup;
