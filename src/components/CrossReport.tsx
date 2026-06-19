import { useMemo } from "react";
import { Copy, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  copyReportText,
  generateCrossNames,
  getCrossReport,
  groupNamesByCategory,
  type TraitGoal,
} from "@/lib/crossName";
import { estimateCrossExtraction } from "@/lib/extraction";
import { showSuccess } from "@/utils/toast";
import type { Seed } from "@/data/seeds";

type Props = {
  parentA: Seed | null;
  parentB: Seed | null;
  salt: number;
  selectedGoals: TraitGoal[];
};

const Stars = ({ value }: { value: number }) => (
  <span className="font-bold text-foreground">
    {"★".repeat(value)}
    {"☆".repeat(5 - value)}
  </span>
);

const CrossReport = ({ parentA, parentB, salt, selectedGoals }: Props) => {
  const report = useMemo(() => {
    if (!parentA || !parentB) return null;
    return getCrossReport(parentA, parentB, selectedGoals);
  }, [parentA, parentB, selectedGoals]);

  const names = useMemo(() => {
    if (!parentA || !parentB) return [];
    return generateCrossNames(parentA, parentB, salt, selectedGoals);
  }, [parentA, parentB, salt, selectedGoals]);

  const groupedNames = useMemo(() => groupNamesByCategory(names), [names]);

  const extraction = useMemo(() => {
    if (!parentA || !parentB) return null;
    return estimateCrossExtraction(parentA, parentB);
  }, [parentA, parentB]);

  if (!report || !parentA || !parentB || !extraction) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(copyReportText(parentA, parentB, report, names));
    showSuccess("Cross report copied to clipboard.");
  };

  const pressability: [string, number][] = [
    ["Flower rosin", extraction.rosin.flower],
    ["Dry sift rosin", extraction.rosin.drySift],
    ["Bubble hash rosin", extraction.rosin.bubbleHash],
    ["Live rosin", extraction.liveRosin],
    ["Resin", extraction.resin],
    ["Live resin", extraction.liveResin],
  ];

  const carts: [string, number][] = [
    ["Rosin cart", extraction.cart.rosin],
    ["Live rosin cart", extraction.cart.liveRosin],
    ["Resin cart", extraction.cart.resin],
    ["Live resin cart", extraction.cart.liveResin],
  ];

  return (
    <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[2rem] border-2 border-primary/20 bg-card p-5 shadow-sm sm:p-7">
        <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">Cross potential</p>
        <p className="font-display text-5xl font-black text-primary">{report.scores.overall}/100</p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{report.breederNote}</p>
        <div className="mt-5 space-y-3">
          {report.profile.terpenes.map((terpene) => (
            <div key={terpene.key}>
              <div className="mb-1 flex items-center justify-between text-xs font-bold">
                <span>{terpene.info.name}</span>
                <span>{terpene.share}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full" style={{ width: `${terpene.share}%`, backgroundColor: terpene.info.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[2rem] border-2 border-border bg-card p-5 shadow-sm sm:p-7">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-black">Name ideas</h2>
          </div>
          <Button type="button" variant="outline" size="sm" className="rounded-full border-2 font-bold" onClick={handleCopy}>
            <Copy className="mr-1.5 h-3.5 w-3.5" />
            Copy report
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {groupedNames.map((group) => (
            <div key={group.category} className="rounded-3xl bg-background p-4">
              <p className="mb-3 text-xs font-black uppercase tracking-wide text-muted-foreground">{group.category}</p>
              <div className="space-y-2">
                {group.names.map((item) => (
                  <div key={item.name} className="rounded-2xl border border-border bg-card p-3">
                    <p className="font-display text-lg font-bold leading-tight">{item.name}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.note}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[2rem] border-2 border-border bg-card p-5 shadow-sm sm:p-7 lg:col-span-2">
        <div className="mb-5">
          <p className="text-xs font-black uppercase tracking-wide text-primary">Full cross report</p>
          <h2 className="font-display text-2xl font-black tracking-tight">{parentA.name} × {parentB.name}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{report.profile.summary}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl bg-background p-4">
            <p className="mb-3 text-xs font-black uppercase tracking-wide text-muted-foreground">Score breakdown</p>
            <div className="space-y-2">
              {[
                ["Flavor synergy", report.scores.flavorSynergy],
                ["Terpene contrast", report.scores.terpeneContrast],
                ["Breeder interest", report.scores.breederInterest],
                ["Name potential", report.scores.namePotential],
                ["Goal match", report.scores.goalMatch],
              ].map(([label, score]) => (
                <div key={label as string}>
                  <div className="mb-1 flex justify-between text-xs font-bold">
                    <span>{label}</span>
                    <span>{score}/100</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-background p-4 lg:col-span-2">
            <p className="mb-3 text-xs font-black uppercase tracking-wide text-muted-foreground">Phenotype preview</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {report.phenotypes.map((pheno) => (
                <div key={pheno.title} className="rounded-2xl border border-border bg-card p-3">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black uppercase text-primary">{pheno.likelihood}</span>
                  <p className="mt-2 font-display text-base font-bold leading-tight">{pheno.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{pheno.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-background p-4 lg:col-span-3">
            <p className="mb-1 text-xs font-black uppercase tracking-wide text-muted-foreground">Extraction outlook (blended from both parents)</p>
            <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
              Estimated solventless and solvent direction for the offspring, plus how each output may run in a 510 cart.
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold sm:grid-cols-3 lg:grid-cols-6">
              {pressability.map(([label, value]) => (
                <div key={label} className="rounded-lg bg-card p-2">
                  <span className="block text-[9px] font-black uppercase text-muted-foreground">{label}</span>
                  <Stars value={value} />
                </div>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] font-semibold sm:grid-cols-4">
              {carts.map(([label, value]) => (
                <div key={label} className="rounded-lg bg-card p-2">
                  <span className="block text-[9px] font-black uppercase text-muted-foreground">{label}</span>
                  <Stars value={value} />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-background p-4 lg:col-span-3">
            <p className="mb-3 text-xs font-black uppercase tracking-wide text-muted-foreground">Cross size / dry-yield estimates</p>
            <div className="grid gap-3 md:grid-cols-3">
              {report.growthEstimates.map((estimate) => {
                const gear = estimate.wattage === "<100W" ? "Vivosun VGrow smart box" : estimate.wattage === "220W" ? "AC Infinity 2×2" : "AC Infinity 4×4";
                return (
                  <div key={estimate.wattage} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wide text-primary">{estimate.wattage}</p>
                        <p className="text-xs font-bold text-muted-foreground">{gear}</p>
                      </div>
                      <p className="font-display text-xl font-black">{estimate.yieldG.min}–{estimate.yieldG.max}g</p>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold text-muted-foreground">
                      <span>H: {estimate.heightCm.min}–{estimate.heightCm.max}cm</span>
                      <span>W: {estimate.widthCm.min}–{estimate.widthCm.max}cm</span>
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{estimate.note}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl bg-background p-4 lg:col-span-2">
            <p className="mb-3 text-xs font-black uppercase tracking-wide text-muted-foreground">Genetic notes</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {report.geneticNotes.map((note) => (
                <div key={note.label} className="rounded-2xl border border-border bg-card p-3">
                  <p className="font-bold">{note.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{note.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-background p-4">
            <p className="mb-3 text-xs font-black uppercase tracking-wide text-muted-foreground">Lineage map</p>
            <div className="space-y-3">
              {report.lineage.map((node) => (
                <div key={node.parent} className="rounded-2xl border border-border bg-card p-3">
                  <p className="text-[10px] font-black uppercase text-primary">Parent {node.parent}</p>
                  <p className="mt-1 font-display text-base font-bold leading-tight">{node.name}</p>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">{node.breeder}</p>
                  {node.pieces.length > 0 && (
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{node.pieces.join(" × ")}</p>
                  )}
                  {node.flags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {node.flags.map((flag) => (
                        <span key={flag} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-black text-muted-foreground">{flag}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CrossReport;