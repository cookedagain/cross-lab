import { Bookmark, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SavedCross } from "@/lib/storage";

type Props = {
  saved: SavedCross[];
  onLoad: (cross: SavedCross) => void;
  onRemove: (key: string) => void;
};

const SavedCrosses = ({ saved, onLoad, onRemove }: Props) => {
  if (saved.length === 0) return null;

  return (
    <section className="mt-8 rounded-[2rem] border-2 border-border bg-card p-5 shadow-sm sm:p-7">
      <div className="mb-5 flex items-center gap-2">
        <Bookmark className="h-5 w-5 text-primary" />
        <h2 className="font-display text-2xl font-black">Saved crosses</h2>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">{saved.length}</span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {[...saved]
          .sort((a, b) => b.savedAt - a.savedAt)
          .map((cross) => (
            <div key={cross.key} className="rounded-2xl border border-border bg-background p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-display text-lg font-bold leading-tight">{cross.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {cross.parentAName} × {cross.parentBName}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-black text-primary">
                  {cross.score}/100
                </span>
              </div>

              {cross.goals.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {cross.goals.map((goal) => (
                    <span key={goal} className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                      {goal}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-3 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-full border-2 text-xs font-bold"
                  onClick={() => onLoad(cross)}
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  Load pairing
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-full border-2 text-destructive"
                  onClick={() => onRemove(cross.key)}
                  aria-label="Remove saved cross"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
      </div>
    </section>
  );
};

export default SavedCrosses;
