import { AlertTriangle, PackagePlus } from "lucide-react";
import CollapsibleSection from "@/components/CollapsibleSection";
import {
  getIncomingSectionTotal,
  incomingCombinedTotal,
  incomingNamedLineTotal,
  incomingSeedSections,
  incomingSeedSummary,
  incomingTypeBreakdown,
  type IncomingSeedType,
} from "@/data/incomingSeeds";

const TYPE_STYLES: Record<IncomingSeedType, string> = {
  "Fem photo": "border-pink-200 bg-pink-100 text-pink-800 dark:border-pink-900 dark:bg-pink-950/50 dark:text-pink-200",
  "Fem auto": "border-lime-200 bg-lime-100 text-lime-800 dark:border-lime-900 dark:bg-lime-950/50 dark:text-lime-200",
  "Reg photo": "border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-200",
  "Fem photo, triploid": "border-violet-200 bg-violet-100 text-violet-800 dark:border-violet-900 dark:bg-violet-950/50 dark:text-violet-200",
  "Duplicate unknown": "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200",
};

const StatCard = ({ label, value, sub }: { label: string; value: string | number; sub?: string }) => (
  <div className="rounded-2xl border border-border bg-background p-4">
    <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="mt-1 font-display text-3xl font-black">{value}</p>
    {sub && <p className="mt-0.5 text-xs font-semibold text-muted-foreground">{sub}</p>}
  </div>
);

const TypePill = ({ type, count }: { type: IncomingSeedType; count?: number }) => (
  <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${TYPE_STYLES[type]}`}>
    {type}{typeof count === "number" ? `: ${count}` : ""}
  </span>
);

const IncomingSeedDrop = () => {
  return (
    <CollapsibleSection
      title="Incoming drop — not in hand yet"
      icon={<PackagePlus className="h-5 w-5" />}
      description={
        <>
          Tracks the big incoming order separately from live vault counts. These seeds are <b>not</b> included in current inventory, analytics, keeper pressure, or breeding selectors until they actually arrive.
        </>
      }
      badge={<span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">+{incomingCombinedTotal}</span>}
      defaultOpen={false}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Combined incoming" value={incomingCombinedTotal} sub="identified seeds" />
        <StatCard label="Named lines" value={incomingNamedLineTotal} sub="excluding duplicate placeholder" />
        <StatCard label="Multiverse cart" value={incomingSeedSummary.multiverseIdentifiedSeeds} sub="identified seeds" />
        <StatCard label="Ethos L2T2" value={incomingSeedSummary.l2t2Seeds} sub="Multipass seeds" />
      </div>

      <div className="mt-4 rounded-3xl border border-dashed border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="text-sm font-black">Excluded from the incoming total</p>
            <p className="mt-1 text-xs font-semibold leading-relaxed">
              The unidentified 10-pack of Auto Bonus Beans is tracked as excluded, so the active incoming total stays at {incomingCombinedTotal} identified seeds.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-border bg-background p-4">
        <p className="mb-2 text-xs font-black uppercase tracking-wide text-muted-foreground">Known type breakdown</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(incomingTypeBreakdown) as IncomingSeedType[]).map((type) => (
            <TypePill key={type} type={type} count={incomingTypeBreakdown[type]} />
          ))}
        </div>
        <p className="mt-2 text-[11px] font-semibold leading-relaxed text-muted-foreground">
          Fem photo = feminized photoperiod · Fem auto = feminized autoflower · Reg photo = regular photoperiod. The L2T2 duplicate is counted as one seed but its exact line/type remains unresolved.
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {incomingSeedSections.map((section) => (
          <details key={`${section.source}-${section.title}`} className="group rounded-3xl border border-border bg-background p-4 open:shadow-sm">
            <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-display text-lg font-black leading-tight">{section.title}</p>
                <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
                  {section.source} · {section.entries.filter((entry) => entry.namedLine !== false).length} named lines
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
                  {getIncomingSectionTotal(section)} seeds
                </span>
                <span className="text-xs font-black text-muted-foreground transition group-open:rotate-180">⌄</span>
              </div>
            </summary>

            {section.note && (
              <p className="mt-3 rounded-2xl bg-muted/50 p-3 text-xs font-semibold leading-relaxed text-muted-foreground">
                {section.note}
              </p>
            )}

            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-[10px] uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-3 font-black">Cultivar</th>
                    <th className="px-3 py-2 font-black">Breeder / line</th>
                    <th className="px-3 py-2 text-right font-black">Count</th>
                    <th className="py-2 pl-3 font-black">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {section.entries.map((entry) => (
                    <tr key={`${section.title}-${entry.cultivar}`} className="border-b border-border/50 last:border-0">
                      <td className="py-2 pr-3 font-bold text-foreground">{entry.cultivar}</td>
                      <td className="px-3 py-2 font-semibold text-muted-foreground">{entry.breeder}</td>
                      <td className="px-3 py-2 text-right font-black">{entry.count}</td>
                      <td className="py-2 pl-3">
                        <TypePill type={entry.type} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        ))}
      </div>
    </CollapsibleSection>
  );
};

export default IncomingSeedDrop;
