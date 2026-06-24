import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { type Seed, type SeedType } from "@/data/seeds";
import { showError, showSuccess } from "@/utils/toast";

const SEEDS_STORAGE_KEY = "crosslab-custom-seeds";
const INVENTORY_STORAGE_KEY = "crosslab-seed-counts";
const MULTIPASS_STORAGE_KEY = "crosslab-ethos-multipass";
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

const makeId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

type VaultContextValue = {
  customSeeds: Seed[];
  seedCounts: Record<string, number>;
  multipass: MultipassEntry[];
  lots: BreedingLot[];
  arrivedSeeds: Seed[];
  vaultSeeds: Seed[];
  getSeedCount: (seed: Seed) => number;
  seedWithCount: (seed: Seed) => Seed;
  addSeed: (data: Omit<Seed, "id">) => void;
  removeSeed: (id: string) => void;
  updateSeedCount: (seed: Seed, next: number) => void;
  resetSeedCounts: () => void;
  addMultipass: (data: Omit<MultipassEntry, "id" | "arrived">) => void;
  removeMultipass: (id: string) => void;
  toggleArrived: (id: string) => void;
  addLot: (data: Omit<BreedingLot, "id">) => void;
  removeLot: (id: string) => void;
  exportData: () => string;
  importData: (json: string) => void;
};

const VaultContext = createContext<VaultContextValue | null>(null);

const loadJSON = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return fallback;
    return JSON.parse(stored) as T;
  } catch {
    return fallback;
  }
};

export const VaultProvider = ({ children }: { children: ReactNode }) => {
  const [customSeeds, setCustomSeeds] = useState<Seed[]>(() => {
    const parsed = loadJSON<Seed[]>(SEEDS_STORAGE_KEY, []);
    return Array.isArray(parsed) ? parsed : [];
  });

  const [seedCounts, setSeedCounts] = useState<Record<string, number>>(() => {
    const parsed = loadJSON<Record<string, unknown>>(INVENTORY_STORAGE_KEY, {});
    return Object.fromEntries(
      Object.entries(parsed).map(([id, value]) => [id, clampSeedCount(Number(value))]),
    );
  });

  const [multipass, setMultipass] = useState<MultipassEntry[]>(() => {
    const parsed = loadJSON<MultipassEntry[]>(MULTIPASS_STORAGE_KEY, []);
    return Array.isArray(parsed) ? parsed : [];
  });

  const [lots, setLots] = useState<BreedingLot[]>(() => {
    const parsed = loadJSON<BreedingLot[]>(LOTS_STORAGE_KEY, []);
    return Array.isArray(parsed) ? parsed : [];
  });

  useEffect(() => {
    window.localStorage.setItem(SEEDS_STORAGE_KEY, JSON.stringify(customSeeds));
  }, [customSeeds]);

  useEffect(() => {
    window.localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(seedCounts));
  }, [seedCounts]);

  useEffect(() => {
    window.localStorage.setItem(MULTIPASS_STORAGE_KEY, JSON.stringify(multipass));
  }, [multipass]);

  useEffect(() => {
    window.localStorage.setItem(LOTS_STORAGE_KEY, JSON.stringify(lots));
  }, [lots]);

  const arrivedSeeds = useMemo<Seed[]>(
    () =>
      multipass
        .filter((entry) => entry.arrived)
        .map((entry) => ({
          id: entry.id,
          name: entry.name,
          breeder: MULTIPASS_BREEDER,
          type: entry.type,
          count: entry.count,
        })),
    [multipass],
  );

  const vaultSeeds = useMemo(() => [...customSeeds, ...arrivedSeeds], [customSeeds, arrivedSeeds]);

  const getSeedCount = (seed: Seed) => seedCounts[seed.id] ?? seed.count ?? 0;
  const seedWithCount = (seed: Seed): Seed => ({ ...seed, count: getSeedCount(seed) });

  const addSeed = (data: Omit<Seed, "id">) => {
    const id = makeId("seed");
    const count = clampSeedCount(data.count ?? 0);
    setCustomSeeds((current) => [{ ...data, id, count }, ...current]);
    setSeedCounts((current) => ({ ...current, [id]: count }));
    showSuccess(`${data.name} added to your vault.`);
  };

  const removeSeed = (id: string) => {
    setCustomSeeds((current) => current.filter((seed) => seed.id !== id));
    setSeedCounts((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  const updateSeedCount = (seed: Seed, next: number) =>
    setSeedCounts((current) => ({ ...current, [seed.id]: clampSeedCount(next) }));

  const resetSeedCounts = () =>
    setSeedCounts(Object.fromEntries(customSeeds.map((seed) => [seed.id, clampSeedCount(seed.count ?? 0)])));

  const addMultipass = (data: Omit<MultipassEntry, "id" | "arrived">) =>
    setMultipass((current) => [...current, { ...data, id: makeId("multipass"), arrived: false }]);

  const removeMultipass = (id: string) => setMultipass((current) => current.filter((entry) => entry.id !== id));

  const toggleArrived = (id: string) =>
    setMultipass((current) => current.map((entry) => (entry.id === id ? { ...entry, arrived: !entry.arrived } : entry)));

  const addLot = (data: Omit<BreedingLot, "id">) =>
    setLots((current) => [{ ...data, id: makeId("lot") }, ...current]);

  const removeLot = (id: string) => setLots((current) => current.filter((lot) => lot.id !== id));

  const exportData = () =>
    JSON.stringify({ version: 2, customSeeds, seedCounts, multipass, lots }, null, 2);

  const importData = (json: string) => {
    try {
      const parsed = JSON.parse(json) as {
        customSeeds?: Seed[];
        seedCounts?: Record<string, unknown>;
        multipass?: MultipassEntry[];
        lots?: BreedingLot[];
      };
      if (Array.isArray(parsed.customSeeds)) setCustomSeeds(parsed.customSeeds);
      if (parsed.seedCounts) {
        const cleaned = Object.fromEntries(
          Object.entries(parsed.seedCounts).map(([id, value]) => [id, clampSeedCount(Number(value))]),
        );
        setSeedCounts(cleaned);
      }
      if (Array.isArray(parsed.multipass)) setMultipass(parsed.multipass);
      if (Array.isArray(parsed.lots)) setLots(parsed.lots);
      showSuccess("Vault data restored from backup.");
    } catch {
      showError("That file could not be read as a CrossLab backup.");
    }
  };

  const value: VaultContextValue = {
    customSeeds,
    seedCounts,
    multipass,
    lots,
    arrivedSeeds,
    vaultSeeds,
    getSeedCount,
    seedWithCount,
    addSeed,
    removeSeed,
    updateSeedCount,
    resetSeedCounts,
    addMultipass,
    removeMultipass,
    toggleArrived,
    addLot,
    removeLot,
    exportData,
    importData,
  };

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
};

export const useVault = () => {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error("useVault must be used within a VaultProvider");
  return ctx;
};