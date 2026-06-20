import { GENERATION_LABELS, lineageTreeDepth, type LineageTreeNode } from "@/lib/lineageTree";

const NODE_TONES = [
  "border-primary/50 bg-primary/10",
  "border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40",
  "border-violet-300 bg-violet-50 dark:border-violet-900 dark:bg-violet-950/40",
  "border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40",
];

const DOT_TONES = ["bg-primary", "bg-emerald-500", "bg-violet-500", "bg-amber-500"];

const tone = (depth: number) => Math.min(depth, NODE_TONES.length - 1);

// Splits a label on the cross separator so each parent sits on its own line.
const splitLabel = (label: string) =>
  label
    .split("×")
    .map((part) => part.trim())
    .filter(Boolean);

const NodeLabel = ({ label }: { label: string }) => {
  const parts = splitLabel(label);

  if (parts.length <= 1) {
    return <span className="font-display text-sm font-bold leading-tight">{label}</span>;
  }

  return (
    <span className="flex flex-col gap-0.5">
      {parts.map((part, index) => (
        <span key={`${part}-${index}`} className="contents">
          <span className="font-display text-sm font-bold leading-tight">{part}</span>
          {index < parts.length - 1 && (
            <span className="font-display text-xs font-black leading-none text-muted-foreground">×</span>
          )}
        </span>
      ))}
    </span>
  );
};

const TreeNode = ({ node, depth }: { node: LineageTreeNode; depth: number }) => {
  const index = tone(depth);
  return (
    <li className="relative">
      <div className={`inline-flex max-w-full items-start gap-2 rounded-2xl border px-3 py-1.5 ${NODE_TONES[index]}`}>
        <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${DOT_TONES[index]}`} />
        <NodeLabel label={node.label} />
      </div>
      {node.children.length > 0 && (
        <ul className="mt-2 space-y-2 border-l-2 border-dashed border-border pl-4">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
};

const GeneticsTree = ({ root }: { root: LineageTreeNode }) => {
  const depth = lineageTreeDepth(root);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {GENERATION_LABELS.slice(0, depth + 1).map((label, index) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-muted-foreground"
          >
            <span className={`h-2 w-2 rounded-full ${DOT_TONES[tone(index)]}`} />
            {label}
          </span>
        ))}
      </div>

      <ul className="space-y-2">
        <TreeNode node={root} depth={0} />
      </ul>

      <p className="mt-4 text-[11px] font-semibold leading-relaxed text-muted-foreground">
        Built from the strain names in your vault. Deeper generations only appear when the lineage is
        written into the name (nested crosses or parentheses), so some branches stop early.
      </p>
    </div>
  );
};

export default GeneticsTree;