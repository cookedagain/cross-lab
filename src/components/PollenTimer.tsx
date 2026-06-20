import { useState } from "react";
import { Timer, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVault, type PollenStorage } from "@/hooks/useVaultStore";
import { getPollenStatus, POLLEN_STORAGE_LABEL, POLLEN_WINDOWS } from "@/lib/pollen";

const STORAGE_OPTIONS: PollenStorage[] = ["room", "fridge", "freezer"];

const PollenTimer = () => {
  const { pollenLogs, addPollenLog, removePollenLog } = useVault();
  const [source, setSource] = useState("");
  const [collected, setCollected] = useState(new Date().toISOString().slice(0, 10));
  const [storage, setStorage] = useState<PollenStorage>("fridge");
  const [notes, setNotes] = useState("");

  const handleAdd = () => {
    const trimmed = source.trim();
    if (!trimmed) return;
    addPollenLog({ source: trimmed, collected, storage, notes: notes.trim() });
    setSource("");
    setNotes("");
    setStorage("fridge");
    setCollected(new Date().toISOString().slice(0, 10));
  };

  const sorted = [...pollenLogs].sort(
    (a, b) =>
      getPollenStatus(a.collected, a.storage).daysRemaining -
      getPollenStatus(b.collected, b.storage).daysRemaining,
  );

  return (
    <section className="mt-8 rounded-[2rem] border-2 border-border bg-card p-5 shadow-sm sm:p-7">
      <div className="mb-5 flex items-center gap-2">
        <Timer className="h-5 w-5 text-primary" />
        <h2 className="font-display text-2xl font-black">Pollen viability timer</h2>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Track collection date and storage so you know how long each pollen sample stays viable. Estimated windows:
        room ~{POLLEN_WINDOWS.room}d, fridge ~{POLLEN_WINDOWS.fridge}d, freezer ~{POLLEN_WINDOWS.freezer}d.
      </p>

      <div className="rounded-3xl border border-border bg-background p-4">
        <Input
          value={source}
          onChange={(event) => setSource(event.target.value)}
          placeholder="Pollen source (e.g. Temple Kush male #4)"
          className="mb-3 h-11 rounded-2xl font-semibold"
        />
        <div className="mb-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-muted-foreground">Collected</label>
            <Input
              type="date"
              value={collected}
              onChange={(event) => setCollected(event.target.value)}
              className="h-11 rounded-2xl font-semibold"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-muted-foreground">Storage</label>
            <div className="flex gap-2">
              {STORAGE_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setStorage(option)}
                  className={`flex-1 rounded-2xl border-2 px-2 py-2.5 text-xs font-black transition ${
                    storage === option
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {POLLEN_STORAGE_LABEL[option]}
                </button>
              ))}
            </div>
          </div>
        </div>
        <Input
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Notes (desiccant, flour mix, jar #…)"
          className="mb-3 h-11 rounded-2xl font-semibold"
        />
        <Button type="button" className="h-11 rounded-2xl font-bold" onClick={handleAdd} disabled={!source.trim()}>
          <Plus className="mr-1.5 h-4 w-4" />
          Start timer
        </Button>
      </div>

      {sorted.length > 0 ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {sorted.map((log) => {
            const status = getPollenStatus(log.collected, log.storage);
            return (
              <div key={log.id} className={`rounded-2xl border p-3 ${status.tone}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{log.source}</p>
                    <p className="text-[11px] font-semibold opacity-80">
                      {POLLEN_STORAGE_LABEL[log.storage]} · collected {log.collected}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 rounded-full hover:text-destructive"
                    onClick={() => removePollenLog(log.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs font-black">
                  <span>{status.level}</span>
                  <span>
                    {status.daysRemaining > 0 ? `${status.daysRemaining}d left` : "Past window"}
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                  <div className="h-full rounded-full bg-current opacity-70" style={{ width: `${status.percentRemaining}%` }} />
                </div>
                {log.notes && <p className="mt-2 text-[11px] leading-relaxed opacity-80">{log.notes}</p>}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-4 rounded-2xl bg-muted/50 p-4 text-sm text-muted-foreground">
          No pollen samples being tracked yet. Start a timer when you collect pollen to watch its viability window.
        </p>
      )}
    </section>
  );
};

export default PollenTimer;