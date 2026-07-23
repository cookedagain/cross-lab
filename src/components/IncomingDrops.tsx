import { Boxes, CheckCircle2, Clock3, PackageOpen, Users } from "lucide-react";
import CollapsibleSection from "@/components/CollapsibleSection";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getIncomingDropId,
  INCOMING_DROPS,
  INCOMING_DROP_BREEDER_TOTAL,
  INCOMING_DROP_TOTAL,
} from "@/data/incomingDrops";
import { useVault } from "@/hooks/useVaultStore";

const IncomingDrops = () => {
  const { incomingArrivedIds, setIncomingArrived } = useVault();
  const arrived = new Set(incomingArrivedIds);
  const arrivedDrops = INCOMING_DROPS.filter((drop) => arrived.has(getIncomingDropId(drop)));
  const arrivedSeedTotal = arrivedDrops.reduce((total, drop) => total + drop.count, 0);
  const pendingSeedTotal = INCOMING_DROP_TOTAL - arrivedSeedTotal;

  return (
    <CollapsibleSection
      title="Incoming Drops"
      icon={<PackageOpen className="h-5 w-5" />}
      description="Check off a cultivar when it lands. It will immediately join the searchable main vault and all live totals."
      badge={
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
          {pendingSeedTotal} pending
        </span>
      }
    >
      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-background p-4">
          <div className="mb-2 flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Clock3 className="h-4 w-4" />
            <p className="text-xs font-black uppercase tracking-wide">Pending seeds</p>
          </div>
          <p className="font-display text-3xl font-black">{pendingSeedTotal}</p>
        </div>
        <div className="rounded-2xl border border-border bg-background p-4">
          <div className="mb-2 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <p className="text-xs font-black uppercase tracking-wide">Vaulted seeds</p>
          </div>
          <p className="font-display text-3xl font-black">{arrivedSeedTotal}</p>
        </div>
        <div className="rounded-2xl border border-border bg-background p-4">
          <div className="mb-2 flex items-center gap-2 text-primary">
            <Boxes className="h-4 w-4" />
            <p className="text-xs font-black uppercase tracking-wide">Cultivars</p>
          </div>
          <p className="font-display text-3xl font-black">
            {arrivedDrops.length}<span className="text-base text-muted-foreground"> / {INCOMING_DROPS.length}</span>
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-background p-4">
          <div className="mb-2 flex items-center gap-2 text-primary">
            <Users className="h-4 w-4" />
            <p className="text-xs font-black uppercase tracking-wide">Breeders</p>
          </div>
          <p className="font-display text-3xl font-black">{INCOMING_DROP_BREEDER_TOTAL}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-24 text-center font-black">Arrived</TableHead>
              <TableHead className="min-w-52 font-black">Breeder</TableHead>
              <TableHead className="min-w-80 font-black">Cultivar / Product</TableHead>
              <TableHead className="min-w-48 font-black">Type</TableHead>
              <TableHead className="w-28 text-right font-black">Seeds</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {INCOMING_DROPS.map((drop) => {
              const id = getIncomingDropId(drop);
              const hasArrived = arrived.has(id);

              return (
                <TableRow key={id} className={hasArrived ? "bg-emerald-500/5" : undefined}>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={hasArrived}
                      onCheckedChange={(checked) => setIncomingArrived(id, checked === true)}
                      aria-label={`Mark ${drop.cultivar} as ${hasArrived ? "incoming" : "arrived"}`}
                      className="h-6 w-6 rounded-md"
                    />
                  </TableCell>
                  <TableCell className="font-bold">{drop.breeder}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display font-bold">{drop.cultivar}</span>
                      {hasArrived && (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                          In vault
                        </span>
                      )}
                    </div>
                    {drop.lineage && <p className="mt-1 text-xs font-medium text-muted-foreground">{drop.lineage}</p>}
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {drop.pack && (
                        <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                          {drop.pack}
                        </span>
                      )}
                      {drop.flowering && (
                        <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                          {drop.flowering}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-black text-primary">
                      {drop.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-display text-lg font-black">{drop.count}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </CollapsibleSection>
  );
};

export default IncomingDrops;
