"use client";

// Grow station equipment specs. These now start empty and are managed per-user
// via the station store (localStorage). Each person adds their own kit.

export type StationSpec = {
  label: string;
  value: string;
};

export type GrowStation = {
  id: string;
  name: string;
  role: string;
  category: "<100W" | "220W" | "500W";
  controller: string;
  medium: string;
  mediumNote: string;
  specs: StationSpec[];
  storeUrl: string;
};

export const GROW_STATIONS: GrowStation[] = [];