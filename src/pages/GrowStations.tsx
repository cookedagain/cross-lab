import { Link } from "react-router-dom";
import { ArrowLeft, Boxes, Cpu, Droplets, ExternalLink } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import CloneRegister from "@/components/CloneRegister";
import { CloneRegisterProvider } from "@/hooks/useCloneRegister";
import { GROW_STATIONS } from "@/lib/growStations";

const CATEGORY_TONE: Record<string, string> = {
  "<100W": "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/40 dark:text-teal-200 dark:border-teal-900",
  "220W": "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-900",
  "500W": "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 dark:bg-fuchsia-950/40 dark:text-fuchsia-200 dark:border-fuchsia-900",
};

const GrowStations = () => {
  return (
    <CloneRegisterProvider>
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b border-border/70 bg-card/90 backdrop-blur">
          <div className="container flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <Boxes className="h-6 w-6" />
              </span>
              <div>
                <p className="font-display text-2xl font-black tracking-tight">Grow Stations</p>
                <p className="text-sm text-muted-foreground">Equipment specs & clone register</p>
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
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="container max-w-5xl pb-20 pt-8">
          <section className="grid gap-4 lg:grid-cols-3">
            {GROW_STATIONS.map((station) => (
              <div key={station.id} className="rounded-[1.75rem] border-2 border-border bg-card p-5 shadow-sm">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${CATEGORY_TONE[station.category]}`}>
                    {station.category}
                  </span>
                  <a
                    href={station.storeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-black text-primary hover:underline"
                  >
                    Kit
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <h2 className="font-display text-lg font-black leading-tight">{station.name}</h2>
                <p className="mt-1 text-xs font-semibold text-muted-foreground">{station.role}</p>

                <div className="mt-4 space-y-2">
                  {station.specs.map((spec) => (
                    <div key={spec.label} className="rounded-2xl bg-background p-3">
                      <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">{spec.label}</p>
                      <p className="mt-0.5 text-sm font-semibold leading-tight">{spec.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-2 border-t border-border/60 pt-4">
                  <div className="flex items-start gap-2">
                    <Cpu className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <p className="text-xs font-semibold leading-relaxed">{station.controller}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Droplets className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <p className="text-xs font-semibold leading-relaxed">
                      ~{station.reservoirL}L reservoir · {station.reservoirNote}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </section>

          <CloneRegister />

          <div className="mt-6 rounded-3xl bg-muted/50 p-4 text-xs font-semibold leading-relaxed text-muted-foreground">
            Specs are taken from each kit's published contents. Reservoir volumes are DWC working estimates —
            confirm against your own buckets and trust your EC/pH meter over any chart.
          </div>
        </main>
      </div>
    </CloneRegisterProvider>
  );
};

export default GrowStations;