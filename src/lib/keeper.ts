import type { Seed } from "@/data/seeds";

export type KeeperPriority = {
  score: number;
  level: "High" | "Medium" | "Low" | "Utility";
  tone: string;
  reasons: string[];
  seedPlan: string;
  pollenPlan: string;
};

const SOUGHT_AFTER_CUES = [
  { match: /end game|grandpa|lilac diesel|crescend/i, label: "Ethos cornerstone / hyped line" },
  { match: /temple|quattro|josh d|og kush|tk/i, label: "OG / kush breeding value" },
  { match: /cookies|gelato|permanent marker|cap junkie/i, label: "modern dessert / hype lineage" },
  { match: /diesel|chem91|gmo|nycd/i, label: "gas / Chem-Diesel value" },
  { match: /deep chunk|hash plant|afghan/i, label: "hashplant / old-school preservation value" },
  { match: /abc|mutant|quack|feral|croco/i, label: "rare mutant/ABC trait" },
  { match: /brothers grimm|cinderella|blueberry|tangie/i, label: "classic keeper-hunt value" },
];

export const getKeeperPriority = (seed: Seed): KeeperPriority => {
  const count = seed.count ?? 0;
  const reasons: string[] = [];
  let score = 0;

  if (seed.breeder === "Burn Pile") {
    return {
      score: 0,
      level: "Utility",
      tone: "bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-200 dark:border-orange-900",
      reasons: ["one-and-only run", "white-label / potentially mislabelled", "not breeding stock"],
      seedPlan: "Do not keep seed from Burn Pile plants. Run once for testing/smoke only, then close it out.",
      pollenPlan: "Do not save pollen from Burn Pile plants; the label confidence is too low to justify breeding work.",
    };
  }

  if (count <= 2) {
    score += 42;
    reasons.push("very low stock");
  } else if (count <= 3) {
    score += 34;
    reasons.push("low stock");
  } else if (count <= 6) {
    score += 18;
    reasons.push("limited stock");
  }

  for (const cue of SOUGHT_AFTER_CUES) {
    if (cue.match.test(`${seed.name} ${seed.breeder}`)) {
      score += 14;
      reasons.push(cue.label);
    }
  }

  if (seed.type === "Regular") {
    score += 10;
    reasons.push("can produce true male/female selections");
  }
  if (seed.type === "Autoflower") score += 4;
  if (/s1|bx|rbx|f\d/i.test(seed.name)) {
    score += 6;
    reasons.push("worked filial/backcross marker");
  }

  const level = score >= 42 ? "High" : score >= 24 ? "Medium" : "Low";
  const tone =
    level === "High"
      ? "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-900"
      : level === "Medium"
        ? "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900"
        : "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-900";

  const seedPlan =
    level === "High"
      ? "Keep seed from standout females before spending the line in heavy outcrossing; this is preservation-worthy if a keeper appears."
      : level === "Medium"
        ? "Worth making a small backup seed lot if the plant proves special, but do not force it if the expression is average."
        : "Use normally; keep seed only from clear winners or crosses that fit a project goal.";

  const pollenPlan =
    seed.type === "Regular"
      ? level === "High"
        ? "If a male is exceptional, save pollen as a priority donor and test it lightly before using it broadly."
        : "Save pollen only from males that beat your structure, vigor, aroma-stem, and lineage standard."
      : seed.type === "Feminized"
        ? "Female-derived pollen is an advanced preservation/combining choice; reserve it for elite keepers rather than routine crosses."
        : seed.type === "Autoflower"
          ? "Auto pollen is worth keeping only when the auto trait and plant quality are both central to the project."
          : "Wait until sex and quality are known before deciding whether pollen is worth keeping.";

  return { score, level, tone, reasons: reasons.slice(0, 3), seedPlan, pollenPlan };
};