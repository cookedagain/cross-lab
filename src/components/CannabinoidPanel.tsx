import { estimateCannabinoidPanel, CATEGORY_TONE } from "@/lib/cannabinoids";
import type { Seed } from "@/data/seeds";

const CannabinoidPanel = ({ seed }: { seed: Seed }) => {
  const panel = estimateCannabinoidPanel(seed);

  return (
    <div className="rounded-3xl border border-border bg-card p-5 lg:col-span-2">
      <p className="mb-1 text-xs font-black uppercase tracking-wide text-muted-foreground">
        Natural cannabinoid panel (est. % dry weight)
      </p>
      <p className="mb-3 text-[11px] font-semibold text-muted-foreground">
        Categories are scaled per cannabinoid — planning estimates from name/lineage cues, not lab results.
      </p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {panel.map((entry) => (
          <div key={entry.key} className="rounded-2xl border border-border bg-background p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.info.color }} />
                <span className="font-display text-base font-black leading-none">{entry.info.name}</span>
              </div>
              <span className={`rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wide ${CATEGORY_TONE[entry.category]}`}>
                {entry.category}
              </span>
            </div>
            <p className="mt-2 font-display text-lg font-black leading-none">
              {entry.range.min}–{entry.range.max}%
            </p>
            <p className="mt-1 text-[10px] font-semibold leading-tight text-muted-foreground">{entry.info.label}</p>
            <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground">{entry.info.effect}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CannabinoidPanel;