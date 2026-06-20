import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { showSuccess } from "@/utils/toast";

const STORAGE_KEY = "vaultlab-rotation-products";
const ARCHIVE_STORAGE_KEY = "vaultlab-rotation-archive";
const ROTATION_WIPE_STORAGE_KEY = "vaultlab-rotation-entry-wipe-v1";

const clearStoredRotationEntries = () => {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(ROTATION_WIPE_STORAGE_KEY) === "done") return;

  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(ARCHIVE_STORAGE_KEY);
  window.localStorage.setItem(ROTATION_WIPE_STORAGE_KEY, "done");
};

export const ROTATION_CATEGORIES = [
  "Flower",
  "Hash",
  "Rosin",
  "Vape",
  "Oil",
  "Edible",
  "Other",
] as const;

export type RotationCategory = (typeof ROTATION_CATEGORIES)[number];

export type RotationProduct = {
  id: string;
  name: string;
  brand: string;
  category: RotationCategory;
  thc: number;
  cbd: number;
  startWeight: number;
  remainingWeight: number;
  notes: string;
  rating: number;
};

export type ArchivedProduct = RotationProduct & { archivedAt: string };

export const clampWeight = (value: number) =>
  Math.max(0, Math.round((Number.isFinite(value) ? value : 0) * 100) / 100);

export const clampRating = (value: number) =>
  Math.max(0, Math.min(5, Math.round(Number.isFinite(value) ? value : 0)));

type RotationContextValue = {
  products: RotationProduct[];
  archived: ArchivedProduct[];
  addProduct: (data: Omit<RotationProduct, "id">) => void;
  updateRemaining: (id: string, next: number) => void;
  updateRating: (id: string, next: number) => void;
  removeProduct: (id: string) => void;
  archiveProduct: (id: string) => void;
  restoreProduct: (id: string) => void;
  removeArchived: (id: string) => void;
};

const RotationContext = createContext<RotationContextValue | null>(null);

const loadJSON = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return fallback;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
};

export const RotationProvider = ({ children }: { children: ReactNode }) => {
  clearStoredRotationEntries();

  const [products, setProducts] = useState<RotationProduct[]>(() =>
    loadJSON<RotationProduct[]>(STORAGE_KEY, []).map((product) => ({ rating: 0, ...product })),
  );
  const [archived, setArchived] = useState<ArchivedProduct[]>(() =>
    loadJSON<ArchivedProduct[]>(ARCHIVE_STORAGE_KEY, []),
  );

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    window.localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(archived));
  }, [archived]);

  const addProduct = (data: Omit<RotationProduct, "id">) => {
    setProducts((current) => [
      { ...data, id: `rotation-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` },
      ...current,
    ]);
    showSuccess("Product added to rotation.");
  };

  const updateRemaining = (id: string, next: number) =>
    setProducts((current) =>
      current.map((product) =>
        product.id === id ? { ...product, remainingWeight: clampWeight(next) } : product,
      ),
    );

  const updateRating = (id: string, next: number) =>
    setProducts((current) =>
      current.map((product) =>
        product.id === id ? { ...product, rating: clampRating(next) } : product,
      ),
    );

  const removeProduct = (id: string) =>
    setProducts((current) => current.filter((product) => product.id !== id));

  const archiveProduct = (id: string) =>
    setProducts((current) => {
      const target = current.find((product) => product.id === id);
      if (target) {
        setArchived((list) => [{ ...target, archivedAt: new Date().toISOString() }, ...list]);
        showSuccess("Moved to previously used.");
      }
      return current.filter((product) => product.id !== id);
    });

  const restoreProduct = (id: string) =>
    setArchived((current) => {
      const target = current.find((product) => product.id === id);
      if (target) {
        const { archivedAt, ...rest } = target;
        setProducts((list) => [rest, ...list]);
        showSuccess("Restored to rotation.");
      }
      return current.filter((product) => product.id !== id);
    });

  const removeArchived = (id: string) =>
    setArchived((current) => current.filter((product) => product.id !== id));

  return (
    <RotationContext.Provider
      value={{
        products,
        archived,
        addProduct,
        updateRemaining,
        updateRating,
        removeProduct,
        archiveProduct,
        restoreProduct,
        removeArchived,
      }}
    >
      {children}
    </RotationContext.Provider>
  );
};

export const useRotation = () => {
  const ctx = useContext(RotationContext);
  if (!ctx) throw new Error("useRotation must be used within a RotationProvider");
  return ctx;
};