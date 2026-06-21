// Grow station equipment specs, built from the three kits actually in use.
// Specs reflect the published kit contents. The VGrow runs DWC; the 2×2 and 4×4
// run coco/soil in 5-gallon (~19L) grow buckets, hand-fed.

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

export const GROW_STATIONS: GrowStation[] = [
  {
    id: "vgrow",
    name: "Vivosun VGrow Smart Box (DWC)",
    role: "Solo / micro grow · self-contained smart box",
    category: "<100W",
    controller: "VIVOSUN GrowHub app + built-in smart controller",
    medium: "~11L DWC reservoir",
    mediumNote: "Single DWC bucket with airstone — top up daily, full change weekly.",
    specs: [
      { label: "Footprint", value: "Self-contained box (~40×40cm grow area)" },
      { label: "Light", value: "Built-in full-spectrum LED (~100W draw)" },
      { label: "Airflow", value: "Built-in inline fan + carbon filtration" },
      { label: "System", value: "Integrated DWC bucket with airstone" },
      { label: "Smart", value: "App scheduling for light, fan & timers" },
    ],
    storeUrl:
      "https://vivosun.com/en-AU/vivosun-complete-hydroponic-grow-bundle-vgrow-dwc-kit-p164724949286366400-v164724949286366404",
  },
  {
    id: "ac2x2",
    name: "AC Infinity Advanced 2×2 Kit (1 plant)",
    role: "Single-plant tent · veg or compact flower",
    category: "220W",
    controller: "AC Infinity Controller 69 Pro (UIS)",
    medium: "5 gallon (~19L) bucket · coco/soil",
    mediumNote: "One 5-gallon grow bucket, hand-fed. Coco runs daily feed; soil feeds as the pot dries.",
    specs: [
      { label: "Tent", value: "CLOUDLAB 422 — 60×60×120cm (2'×2'×4')" },
      { label: "Light", value: "IONBOARD S22, 100W full-spectrum LED" },
      { label: "Fan", value: "CLOUDLINE T4 — 4\" inline (PWM)" },
      { label: "Filter", value: "4\" carbon filter + ducting" },
      { label: "Controller", value: "Controller 69 Pro — temp/humidity automation" },
    ],
    storeUrl:
      "https://www.quickbloomlights.com.au/products/advanced-2x2-grow-kit-by-ac-infinity-1-plant-kit?variant=48836132897082",
  },
  {
    id: "ac4x4",
    name: "AC Infinity Advanced IonFrame 4×4 Kit (4 plant)",
    role: "Main flower tent · up to 4 plants",
    category: "500W",
    controller: "AC Infinity Controller 69 Pro+ (Wi-Fi/Bluetooth UIS)",
    medium: "4 × 5 gallon (~19L) buckets · coco/soil",
    mediumNote: "Up to four 5-gallon grow buckets, hand-fed. Coco runs daily feed; soil feeds as the pots dry.",
    specs: [
      { label: "Tent", value: "CLOUDLAB 644 — 120×120×200cm (4'×4'×6'7\")" },
      { label: "Light", value: "IonFrame EVO8, 730W full-spectrum LED" },
      { label: "Fan", value: "CLOUDLINE T6 — 6\" inline (PWM)" },
      { label: "Filter", value: "6\" carbon filter + ducting" },
      { label: "Controller", value: "Controller 69 Pro+ — Wi-Fi app automation" },
    ],
    storeUrl:
      "https://www.quickbloomlights.com.au/products/pre-order-only-advanced-ionframe-4x4-grow-kit-by-ac-infinity-4-plant-kit?variant=48651119690042",
  },
];