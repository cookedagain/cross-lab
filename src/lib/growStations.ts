"use client";

export type StationSpec = {
  label: string;
  value: string;
};

export type GrowStation = {
  id: string;
  name: string;
  role: string;
  status: "Owned" | "Purchased · install status to confirm";
  category: "<100W" | "280W" | "500W";
  powerLabel: string;
  controller: string;
  medium: string;
  mediumNote: string;
  specs: StationSpec[];
  storeUrl?: string;
};

export const GROW_STATION_YIELD_MULTIPLIER: Record<GrowStation["category"], number> = {
  "<100W": 1,
  "280W": 1.75,
  "500W": 3.15,
};

export const scaleYieldForStation = (
  yieldG: { min: number; max: number },
  category: GrowStation["category"],
) => {
  const multiplier = GROW_STATION_YIELD_MULTIPLIER[category];
  return {
    min: Math.round(yieldG.min * multiplier),
    max: Math.round(yieldG.max * multiplier),
  };
};

export const GROW_STATIONS: GrowStation[] = [
  {
    id: "vgrow",
    name: "VIVOSUN vGrow Smart Box",
    role: "Single-plant experiment, mother/clone source, or controlled DWC run",
    status: "Owned",
    category: "<100W",
    powerLabel: "100W",
    controller: "Built-in VIVOSUN GrowHub smart controller",
    medium: "15 L DWC reservoir",
    mediumNote: "Historical DWC use; aggressive roots and restricted circulation are known risks.",
    specs: [
      { label: "Format", value: "Self-contained single-plant smart box" },
      { label: "Light", value: "Built-in full-spectrum LED · approximately 100 W" },
      { label: "Airflow", value: "Built-in fan and carbon filtration" },
      { label: "Best use", value: "Mother, clone source, or controlled single-plant trial" },
    ],
    storeUrl: "https://vivosun.com/en-AU/",
  },
  {
    id: "ac2x4",
    name: "AC Infinity Advanced 2×4 Kit",
    role: "Breeding, reproduction, quarantine, or two-plant work",
    status: "Purchased · install status to confirm",
    category: "280W",
    powerLabel: "280W",
    controller: "AC Infinity control ecosystem; two Controller AI+ units are owned across the lab",
    medium: "Run-specific",
    mediumNote: "Do not treat this tent as operational until installation is confirmed.",
    specs: [
      { label: "Tent", value: "2 × 4 ft AC Infinity Advanced kit" },
      { label: "Light", value: "IONFRAME EVO3 · approximately 280 W" },
      { label: "Intended canopy", value: "Two plants or a controlled regular population" },
      { label: "Preferred role", value: "Breeding / reproduction / quarantine" },
    ],
  },
  {
    id: "ac4x4",
    name: "AC Infinity 4×4 Primary Tent",
    role: "Principal flower, production, and solventless-selection space",
    status: "Owned",
    category: "500W",
    powerLabel: "500W",
    controller: "AC Infinity Controller AI+ with Cloudline T6 extraction and carbon filtration",
    medium: "Living soil · working concept",
    mediumNote: "Four approximately 50 L fabric pots with Easy As Organics; exact irrigation and amendment cycle remain open.",
    specs: [
      { label: "Tent", value: "Approximately 1,200 × 1,200 × 1,800 mm (4 × 4 × 6 ft)" },
      { label: "Light", value: "IONFRAME EVO6 · approximately 500 W" },
      { label: "Airflow", value: "Cloudline T6, carbon filter, oscillating fans, and trellis" },
      { label: "Benchmark", value: "Four full-canopy plants" },
      { label: "Next calibration", value: "ETHOS Martian Fuel GEN1 · not started" },
    ],
  },
];
