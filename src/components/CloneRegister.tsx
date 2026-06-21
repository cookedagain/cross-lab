import { useState } from "react";
import { Leaf, Plus, Sprout, Trash2 } from "lucide-react";
import CollapsibleSection from "@/components/CollapsibleSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CLONE_STATUSES,
  STATUS_TONE,
  useCloneRegister,
  type CloneStatus,
} from "@/hooks/useCloneRegister";

const CloneRegister = () => {
  const { mothers, slots, addMother, removeMother, updateSlot, clearSlot } = useCloneRegister();
  const [selected, setSelected] = useState<number | null>(null);

  const [motherName, setMotherName] = useState("");
  const [motherSource, setMotherSource] = useState("");
  const [motherNotes, setMotherNotes] = useState("");

  const handleAddMother = () => {
    const name = motherName.trim();
    if (!name) return;
    addMother({ name, source: motherSource.trim(), notes: motherNotes.trim() });
    setMotherName("");
    setMotherSource("");
    setMotherNotes("");
  };

  const activeSlot = selected !== null ? slots[selected] : null;
  const rootedCount = slots.filter((slot) => slot.status === "Rooted" || slot.status === "Potted").length;
  const inUseCount = slots.filter((slot) => slot.status !== "Empty").length;

  return (
    <CollapsibleSection
      title="Clone register"
      icon={<Sprout className="h-5 w-5" />}
      description="Track your mother plants and a 24-slot rooting grid. Tap a slot to assign a cutting and update its rooting status."
      badge={
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
          {inUseCount}/24 in use
        </span>
      }
    >
      {/* Mother tracker */}
      <div className="rounded-3xl border border-border bg-background p-4">
        <p className="mb-3 text-xs font-black uppercase tracking-wide text-primary">Add a mother plant</p>
        <Input
          value={motherName}
          onChange={(event) => setMotherName(event.target.value)}
          placeholder="Mother name (e.g. Temple Kush keeper #4)"
          className="mb-3 h-11 rounded-2xl font-semibold"
        />
        <Input
          value={motherSource}
          onChange={(event) => setMotherSource(event.target.value)}
          placeholder="Source strain / breeder"
          className="mb-3 h-11 rounded-2xl font-semibold"
        />
        <Input
          value={motherNotes}
          onChange={(event) => setMotherNotes(event.target.value)}
          placeholder="Notes (pheno, vigor, keeper traits…)"
          className="mb-3 h-11 rounded-2xl font-semibold"
        />
        <Button type="button" className="h-11 rounded-2xl font-bold" onClick={handleAddMother} disabled={!motherName.trim()}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add mother
        </Button>
      </div>

      {mothers.length > 0 && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {mothers.map((mother) => (
            <div key={mother.id} className="rounded-2xl border border-border bg-background p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 truncate text-sm font-bold">
                    <Leaf className="h-3.5 w-3.5 shrink-0 text-primary" />
                    {mother.name}
                  </p>
                  {mother.source && <p className="truncate text-[11px] font-semibold text-muted-foreground">{mother.source}</p>}
                  <p className="mt-0.5 text-[11px] font-bold text-muted-foreground">added {mother.dateAdded}</p>
                  {mother.notes && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{mother.notes}</p>}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:text-destructive"
                  onClick={() => removeMother(mother.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 24-slot rooting grid */}
      <div className="mt-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">24-slot rooting grid</p>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-black text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
            {rootedCount} rooted / potted
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
          {slots.map((slot) => {
            const isSelected = selected === slot.index;
            return (
              <button
                key={slot.index}
                type="button"
                onClick={() => setSelected(slot.index)}
                className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-2xl border-2 p-1 text-center transition ${
                  STATUS_TONE[slot.status]
                } ${isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
              >
                <span className="font-display text-sm font-black leading-none">{slot.index + 1}</span>
                {slot.motherName ? (
                  <span className="line-clamp-2 text-[8px] font-bold leading-tight">{slot.motherName}</span>
                ) : (
                  <span className="text-[8px] font-semibold uppercase opacity-60">empty</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Slot editor */}
      {activeSlot && (
        <div className="mt-4 rounded-3xl border-2 border-primary/30 bg-background p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="font-display text-lg font-black">Slot {activeSlot.index + 1}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-full border-2 text-xs font-bold"
              onClick={() => {
                clearSlot(activeSlot.index);
              }}
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              Clear slot
            </Button>
          </div>

          <label className="mb-3 block">
            <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-muted-foreground">Mother / clone</span>
            {mothers.length > 0 ? (
              <select
                value={activeSlot.motherName}
                onChange={(event) => updateSlot(activeSlot.index, { motherName: event.target.value })}
                className="h-11 w-full rounded-2xl border border-border bg-card px-3 text-sm font-semibold"
              >
                <option value="">— Select a mother —</option>
                {mothers.map((mother) => (
                  <option key={mother.id} value={mother.name}>
                    {mother.name}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                value={activeSlot.motherName}
                onChange={(event) => updateSlot(activeSlot.index, { motherName: event.target.value })}
                placeholder="Clone name (add a mother above to pick from a list)"
                className="h-11 rounded-2xl font-semibold"
              />
            )}
          </label>

          <label className="mb-3 block">
            <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-muted-foreground">Date taken</span>
            <Input
              type="date"
              value={activeSlot.dateTaken}
              onChange={(event) => updateSlot(activeSlot.index, { dateTaken: event.target.value })}
              className="h-11 rounded-2xl font-semibold"
            />
          </label>

          <div>
            <span className="mb-1.5 block text-[10px] font-black uppercase tracking-wide text-muted-foreground">Status</span>
            <div className="flex flex-wrap gap-2">
              {CLONE_STATUSES.map((status: CloneStatus) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => updateSlot(activeSlot.index, { status })}
                  className={`rounded-full border-2 px-3 py-1.5 text-xs font-bold transition ${
                    activeSlot.status === status
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </CollapsibleSection>
  );
};

export default CloneRegister;