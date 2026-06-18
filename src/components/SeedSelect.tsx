import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Sprout } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SEEDS, BREEDERS, type Seed } from "@/data/seeds";

type Props = {
  label: string;
  accent: "green" | "purple";
  value: Seed | null;
  onChange: (seed: Seed) => void;
  seeds?: Seed[];
  seedCounts?: Record<string, number>;
  title?: string;
};

const accentStyles = {
  green: {
    ring: "border-primary/30 hover:border-primary",
    chip: "bg-primary text-primary-foreground",
  },
  purple: {
    ring: "border-accent/30 hover:border-accent",
    chip: "bg-accent text-accent-foreground",
  },
};

const typeLabel = (seed: Seed) =>
  seed.type === "Autoflower"
    ? "AUTO"
    : seed.type === "Regular"
      ? "REG"
      : seed.type === "Unknown Photo"
        ? "PHOTO ?"
        : "FEM";

const countLabel = (seed: Seed, seedCounts: Record<string, number>) => {
  const count = seedCounts[seed.id];
  if (seed.breeder === "Burn Pile") return count === undefined ? "burn pile · utility" : `${count} seeds · burn pile`;
  if (count === undefined) return "unknown stock";
  if (count <= 3) return `${count} seeds · preserve`;
  if (count <= 6) return `${count} seeds · cautious`;
  return `${count} seeds · breedable`;
};

const SeedSelect = ({
  label,
  accent,
  value,
  onChange,
  seeds = SEEDS,
  seedCounts = {},
  title,
}: Props) => {
  const [open, setOpen] = useState(false);
  const styles = accentStyles[accent];
  const breeders = useMemo(() => {
    const extra = seeds.map((seed) => seed.breeder).filter((b) => !BREEDERS.includes(b));
    return [...BREEDERS.filter((b) => seeds.some((s) => s.breeder === b)), ...Array.from(new Set(extra))];
  }, [seeds]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold",
            styles.chip,
          )}
        >
          {label}
        </span>
        <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {title ?? `Parent ${label}`}
        </span>
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "h-auto min-h-[64px] w-full justify-between rounded-2xl border-2 bg-card px-4 py-3 text-left shadow-sm transition-colors",
              styles.ring,
            )}
          >
            {value ? (
              <span className="flex min-w-0 flex-col">
                <span className="flex min-w-0 items-center gap-2 text-base font-semibold leading-tight">
                  <span className="truncate">{value.name}</span>
                  <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">
                    {typeLabel(value)}
                  </span>
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {value.breeder} · {value.type} · {countLabel(value, seedCounts)}
                </span>
              </span>
            ) : (
              <span className="flex items-center gap-2 text-muted-foreground">
                <Sprout className="h-4 w-4" />
                Pick a seed…
              </span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0"
          align="start"
        >
          <Command
            filter={(value, search) =>
              value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
            }
          >
            <CommandInput placeholder="Search strains…" />
            <CommandList>
              <CommandEmpty>No seed found.</CommandEmpty>
              {breeders.map((breeder) => {
                const breederSeeds = seeds.filter((s) => s.breeder === breeder);
                if (breederSeeds.length === 0) return null;
                return (
                  <CommandGroup key={breeder} heading={breeder}>
                    {breederSeeds.map((seed) => (
                      <CommandItem
                        key={seed.id}
                        value={`${seed.name} ${seed.breeder}`}
                        onSelect={() => {
                          onChange(seed);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value?.id === seed.id ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="truncate">{seed.name}</span>
                            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-black text-muted-foreground">
                              {typeLabel(seed)}
                            </span>
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {seed.type} · {countLabel(seed, seedCounts)}
                          </span>
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                );
              })}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SeedSelect;
