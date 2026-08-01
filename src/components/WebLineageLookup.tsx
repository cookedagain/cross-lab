import { useEffect, useMemo, useState } from "react";
import { ExternalLink, RefreshCw, Search, SearchCheck, SearchX } from "lucide-react";
import {
  getLineageSourceLinks,
  lookupWebLineage,
  type WebLineageResult,
} from "@/lib/lineageScraper";
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
  const [requested, setRequested] = useState(!compact);
  const [nonce, setNonce] = useState(0);
  const sourceLinks = useMemo(
    () => result?.searchedSources ?? getLineageSourceLinks(name, breeder),
    [breeder, name, result?.searchedSources],
  );

  useEffect(() => {
    if (!requested) return;
    let active = true;
    setLoading(true);
    lookupWebLineage(name, breeder, { force: nonce > 0 })
      .then((next) => {
        if (active) setResult(next);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [name, breeder, nonce, requested]);

  if (/\s[×x]\s/i.test(` ${name} `) || result?.status === "explicit-cross") return null;

  const startLookup = () => {
    if (requested) {
      setNonce((value) => value + 1);
    } else {
      setRequested(true);
    }
  };

  if (compact) {
    if (!requested) {
      return (
        <button
          type="button"
          onClick={startLookup}
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-muted/70 px-2.5 py-1.5 text-[11px] font-black text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
        >
          <Search className="h-3 w-3" />
          Look up lineage
        </button>
      );
    }

    return (
      <div className="mt-2 rounded-xl bg-muted/70 p-2 text-[11px] font-semibold text-muted-foreground">
        {loading ? (
          <span className="inline-flex items-center gap-1.5">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Checking breeder sites…
          </span>
        ) : result?.status === "resolved" && result.parents ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>
              Web lineage: <b className="text-foreground">{result.parents[0]} × {result.parents[1]}</b>
            </span>
            {result.sourceUrl && (
              <a
                href={result.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-black text-primary hover:underline"
              >
                {result.source}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <span>No confident match extracted.</span>
            <a
              href={sourceLinks[0]?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-black text-primary hover:underline"
            >
              Search {sourceLinks[0]?.label}
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href={sourceLinks[sourceLinks.length - 1]?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-black text-primary hover:underline"
            >
              Leafly fallback
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-2xl border border-border bg-muted/40 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide text-primary">
            {result?.status === "resolved" ? (
              <SearchCheck className="h-3.5 w-3.5" />
            ) : result?.status === "not-found" || result?.status === "error" ? (
              <SearchX className="h-3.5 w-3.5" />
            ) : (
              <Search className="h-3.5 w-3.5" />
            )}
            Breeder-site lineage lookup
          </p>
          {loading ? (
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Checking official breeder sites, then Leafly…
            </p>
          ) : result?.status === "resolved" && result.parents ? (
            <>
              <p className="mt-1 font-display text-base font-bold leading-tight">
                {result.parents[0]} × {result.parents[1]}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-muted-foreground">
                {result.note} Last checked {dateLabel(result.syncedAt)}.
              </p>
              {result.sourceUrl && (
                <a
                  href={result.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-black text-primary hover:underline"
                >
                  Open result on {result.source}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </>
          ) : (
            <p className="mt-1 text-xs font-semibold leading-relaxed text-muted-foreground">
              {result?.note ?? "Preparing the breeder-site lookup."}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 shrink-0 rounded-full px-3 text-[11px] font-black"
          onClick={startLookup}
          disabled={loading}
          title="Re-check lineage"
        >
          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Re-check
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 border-t border-border/70 pt-3">
        {sourceLinks.map((source, index) => (
          <a
            key={`${source.label}-${source.url}`}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black transition hover:border-primary hover:text-primary ${
              index === sourceLinks.length - 1
                ? "border-dashed border-muted-foreground/40 text-muted-foreground"
                : "border-border bg-card text-foreground"
            }`}
          >
            {source.label}
            <ExternalLink className="h-3 w-3" />
          </a>
        ))}
      </div>
    </div>
  );
};

export default WebLineageLookup;
