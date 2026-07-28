import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, BarChart3, Search } from "lucide-react";
import CollapsibleSection from "@/components/CollapsibleSection";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Seed } from "@/data/seeds";
import { useVault } from "@/hooks/useVaultStore";
import {
  CANNABINOID_ORDER,
  CANNABINOIDS,
  estimateCannabinoidPanel,
  type CannabinoidKey,
  type CannabinoidPanelEntry,
} from "@/lib/cannabinoids";
import { TypeBadge } from "@/components/TypeBadge";

type CannabinoidDetailsTableProps = {
  seeds: Seed[];
};

type SortKey = "name" | "breeder" | "count" | CannabinoidKey;
type SortDirection = "asc" | "desc";

type DetailsRow = {
  seed: Seed;
  values: CannabinoidPanelEntry[];
};

const getCannabinoidValue = (row: DetailsRow, key: CannabinoidKey) =>
  row.values.find((entry) => entry.key === key)?.range.max ?? 0;

const formatRange = (entry: CannabinoidPanelEntry | undefined) => {
  if (!entry) return "—";
  if (entry.range.min === entry.range.max) return `${entry.range.max}%`;
  return `${entry.range.min}–${entry.range.max}%`;
};

const CannabinoidDetailsTable = ({ seeds }: CannabinoidDetailsTableProps) => {
  const { getSeedCount } = useVault();
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const rows = useMemo<DetailsRow[]>(
    () =>
      seeds.map((seed) => ({
        seed,
        values: estimateCannabinoidPanel(seed),
      })),
    [seeds],
  );

  const visibleRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return rows
      .filter(({ seed }) =>
        !normalizedQuery
          ? true
          : `${seed.name} ${seed.breeder} ${seed.type}`.toLowerCase().includes(normalizedQuery),
      )
      .sort((a, b) => {
        let comparison = 0;

        if (sortKey === "name") {
          comparison = a.seed.name.localeCompare(b.seed.name);
        } else if (sortKey === "breeder") {
          comparison = a.seed.breeder.localeCompare(b.seed.breeder);
        } else if (sortKey === "count") {
          comparison = getSeedCount(a.seed) - getSeedCount(b.seed);
        } else {
          comparison = getCannabinoidValue(a, sortKey) - getCannabinoidValue(b, sortKey);
        }

        if (comparison === 0) return a.seed.name.localeCompare(b.seed.name);
        return sortDirection === "asc" ? comparison : -comparison;
      });
  }, [getSeedCount, query, rows, sortDirection, sortKey]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection(CANNABINOID_ORDER.includes(key as CannabinoidKey) ? "desc" : "asc");
  };

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return null;
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3 w-3" />
    ) : (
      <ArrowDown className="h-3 w-3" />
    );
  };

  return (
    <CollapsibleSection
      title="Cannabinoid details · all noids"
      icon={<BarChart3 className="h-5 w-5" />}
      defaultOpen={true}
      badge={
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
          {CANNABINOID_ORDER.length} noids · {visibleRows.length} strains
        </span>
      }
      description="All listed cannabinoids in a Windows Explorer-style details view. Click any cannabinoid column to sort by estimated concentration; the first click is highest to lowest."
    >
      <div className="rounded-3xl border border-border bg-background">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search strains or breeders…"
              className="h-10 rounded-2xl pl-9 font-semibold"
            />
          </div>
          <p className="text-xs font-semibold text-muted-foreground">
            Sorting uses the estimated upper range; values are not lab results.
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table className="min-w-[1900px] text-xs">
            <TableHeader>
              <TableRow className="bg-muted/60 hover:bg-muted/60">
                <TableHead className="sticky left-0 z-20 min-w-64 bg-muted/95 px-3 py-2 text-[10px] font-black uppercase tracking-wide">
                  <button
                    type="button"
                    onClick={() => handleSort("name")}
                    className="inline-flex items-center gap-1 hover:text-primary"
                  >
                    Strain {sortIndicator("name")}
                  </button>
                </TableHead>
                <TableHead className="min-w-44 px-3 py-2 text-[10px] font-black uppercase tracking-wide">
                  <button
                    type="button"
                    onClick={() => handleSort("breeder")}
                    className="inline-flex items-center gap-1 hover:text-primary"
                  >
                    Breeder {sortIndicator("breeder")}
                  </button>
                </TableHead>
                <TableHead className="min-w-28 px-3 py-2 text-[10px] font-black uppercase tracking-wide">
                  Type
                </TableHead>
                <TableHead className="min-w-20 px-3 py-2 text-right text-[10px] font-black uppercase tracking-wide">
                  <button
                    type="button"
                    onClick={() => handleSort("count")}
                    className="ml-auto inline-flex items-center gap-1 hover:text-primary"
                  >
                    Seeds {sortIndicator("count")}
                  </button>
                </TableHead>
                {CANNABINOID_ORDER.map((key) => (
                  <TableHead
                    key={key}
                    className="min-w-24 px-3 py-2 text-right text-[10px] font-black uppercase tracking-wide"
                    title={`${CANNABINOIDS[key].label} — click to sort high to low`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSort(key)}
                      className="ml-auto inline-flex items-center gap-1 hover:text-primary"
                    >
                      <span>{CANNABINOIDS[key].name}</span>
                      {sortIndicator(key)}
                    </button>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleRows.map(({ seed, values }) => (
                <TableRow key={seed.id} className="group">
                  <TableCell className="sticky left-0 z-10 min-w-64 bg-background px-3 py-2 font-semibold group-hover:bg-muted/50">
                    <a
                      href={`/strain/${encodeURIComponent(seed.id)}`}
                      className="hover:text-primary hover:underline"
                    >
                      {seed.name}
                    </a>
                    <p className="mt-0.5 text-[10px] font-semibold text-muted-foreground">
                      {seed.breeder}
                    </p>
                    {seed.note && (
                      <p className="mt-0.5 max-w-56 text-[10px] font-semibold leading-tight text-amber-700 dark:text-amber-300">
                        {seed.note}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="px-3 py-2 font-semibold text-muted-foreground">
                    {seed.breeder}
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <TypeBadge type={seed.type} />
                  </TableCell>
                  <TableCell className="px-3 py-2 text-right font-black">
                    {getSeedCount(seed)}
                  </TableCell>
                  {CANNABINOID_ORDER.map((key) => {
                    const entry = values.find((item) => item.key === key);
                    return (
                      <TableCell key={key} className="px-3 py-2 text-right font-mono text-[11px] font-bold">
                        {formatRange(entry)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {visibleRows.length === 0 && (
          <p className="p-6 text-center text-sm font-semibold text-muted-foreground">
            No strains match this search.
          </p>
        )}
      </div>
    </CollapsibleSection>
  );
};

export default CannabinoidDetailsTable;