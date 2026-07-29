import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { cloneSlotSchema, motherSchema } from "@/lib/validation";
import { readSecure, SECURE_STORAGE_EVENT, writeSecure } from "@/lib/secureStorage";
import { showSuccess } from "@/utils/toast";

const MOTHERS_KEY = "crosslab-clone-mothers";
const SLOTS_KEY = "crosslab-clone-slots";
export const CLONE_SLOT_COUNT = 24;

export const CLONE_STATUSES = ["Empty", "Cutting", "Rooting", "Rooted", "Potted"] as const;
export type CloneStatus = (typeof CLONE_STATUSES)[number];

export type Mother = { id: string; name: string; source: string; dateAdded: string; notes: string };
export type CloneSlot = { index: number; motherName: string; dateTaken: string; status: CloneStatus };

export const STATUS_TONE: Record<CloneStatus, string> = {
  Empty: "bg-muted text-muted-foreground border-border",
  Cutting: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-200 dark:border-sky-900",
  Rooting: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900",
  Rooted: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-900",
  Potted: "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/40 dark:text-violet-200 dark:border-violet-900",
};

const emptySlots = (): CloneSlot[] => Array.from({ length: CLONE_SLOT_COUNT }, (_, index) => ({
  index, motherName: "", dateTaken: "", status: "Empty" as CloneStatus,
}));

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
  const [mothers, setMothers] = useState<Mother[]>([]);
  const [slots, setSlots] = useState<CloneSlot[]>(emptySlots());
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [storedMothers, storedSlots] = await Promise.all([
          readSecure<unknown>(MOTHERS_KEY, []),
          readSecure<unknown>(SLOTS_KEY, []),
        ]);
        if (!active) return;
        if (Array.isArray(storedMothers)) {
          setMothers(storedMothers.slice(0, 1000).flatMap((mother) => {
            const result = motherSchema.safeParse(mother);
            return result.success ? [result.data as Mother] : [];
          }));
        }
        if (Array.isArray(storedSlots)) {
          const validated = storedSlots.flatMap((slot) => {
            const result = cloneSlotSchema.safeParse(slot);
            return result.success ? [result.data as CloneSlot] : [];
          });
          if (validated.length === CLONE_SLOT_COUNT) setSlots(validated);
        }
        setStorageReady(true);
      } catch {
        if (active) setStorageReady(false);
      }
    };
    void load();
    window.addEventListener(SECURE_STORAGE_EVENT, load);
    return () => {
      active = false;
      window.removeEventListener(SECURE_STORAGE_EVENT, load);
    };
  }, []);

  useEffect(() => {
    if (storageReady) void writeSecure(MOTHERS_KEY, mothers);
  }, [mothers, storageReady]);

  useEffect(() => {
    if (storageReady) void writeSecure(SLOTS_KEY, slots);
  }, [slots, storageReady]);

  const addMother = (data: Omit<Mother, "id" | "dateAdded">) => {
    setMothers((current) => [{ ...data, id: `mother-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, dateAdded: new Date().toISOString().slice(0, 10) }, ...current]);
    showSuccess("Mother added to the register.");
  };
  const removeMother = (id: string) => setMothers((current) => current.filter((mother) => mother.id !== id));
  const updateSlot = (index: number, data: Partial<Omit<CloneSlot, "index">>) => setSlots((current) => current.map((slot) => slot.index === index ? { ...slot, ...data } : slot));
  const clearSlot = (index: number) => setSlots((current) => current.map((slot) => slot.index === index ? { index, motherName: "", dateTaken: "", status: "Empty" } : slot));

  return <CloneRegisterContext.Provider value={{ mothers, slots, addMother, removeMother, updateSlot, clearSlot }}>{children}</CloneRegisterContext.Provider>;
};

export const useCloneRegister = () => {
  const ctx = useContext(CloneRegisterContext);
  if (!ctx) throw new Error("useCloneRegister must be used within a CloneRegisterProvider");
  return ctx;
};