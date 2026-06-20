import { useState } from "react";
import { Scale, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVault } from "@/hooks/useVaultStore";

const ENV_OPTIONS = ["<100W box", "220W 2×2", "500W 4×4", "Outdoor", "Other"];

const HarvestLog = () => {
  const { harvestLogs, addHarvestLog, removeHarvestLog } = useVault();
  const [strain, setStrain] = useState("");
  const [dryWeight, setDryWeight] = useState(0);
  const [environment, setEnvironment] = useState(ENV_OPTIONS[1]);
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  const handleAdd = () => {
    const trimmed = strain.trim();
    if (!trimmed) return;
    addHarvestLog({
      strain: trimmed,
      dryWeightG: Math.max(0, Math.round(dryWeight)),
      environment,
      harvestDate,
      notes: notes.trim(),
    });
    setStrain("");
    setDryWeight(0);
    setNotes("");
    setHarvestDate(new Date().toISOString().slice(0, 10));
  };

  const totalYield = harvestLogs.reduce((sum, log) => sum + log.dryWeightG, 0);
  const avgYield = harvestLogs.length ? Math.round(totalYield / harvestLogs.length) : 0;

  return (
    <section className="mt-8 rounded-[2rem] border-2 border-border bg-card p-5 shadow-sm sm:p-7">
      <div className="mb-5 flex items-center gap-2">
        <Scale className="h-5 w-5 text-primary" />
        <h2 className="font-display text-2xl font-black">Harvest yield log</h2>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Record actual dry weights so you can compare real results to CrossLab's estimates and tune your expectations.
      </p>

      <div className="rounded-3xl border border-border bg-background p-4">
        <Input
          value={strain}
          onChange={(event) => setStrain(event.target.value)}
          placeholder="Strain / plant (e.g. Cherry TK pheno #2)"
          className="mb-3 h-11 rounded-2xl font-semibold"
        />
        <div className="mb-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-muted-foreground">Dry weight (g)</label>
            <Input
              type="number"
              min={0}
              value={dryWeight}
              onChange={(event) => setDryWeight(Number(event.target.value))}
              className="h-11 rounded-2xl font-semibold"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-muted-foreground">Harvest date</label>
            <Input
              type="date"
              value={harvestDate}
              onChange={(event) => setHarvestDate(event.target.value)}
              className="h-11 rounded-2xl font-semibold"
            />
          </div>
        </div>
        <div className="mb-3 flex flex-wrap gap-2">
          {ENV_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setEnvironment(option)}
              className={`rounded-full border-2 px-3 py-1.5 text-xs font-bold transition ${
                environment === option
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <Input
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Notes (nute schedule, training, cure…)"
          className="mb-3 h-11 rounded-2xl font-semibold"
        />
        <Button type="button" className="h-11 rounded-2xl font-bold" onClick={handleAdd} disabled={!strain.trim()}>
          <Plus className="mr-1.5 h-4 w-4" />
          Log harvest
        </Button>
      </div>

      {harvestLogs.length > 0 ? (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-background p-4">
              <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">Total harvested</p>
              <p className="mt-1 font-display text-2xl font-black">{totalYield}g</p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">Avg per plant</p>
              <p className="mt-1 font-display text-2xl font-black">{avgYield}g</p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">Logged harvests</p>
              <p className="mt-1 font-display text-2xl font-black">{harvestLogs.length}</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {harvestLogs.map((log) => (
              <div key={log.id} className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-background p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{log.strain}</p>
                  <p className="text-[11px] font-bold text-muted-foreground">
                    {log.dryWeightG}g · {log.environment} · {log.harvestDate}
                  </p>
                  {log.notes && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{log.notes}</p>}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:text-destructive"
                  onClick={() => removeHarvestLog(log.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="mt-4 rounded-2xl bg-muted/50 p-4 text-sm text-muted-foreground">
          No harvests logged yet. Record your dry weights to start tracking real-world yields.
        </p>
      )}
    </section>
  );
};

export default HarvestLog;