import {
  AlertTriangle,
  Archive,
  Camera,
  Cpu,
  Droplets,
  FlaskConical,
  Snowflake,
  Sprout,
  ThermometerSun,
  Wind,
} from "lucide-react";

const CurrentLabStatus = () => (
  <section className="mb-6 space-y-4">
    <div className="rounded-[2rem] border-2 border-primary/20 bg-primary/5 p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Current authority · 21 September 2026 AEST</p>
          <h2 className="mt-1 font-display text-2xl font-black">CrossLab Seed Vault · Manning Madness</h2>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            Personal, non-commercial archive. Two More Weeks Labs remains the internal lab alias.
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1.5 text-xs font-black text-amber-800 dark:text-amber-200">
          <AlertTriangle className="h-4 w-4" />
          Working · 1,961 physical · 242 rows
        </span>
      </div>
      <p className="mt-3 rounded-2xl bg-amber-500/10 p-3 text-xs font-semibold leading-relaxed text-amber-900 dark:text-amber-100">
        The post-Pixie total is provisional pending a physical recount of the pinned 71-seed / 11-line outbound record. Pre-dispatch stock was fully reconciled at 2,032 seeds across 244 rows.
      </p>
    </div>

    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 text-primary">
          <Sprout className="h-5 w-5" />
          <p className="text-xs font-black uppercase tracking-wide">Next main calibration · not started</p>
        </div>
        <h3 className="mt-2 font-display text-xl font-black">ETHOS Martian Fuel GEN1</h3>
        <p className="mt-1 text-sm font-semibold text-muted-foreground">
          Martian Candy OG × Banana Daddy AUTO IBL · five feminized seeds physically held.
        </p>
        <div className="mt-4 space-y-2 text-sm font-semibold leading-relaxed text-muted-foreground">
          <p className="rounded-2xl bg-muted/60 p-3">
            Preferred direction: four approximately 50 L fabric pots with Easy As Organics living soil in the primary 4×4.
          </p>
          <p className="rounded-2xl bg-amber-500/10 p-3 text-amber-900 dark:text-amber-100">
            Pot size/count, irrigation, and exact amendment cycle remain open. No germination or run start is recorded.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 text-primary">
          <ThermometerSun className="h-5 w-5" />
          <p className="text-xs font-black uppercase tracking-wide">Environment & storage</p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-muted/60 p-3">
            <p className="text-[10px] font-black uppercase text-muted-foreground">Latest spot reading</p>
            <p className="mt-1 font-display text-xl font-black">19.6 °C · 32% RH</p>
          </div>
          <div className="rounded-2xl bg-muted/60 p-3">
            <p className="text-[10px] font-black uppercase text-muted-foreground">Current containers</p>
            <p className="mt-1 font-display text-xl font-black">8 clip-lid tubs</p>
          </div>
        </div>
        <ul className="mt-3 space-y-2 text-xs font-semibold leading-relaxed text-muted-foreground">
          <li className="flex gap-2"><Droplets className="mt-0.5 h-4 w-4 shrink-0 text-primary" />Desiccant beads were recharged after the latest reading; it is a spot observation, not a logger average.</li>
          <li className="flex gap-2"><Archive className="mt-0.5 h-4 w-4 shrink-0 text-primary" />Labelled microcentrifuge vials are capped; original packs and receipts are retained for provenance.</li>
          <li className="flex gap-2"><Snowflake className="mt-0.5 h-4 w-4 shrink-0 text-primary" />Chest-freezer storage is planned after the move, using dry sealed secondary containers and contained desiccant.</li>
        </ul>
      </div>

      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
        <div className="flex items-center gap-2 text-primary">
          <Cpu className="h-5 w-5" />
          <p className="text-xs font-black uppercase tracking-wide">Supporting equipment</p>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="flex gap-2 rounded-2xl bg-muted/60 p-3">
            <Cpu className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-xs font-semibold leading-relaxed"><b className="block text-foreground">Owned</b>Two AC Infinity Controller AI+ units and spare 64 GB SD cards.</p>
          </div>
          <div className="flex gap-2 rounded-2xl bg-muted/60 p-3">
            <Wind className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-xs font-semibold leading-relaxed"><b className="block text-foreground">Available</b>Excelair portable air conditioner, approximately 3.75 kW.</p>
          </div>
          <div className="flex gap-2 rounded-2xl bg-muted/60 p-3">
            <Camera className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-xs font-semibold leading-relaxed"><b className="block text-foreground">Status to confirm</b>Two planned Spectron 7 AI 4K cameras, one per principal tent.</p>
          </div>
        </div>
        <p className="mt-3 text-xs font-semibold text-muted-foreground">Owned clone space: approximately 70 × 45 × 70 cm with roughly 60 W light. Clone tent B was cancelled.</p>
      </div>

      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
        <div className="flex items-center gap-2 text-primary">
          <FlaskConical className="h-5 w-5" />
          <p className="text-xs font-black uppercase tracking-wide">Extraction state</p>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-muted/60 p-3">
            <p className="text-[10px] font-black uppercase text-muted-foreground">Recent flower rosin</p>
            <p className="mt-1 font-display text-xl font-black">5.01 g</p>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">Afghan Layer Cake · 25.5–29.0 g bounded input</p>
          </div>
          <div className="rounded-2xl bg-muted/60 p-3">
            <p className="text-[10px] font-black uppercase text-muted-foreground">Defensible return</p>
            <p className="mt-1 font-display text-xl font-black">17.3–19.6%</p>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">90 µm · 90 °C · 3 minutes</p>
          </div>
          <div className="rounded-2xl bg-muted/60 p-3">
            <p className="text-[10px] font-black uppercase text-muted-foreground">Owned</p>
            <p className="mt-1 font-display text-lg font-black">1-tonne press + 8-bag washer</p>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">Ounce-capable press upgrade remains considered, not purchased.</p>
          </div>
        </div>
        <p className="mt-3 flex items-start gap-2 rounded-2xl bg-amber-500/10 p-3 text-xs font-semibold leading-relaxed text-amber-900 dark:text-amber-100">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          The earlier approximately 2 g already in the Miron jar is excluded from the 5.01 g session return. Cultivars are not treated as proven washers until a cloned individual is harvested and test-washed.
        </p>
      </div>
    </div>
  </section>
);

export default CurrentLabStatus;
