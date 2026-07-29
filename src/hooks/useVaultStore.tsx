import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_SEED_COUNTS, SEEDS, type Seed, type SeedType } from "@/data/seeds";
import { getIncomingDropId, INCOMING_DROPS, INCOMING_ORDERS, incomingDropToSeed } from "@/data/incomingDrops";
import { backupSchema, multipassSchema, breedingLotSchema, seedCountsSchema } from "@/lib/validation";
import { readSecure, SECURE_STORAGE_EVENT, writeSecure } from "@/lib/secureStorage";
import { showError, showSuccess } from "@/utils/toast";

const INVENTORY_STORAGE_KEY = "crosslab-seed-counts";
const MULTIPASS_STORAGE_KEY = "crosslab-ethos-multipass";
const INCOMING_ARRIVALS_STORAGE_KEY = "crosslab-incoming-drops-arrived-v3";
const LOTS_STORAGE_KEY = "crosslab-breeding-lots";
export const MULTIPASS_BREEDER = "Ethos Genetics";

export type MultipassEntry = {
  id: string;
  name: string;
  parentA: string;
  parentB: string;
  type: SeedType;
  count: number;
  arrived: boolean;
};

export type BreedingLot = {
  id: string;
  kind: "pollen" | "seed";
  name: string;
  parents: string;
  date: string;
  quantity: number;
  notes: string;
};

export const clampSeedCount = (value: number) =>
  Math.max(0, Math.min(999, Math.round(Number.isFinite(value) ? value : 0)));

type VaultContextValue = {
  seedCounts: Record<string, number>;
  multipass: MultipassEntry[];
  incomingArrivedIds: string[];
  lots: BreedingLot[];
  arrivedSeeds: Seed[];
  arrivedIncomingSeeds: Seed[];
  vaultSeeds: Seed[];
  getSeedCount: (seed: Seed) => number;
  seedWithCount: (seed: Seed) => Seed;
  updateSeedCount: (seed: Seed, next: number) => void;
  resetSeedCounts: () => void;
  addMultipass: (data: Omit<MultipassEntry, "id" | "arrived">) => void;
  removeMultipass: (id: string) => void;
  toggleArrived: (id: string) => void;
  setIncomingArrived: (id: string, arrived: boolean) => void;
  addLot: (data: Omit<BreedingLot, "id">) => void;
  removeLot: (id: string) => void;
  exportData: () => string;
  importData: (json: string) => void;
};

const VaultContext = createContext<VaultContextValue | null>(null);

export const VaultProvider = ({ children }: { children: ReactNode }) => {
  const [seedCounts, setSeedCounts] = useState<Record<string, number>>(DEFAULT_SEED_COUNTS);
  const [multipass, setMultipass] = useState<MultipassEntry[]>([]);
  const [incomingArrivedIds, setIncomingArrivedIds] = useState<string[]>([]);
  const [lots, setLots] = useState<BreedingLot[]>([]);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [counts, storedMultipass, storedArrived, storedLots] = await Promise.all([
          readSecure<unknown>(INVENTORY_STORAGE_KEY, {}),
          readSecure<unknown>(MULTIPASS_STORAGE_KEY, []),
          readSecure<unknown>(INCOMING_ARRIVALS_STORAGE_KEY, []),
          readSecure<unknown>(LOTS_STORAGE_KEY, []),
        ]);
        if (!active) return;

        const countResult = seedCountsSchema.safeParse(counts);
        if (countResult.success) setSeedCounts({ ...DEFAULT_SEED_COUNTS, ...countResult.data });
        if (Array.isArray(storedMultipass)) {
          setMultipass(storedMultipass.slice(0, 1000).flatMap((entry) => {
            const result = multipassSchema.safeParse(entry);
            return result.success ? [result.data as MultipassEntry] : [];
          }));
        }
        if (Array.isArray(storedArrived)) {
          const validIds = new Set(INCOMING_DROPS.map(getIncomingDropId));
          setIncomingArrivedIds(storedArrived.filter((id): id is string => typeof id === "string" && validIds.has(id)).slice(0, 1000));
        }
        if (Array.isArray(storedLots)) {
          setLots(storedLots.slice(0, 1000).flatMap((lot) => {
            const result = breedingLotSchema.safeParse(lot);
            return result.success ? [result.data as BreedingLot] : [];
          }));
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
    if (storageReady) void writeSecure(INVENTORY_STORAGE_KEY, seedCounts);
  }, [seedCounts, storageReady]);

  useEffect(() => {
    if (storageReady) void writeSecure(MULTIPASS_STORAGE_KEY, multipass);
  }, [multipass, storageReady]);

  useEffect(() => {
    if (storageReady) void writeSecure(INCOMING_ARRIVALS_STORAGE_KEY, incomingArrivedIds);
  }, [incomingArrivedIds, storageReady]);

  useEffect(() => {
    if (storageReady) void writeSecure(LOTS_STORAGE_KEY, lots);
  }, [lots, storageReady]);

  const arrivedSeeds = useMemo<Seed[]>(
    () => multipass.filter((entry) => entry.arrived).map((entry) => ({
      id: entry.id,
      name: entry.name,
      breeder: MULTIPASS_BREEDER,
      type: entry.type,
      count: entry.count,
    })),
    [multipass],
  );

  const arrivedIncomingSeeds = useMemo<Seed[]>(() => {
    const arrived = new Set(incomingArrivedIds);
    return INCOMING_DROPS.filter((drop) => arrived.has(getIncomingDropId(drop))).map(incomingDropToSeed);
  }, [incomingArrivedIds]);

  const vaultSeeds = useMemo(() => [...SEEDS, ...arrivedSeeds, ...arrivedIncomingSeeds], [arrivedSeeds, arrivedIncomingSeeds]);
  const getSeedCount = (seed: Seed) => seedCounts[seed.id] ?? seed.count ?? 0;
  const seedWithCount = (seed: Seed): Seed => ({ ...seed, count: getSeedCount(seed) });
  const updateSeedCount = (seed: Seed, next: number) => setSeedCounts((current) => ({ ...current, [seed.id]: clampSeedCount(next) }));
  const resetSeedCounts = () => setSeedCounts(DEFAULT_SEED_COUNTS);
  const addMultipass = (data: Omit<MultipassEntry, "id" | "arrived">) => setMultipass((current) => [...current, { ...data, id: `multipass-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, arrived: false }]);
  const removeMultipass = (id: string) => setMultipass((current) => current.filter((entry) => entry.id !== id));
  const toggleArrived = (id: string) => setMultipass((current) => current.map((entry) => (entry.id === id ? { ...entry, arrived: !entry.arrived } : entry)));

  const setIncomingArrived = (id: string, arrived: boolean) => {
    setIncomingArrivedIds((current) => arrived ? (current.includes(id) ? current : [...current, id]) : current.filter((item) => item !== id));
    if (!arrived) {
      setSeedCounts((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
    }
    showSuccess(arrived ? "Incoming cultivar added to the main vault." : "Cultivar moved back to incoming.");
  };

  const addLot = (data: Omit<BreedingLot, "id">) => setLots((current) => [{ ...data, id: `lot-${Date.now()}-${Math.random().toString(36).slice(2, 7) },` }, ...current]);
  const removeLot = (id: string) => setLots((current) => current.filter((lot) => lot.id !== id));

  const exportData = () => JSON.stringify({
    version: 3,
    seedCounts,
    multipass,
    lots,
    incomingDrops: { orders: INCOMING_ORDERS, drops: INCOMING_DROPS, arrivedIds: incomingArrivedIds },
  }, null, 2);

  const importData = (json: string) => {
    try {
      const result = backupSchema.safeParse(JSON.parse(json) as unknown);
      if (!result.success) {
        showError("That backup failed validation and was not imported.");
        return;
      }
      const data = result.data;
      if (data.seedCounts) setSeedCounts({ ...DEFAULT_SEED_COUNTS, ...data.seedCounts });
      if (data.multipass) setMultipass(data.multipass as MultipassEntry[]);
      const importedArrivedIds = data.incomingDrops?.arrivedIds ?? data.incomingArrivedIds;
      if (importedArrivedIds) {
        const validIds = new Set(INCOMING_DROPS.map(getIncomingDropId));
        setIncomingArrivedIds(importedArrivedIds.filter((id) => validIds.has(id)));
      }
      if (data.lots) setLots(data.lots as BreedingLot[]);
      showSuccess("Validated vault data restored from backup.");
    } catch {
      showError("That file could not be read as a CrossLab backup.");
    }
  };

  return (
    <VaultContext.Provider value={{
      seedCounts, multipass, incomingArrivedIds, lots, arrivedSeeds, arrivedIncomingSeeds, vaultSeeds,
      getSeedCount, seedWithCount, updateSeedCount, resetSeedCounts, addMultipass, removeMultipass,
      toggleArrived, setIncomingArrived, addLot, removeLot, exportData, importData,
    }}>
      {children}
    </VaultContext.Provider>
  );
};

export const useVault = () => {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error("useVault must be used within a VaultProvider");
  return ctx;
};