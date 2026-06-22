import {
  CYCO_PRODUCTS,
  STAGE_TONE,
  mixAmount,
  type CycoKey,
  type FeedWeek,
} from "@/lib/cycoFeed";

const FeedWeekCard = ({ week, reservoirL }: { week: FeedWeek; reservoirL: number }) => {
  const entries = Object.entries(week.rates) as [CycoKey, number][];

  return (
    <div className="rounded-3xl border border-border bg-background p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="font-display text-lg font-black leading-tight">Week {week.week}</p>
          <p className="text-xs font-semibold text-muted-foreground">{week.label}</p>
        </div>
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${STAGE_TONE[week.stage]}`}>
          {week.stage}
        </span>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5 text-[10px] font-black uppercase tracking-wide text-muted-foreground">
        <span className="rounded-full bg-muted px-2 py-0.5">{week.ecTarget}</span>
        <span className="rounded-full bg-muted px-2 py-0.5">pH {week.phTarget}</span>
      </div>

      <div className="space-y-1.5">
        {entries.map(([key, rate]) => {
          const product = CYCO_PRODUCTS[key];
          return (
            <div key={key} className="flex items-center justify-between gap-2 rounded-xl bg-card px-2.5 py-1.5">
              <span className="flex items-center gap-1.5 text-xs font-bold">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: product.color }} />
                {product.name}
              </span>
              <span className="shrink-0 font-display text-sm font-black">
                {mixAmount(rate, reservoirL)}mL
                <span className="ml-1 text-[10px] font-bold text-muted-foreground">({rate}mL/L)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeedWeekCard;
