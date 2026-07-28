import { useEffect, useState } from "react";
import { ExternalLink, RefreshCw, SearchCheck, SearchX, ShieldCheck, Star } from "lucide-react";
import { lookupCannaReview, type CannaReviewResult } from "@/lib/cannareviews";
import { Button } from "@/components/ui/button";
import { PRIVACY_NOTICE, useExternalDataConsent } from "@/lib/privacy";

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
  const { consent, accept } = useExternalDataConsent();
  const [result, setResult] = useState<CannaReviewResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!consent) return;
    let active = true;

    setLoading(true);
    lookupCannaReview(name, brand)
      .then((next) => {
        if (active) setResult(next);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [name, brand, nonce, consent]);

  if (!consent) {
    return (
      <div className="mt-3 rounded-2xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
        <p className="flex items-start gap-1.5 font-bold"><ShieldCheck className="mt-0.5 h-3.5 w-3.5" /> External lookup is disabled until you consent.</p>
        <p className="mt-1 leading-relaxed">{PRIVACY_NOTICE}</p>
        <Button type="button" size="sm" className="mt-2 rounded-xl font-bold" onClick={accept}>Enable lookup</Button>
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

          {loading ? (
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Searching CannaReviews…
            </p>
          ) : result?.status === "resolved" ? (
            <>
              {result.rating !== undefined && (
                <div className="mt-1 flex items-center gap-1.5">
                  <StarRow value={result.rating} />
                  <span className="text-xs font-bold text-foreground">{result.rating.toFixed(1)}/5</span>
                </div>
              )}
              {result.snippet && (
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{result.snippet}</p>
              )}
              <p className="mt-1 text-[10px] font-semibold text-muted-foreground">
                Synced {dateLabel(result.syncedAt)} · daily
              </p>
            </>
          ) : (
            <p className="mt-1 text-xs font-semibold leading-relaxed text-muted-foreground">
              {result?.note ?? "No lookup yet."}
            </p>
          )}

          {result && (
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-black text-primary hover:underline"
            >
              View on CannaReviews
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        <button
          type="button"
          onClick={() => setNonce((value) => value + 1)}
          className="shrink-0 rounded-full p-1.5 text-muted-foreground transition hover:text-primary"
          title="Re-check CannaReviews"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
    </div>
  );
};

export default CannaReviewLookup;