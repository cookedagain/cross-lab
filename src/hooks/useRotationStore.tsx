import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { archivedProductSchema, rotationProductSchema } from "@/lib/validation";
import {
  isSecureStorageUnlocked,
  readSecure,
  SECURE_STORAGE_EVENT,
  writeSecure,
} from "@/lib/secureStorage";
import { showSuccess } from "@/utils/toast";

const STORAGE_KEY = "vaultlab-rotation-products";
const ARCHIVE_STORAGE_KEY = "vaultlab-rotation-archive";

export const ROTATION_CATEGORIES = ["Flower", "Hash", "Rosin", "Vape", "Oil", "Edible", "Other"] as const;
export type RotationCategory = (typeof ROTATION_CATEGORIES)[number];

export type RotationProduct = { id: string; name: string; brand: string; category: RotationCategory; thc: number; cbd: number; startWeight: number; remainingWeight: number; notes: string; rating: number };
export type ArchivedProduct = RotationProduct & { archivedAt: string };

export const clampWeight = (value: number) => Math.max(0, Math.round((Number.isFinite(value) ? value : 0) * 100) / 100);
export const clampRating = (value: number) => Math.max(0, Math.min(5, Math.round(Number.isFinite(value) ? value : 0)));

type RotationContextValue = {
  products: RotationProduct[];
  archived: ArchivedProduct[];
  addProduct: (data: Omit<RotationProduct, "id">) => void;
  addProducts: (data: Omit<RotationProduct, "id">[]) => void;
  updateRemaining: (id: string, next: number) => void;
  updateRating: (id: string, next: number) => void;
  removeProduct: (id: string) => void;
  archiveProduct: (id: string) => void;
  restoreProduct: (id: string) => void;
  removeArchived: (id: string) => void;
};

const RotationContext = createContext<RotationContextValue | null>(null);
const makeId = () => `rotation-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const RotationProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<RotationProduct[]>([]);
  const [archived, setArchived] = useState<ArchivedProduct[]>([]);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    let active = true;

    const clearSensitiveState = () => {
      setProducts([]);
      setArchived([]);
      setStorageReady(false);
    };

    const load = async () => {
      if (!isSecureStorageUnlocked()) {
        if (active) clearSensitiveState();
        return;
      }

      try {
        const [storedProducts, storedArchived] = await Promise.all([
          readSecure<unknown>(STORAGE_KEY, []),
          readSecure<unknown>(ARCHIVE_STORAGE_KEY, []),
        ]);
        if (!active || !isSecureStorageUnlocked()) {
          if (active) clearSensitiveState();
          return;
        }

        if (Array.isArray(storedProducts)) {
          setProducts(storedProducts.slice(0, 1000).flatMap((product) => {
            const result = rotationProductSchema.safeParse({ rating: 0, ...product });
            return result.success ? [result.data as RotationProduct] : [];
          }));
        }

        if (Array.isArray(storedArchived)) {
          setArchived(storedArchived.slice(0, 1000).flatMap((product) => {
            const result = archivedProductSchema.safeParse(product);
            return result.success ? [result.data as ArchivedProduct] : [];
          }));
        }

        setStorageReady(true);
      } catch {
        if (active) clearSensitiveState();
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
    if (storageReady && isSecureStorageUnlocked()) void writeSecure(STORAGE_KEY, products);
  }, [products, storageReady]);

  useEffect(() => {
    if (storageReady && isSecureStorageUnlocked()) void writeSecure(ARCHIVE_STORAGE_KEY, archived);
  }, [archived, storageReady]);

  const addProduct = (data: Omit<RotationProduct, "id">) => {
    setProducts((current) => [{ ...data, id: makeId() }, ...current]);
    showSuccess("Product added to rotation.");
  };
  const addProducts = (data: Omit<RotationProduct, "id">[]) => {
    if (data.length === 0) return;
    setProducts((current) => [...data.map((item) => ({ ...item, id: makeId() })), ...current]);
    showSuccess(`Imported ${data.length} products into rotation.`);
  };
  const updateRemaining = (id: string, next: number) => setProducts((current) => current.map((product) => product.id === id ? { ...product, remainingWeight: clampWeight(next) } : product));
  const updateRating = (id: string, next: number) => setProducts((current) => current.map((product) => product.id === id ? { ...product, rating: clampRating(next) } : product));
  const removeProduct = (id: string) => setProducts((current) => current.filter((product) => product.id !== id));
  const archiveProduct = (id: string) => setProducts((current) => {
    const target = current.find((product) => product.id === id);
    if (target) {
      setArchived((list) => [{ ...target, archivedAt: new Date().toISOString() }, ...list]);
      showSuccess("Moved to previously used.");
    }
    return current.filter((product) => product.id !== id);
  });
  const restoreProduct = (id: string) => setArchived((current) => {
    const target = current.find((product) => product.id === id);
    if (target) {
      const { archivedAt: _archivedAt, ...rest } = target;
      setProducts((list) => [rest, ...list]);
      showSuccess("Restored to rotation.");
    }
    return current.filter((product) => product.id !== id);
  });
  const removeArchived = (id: string) => setArchived((current) => current.filter((product) => product.id !== id));

  return <RotationContext.Provider value={{ products, archived, addProduct, addProducts, updateRemaining, updateRating, removeProduct, archiveProduct, restoreProduct, removeArchived }}>{children}</RotationContext.Provider>;
};

export const useRotation = () => {
  const ctx = useContext(RotationContext);
  if (!ctx) throw new Error("useRotation must be used within a RotationProvider");
  return ctx;
};