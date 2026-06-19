import type { SeedType } from "@/data/seeds";

export const typeShort: Record<SeedType, string> = {
  Feminized: "FEM",
  Regular: "REG",
  Autoflower: "AUTO",
  "Unknown Photo": "PHOTO ?",
};

export const typeStyles: Record<SeedType, string> = {
  Feminized: "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-950/50 dark:text-pink-200 dark:border-pink-900",
  Regular: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-200 dark:border-blue-900",
  Autoflower: "bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-950/50 dark:text-lime-200 dark:border-lime-900",
  "Unknown Photo": "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-700",
};

export const SEED_TYPES: SeedType[] = ["Feminized", "Regular", "Autoflower", "Unknown Photo"];