import { AlertTriangle, CheckCircle2, PackagePlus, Undo2 } from "lucide-react";
import CollapsibleSection from "@/components/CollapsibleSection";
import { Button } from "@/components/ui/button";
import {
  getIncomingSeedEntryId,
  incomingCombinedTotal,
  incomingNamedLineTotal,
  incomingSeedSections,
  incomingSeedSummary,
  type IncomingSeedEntry,
  type IncomingSeedSection,
  type IncomingSeedType,
} from "@/data/incomingSeeds";
import { useVault } from "@/hooks/useVaultStore";

const TYPE_STYLES: Record<IncomingSeedType, string> = {
  "Fem photo": "border-pink-200 bg-pink-100 text-pink-800 dark:border-pink-900 dark:bg-pink-950/50 dark:text-pink-200",
  "Fem auto": "border-lime-200 bg-lime-100 text-lime-800 dark:border-lime-900 dark:bg-lime-950/50 dark:text-lime-200",
  "Reg photo": "border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-200",
  "Fem photo, triploid": "border-violet-200 bg-violet-100 text-violet-800 dark:border-violet-900 dark:bg-violet-950/50 dark:text-violet-200",
};

const EMPTY_TYPE_BREAKDOWN: Record<IncomingSeedType, number> = {
  "Fem photo": 0,
  "Fem auto": 0,
  "Reg photo": 0,
  "Fem photo, triploid": 0,
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

const entriesTotal = (entries: IncomingSeedEntry[]) => entries.reduce((sum, entry) => sum + entry.count, 0);

const buildTypeBreakdown = (entries: IncomingSeedEntry[]) =>
  entries.reduce<Record<IncomingSeedType, number>>(
    (totals, entry) => ({ ...totals, [entry.type]: totals[entry.type] + entry.count }),
    { ...EMPTY_TYPE_BREAKDOWN },
  );

type LocatedIncomingEntry = {
  section: IncomingSeedSection;
  entry: IncomingSeedEntry;
  id: string;
};

const locateEntries = (): LocatedIncomingEntry[] =>
  incomingSeedSections.flatMap((section) =>
    section.entries.map((entry) => ({
      section,
      entry,
      id: getIncomingSeedEntryId(section, entry),
    })),
  );

const IncomingSeedDrop = () => {
  const { incomingArrivedIds, markIncomingArrived, markIncomingPending } = useVault();
  const arrivedIds = new Set(incomingArrivedIds);
  const locatedEntries = locateEntries();

  const pendingSections = incomingSeedSections
    .map((section) => ({
      ...section,
      entries: section.entries.filter((entry) => !arrivedIds.has(getIncomingSeedEntryId(section, entry))),
    }))
    .filter((section) => section.entries.length > 0);

  const pendingEntries = pendingSections.flatMap((section) => section.entries);
  const arrivedEntries = locatedEntries.filter(({ id }) => arrivedIds.has(id));

  const pendingTotal = entriesTotal(pendingEntries);
  const movedTotal = arrivedEntries.reduce((sum, item) => sum + item.entry.count, 0);
  const pendingNamedLines = pendingEntries.length;
  const pendingTypeBreakdown = buildTypeBreakdown(pendingEntries);

  return (
    <CollapsibleSection
      title="Incoming drop — not in hand yet"
      icon={<PackagePlus className="h-5 w-5" />}
      description={
        <>
          Check off each line as it lands. Marking a line arrived removes it from this pending list and adds it straight into the live vault.
        </>
      }
      badge={<span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">+{pendingTotal}</span>}
      defaultOpen={false}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Still pending" value={pendingTotal} sub="ordered, not in hand" />
        <StatCard label="Moved to vault" value={movedTotal} sub="landed from this drop" />
        <StatCard label="Pending named lines" value={pendingNamedLines} sub={`of ${incomingNamedLineTotal} original`} />
        <StatCard label="Original identified" value={incomingCombinedTotal} sub="before arrivals" />
      </div>

      <div className="mt-4 rounded-3xl border border-dashed border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="text-sm font-black">Excluded from the incoming total</p>
            <p className="mt-1 text-xs font-semibold leading-relaxed">
              The unidentified 10-pack of Auto Bonus Beans is still excluded. Multiverse started at {incomingSeedSummary.multiverseIdentifiedSeeds} identified seeds; L2T2 started at {incomingSeedSummary.l2t2Seeds}.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-border bg-background p-4">
        <p className="mb-2 text-xs font-black uppercase tracking-wide text-muted-foreground">Pending type breakdown</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(pendingTypeBreakdown) as IncomingSeedType[]).map((type) => (
            <TypePill key={type} type={type} count={pendingTypeBreakdown[type]} />
          ))}
        </div>
      </div>

      {arrivedEntries.length > 0 && (
        <details className="mt-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 open:shadow-sm dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
            <div>
              <p className="font-display text-lg font-black leading-tight">Moved to live vault</p>
              <p className="mt-0.5 text-xs font-semibold opacity-80">
                {arrivedEntries.length} lines · {movedTotal} seeds now counted in the main vault
              </p>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-100">
              Arrived
            </span>
          </summary>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {arrivedEntries.map(({ entry, id }) => (
              <div key={id} className="flex items-center justify-between gap-3 rounded-2xl bg-background/80 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{entry.cultivar}</p>
                  <p className="mt-0.5 text-[11px] font-semibold opacity-80">{entry.breeder} · {entry.count} seeds</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 shrink-0 rounded-full border-2 text-xs font-bold"
                  onClick={() => markIncomingPending(id)}
                >
                  <Undo2 className="mr-1 h-3.5 w-3.5" />
                  Undo
                </Button>
              </div>
            ))}
          </div>
        </details>
      )}

      <div className="mt-4 space-y-3">
        {pendingSections.length === 0 ? (
          <p className="rounded-2xl bg-muted/50 p-4 text-sm font-semibold text-muted-foreground">
            Every named incoming line has been moved into the live vault.
          </p>
        ) : (
          pendingSections.map((section) => (
            <details key={`${section.source}-${section.title}`} className="group rounded-3xl border border-border bg-background p-4 open:shadow-sm">
              <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-black leading-tight">{section.title}</p>
                  <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
                    {section.source} · {section.entries.length} pending named lines
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
                    {entriesTotal(section.entries)} seeds
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
                <table className="w-full min-w-[720px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-[10px] uppercase tracking-wide text-muted-foreground">
                      <th className="py-2 pr-3 font-black">Arrived</th>
                      <th className="px-3 py-2 font-black">Cultivar</th>
                      <th className="px-3 py-2 font-black">Breeder / line</th>
                      <th className="px-3 py-2 text-right font-black">Count</th>
                      <th className="py-2 pl-3 font-black">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.entries.map((entry) => {
                      const id = getIncomingSeedEntryId(section, entry);
                      return (
                        <tr key={`${section.title}-${entry.cultivar}`} className="border-b border-border/50 last:border-0">
                          <td className="py-2 pr-3">
                            <Button
                              type="button"
                              size="sm"
                              className="h-8 rounded-full text-xs font-bold"
                              onClick={() => markIncomingArrived(id)}
                              title="Move this line into the live vault"
                            >
                              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                              Arrived
                            </Button>
                          </td>
                          <td className="px-3 py-2 font-bold text-foreground">{entry.cultivar}</td>
                          <td className="px-3 py-2 font-semibold text-muted-foreground">{entry.breeder}</td>
                          <td className="px-3 py-2 text-right font-black">{entry.count}</td>
                          <td className="py-2 pl-3">
                            <TypePill type={entry.type} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </details>
          ))
        )}
      </div>
    </CollapsibleSection>
  );
};

export default IncomingSeedDrop;
