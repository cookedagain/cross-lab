import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { GrowStation } from "@/lib/growStations";
import { showSuccess } from "@/utils/toast";

const STORAGE_KEY = "crosslab-grow-stations";

type StationContextValue = {
  stations: GrowStation[];
  addStation: (data: Omit<GrowStation, "id">) => void;
  removeStation: (id: string) => void;
};

const StationContext = createContext<StationContextValue | null>(null);

const loadStations = (): GrowStation[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const StationProvider = ({ children }: { children: ReactNode }) => {
  const [stations, setStations] = useState<GrowStation[]>(() => loadStations());

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stations));
  }, [stations]);

  const addStation = (data: Omit<GrowStation, "id">) => {
    setStations((current) => [
      { ...data, id: `station-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` },
      ...current,
    ]);
    showSuccess(`${data.name} added to your grow stations.`);
  };

  const removeStation = (id: string) =>
    setStations((current) => current.filter((station) => station.id !== id));

  return (
    <StationContext.Provider value={{ stations, addStation, removeStation }}>
      {children}
    </StationContext.Provider>
  );
};

export const useStations = () => {
  const ctx = useContext(StationContext);
  if (!ctx) throw new Error("useStations must be used within a StationProvider");
  return ctx;
};