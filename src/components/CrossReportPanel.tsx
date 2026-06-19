import { BookmarkCheck, BookmarkPlus, ClipboardCopy, GitBranch, Ruler, Sprout, TestTube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { copyReportText, type CrossName, type CrossReport } from "@/lib/crossName";
import { showSuccess } from "@/utils/toast";
import type { Seed } from "@/data/seeds";

type Props = {
  parentA: Seed;
  parentB: Seed;
  report: CrossReport;
  names: CrossName[];
  isSaved: boolean;
  onSave: () => void;
  onRemove: () => void;
};

const CrossReportPanel = ({ parentA, parentB, report, names, isSaved, onSave, onRemove }: Props) => {
  const copyReport = async () => {
    await navigator.clipboard.writeText(copyReportText(parentA, parentB, report, names));
    showSuccess("Cross report copied to clipboard");
  };

  return (
    <section className="mt-8 rounded-[2rem] border-2 border-border bg-card p-5 shadow-sm sm:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TestTube className="h-5 w-5 text-primary" />
          <h2 className="font-display text-2xl font-black">Full cross report</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-full border-2 text-sm font-bold" onClick={copyReport}>
            <ClipboardCopy className="mr-2 h-4 w-4" />
            Copy report
          </Button>
          {isSaved ? (
            <Button variant="outline" className="rounded-full border-2 text-sm font-bold" onClick={onRemove}>
              <BookmarkCheck className="mr-2 h-4 w-4 text-primary" />
              Saved
            </Button>
          ) : (
            <Button className="rounded-full text-sm font-bold" onClick={onSave}>
              <BookmarkPlus className="mr-2 h-4 w-4" />
              Save cross
            </Button>
          )}
        </div>
      </div>

      {/* Phenotype previews */}
      <div className="mb-5">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-muted-foreground">
          <Sprout className="h-3.5 w-3.5" /> Phenotype previews
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          {report.phenotypes.map((pheno) => (
            <div key={pheno.title} className="rounded-2xl border border-border bg-background p-4">
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="font-display text-base font-bold leading-tight">{pheno.title}</p>
                <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">
                  {pheno.likelihood}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">{pheno.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Growth estimates (cross-level) */}
      <div className="mb-5">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-muted-foreground">
          <Ruler className="h-3.5 w-3.5" /> Offspring size &amp; yield estimate
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {report.growthEstimates.map((env) => (
            <div key={env.wattage} className="rounded-2xl border border-border bg-background p-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wide text-primary">{env.wattage}</span>
                <span className="font-display text-base font-black">{env.yieldG.min}–{env.yieldG.max}g</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {env.heightCm.min}–{env.heightCm.max}cm H · {env.widthCm.min}–{env.widthCm.max}cm W
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{env.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Genetic notes */}
      <div className="mb-5">
        <p className="mb-2 text-xs font-black uppercase tracking-wide text-muted-foreground">Genetic notes</p>
        <div className="space-y-2">
          {report.geneticNotes.map((note) => (
            <div key={note.label} className="rounded-2xl border border-border bg-background p-3">
              <p className="text-sm font-bold">{note.label}</p>
              <p className="text-xs leading-relaxed text-muted-foreground">{note.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Lineage */}
      <div>
        <p className="mb-2 flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-muted-foreground">
          <GitBranch className="h-3.5 w-3.5" /> Lineage breakdown
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {report.lineage.map((node) => (
            <div key={node.parent} className="rounded-2xl border border-border bg-background p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="font-display text-base font-bold leading-tight">
                  <span className="mr-1.5 rounded-full bg-primary px-2 py-0.5 text-xs font-black text-primary-foreground">
                    {node.parent}
                  </span>
                  {node.name}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">{node.breeder}</p>
              {node.pieces.length > 1 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {node.pieces.map((piece) => (
                    <span key={piece} className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                      {piece}
                    </span>
                  ))}
                </div>
              )}
              {node.flags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {node.flags.map((flag) => (
                    <span key={flag} className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">
                      {flag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CrossReportPanel;
