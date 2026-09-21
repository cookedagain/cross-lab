import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_SEED_COUNTS, SEEDS, type Seed, type SeedType } from "@/data/seeds";
import { getIncomingDropId, INCOMING_DROPS, INCOMING_ORDERS, incomingDropToSeed } from "@/data/incomingDrops";
import { showError, showSuccess } from "@/utils/toast";

const INVENTORY_STORAGE_KEY = "crosslab-seed-counts-v4-2026-09-08";
const MULTIPASS_STORAGE_KEY = "crosslab-ethos-multipass-v3-2026-09-08";
const INCOMING_ARRIVALS_STORAGE_KEY = "crosslab-incoming-drops-arrived-v5";
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
  const [seedCounts, setSeedCounts] = useState<Record<string, number>>(() => {
    const parsed = loadJSON<Record<string, unknown>>(INVENTORY_STORAGE_KEY, {});
    const cleaned = Object.fromEntries(
      Object.entries(parsed).map(([id, value]) => [id, clampSeedCount(Number(value))]),
    );
    return { ...DEFAULT_SEED_COUNTS, ...cleaned };
  });

  const [multipass, setMultipass] = useState<MultipassEntry[]>(() => {
    const parsed = loadJSON<MultipassEntry[]>(MULTIPASS_STORAGE_KEY, []);
    return Array.isArray(parsed) ? parsed : [];
  });

  const [incomingArrivedIds, setIncomingArrivedIds] = useState<string[]>(() => {
    const parsed = loadJSON<string[]>(INCOMING_ARRIVALS_STORAGE_KEY, []);
    const validIds = new Set(INCOMING_DROPS.map(getIncomingDropId));
    return Array.isArray(parsed)
      ? parsed.filter((id) => typeof id === "string" && validIds.has(id))
      : [];
  });

  const [lots, setLots] = useState<BreedingLot[]>(() => {
    const parsed = loadJSON<BreedingLot[]>(LOTS_STORAGE_KEY, []);
    return Array.isArray(parsed) ? parsed : [];
  });

  useEffect(() => {
    window.localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(seedCounts));
  }, [seedCounts]);

  useEffect(() => {
    window.localStorage.setItem(MULTIPASS_STORAGE_KEY, JSON.stringify(multipass));
  }, [multipass]);

  useEffect(() => {
    window.localStorage.setItem(INCOMING_ARRIVALS_STORAGE_KEY, JSON.stringify(incomingArrivedIds));
  }, [incomingArrivedIds]);

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

  const arrivedIncomingSeeds = useMemo<Seed[]>(() => {
    const arrived = new Set(incomingArrivedIds);
    return INCOMING_DROPS.filter(
      (drop) => drop.recordKind === "exact" && drop.count !== null && arrived.has(getIncomingDropId(drop)),
    ).map(incomingDropToSeed);
  }, [incomingArrivedIds]);

  const vaultSeeds = useMemo(
    () => [...SEEDS, ...arrivedSeeds, ...arrivedIncomingSeeds],
    [arrivedSeeds, arrivedIncomingSeeds],
  );

  const getSeedCount = (seed: Seed) => seedCounts[seed.id] ?? seed.count ?? 0;
  const seedWithCount = (seed: Seed): Seed => ({ ...seed, count: getSeedCount(seed) });

  const updateSeedCount = (seed: Seed, next: number) =>
    setSeedCounts((current) => ({ ...current, [seed.id]: clampSeedCount(next) }));

  const resetSeedCounts = () => setSeedCounts(DEFAULT_SEED_COUNTS);

  const addMultipass = (data: Omit<MultipassEntry, "id" | "arrived">) =>
    setMultipass((current) => [
      ...current,
      { ...data, id: `multipass-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, arrived: false },
    ]);

  const removeMultipass = (id: string) => setMultipass((current) => current.filter((entry) => entry.id !== id));

  const toggleArrived = (id: string) =>
    setMultipass((current) => current.map((entry) => (entry.id === id ? { ...entry, arrived: !entry.arrived } : entry)));

  const setIncomingArrived = (id: string, arrived: boolean) => {
    const drop = INCOMING_DROPS.find((item) => getIncomingDropId(item) === id);
    if (arrived && (!drop || drop.recordKind !== "exact" || drop.count === null)) {
      showError("Confirm the landed cultivar and physical count before moving it into the vault.");
      return;
    }

    setIncomingArrivedIds((current) =>
      arrived ? (current.includes(id) ? current : [...current, id]) : current.filter((item) => item !== id),
    );
    if (!arrived) {
      setSeedCounts((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
    }
    showSuccess(arrived ? "Physically audited cultivar added to the main vault." : "Cultivar moved back to incoming.");
  };

  const addLot = (data: Omit<BreedingLot, "id">) =>
    setLots((current) => [{ ...data, id: `lot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }, ...current]);

  const removeLot = (id: string) => setLots((current) => current.filter((lot) => lot.id !== id));

  const exportData = () =>
    JSON.stringify(
      {
        version: 4,
        seedCounts,
        multipass,
        lots,
        incomingDrops: {
          orders: INCOMING_ORDERS,
          drops: INCOMING_DROPS,
          arrivedIds: incomingArrivedIds,
        },
      },
      null,
      2,
    );

  const importData = (json: string) => {
    try {
      const parsed = JSON.parse(json) as {
        seedCounts?: Record<string, unknown>;
        multipass?: MultipassEntry[];
        incomingArrivedIds?: string[];
        incomingDrops?: {
          arrivedIds?: string[];
        };
        lots?: BreedingLot[];
      };
      if (parsed.seedCounts) {
        const cleaned = Object.fromEntries(
          Object.entries(parsed.seedCounts).map(([id, value]) => [id, clampSeedCount(Number(value))]),
        );
        setSeedCounts({ ...DEFAULT_SEED_COUNTS, ...cleaned });
      }
      if (Array.isArray(parsed.multipass)) setMultipass(parsed.multipass);
      const importedArrivedIds = parsed.incomingDrops?.arrivedIds ?? parsed.incomingArrivedIds;
      if (Array.isArray(importedArrivedIds)) {
        const validIds = new Set(INCOMING_DROPS.map(getIncomingDropId));
        setIncomingArrivedIds(
          importedArrivedIds.filter((id): id is string => typeof id === "string" && validIds.has(id)),
        );
      }
      if (Array.isArray(parsed.lots)) setLots(parsed.lots);
      showSuccess("Vault data restored from backup.");
    } catch {
      showError("That file could not be read as a CrossLab backup.");
    }
  };

  const value: VaultContextValue = {
    seedCounts,
    multipass,
    incomingArrivedIds,
    lots,
    arrivedSeeds,
    arrivedIncomingSeeds,
    vaultSeeds,
    getSeedCount,
    seedWithCount,
    updateSeedCount,
    resetSeedCounts,
    addMultipass,
    removeMultipass,
    toggleArrived,
    setIncomingArrived,
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