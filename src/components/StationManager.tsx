import { useState } from "react";
import { Boxes, Cpu, Plus, Sprout, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StationSeedRecommendations } from "@/components/StationSeedRecommendations";
import { useStations } from "@/hooks/useStationStore";
import type { GrowStation, StationSpec } from "@/lib/growStations";

const CATEGORY_TONE: Record<string, string> = {
  "<100W": "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/40 dark:text-teal-200 dark:border-teal-900",
  "220W": "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-900",
  "500W": "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 dark:bg-fuchsia-950/40 dark:text-fuchsia-200 dark:border-fuchsia-900",
};

const CATEGORIES: GrowStation["category"][] = ["<100W", "220W", "500W"];

const parseSpecs = (text: string): StationSpec[] =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf(":");
      if (idx === -1) return { label: line, value: "" };
      return { label: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() };
    })
    .filter((spec) => spec.label);

const StationManager = () => {
  const { stations, addStation, removeStation } = useStations();

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [category, setCategory] = useState<GrowStation["category"]>("220W");
  const [controller, setController] = useState("");
  const [medium, setMedium] = useState("");
  const [mediumNote, setMediumNote] = useState("");
  const [storeUrl, setStoreUrl] = useState("");
  const [specsText, setSpecsText] = useState("");

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    addStation({
      name: trimmed,
      role: role.trim(),
      category,
      controller: controller.trim(),
      medium: medium.trim(),
      mediumNote: mediumNote.trim(),
      storeUrl: storeUrl.trim(),
      specs: parseSpecs(specsText),
    });
    setName("");
    setRole("");
    setController("");
    setMedium("");
    setMediumNote("");
    setStoreUrl("");
    setSpecsText("");
  };

  return (
    <section>
      <div className="rounded-[1.75rem] border-2 border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Boxes className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-black tracking-tight">Add a grow station</h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Station name (e.g. AC Infinity 4×4)" className="h-11 rounded-2xl font-semibold" />
          <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role (e.g. Main flower tent)" className="h-11 rounded-2xl font-semibold" />
          <Input value={controller} onChange={(e) => setController(e.target.value)} placeholder="Controller (e.g. Controller 69 Pro+)" className="h-11 rounded-2xl font-semibold" />
          <Input value={medium} onChange={(e) => setMedium(e.target.value)} placeholder="Medium (e.g. 4 × 19L coco/soil)" className="h-11 rounded-2xl font-semibold" />
          <Input value={mediumNote} onChange={(e) => setMediumNote(e.target.value)} placeholder="Medium note (feeding style…)" className="h-11 rounded-2xl font-semibold sm:col-span-2" />
          <Input value={storeUrl} onChange={(e) => setStoreUrl(e.target.value)} placeholder="Store link (optional)" className="h-11 rounded-2xl font-semibold sm:col-span-2" />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground">Power class:</span>
          {CATEGORIES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setCategory(option)}
              className={`rounded-full border-2 px-3 py-1 text-xs font-black transition ${
                category === option
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="mt-3">
          <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-muted-foreground">
            Specs — one per line as "Label: Value"
          </span>
          <Textarea
            value={specsText}
            onChange={(e) => setSpecsText(e.target.value)}
            placeholder={"Tent: 120×120×200cm\nLight: 500W full-spectrum LED\nFan: 6\" inline"}
            className="min-h-[120px] rounded-2xl font-mono text-xs leading-6"
          />
        </div>

        <Button type="button" className="mt-4 h-11 rounded-2xl font-bold" onClick={handleAdd} disabled={!name.trim()}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add station
        </Button>
      </div>

      {stations.length === 0 ? (
        <p className="mt-4 rounded-2xl bg-muted/50 p-4 text-sm font-semibold text-muted-foreground">
          No grow stations yet. Add your tents and boxes above and they'll appear here with tailored seed picks.
        </p>
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {stations.map((station) => (
            <div key={station.id} className="flex flex-col justify-between rounded-[1.75rem] border-2 border-border bg-card p-5 shadow-sm">
              <div>
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${CATEGORY_TONE[station.category]}`}>
                    {station.category}
                  </span>
                  <div className="flex items-center gap-1">
                    {station.storeUrl && (
                      <a
                        href={station.storeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-black text-primary hover:underline"
                      >
                        Kit
                      </a>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full text-muted-foreground hover:text-destructive"
                      onClick={() => removeStation(station.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <h3 className="font-display text-lg font-black leading-tight">{station.name}</h3>
                {station.role && <p className="mt-1 text-xs font-semibold text-muted-foreground">{station.role}</p>}

                {station.specs.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {station.specs.map((spec) => (
                      <div key={spec.label} className="rounded-2xl bg-background p-3">
                        <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">{spec.label}</p>
                        {spec.value && <p className="mt-0.5 text-sm font-semibold leading-tight">{spec.value}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {(station.controller || station.medium) && (
                  <div className="mt-4 space-y-2 border-t border-border/60 pt-4">
                    {station.controller && (
                      <div className="flex items-start gap-2">
                        <Cpu className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <p className="text-xs font-semibold leading-relaxed">{station.controller}</p>
                      </div>
                    )}
                    {station.medium && (
                      <div className="flex items-start gap-2">
                        <Sprout className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <p className="text-xs font-semibold leading-relaxed">
                          {station.medium}
                          {station.mediumNote ? ` · ${station.mediumNote}` : ""}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <StationSeedRecommendations category={station.category} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default StationManager;