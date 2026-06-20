import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { showSuccess } from "@/utils/toast";

const STORAGE_KEY = "vaultlab-rotation-products";

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
};

export const clampWeight = (value: number) =>
  Math.max(0, Math.round((Number.isFinite(value) ? value : 0) * 100) / 100);

type RotationContextValue = {
  products: RotationProduct[];
  addProduct: (data: Omit<RotationProduct, "id">) => void;
  updateRemaining: (id: string, next: number) => void;
  removeProduct: (id: string) => void;
};

const RotationContext = createContext<RotationContextValue | null>(null);

const loadProducts = (): RotationProduct[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as RotationProduct[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const RotationProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<RotationProduct[]>(loadProducts);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

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

  const removeProduct = (id: string) =>
    setProducts((current) => current.filter((product) => product.id !== id));

  return (
    <RotationContext.Provider value={{ products, addProduct, updateRemaining, removeProduct }}>
      {children}
    </RotationContext.Provider>
  );
};

export const useRotation = () => {
  const ctx = useContext(RotationContext);
  if (!ctx) throw new Error("useRotation must be used within a RotationProvider");
  return ctx;
};