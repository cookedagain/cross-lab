import { useMemo, useState } from "react";
import { AlertTriangle, ArrowDownUp, Boxes, CheckCircle2, Clock3, PackageOpen, Store, Users } from "lucide-react";
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
  INCOMING_DROP_UNCONFIRMED_COUNT,
  INCOMING_ORDERS,
  PROPOSED_ACQUISITIONS,
  type IncomingDrop,
} from "@/data/incomingDrops";
import { useVault } from "@/hooks/useVaultStore";

type SortKey = "cultivar" | "breeder" | "type" | "count" | "arrived";
type SortDirection = "asc" | "desc";

const TYPE_ORDER: Record<IncomingDrop["type"], number> = {
  Regular: 0,
  Autoflower: 1,
  Photoperiod: 2,
  "Unknown from cart": 3,
};

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "cultivar", label: "Cultivar A → Z" },
  { value: "breeder", label: "Breeder A → Z" },
  { value: "type", label: "Type" },
  { value: "count", label: "Seed count" },
  { value: "arrived", label: "Arrival status" },
];

const IncomingDrops = () => {
  const { incomingArrivedIds, setIncomingArrived } = useVault();
  const [sortKey, setSortKey] = useState<SortKey>("cultivar");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const arrived = new Set(incomingArrivedIds);
  const orderById = new Map(INCOMING_ORDERS.map((order) => [order.id, order]));
  const arrivedDrops = INCOMING_DROPS.filter((drop) => arrived.has(getIncomingDropId(drop)));
  const pendingDrops = INCOMING_DROPS.filter((drop) => !arrived.has(getIncomingDropId(drop)));
  const arrivedSeedTotal = arrivedDrops.reduce((total, drop) => total + (drop.count ?? 0), 0);
  const pendingSeedTotal = Math.max(0, INCOMING_DROP_TOTAL - arrivedSeedTotal);

  const sortedDrops = useMemo(() => {
    return [...INCOMING_DROPS].sort((a, b) => {
      let comparison = 0;

      switch (sortKey) {
        case "breeder":
          comparison = a.breeder.localeCompare(b.breeder);
          break;
        case "type":
          comparison = TYPE_ORDER[a.type] - TYPE_ORDER[b.type];
          break;
        case "count": {
          const aCount = a.count ?? -1;
          const bCount = b.count ?? -1;
          comparison = aCount - bCount;
          break;
        }
        case "arrived":
          comparison =
            Number(arrived.has(getIncomingDropId(a))) -
            Number(arrived.has(getIncomingDropId(b)));
          break;
        case "cultivar":
        default:
          comparison = a.cultivar.localeCompare(b.cultivar);
          break;
      }

      if (comparison === 0) comparison = a.cultivar.localeCompare(b.cultivar);
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [incomingArrivedIds, sortDirection, sortKey]);

  const toggleSortDirection = () => {
    setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
  };

  return (
    <CollapsibleSection
      title="Incoming & Unreconciled"
      icon={<PackageOpen className="h-5 w-5" />}
      description={
        INCOMING_DROPS.length > 0
          ? "Count-known orders, requested manifest references, and count-TBD allocations. Only exact rows can move into the vault after a physical count."
          : "The incoming tracker is empty and ready for the next confirmed allocation."
      }
      badge={
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
          {pendingDrops.length} records · {pendingSeedTotal} known seeds
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
          <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {INCOMING_ORDERS.map((order) => {
              const orderDrops = INCOMING_DROPS.filter(
                (drop) => (drop.orderId ?? DEFAULT_INCOMING_ORDER_ID) === order.id,
              );
              const orderSeeds = order.confirmedSeedCount ?? orderDrops.reduce((total, drop) => total + (drop.count ?? 0), 0);

              return (
                <div key={order.id} className="rounded-3xl border-2 border-primary/20 bg-primary/5 p-5">
                  <div className="mb-4 flex items-center gap-2 text-primary">
                    <Store className="h-5 w-5" />
                    <p className="text-xs font-black uppercase tracking-[0.2em]">{order.label}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <div>
                      <p className="text-xs font-bold text-muted-foreground">Supplier</p>
                      <p className="mt-1 font-display font-black">{order.supplier}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground">Status</p>
                      <p className="mt-1 font-display font-black">{order.status}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground">Source / shipment</p>
                      <p className="mt-1 font-display font-black">{order.source ?? order.orderDate}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground">Count-known seeds</p>
                      <p className="mt-1 font-display font-black">
                        {orderSeeds || "TBD"} <span className="text-xs text-muted-foreground">· {orderDrops.length} tracker records</span>
                      </p>
                    </div>
                  </div>
                  {order.currency && <p className="mt-3 text-xs font-bold text-muted-foreground">{order.currency}</p>}
                  {order.note && <p className="mt-3 text-xs font-semibold leading-relaxed text-muted-foreground">{order.note}</p>}
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
                <p className="text-xs font-black uppercase tracking-wide">TBD allocations</p>
              </div>
              <p className="font-display text-3xl font-black">{INCOMING_DROP_UNCONFIRMED_COUNT}</p>
              <p className="text-xs text-muted-foreground">zero in totals</p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="mb-2 flex items-center gap-2 text-primary">
                <Users className="h-4 w-4" />
                <p className="text-xs font-black uppercase tracking-wide">Tracker groups</p>
              </div>
              <p className="font-display text-3xl font-black">{INCOMING_ORDERS.length}</p>
              <p className="text-xs text-muted-foreground">{INCOMING_DROPS.length} records</p>
            </div>
          </div>

          <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
            <b>{INCOMING_DROP_TOTAL} count-known incoming seeds</b>: 20 across two LandraceWarden rows, 50 across five paid/not-sent @wizdom lots, and 400 across JohnnyPotseed's 40 packs. The 39 Johnny catalogue rows remain requested references rather than a confirmed manifest, while the {INCOMING_DROP_UNCONFIRMED_COUNT} TBD allocations add zero.
          </div>

          <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-border bg-background p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-primary">Sort incoming drops</p>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">
                Unknown seed counts stay at the end when sorting by count.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                <span>Sort by</span>
                <select
                  value={sortKey}
                  onChange={(event) => setSortKey(event.target.value as SortKey)}
                  className="h-9 rounded-xl border border-border bg-card px-3 text-sm font-bold text-foreground outline-none focus:border-primary"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={toggleSortDirection}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 text-xs font-black text-muted-foreground transition hover:border-primary hover:text-primary"
              >
                <ArrowDownUp className="h-4 w-4" />
                {sortDirection === "asc" ? "Ascending" : "Descending"}
              </button>
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
                {sortedDrops.map((drop) => {
                  const id = getIncomingDropId(drop);
                  const hasArrived = arrived.has(id);
                  const canReconcile = drop.recordKind === "exact" && drop.count !== null;
                  const order = orderById.get(drop.orderId ?? DEFAULT_INCOMING_ORDER_ID);
                  const packLabel = drop.pack?.includes("Multipack")
                    ? null
                    : `${drop.quantityPacks} ${drop.quantityPacks === 1 ? "pack" : "packs"}`;

                  return (
                    <TableRow key={id} className={hasArrived ? "bg-emerald-500/5" : undefined}>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={hasArrived}
                          disabled={!canReconcile}
                          onCheckedChange={(checked) => setIncomingArrived(id, checked === true)}
                          aria-label={canReconcile ? `Mark ${drop.cultivar} as ${hasArrived ? "incoming" : "physically audited"}` : `${drop.cultivar} requires a confirmed physical count`}
                          title={canReconcile ? "Mark physically audited" : "Confirm the landed cultivar and count before moving it to the vault"}
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
                          {drop.recordKind === "requested-reference" && (
                            <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-sky-700 dark:text-sky-300">
                              Requested reference
                            </span>
                          )}
                          {drop.recordKind === "tbd-allocation" && (
                            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-amber-700 dark:text-amber-300">
                              Count TBD
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
                            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-black text-muted-foreground">
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
                        {drop.count ?? <span className="text-sm text-amber-600 dark:text-amber-400">TBD</span>}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="mt-5 rounded-3xl border border-dashed border-border bg-muted/30 p-4">
            <div className="mb-3 flex items-center gap-2 text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-xs font-black uppercase tracking-wide">Proposed or superseded · excluded from totals</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {PROPOSED_ACQUISITIONS.map((item) => (
                <div key={item.title} className="rounded-2xl bg-background p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-black">{item.title}</p>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-black uppercase text-muted-foreground">
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-semibold leading-relaxed text-muted-foreground">{item.note}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </CollapsibleSection>
  );
};

export default IncomingDrops;