import { Boxes, CheckCircle2, Clock3, PackageOpen, Store, Users } from "lucide-react";
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
  DEFAULT_INCOMING_ORDER_ID,
  getIncomingDropId,
  INCOMING_DROPS,
  INCOMING_DROP_TOTAL,
  INCOMING_ORDERS,
} from "@/data/incomingDrops";
import { useVault } from "@/hooks/useVaultStore";

const IncomingDrops = () => {
  const { incomingArrivedIds, setIncomingArrived } = useVault();
  const arrived = new Set(incomingArrivedIds);
  const orderById = new Map(INCOMING_ORDERS.map((order) => [order.id, order]));
  const arrivedDrops = INCOMING_DROPS.filter((drop) => arrived.has(getIncomingDropId(drop)));
  const pendingDrops = INCOMING_DROPS.filter((drop) => !arrived.has(getIncomingDropId(drop)));
  const arrivedSeedTotal = arrivedDrops.reduce((total, drop) => total + (drop.count ?? 0), 0);
  const pendingSeedTotal = pendingDrops.reduce((total, drop) => total + (drop.count ?? 0), 0);

  return (
    <CollapsibleSection
      title="Incoming Order"
      icon={<PackageOpen className="h-5 w-5" />}
      description={
        INCOMING_DROPS.length > 0
          ? "Paid seeds awaiting delivery. Check off a product when it lands to add it to the searchable main vault."
          : "The incoming cart is empty and ready for the next order."
      }
      badge={
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
          {pendingDrops.length} pending
        </span>
      }
    >
      {INCOMING_DROPS.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-background px-6 py-10 text-center">
          <PackageOpen className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-display text-lg font-black">No incoming order</p>
          <p className="mt-1 text-sm text-muted-foreground">No products are currently logged.</p>
        </div>
      ) : (
        <>
          <div className="mb-5 grid gap-4 lg:grid-cols-2">
            {INCOMING_ORDERS.map((order) => {
              const orderDrops = INCOMING_DROPS.filter(
                (drop) => (drop.orderId ?? DEFAULT_INCOMING_ORDER_ID) === order.id,
              );
              const orderSeeds = orderDrops.reduce((total, drop) => total + (drop.count ?? 0), 0);

              return (
                <div key={order.id} className="rounded-3xl border-2 border-primary/20 bg-primary/5 p-5">
                  <div className="mb-4 flex items-center gap-2 text-primary">
                    <Store className="h-5 w-5" />
                    <p className="text-xs font-black uppercase tracking-[0.2em]">{order.label}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-bold text-muted-foreground">Supplier</p>
                      <p className="mt-1 font-display font-black">{order.supplier}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground">Status</p>
                      <p className="mt-1 font-display font-black">{order.status}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground">{order.source ? "Source" : "Order date"}</p>
                      <p className="mt-1 font-display font-black">{order.source ?? order.orderDate}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground">Confirmed seeds</p>
                      <p className="mt-1 font-display font-black">
                        {orderSeeds} <span className="text-xs text-muted-foreground">across {orderDrops.length} products</span>
                      </p>
                    </div>
                  </div>
                  {order.currency && <p className="mt-3 text-xs font-bold text-muted-foreground">Currency: {order.currency}</p>}
                </div>
              );
            })}
          </div>

          <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="mb-2 flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <Clock3 className="h-4 w-4" />
                <p className="text-xs font-black uppercase tracking-wide">Confirmed pending</p>
              </div>
              <p className="font-display text-3xl font-black">{pendingSeedTotal}</p>
              <p className="text-xs text-muted-foreground">known seeds</p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="mb-2 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <p className="text-xs font-black uppercase tracking-wide">Vaulted</p>
              </div>
              <p className="font-display text-3xl font-black">{arrivedSeedTotal}</p>
              <p className="text-xs text-muted-foreground">known seeds</p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="mb-2 flex items-center gap-2 text-primary">
                <Boxes className="h-4 w-4" />
                <p className="text-xs font-black uppercase tracking-wide">Products</p>
              </div>
              <p className="font-display text-3xl font-black">
                {arrivedDrops.length}<span className="text-base text-muted-foreground"> / {INCOMING_DROPS.length}</span>
              </p>
              <p className="text-xs text-muted-foreground">arrived</p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="mb-2 flex items-center gap-2 text-primary">
                <Users className="h-4 w-4" />
                <p className="text-xs font-black uppercase tracking-wide">Sources</p>
              </div>
              <p className="font-display text-3xl font-black">{INCOMING_ORDERS.length}</p>
              <p className="text-xs text-muted-foreground">incoming drops</p>
            </div>
          </div>

          <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
            <b>{INCOMING_DROP_TOTAL} confirmed minimum seeds</b> are recorded across both incoming sources. No unidentified L2T2 duplicate is included.
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
                  const order = orderById.get(drop.orderId ?? DEFAULT_INCOMING_ORDER_ID);
                  const packLabel = drop.pack?.includes("Multipack")
                    ? null
                    : `${drop.quantityPacks} ${drop.quantityPacks === 1 ? "pack" : "packs"}`;

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
                          {order && (
                            <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">
                              {order.label}
                            </span>
                          )}
                          {packLabel && (
                            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                              {packLabel}
                            </span>
                          )}
                          {drop.pack && (
                            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                              {drop.pack}
                            </span>
                          )}
                          {drop.cultivarCount && (
                            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                              {drop.cultivarCount} cultivars
                            </span>
                          )}
                          {drop.seedsPerCultivar && (
                            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                              {drop.seedsPerCultivar} per cultivar
                            </span>
                          )}
                          {drop.seedsPerPack && (
                            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                              {drop.seedsPerPack} per pack
                            </span>
                          )}
                          {drop.flowering && (
                            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                              {drop.flowering}
                            </span>
                          )}
                          {drop.note && (
                            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-black text-amber-700 dark:text-amber-300">
                              {drop.note}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {drop.type === "Unknown from cart" ? (
                          <span className="inline-flex rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-black text-muted-foreground">
                            {drop.sex === "Feminized" ? "Feminized · type TBC" : "Type / sex TBC"}
                          </span>
                        ) : drop.type === "Regular" ? (
                          <span className="inline-flex rounded-full border border-blue-500/25 bg-blue-500/10 px-2.5 py-1 text-xs font-black text-blue-700 dark:text-blue-300">
                            Regular seeds
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-black text-primary">
                            {drop.sex === "Unknown from cart" ? drop.type : `${drop.sex} ${drop.type}`}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-display text-lg font-black">
                        {drop.count ?? <span className="text-sm text-amber-600 dark:text-amber-400">TBC</span>}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </CollapsibleSection>
  );
};

export default IncomingDrops;