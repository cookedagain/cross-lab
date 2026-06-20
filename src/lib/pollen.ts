import type { PollenStorage } from "@/hooks/useVaultStore";

// Rough viability windows (in days) for cannabis pollen by storage method.
export const POLLEN_WINDOWS: Record<PollenStorage, number> = {
  room: 21,
  fridge: 90,
  freezer: 365,
};

export const POLLEN_STORAGE_LABEL: Record<PollenStorage, string> = {
  room: "Room temp",
  fridge: "Fridge",
  freezer: "Freezer",
};

export type PollenStatus = {
  daysElapsed: number;
  totalDays: number;
  daysRemaining: number;
  percentRemaining: number;
  level: "Fresh" | "Aging" | "Expiring" | "Expired";
  tone: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export const getPollenStatus = (collected: string, storage: PollenStorage): PollenStatus => {
  const totalDays = POLLEN_WINDOWS[storage];
  const start = new Date(collected).getTime();
  const daysElapsed = Math.max(0, Math.floor((Date.now() - start) / DAY_MS));
  const daysRemaining = totalDays - daysElapsed;
  const percentRemaining = Math.max(0, Math.min(100, Math.round((daysRemaining / totalDays) * 100)));

  let level: PollenStatus["level"];
  if (daysRemaining <= 0) level = "Expired";
  else if (percentRemaining <= 20) level = "Expiring";
  else if (percentRemaining <= 55) level = "Aging";
  else level = "Fresh";

  const tone =
    level === "Fresh"
      ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-900"
      : level === "Aging"
        ? "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900"
        : level === "Expiring"
          ? "bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-200 dark:border-orange-900"
          : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-900";

  return { daysElapsed, totalDays, daysRemaining, percentRemaining, level, tone };
};