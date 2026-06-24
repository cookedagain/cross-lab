"use client";

export type CycoKey =
  | "growA"
  | "growB"
  | "bloomA"
  | "bloomB"
  | "silica"
  | "ryzofuel"
  | "b1boost"
  | "zyme"
  | "xl"
  | "swell"
  | "potashPlus"
  | "kleanse"
  | "drRepair"
  | "uptake"
  | "phUp"
  | "phDown"
  | "greatWhite";

export const CYCO_PRODUCTS: Record<CycoKey, { name: string; color: string }> = {
  growA: { name: "Cyco Platinum Grow A", color: "#16a34a" },
  growB: { name: "Cyco Platinum Grow B", color: "#22c55e" },
  bloomA: { name: "Cyco Platinum Bloom A", color: "#db2777" },
  bloomB: { name: "Cyco Platinum Bloom B", color: "#ec4899" },
  silica: { name: "Cyco Platinum Silica", color: "#0ea5e9" },
  ryzofuel: { name: "Cyco Ryzofuel", color: "#f59e0b" },
  b1boost: { name: "Cyco B1 Boost", color: "#8b5cf6" },
  zyme: { name: "Cyco Zyme", color: "#06b6d4" },
  xl: { name: "Cyco XL", color: "#f97316" },
  swell: { name: "Cyco Swell", color: "#fb7185" },
  potashPlus: { name: "Cyco Potash Plus", color: "#7c3aed" },
  kleanse: { name: "Cyco Kleanse", color: "#14b8a6" },
  drRepair: { name: "Cyco Dr Repair", color: "#3b82f6" },
  uptake: { name: "Cyco Uptake", color: "#6366f1" },
  phUp: { name: "pH Up", color: "#facc15" },
  phDown: { name: "pH Down", color: "#ef4444" },
  greatWhite: { name: "Great White Mycorrhizae", color: "#a855f7" },
};

export const CYCO_SCHEDULE = [
  {
    name: "Seedling",
    rates: {
      growA: 0.25,
      growB: 0.25,
      silica: 0.25,
      zyme: 0.25,
      greatWhite: 0.1,
    },
  },
  {
    name: "Veg 1",
    rates: {
      growA: 0.5,
      growB: 0.5,
      silica: 0.5,
      zyme: 0.5,
      b1boost: 0.25,
      greatWhite: 0.1,
    },
  },
  {
    name: "Veg 2",
    rates: {
      growA: 0.75,
      growB: 0.75,
      silica: 0.5,
      zyme: 0.5,
      b1boost: 0.25,
      greatWhite: 0.1,
    },
  },
  {
    name: "Veg 3",
    rates: {
      growA: 1,
      growB: 1,
      silica: 0.5,
      zyme: 0.5,
      b1boost: 0.5,
      greatWhite: 0.1,
    },
  },
  {
    name: "Transition",
    rates: {
      bloomA: 0.5,
      bloomB: 0.5,
      silica: 0.5,
      zyme: 0.5,
      b1boost: 0.25,
      greatWhite: 0.05,
    },
  },
  {
    name: "Flower 1",
    rates: {
      bloomA: 1,
      bloomB: 1,
      silica: 0.5,
      zyme: 0.5,
      xl: 0.25,
      greatWhite: 0.05,
    },
  },
  {
    name: "Flower 2",
    rates: {
      bloomA: 1,
      bloomB: 1,
      silica: 0.5,
      zyme: 0.5,
      xl: 0.25,
      swell: 0.25,
      greatWhite: 0.05,
    },
  },
  {
    name: "Flower 3",
    rates: {
      bloomA: 1,
      bloomB: 1,
      silica: 0.5,
      zyme: 0.5,
      xl: 0.5,
      swell: 0.25,
      potashPlus: 0.25,
      greatWhite: 0.05,
    },
  },
  {
    name: "Flower 4",
    rates: {
      bloomA: 1,
      bloomB: 1,
      silica: 0.5,
      zyme: 0.5,
      xl: 0.5,
      swell: 0.5,
      potashPlus: 0.25,
    },
  },
  {
    name: "Flower 5",
    rates: {
      bloomA: 1,
      bloomB: 1,
      silica: 0.25,
      zyme: 0.5,
      xl: 0.5,
      swell: 0.5,
      potashPlus: 0.5,
    },
  },
  {
    name: "Flush",
    rates: {
      kleanse: 1,
      drRepair: 0.25,
      uptake: 0.25,
      phUp: 0.1,
      phDown: 0.1,
    },
  },
];