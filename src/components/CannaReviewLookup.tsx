import { useState } from "react";
import { ExternalLink, RefreshCw, SearchCheck, SearchX, ShieldCheck, Star } from "lucide-react";
import { lookupCannaReview, type CannaReviewResult } from "@/lib/cannareviews";
import { Button } from "@/components/ui/button";
import { cleanExternalText, PRIVACY_NOTICE, useExternalDataConsent } from "@/lib/privacy";

const dateLabel = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" }) : "";

const StarRow = ({ value }: { value: number }) => (
  <span className="inline-flex items-center gap-0.5 text-amber-500">
    {Array.from({ length: 5 }).map((_, index) => (
      <Star key={index} className={`h-3 w-3 ${index < Math.round(value) ? "fill-current" : "opacity-30"}`} />
    ))}
  </span>
);

const CannaReviewLookup = ({ name, brand }: { name: string; brand?: string }) => {
  const { consent, accept } = useExternalDataConsent("cannareviews");
  const [result, setResult] = useState<CannaReviewResult | null>(null);
  const [loading, setLoading] = useState(false);

  const query = cleanExternalText([name, brand].filter(Boolean).join(" "), 180);

  const handleSearch = async () => {
    if (!consent || !query || loading) return;
    setLoading(true);
    try {
      setResult(await lookupCannaReview(name, brand));
    } catch (error) {
      setResult({
        status: "error",
        query,
        url: "",
        note: error instanceof Error ? error.message : "CannaReviews could not be reached.",
        syncedAt: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  if (!consent) {
    return (
      <div className="mt-3 rounded-2xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
        <p className="flex items-start gap-1.5 font-bold"><ShieldCheck className="mt-0.5 h-3.5 w-3.5" /> CannaReviews search is disabled.</p>
        <p className="mt-1 leading-relaxed">{PRIVACY_NOTICE}</p>
        <Button type="button" size="sm" className="mt-2 rounded-xl font-bold" onClick={accept}>Allow CannaReviews searches</Button>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-2xl border border-border bg-muted/40 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide text-primary">
            {result?.status === "resolved" ? <SearchCheck className="h-3.5 w-3.5" /> : <SearchX className="h-3.5 w-3.5" />}
            CannaReviews lookup
          </p>

          {!result && !loading && (
            <>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">Ready to search for:</p>
              <p className="mt-1 break-words text-xs font-black text-foreground">“{query || "No valid query"}”</p>
              <Button type="button" size="sm" className="mt-2 rounded-xl font-bold" onClick={handleSearch} disabled={!query}>
                <SearchCheck className="mr-1.5 h-3.5 w-3.5" />
                Search this service
              </Button>
            </>
          )}

          {loading && (
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Searching CannaReviews…
            </p>
          )}

          {!loading && result?.status === "resolved" && (
            <>
              {result.rating !== undefined && (
                <div className="mt-1 flex items-center gap-1.5">
                  <StarRow value={result.rating} />
                  <span className="text-xs font-bold text-foreground">{result.rating.toFixed(1)}/5</span>
                </div>
              )}
              {result.snippet && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{result.snippet}</p>}
              <p className="mt-1 text-[10px] font-semibold text-muted-foreground">Synced {dateLabel(result.syncedAt)} · daily</p>
            </>
          )}

          {!loading && result && result.status !== "resolved" && (
            <p className="mt-1 text-xs font-semibold leading-relaxed text-muted-foreground">{result.note}</p>
          )}

          {result?.url && (
            <a href={result.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-[11px] font-black text-primary hover:underline">
              View on CannaReviews
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {result && (
          <button type="button" onClick={handleSearch} className="shrink-0 rounded-full p-1.5 text-muted-foreground transition hover:text-primary" title="Search CannaReviews again">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        )}
      </div>
    </div>
  );
};

export default CannaReviewLookup;