import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ConfidenceMeta, DataSourceType } from "@/lib/confidence";

const SOURCE_LABELS: Record<DataSourceType, string> = {
  manual: "Manual",
  catalog: "Catalog",
  derived: "Derived",
  heuristic: "Estimated",
  ai: "AI",
  external: "External",
};

const CONFIDENCE_STYLES: Record<ConfidenceMeta["confidence"], string> = {
  high: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
  medium: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
  low: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200",
};

type ConfidenceBadgeProps = {
  meta: ConfidenceMeta;
  compact?: boolean;
  className?: string;
};

const ConfidenceBadge = ({ meta, compact = false, className = "" }: ConfidenceBadgeProps) => {
  const label = compact
    ? meta.confidence
    : `${SOURCE_LABELS[meta.source]} · ${meta.confidence}`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          className={`inline-flex cursor-help items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${CONFIDENCE_STYLES[meta.confidence]} ${className}`}
        >
          <Info className="h-3 w-3" />
          {label}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs leading-relaxed">
        <p className="font-black capitalize">{meta.confidence} confidence</p>
        <p className="mt-1">{meta.summary}</p>
        {meta.reasons && meta.reasons.length > 0 && (
          <ul className="mt-2 list-disc space-y-1 pl-4">
            {meta.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        )}
        {meta.caveat && <p className="mt-2 font-semibold opacity-90">{meta.caveat}</p>}
      </TooltipContent>
    </Tooltip>
  );
};

export default ConfidenceBadge;
