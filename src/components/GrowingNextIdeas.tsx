import { BarChart3, BellRing, ClipboardList, Droplets, FlaskConical, Network, PackageCheck, ShieldCheck } from "lucide-react";
import CollapsibleSection from "@/components/CollapsibleSection";

const IDEAS = [
  {
    title: "Pop Seed → Active Run",
    icon: <PackageCheck className="h-4 w-4" />,
    value: "Highest value",
    note: "Turn a seed-picker result into a live grow: deduct 1 seed, assign it to vGrow/2×4/4×4, and start a run timeline automatically.",
  },
  {
    title: "Daily pH / EC Feed Log",
    icon: <Droplets className="h-4 w-4" />,
    value: "Best grow-control upgrade",
    note: "Log pH, EC/PPM, reservoir temp, runoff, and feed mix per station with trend graphs and warning bands.",
  },
  {
    title: "Harvest ROI Tracker",
    icon: <BarChart3 className="h-4 w-4" />,
    value: "Best numbers upgrade",
    note: "After harvest, compare dry grams against electricity, nutrient, medium, and seed costs to calculate cost-per-gram.",
  },
  {
    title: "Clone Family Tree",
    icon: <Network className="h-4 w-4" />,
    value: "Best breeding upgrade",
    note: "Connect mothers, cuts, generations, rooting success, keeper notes, and which clones came from which plant.",
  },
  {
    title: "Selection Scorecards",
    icon: <ClipboardList className="h-4 w-4" />,
    value: "Best pheno-hunt upgrade",
    note: "Score plants for vigor, structure, nose, frost, stress response, yield, smoke, and keeper potential at each stage.",
  },
  {
    title: "Seed Preservation Plan",
    icon: <ShieldCheck className="h-4 w-4" />,
    value: "Best vault-protection upgrade",
    note: "Automatically flag low-count, rare, and high-priority lines and suggest which packs should be preserved before being spent.",
  },
  {
    title: "Reversal / Pollen Planner",
    icon: <FlaskConical className="h-4 w-4" />,
    value: "Best advanced breeding upgrade",
    note: "Track selected donor, receiver, pollen collection windows, pollen storage, test-lot size, and cross goals.",
  },
  {
    title: "Smart Reminders",
    icon: <BellRing className="h-4 w-4" />,
    value: "Best quality-of-life upgrade",
    note: "Reminders for feed changes, training checks, flower transition, harvest window, drying checks, and cure burps.",
  },
];

const GrowingNextIdeas = () => {
  return (
    <CollapsibleSection
      title="What to Add Next"
      icon={<ClipboardList className="h-5 w-5" />}
      description="Recommended upgrades that would connect the picker, grow simulator, breeding lab, and logs into one complete workflow."
      defaultOpen={false}
    >
      <div className="grid gap-3 md:grid-cols-2">
        {IDEAS.map((idea) => (
          <div key={idea.title} className="rounded-3xl border border-border bg-background p-4">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-primary">
                {idea.icon}
                <p className="font-display text-lg font-black leading-tight text-foreground">{idea.title}</p>
              </div>
              <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-primary">
                {idea.value}
              </span>
            </div>
            <p className="text-sm font-semibold leading-relaxed text-muted-foreground">{idea.note}</p>
          </div>
        ))}
      </div>
    </CollapsibleSection>
  );
};

export default GrowingNextIdeas;
