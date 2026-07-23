import { Boxes, PackageOpen, Users } from "lucide-react";
import CollapsibleSection from "@/components/CollapsibleSection";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  INCOMING_DROPS,
  INCOMING_DROP_BREEDER_TOTAL,
  INCOMING_DROP_TOTAL,
} from "@/data/incomingDrops";

const IncomingDrops = () => (
  <CollapsibleSection
    title="Incoming Drops"
    icon={<PackageOpen className="h-5 w-5" />}
    description="Confirmed incoming packs. These remain separate from live-vault totals until they arrive."
    badge={
      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
        {INCOMING_DROP_TOTAL} seeds
      </span>
    }
  >
    <div className="mb-5 grid gap-3 sm:grid-cols-3">
      <div className="rounded-2xl border border-border bg-background p-4">
        <div className="mb-2 flex items-center gap-2 text-primary">
          <Boxes className="h-4 w-4" />
          <p className="text-xs font-black uppercase tracking-wide">Seeds</p>
        </div>
        <p className="font-display text-3xl font-black">{INCOMING_DROP_TOTAL}</p>
      </div>
      <div className="rounded-2xl border border-border bg-background p-4">
        <div className="mb-2 flex items-center gap-2 text-primary">
          <PackageOpen className="h-4 w-4" />
          <p className="text-xs font-black uppercase tracking-wide">Products</p>
        </div>
        <p className="font-display text-3xl font-black">{INCOMING_DROPS.length}</p>
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
            <TableHead className="min-w-52 font-black">Breeder</TableHead>
            <TableHead className="min-w-64 font-black">Cultivar / Product</TableHead>
            <TableHead className="min-w-48 font-black">Type</TableHead>
            <TableHead className="w-28 text-right font-black">Seeds</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {INCOMING_DROPS.map((drop) => (
            <TableRow key={`${drop.breeder}-${drop.cultivar}`}>
              <TableCell className="font-bold">{drop.breeder}</TableCell>
              <TableCell className="font-display font-bold">{drop.cultivar}</TableCell>
              <TableCell>
                <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-black text-primary">
                  {drop.type}
                </span>
              </TableCell>
              <TableCell className="text-right font-display text-lg font-black">{drop.count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </CollapsibleSection>
);

export default IncomingDrops;
