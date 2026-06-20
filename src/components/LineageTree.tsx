import { useMemo } from "react";
import { Network } from "lucide-react";
import { useVault } from "@/hooks/useVaultStore";

type TreeNode = {
  id: string;
  child: string;
  parentA: string;
  parentB: string;
  source: "Seed lot" | "Multipass";
  detail: string;
};

const splitParents = (parents: string): [string, string] => {
  const [a, b] = parents.split(/×|x/i).map((part) => part.trim());
  return [a || "Unknown", b || "Unknown"];
};

const LineageTree = () => {
  const { lots, multipass } = useVault();

  const nodes = useMemo<TreeNode[]>(() => {
    const fromLots: TreeNode[] = lots
      .filter((lot) => lot.kind === "seed" && lot.parents.trim())
      .map((lot) => {
        const [parentA, parentB] = splitParents(lot.parents);
        return {
          id: lot.id,
          child: lot.name,
          parentA,
          parentB,
          source: "Seed lot",
          detail: `${lot.quantity} seeds · ${lot.date}`,
        };
      });

    const fromMultipass: TreeNode[] = multipass
      .filter((entry) => entry.parentA.trim() || entry.parentB.trim())
      .map((entry) => ({
        id: entry.id,
        child: entry.name,
        parentA: entry.parentA.trim() || "Unknown",
        parentB: entry.parentB.trim() || "Unknown",
        source: "Multipass",
        detail: entry.arrived ? "in vault" : "incoming",
      }));

    return [...fromLots, ...fromMultipass];
  }, [lots, multipass]);

  return (
    <section className="mt-8 rounded-[2rem] border-2 border-border bg-card p-5 shadow-sm sm:p-7">
      <div className="mb-5 flex items-center gap-2">
        <Network className="h-5 w-5 text-primary" />
        <h2 className="font-display text-2xl font-black">Lineage family tree</h2>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        A visual map of the crosses in your program, built from your seed lots and Multipass packs. Each child traces
        back to its two parents.
      </p>

      {nodes.length > 0 ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {nodes.map((node) => (
            <div key={node.id} className="rounded-3xl border border-border bg-background p-4">
              <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
                <div className="flex flex-col gap-2">
                  <div className="rounded-2xl bg-blue-50 p-3 text-blue-900 dark:bg-blue-950/40 dark:text-blue-100">
                    <p className="text-[9px] font-black uppercase tracking-wide opacity-70">Parent A</p>
                    <p className="text-sm font-bold leading-tight">{node.parentA}</p>
                  </div>
                  <div className="rounded-2xl bg-pink-50 p-3 text-pink-900 dark:bg-pink-950/40 dark:text-pink-100">
                    <p className="text-[9px] font-black uppercase tracking-wide opacity-70">Parent B</p>
                    <p className="text-sm font-bold leading-tight">{node.parentB}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="font-display text-lg font-black text-muted-foreground">→</span>
                </div>
                <div className="flex items-center">
                  <div className="w-full rounded-2xl border-2 border-primary/30 bg-primary/10 p-3">
                    <p className="text-[9px] font-black uppercase tracking-wide text-primary">{node.source}</p>
                    <p className="font-display text-base font-black leading-tight">{node.child}</p>
                    <p className="mt-1 text-[11px] font-semibold text-muted-foreground">{node.detail}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl bg-muted/50 p-4 text-sm text-muted-foreground">
          No crosses to map yet. Add seed lots (with parents) or Multipass packs with cross parents and your family tree
          will build itself.
        </p>
      )}
    </section>
  );
};

export default LineageTree;