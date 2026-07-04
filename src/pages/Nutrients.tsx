import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Beaker, Droplets, Info, ListOrdered, Minus, Plus, RefreshCw } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import CollapsibleSection from "@/components/CollapsibleSection";
import FeedWeekCard from "@/components/FeedWeekCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CYCO_PRODUCTS,
  CYCO_SCHEDULE,
  DEFAULT_RESERVOIR_L,
  FLUSH_NOTE,
  MIXING_ORDER,
} from "@/lib/cycoFeed";

const clampReservoir = (value: number) =>
  Math.max(1, Math.min(200, Math.round((Number.isFinite(value) ? value : DEFAULT_RESERVOIR_L) * 10) / 10));

const DWC_NOTES = [
  "Start new genetics at half strength — DWC delivers nutrients far more aggressively than soil or coco.",
  "Keep res temperature 18–21°C to hold dissolved oxygen and prevent root rot.",
  "Top up daily with plain pH'd water; do a full reservoir change every 7 days.",
  "pH will drift up as plants drink — check and correct daily, adjusting pH last after all nutrients are in.",
  "Cyco Zyme every week keeps the root zone and airstones clean in a recirculating system.",
];

const Nutrients = () => {
  const [reservoir, setReservoir] = useState(DEFAULT_RESERVOIR_L);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/70 bg-card/90 backdrop-blur">
        <div className="container flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <Beaker className="h-6 w-6" />
            </span>
            <div>
              <p className="font-display text-2xl font-black tracking-tight">Cyco Feed Chart</p>
              <p className="text-sm text-muted-foreground">Cyco Platinum Series · DWC in the VGrow</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border-2 border-border bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Seed vault
            </Link>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-2xl border-2"
              onClick={() => window.location.reload()}
              title="Refresh page"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container max-w-5xl pb-20 pt-8">
        <section className="rounded-[1.75rem] border-2 border-primary/30 bg-primary/5 p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Droplets className="h-6 w-6 text-primary" />
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Reservoir volume</p>
                <p className="text-sm font-semibold text-muted-foreground">
                  All amounts below auto-scale to this volume.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-2xl border border-border bg-card p-1">
                <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => setReservoir((v) => clampReservoir(v - 1))}>
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  min={1}
                  step="0.5"
                  value={reservoir}
                  onChange={(event) => setReservoir(clampReservoir(Number(event.target.value)))}
                  className="h-9 w-16 border-0 bg-transparent p-0 text-center text-lg font-black shadow-none focus-visible:ring-0"
                />
                <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => setReservoir((v) => clampReservoir(v + 1))}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <span className="font-display text-2xl font-black">L</span>
            </div>
          </div>
        </section>

        <CollapsibleSection
          title="Mixing order"
          icon={<ListOrdered className="h-5 w-5" />}
          description="Cyco's official order of addition. Stir between each step and adjust pH last."
        >
          <div className="space-y-2">
            {MIXING_ORDER.map((step) => (
              <div key={step.step} className="flex items-start gap-3 rounded-2xl border border-border bg-background p-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-black text-primary">
                  {step.step}
                </span>
                <div>
                  {step.keys.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {step.keys.map((key) => (
                        <span key={key} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-black text-muted-foreground">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CYCO_PRODUCTS[key].color }} />
                          {CYCO_PRODUCTS[key].name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-primary">
                      pH adjust
                    </span>
                  )}
                  <p className="mt-1.5 text-xs font-semibold leading-relaxed text-muted-foreground">{step.note}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-start gap-2 rounded-2xl bg-slate-100 p-3 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-xs font-semibold leading-relaxed">{FLUSH_NOTE}</p>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Weekly schedule"
          icon={<Beaker className="h-5 w-5" />}
          description={`Cyco Platinum Series, grow → bloom → flush. Amounts shown for your ${reservoir}L reservoir (mL/L in brackets).`}
        >
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {CYCO_SCHEDULE.map((week) => (
              <FeedWeekCard key={week.week} week={week} reservoirL={reservoir} />
            ))}
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Product range"
          icon={<Info className="h-5 w-5" />}
          description="Everything in the Cyco Platinum line and what each bottle does."
          defaultOpen={false}
        >
          <div className="grid gap-2 sm:grid-cols-2">
            {Object.entries(CYCO_PRODUCTS).map(([key, product]) => (
              <div key={key} className="flex items-start gap-3 rounded-2xl border border-border bg-background p-3">
                <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: product.color }} />
                <div>
                  <p className="text-sm font-bold">{product.name}</p>
                  <p className="text-xs font-semibold text-muted-foreground">{product.role}</p>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        <div className="mt-6 rounded-3xl bg-amber-50 p-4 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold">DWC reality check</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm leading-relaxed">
                {DWC_NOTES.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
              <p className="mt-2 text-xs font-semibold opacity-80">
                These are planning rates based on Cyco's published Platinum Series guidance — always confirm against the
                current bottle label and trust your EC/pH meter over any chart.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Nutrients;