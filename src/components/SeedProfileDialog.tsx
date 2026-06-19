import { Leaf, Minus, Plus, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getSingleSeedProfile, estimateSeedGrowth } from "@/lib/crossName";
import { PHENO_STATUSES, type JournalEntry, type PhenoStatus } from "@/lib/storage";
import type { Seed, SeedType } from "@/data/seeds";

const typeShort: Record<SeedType, string> = {
  Feminized: "FEM",
  Regular: "REG",
  Autoflower: "AUTO",
  "Unknown Photo": "PHOTO ?",
};

type Props = {
  seed: Seed | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  onCountChange: (count: number) => void;
  journal: JournalEntry | undefined;
  onJournalChange: (entry: JournalEntry) => void;
};

const SeedProfileDialog = ({ seed, open, onOpenChange, count, onCountChange, journal, onJournalChange }: Props) => {
  if (!seed) return null;

  const profile = getSingleSeedProfile(seed, count);
  const growth = estimateSeedGrowth(seed);
  const status: PhenoStatus = journal?.status ?? "untested";
  const notes = journal?.notes ?? "";

  const update = (patch: Partial<JournalEntry>) =>
    onJournalChange({ status, notes, ...patch, updatedAt: Date.now() });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border bg-card px-5 py-4">
          <DialogTitle className="flex items-center gap-2 pr-6 font-display text-xl font-black leading-tight">
            <Leaf className="h-5 w-5 shrink-0 text-primary" />
            <span className="min-w-0">{seed.name}</span>
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {seed.breeder} · {seed.type} · <span className="font-bold">{typeShort[seed.type]}</span>
          </p>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-5rem)]">
          <div className="space-y-5 px-5 py-5">
            {/* Inventory editing */}
            <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/50 p-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">Seeds in vault</p>
                <p className="text-xs text-muted-foreground">Adjust your live count as you crack packs.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => onCountChange(Math.max(0, count - 1))}
                  aria-label="Decrease count"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-display text-xl font-black">{count}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => onCountChange(count + 1)}
                  aria-label="Increase count"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Best guess */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <p className="mb-1 flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Best guess
              </p>
              <p className="text-sm leading-relaxed">{profile.bestGuess}</p>
            </div>

            {/* Terpenes */}
            {profile.terpenes.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-wide text-muted-foreground">Likely terpene lean</p>
                <div className="space-y-2">
                  {profile.terpenes.map((terpene) => (
                    <div key={terpene.key}>
                      <div className="mb-1 flex items-center justify-between text-xs font-bold">
                        <span>{terpene.info.name}</span>
                        <span className="text-muted-foreground">{terpene.info.aroma}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full" style={{ width: `${terpene.share}%`, backgroundColor: terpene.info.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Yield estimates */}
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-wide text-muted-foreground">Est. dry yield · single plant</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {growth.map((env) => (
                  <div key={env.wattage} className="rounded-xl border border-border bg-muted/50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wide text-primary">{env.wattage}</span>
                      <span className="font-display text-base font-black">{env.yieldG.min}–{env.yieldG.max}g</span>
                    </div>
                    <p className="mt-1 text-[10px] font-semibold leading-tight text-muted-foreground">{env.gear}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {env.heightCm.min}–{env.heightCm.max}cm H · {env.widthCm.min}–{env.widthCm.max}cm W
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Selfing / preservation */}
            <div className="rounded-2xl border border-border bg-muted/50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                {profile.selfing.priority} priority · {profile.selfing.title}
              </p>
              <p className="mt-1 text-sm leading-relaxed">{profile.selfing.note}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{profile.selfing.caution}</p>
            </div>

            {/* Journal */}
            <div className="rounded-2xl border-2 border-border p-4">
              <p className="mb-3 text-sm font-black">Grow journal</p>
              <div className="mb-3 flex flex-wrap gap-2">
                {PHENO_STATUSES.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => update({ status: option.value })}
                    className={`rounded-full border-2 px-3 py-1 text-xs font-bold transition ${
                      status === option.value ? option.tone : "border-border bg-card text-muted-foreground hover:border-primary"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <Textarea
                value={notes}
                onChange={(event) => update({ notes: event.target.value })}
                placeholder="Pheno notes: germination, structure, smell, keeper/cull reasons…"
                className="min-h-[90px] rounded-2xl"
              />
              <Button
                variant="outline"
                size="sm"
                className="mt-2 rounded-full border-2 text-xs font-bold"
                onClick={() => update({ notes: notes ? `${notes}\n${profile.bestGuess}` : profile.bestGuess })}
              >
                <Wand2 className="mr-1.5 h-3.5 w-3.5" />
                Prefill best guess
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SeedProfileDialog;
