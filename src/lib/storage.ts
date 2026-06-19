import type { TraitGoal } from "@/lib/crossName";

export type PhenoStatus = "untested" | "growing" | "keeper" | "cull";

export const PHENO_STATUSES: { value: PhenoStatus; label: string; tone: string }[] = [
  { value: "untested", label: "Untested", tone: "bg-slate-100 text-slate-700 border-slate-200" },
  { value: "growing", label: "Growing", tone: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "keeper", label: "Keeper", tone: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { value: "cull", label: "Cull", tone: "bg-red-100 text-red-800 border-red-200" },
];

export type JournalEntry = {
  status: PhenoStatus;
  notes: string;
  updatedAt: number;
};

export type SavedCross = {
  key: string;
  parentAId: string;
  parentBId: string;
  parentAName: string;
  parentBName: string;
  name: string;
  score: number;
  goals: TraitGoal[];
  savedAt: number;
};

export const STORAGE_KEYS = {
  inventory: "crosslab.inventory",
  journal: "crosslab.journal",
  savedCrosses: "crosslab.savedCrosses",
} as const;
