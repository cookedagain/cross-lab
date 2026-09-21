import { AlertTriangle, Send } from "lucide-react";
import CollapsibleSection from "@/components/CollapsibleSection";
import {
  PIXIE_OUTBOUND_PROVISIONAL_TOTAL,
  PIXIE_OUTBOUND_RECORDS,
  PRE_PIXIE_CONFIRMED_ROWS,
  PRE_PIXIE_CONFIRMED_TOTAL,
} from "@/data/seeds";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const OutboundHistory = () => (
  <CollapsibleSection
    title="Outbound History"
    icon={<Send className="h-5 w-5" />}
    description="Pixie65 parcel sent by registered post on 14 September 2026. Dispatch is confirmed; the exact contents remain pinned and provisional until a physical recount."
    badge={
      <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-black text-amber-800 dark:text-amber-200">
        {PIXIE_OUTBOUND_PROVISIONAL_TOTAL} provisional seeds · {PIXIE_OUTBOUND_RECORDS.length} lines
      </span>
    }
  >
    <div className="mb-4 grid gap-3 sm:grid-cols-3">
      <div className="rounded-2xl border border-border bg-background p-4">
        <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">Pre-dispatch confirmed</p>
        <p className="mt-1 font-display text-2xl font-black">{PRE_PIXIE_CONFIRMED_TOTAL}</p>
        <p className="text-xs font-semibold text-muted-foreground">seeds · {PRE_PIXIE_CONFIRMED_ROWS} rows</p>
      </div>
      <div className="rounded-2xl border border-border bg-background p-4">
        <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">Working parcel</p>
        <p className="mt-1 font-display text-2xl font-black">71</p>
        <p className="text-xs font-semibold text-muted-foreground">51 feminized · 20 regular</p>
      </div>
      <div className="rounded-2xl border border-border bg-background p-4">
        <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">Postage</p>
        <p className="mt-1 font-display text-2xl font-black">A$5.55</p>
        <p className="text-xs font-semibold text-muted-foreground">3 × A$1.85 stamps</p>
      </div>
    </div>

    <div className="mb-4 flex gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm font-semibold leading-relaxed text-amber-900 dark:text-amber-100">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
      <p>
        The displayed 1,961-seed physical ledger is a working post-dispatch figure, not a confirmed recount. GG #4 × Black Cherry Smoothie, Platinum Kush Breath, and Slurricane #7 S1 were directly confirmed as not sent and remain at 21, 13, and 12 seeds.
      </p>
    </div>

    <div className="overflow-hidden rounded-2xl border border-border bg-background">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="min-w-48 font-black">Breeder</TableHead>
            <TableHead className="min-w-72 font-black">Cultivar</TableHead>
            <TableHead className="text-right font-black">Before</TableHead>
            <TableHead className="text-right font-black">Sent*</TableHead>
            <TableHead className="text-right font-black">Retained*</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {PIXIE_OUTBOUND_RECORDS.map((record) => (
            <TableRow key={`${record.breeder}-${record.cultivar}`}>
              <TableCell className="font-bold">{record.breeder}</TableCell>
              <TableCell>
                <p className="font-display font-bold">{record.cultivar}</p>
                <p className="text-xs font-semibold text-muted-foreground">{record.sex}</p>
              </TableCell>
              <TableCell className="text-right font-bold">{record.preSendHeld}</TableCell>
              <TableCell className="text-right font-black text-amber-700 dark:text-amber-300">{record.provisionalSent}</TableCell>
              <TableCell className="text-right font-black">{record.workingRetained}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    <p className="mt-3 text-xs font-semibold text-muted-foreground">* Sent and retained values remain provisional pending recount.</p>
  </CollapsibleSection>
);

export default OutboundHistory;
