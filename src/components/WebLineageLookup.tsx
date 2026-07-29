import { useState } from "react";
import { RefreshCw, SearchCheck, SearchX, ShieldCheck } from "lucide-react";
import { lookupWebLineage, type WebLineageResult } from "@/lib/lineageScraper";
import { Button } from "@/components/ui/button";
import { cleanExternalText, PRIVACY_NOTICE, useExternalDataConsent } from "@/lib/privacy";

type WebLineageLookupProps = {
  name: string;
  breeder?: string;
  compact?: boolean;
};

const dateLabel = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" }) : "";

const WebLineageLookup = ({ name, breeder, compact = false }: WebLineageLookupProps) => {
  const { consent, accept } = useExternalDataConsent("lineage");
  const [result, setResult] = useState<WebLineageResult | null>(null);
  const [loading, setLoading] = useState(false);

  const query = cleanExternalText([name, breeder].filter(Boolean).join(" "), 180);

  const handleLookup = async () => {
    if (!consent || !query || loading) return;
    setLoading(true);
    try {
      setResult(await lookupWebLineage(name, breeder));
    } finally {
      setLoading(false);
    }
  };

  if (!consent) {
    return (
      <div className="mt-2 rounded-xl border border-amber-300 bg-amber-50 p-2 text-[11px] text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
        <p className="flex items-start gap-1.5 font-bold"><ShieldCheck className="mt-0.5 h-3 w-3" /> Web lineage search is disabled.</p>
        <p className="mt-1 leading-relaxed">{PRIVACY_NOTICE}</p>
        <Button type="button" size="sm" className="mt-2 h-7 rounded-lg px-2 text-[10px] font-bold" onClick={accept}>Allow lineage searches</Button>
      </div>
    );
  }

  if (result?.status === "explicit-cross") return null;

  if (compact) {
    return (
      <div className="mt-2 rounded-xl bg-muted/70 p-2 text-[11px] font-semibold text-muted-foreground">
        {loading ? (
          <span className="inline-flex items-center gap-1.5"><RefreshCw className="h-3 w-3 animate-spin" />Looking up web lineage…</span>
        ) : result?.status === "resolved" && result.parents ? (
          <span>Web lineage: <b className="text-foreground">{result.parents[0]} × {result.parents[1]}</b></span>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <span>{result?.note ?? `Ready to search “${query}”.`}</span>
            <Button type="button" size="sm" variant="outline" className="h-7 rounded-lg px-2 text-[10px] font-bold" onClick={handleLookup} disabled={!query}>Search this service</Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-2xl border border-border bg-muted/40 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide text-primary">
            {result?.status === "resolved" ? <SearchCheck className="h-3.5 w-3.5" /> : <SearchX className="h-3.5 w-3.5" />}
            Web-scraped lineage lookup
          </p>
          {loading ? (
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><RefreshCw className="h-3 w-3 animate-spin" />Searching public lineage results…</p>
          ) : result?.status === "resolved" && result.parents ? (
            <>
              <p className="mt-1 font-display text-base font-bold leading-tight">{result.parents[0]} × {result.parents[1]}</p>
              <p className="mt-1 text-[11px] font-semibold text-muted-foreground">{result.note} Last checked {dateLabel(result.syncedAt)}.</p>
            </>
          ) : (
            <>
              <p className="mt-1 text-xs font-semibold leading-relaxed text-muted-foreground">{result?.note ?? `Ready to search “${query}”.`}</p>
              <Button type="button" size="sm" className="mt-2 rounded-xl font-bold" onClick={handleLookup} disabled={!query}>Search this service</Button>
            </>
          )}
        </div>
        {result && <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-full" onClick={handleLookup} title="Search lineage again"><RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /></Button>}
      </div>
    </div>
  );
};

export default WebLineageLookup;