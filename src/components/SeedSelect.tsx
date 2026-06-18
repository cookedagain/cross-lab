import { useState } from "react";
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
};

const accentStyles = {
  green: {
    ring: "border-primary/30 hover:border-primary",
    chip: "bg-primary text-primary-foreground",
    dot: "bg-primary",
  },
  purple: {
    ring: "border-accent/30 hover:border-accent",
    chip: "bg-accent text-accent-foreground",
    dot: "bg-accent",
  },
};

const SeedSelect = ({ label, accent, value, onChange }: Props) => {
  const [open, setOpen] = useState(false);
  const styles = accentStyles[accent];

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
          Parent {label}
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
                <span className="truncate text-base font-semibold leading-tight">
                  {value.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {value.breeder}
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
              {BREEDERS.map((breeder) => {
                const seeds = SEEDS.filter((s) => s.breeder === breeder);
                if (seeds.length === 0) return null;
                return (
                  <CommandGroup key={breeder} heading={breeder}>
                    {seeds.map((seed) => (
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
                        {seed.name}
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
