import { useState } from "react";
import { FlaskRound, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CollapsibleSection from "@/components/CollapsibleSection";
import { clampSeedCount, useVault } from "@/hooks/useVaultStore";

const BreedingLots = () => {
  const { lots, addLot, removeLot } = useVault();
  const [kind, setKind] = useState<"pollen" | "seed">("seed");
  const [name, setName] = useState("");
  const [parents, setParents] = useState("");
  const [quantity, setQuantity] = useState(10);
  const [notes, setNotes] = useState("");

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    addLot({
      kind,
      name: trimmed,
      parents: parents.trim(),
      quantity: clampSeedCount(quantity),
      notes: notes.trim(),
      date: new Date().toISOString().slice(0, 10),
    });
    setName("");
    setParents("");
    setQuantity(10);
    setNotes("");
  };

  const pollenLots = lots.filter((lot) => lot.kind === "pollen");
  const seedLots = lots.filter((lot) => lot.kind === "seed");

  return (
    <CollapsibleSection
      title="Pollen & seed lots"
      icon={<FlaskRound className="h-5 w-5" />}
      description="Track pollen you've collected and seed lots you've made from your own crosses — closing the loop from plan to new stock."
    >
      <div className="rounded-3xl border border-border bg-background p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground">Type:</span>
          {(["seed", "pollen"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setKind(option)}
              className={`rounded-full border-2 px-3 py-1 text-xs font-black uppercase transition ${
                kind === option
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={kind === "pollen" ? "Pollen source (e.g. Temple Kush male #4)" : "Seed lot name (e.g. Cherry Temple F1)"}
          className="mb-3 h-11 rounded-2xl font-semibold"
        />
        <Input
          value={parents}
          onChange={(event) => setParents(event.target.value)}
          placeholder="Parents / cross (e.g. Cherry TK × Temple Kush)"
          className="mb-3 h-11 rounded-2xl font-semibold"
        />
        <Input
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Notes (storage, viability, selection…)"
          className="mb-3 h-11 rounded-2xl font-semibold"
        />
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-2xl border border-border bg-card p-1">
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setQuantity((v) => clampSeedCount(v - 1))}>
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <Input
              type="number"
              min={0}
              value={quantity}
              onChange={(event) => setQuantity(clampSeedCount(Number(event.target.value)))}
              className="h-8 w-14 border-0 bg-transparent p-0 text-center text-sm font-black shadow-none focus-visible:ring-0"
            />
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setQuantity((v) => clampSeedCount(v + 1))}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Button type="button" className="h-11 rounded-2xl font-bold" onClick={handleAdd} disabled={!name.trim()}>
            <Plus className="mr-1.5 h-4 w-4" />
            Log {kind}
          </Button>
        </div>
      </div>

      {lots.length > 0 ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {[
            { label: "Seed lots", items: seedLots, tone: "border-emerald-200 dark:border-emerald-900" },
            { label: "Pollen stores", items: pollenLots, tone: "border-amber-200 dark:border-amber-900" },
          ].map((column) => (
            <div key={column.label}>
              <p className="mb-2 text-xs font-black uppercase tracking-wide text-muted-foreground">
                {column.label} ({column.items.length})
              </p>
              <div className="space-y-2">
                {column.items.map((lot) => (
                  <div key={lot.id} className={`rounded-2xl border bg-background p-3 ${column.tone}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{lot.name}</p>
                        {lot.parents && <p className="truncate text-[11px] font-semibold text-muted-foreground">{lot.parents}</p>}
                        <p className="mt-0.5 text-[11px] font-bold text-muted-foreground">
                          {lot.quantity} {lot.kind === "pollen" ? "samples" : "seeds"} · {lot.date}
                        </p>
                        {lot.notes && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{lot.notes}</p>}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:text-destructive"
                        onClick={() => removeLot(lot.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
                {column.items.length === 0 && (
                  <p className="rounded-2xl bg-muted/50 p-3 text-xs font-semibold text-muted-foreground">Nothing logged yet.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-2xl bg-muted/50 p-4 text-sm text-muted-foreground">
          No lots logged yet. Record pollen or seed you produce so your own genetics become part of the plan.
        </p>
      )}
    </CollapsibleSection>
  );
};

export default BreedingLots;