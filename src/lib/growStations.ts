// Grow station equipment specs, built from the three kits actually in use.
// Specs reflect the published kit contents; reservoir volumes are DWC working
// estimates you can adjust against your own buckets.

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
  reservoirL: number;
  reservoirNote: string;
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
    reservoirL: 11,
    reservoirNote: "Single DWC bucket — top up daily, full change weekly.",
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
    reservoirL: 15,
    reservoirNote: "Single DWC bucket sized to the 2×2 footprint.",
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
    reservoirL: 30,
    reservoirNote: "Scale per plant if running separate DWC buckets.",
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
</dyad-file>

Now the clone-register store with mothers and 24 rooting slots:

<dyad-write path="src/hooks/useCloneRegister.tsx" description="Clone register store: mothers and a fixed 24-slot rooting grid.">
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { showSuccess } from "@/utils/toast";

const MOTHERS_KEY = "crosslab-clone-mothers";
const SLOTS_KEY = "crosslab-clone-slots";
export const CLONE_SLOT_COUNT = 24;

export const CLONE_STATUSES = ["Empty", "Cutting", "Rooting", "Rooted", "Potted"] as const;
export type CloneStatus = (typeof CLONE_STATUSES)[number];

export type Mother = {
  id: string;
  name: string;
  source: string;
  dateAdded: string;
  notes: string;
};

export type CloneSlot = {
  index: number;
  motherName: string;
  dateTaken: string;
  status: CloneStatus;
};

export const STATUS_TONE: Record<CloneStatus, string> = {
  Empty: "bg-muted text-muted-foreground border-border",
  Cutting: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-200 dark:border-sky-900",
  Rooting: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900",
  Rooted: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-900",
  Potted: "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/40 dark:text-violet-200 dark:border-violet-900",
};

const emptySlots = (): CloneSlot[] =>
  Array.from({ length: CLONE_SLOT_COUNT }, (_, index) => ({
    index,
    motherName: "",
    dateTaken: "",
    status: "Empty" as CloneStatus,
  }));

const loadJSON = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return fallback;
    const parsed = JSON.parse(stored);
    return parsed as T;
  } catch {
    return fallback;
  }
};

type CloneRegisterValue = {
  mothers: Mother[];
  slots: CloneSlot[];
  addMother: (data: Omit<Mother, "id" | "dateAdded">) => void;
  removeMother: (id: string) => void;
  updateSlot: (index: number, data: Partial<Omit<CloneSlot, "index">>) => void;
  clearSlot: (index: number) => void;
};

const CloneRegisterContext = createContext<CloneRegisterValue | null>(null);

export const CloneRegisterProvider = ({ children }: { children: ReactNode }) => {
  const [mothers, setMothers] = useState<Mother[]>(() => loadJSON<Mother[]>(MOTHERS_KEY, []));
  const [slots, setSlots] = useState<CloneSlot[]>(() => {
    const stored = loadJSON<CloneSlot[]>(SLOTS_KEY, []);
    if (!Array.isArray(stored) || stored.length !== CLONE_SLOT_COUNT) return emptySlots();
    return stored;
  });

  useEffect(() => {
    window.localStorage.setItem(MOTHERS_KEY, JSON.stringify(mothers));
  }, [mothers]);

  useEffect(() => {
    window.localStorage.setItem(SLOTS_KEY, JSON.stringify(slots));
  }, [slots]);

  const addMother = (data: Omit<Mother, "id" | "dateAdded">) => {
    setMothers((current) => [
      {
        ...data,
        id: `mother-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        dateAdded: new Date().toISOString().slice(0, 10),
      },
      ...current,
    ]);
    showSuccess("Mother added to the register.");
  };

  const removeMother = (id: string) =>
    setMothers((current) => current.filter((mother) => mother.id !== id));

  const updateSlot = (index: number, data: Partial<Omit<CloneSlot, "index">>) =>
    setSlots((current) =>
      current.map((slot) => (slot.index === index ? { ...slot, ...data } : slot)),
    );

  const clearSlot = (index: number) =>
    setSlots((current) =>
      current.map((slot) =>
        slot.index === index ? { index, motherName: "", dateTaken: "", status: "Empty" } : slot,
      ),
    );

  return (
    <CloneRegisterContext.Provider
      value={{ mothers, slots, addMother, removeMother, updateSlot, clearSlot }}
    >
      {children}
    </CloneRegisterContext.Provider>
  );
};

export const useCloneRegister = () => {
  const ctx = useContext(CloneRegisterContext);
  if (!ctx) throw new Error("useCloneRegister must be used within a CloneRegisterProvider");
  return ctx;
};