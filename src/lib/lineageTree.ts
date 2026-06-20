// Builds a generational genetics tree from strain names. Deeper ancestry only
// appears when it's written into the name (nested crosses or parentheses),
// e.g. "Fruit Funk (GMO × Guava Biscotti)" or "A × B × C".

export type LineageTreeNode = {
  id: string;
  label: string;
  children: LineageTreeNode[];
};

export const GENERATION_LABELS = [
  "Planned cross",
  "Parents",
  "Grandparents",
  "Great-grandparents",
];

// Parents (1) → grandparents (2) → great-grandparents (3)
const MAX_DEPTH = 3;

const cleanName = (name: string): string =>
  name.replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();

// Splits a name on the cross separator (× or a space-padded "x") while
// respecting parentheses so nested lineage isn't split incorrectly.
function splitCrosses(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let buffer = "";

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "(") {
      depth += 1;
      buffer += ch;
      continue;
    }
    if (ch === ")") {
      depth = Math.max(0, depth - 1);
      buffer += ch;
      continue;
    }

    const isMultSign = ch === "×";
    const isLetterX = (ch === "x" || ch === "X") && text[i - 1] === " " && text[i + 1] === " ";

    if (depth === 0 && (isMultSign || isLetterX)) {
      parts.push(buffer);
      buffer = "";
      continue;
    }

    buffer += ch;
  }

  parts.push(buffer);
  return parts.map((part) => part.trim()).filter(Boolean);
}

// Returns the parent names for a strain, or [] when the name is a leaf.
function extractParents(name: string): string[] {
  const text = name.trim();

  // Trailing parenthetical lineage: "Name (X × Y)"
  const paren = text.match(/\(([^()]*)\)\s*$/);
  if (paren) {
    const innerParts = splitCrosses(paren[1]);
    if (innerParts.length > 1) return innerParts;
  }

  // Otherwise split the (parenthetical-stripped) name on the cross separator.
  const stripped = text.replace(/\([^)]*\)/g, " ");
  const parts = splitCrosses(stripped);
  if (parts.length > 1) return parts;

  return [];
}

function parseStrain(name: string, depth: number, id: string): LineageTreeNode {
  const label = cleanName(name) || name.trim();
  if (depth >= MAX_DEPTH) {
    return { id, label, children: [] };
  }

  const parents = extractParents(name);
  return {
    id,
    label,
    children: parents.map((parent, index) => parseStrain(parent, depth + 1, `${id}-${index}`)),
  };
}

// Root = the planned cross; its two children are the selected parents, which
// then branch into grandparents and great-grandparents where available.
export function buildCrossLineageTree(nameA: string, nameB: string): LineageTreeNode {
  return {
    id: "cross",
    label: `${cleanName(nameA)} × ${cleanName(nameB)}`,
    children: [parseStrain(nameA, 1, "a"), parseStrain(nameB, 1, "b")],
  };
}

// Single-strain tree: the strain itself is the root, branching into its ancestry.
export function buildStrainLineageTree(name: string): LineageTreeNode {
  return parseStrain(name, 0, "root");
}

export function lineageTreeDepth(node: LineageTreeNode): number {
  if (node.children.length === 0) return 0;
  return 1 + Math.max(...node.children.map(lineageTreeDepth));
}