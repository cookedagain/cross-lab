import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useVault } from "@/hooks/useVaultStore";
import { fetchBreederAvailability } from "@/lib/breederCatalog";
import { lookupWebLineage } from "@/lib/lineageScraper";

const RECHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;
const LAST_FULL_SYNC_KEY = "crosslab-cultivar-data-sync-v1";
const LINEAGE_CONCURRENCY = 2;

let activeSync: Promise<void> | null = null;
let activeSyncIsFull = false;
let lastFullSyncMemory = 0;

const readLastFullSync = () => {
  try {
    const stored = window.localStorage.getItem(LAST_FULL_SYNC_KEY);
    const timestamp = stored ? new Date(stored).getTime() : 0;
    return Number.isFinite(timestamp) ? Math.max(timestamp, lastFullSyncMemory) : lastFullSyncMemory;
  } catch {
    return lastFullSyncMemory;
  }
};

const writeLastFullSync = () => {
  lastFullSyncMemory = Date.now();
  try {
    window.localStorage.setItem(LAST_FULL_SYNC_KEY, new Date(lastFullSyncMemory).toISOString());
  } catch {
    // The in-memory timestamp keeps the open app on its daily schedule.
  }
};

type CultivarDataSyncContextValue = {
  isSyncing: boolean;
  forceRecheck: () => Promise<void>;
};

const CultivarDataSyncContext = createContext<CultivarDataSyncContextValue | null>(null);

const CultivarDataSync = ({ children }: { children: ReactNode }) => {
  const { vaultSeeds } = useVault();
  const timerRef = useRef<number | null>(null);
  const syncRunsRef = useRef(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const cultivars = useMemo(
    () =>
      Array.from(
        new Map(
          vaultSeeds.map((seed) => [
            `${seed.name.toLowerCase()}::${seed.breeder.toLowerCase()}`,
            { name: seed.name, breeder: seed.breeder },
          ]),
        ).values(),
      ),
    [vaultSeeds],
  );
  const breeders = useMemo(
    () => Array.from(new Set(cultivars.map((cultivar) => cultivar.breeder))),
    [cultivars],
  );

  const performSync = useCallback(
    async (force: boolean) => {
      for (const breeder of breeders) {
        await fetchBreederAvailability(breeder);
      }

      let nextIndex = 0;
      const workers = Array.from(
        { length: Math.min(LINEAGE_CONCURRENCY, cultivars.length) },
        async () => {
          while (nextIndex < cultivars.length) {
            const cultivar = cultivars[nextIndex++];
            await lookupWebLineage(cultivar.name, cultivar.breeder, { force });
          }
        },
      );
      await Promise.all(workers);
    },
    [breeders, cultivars],
  );

  const runSync = useCallback(
    async (force = false) => {
      syncRunsRef.current += 1;
      setIsSyncing(true);
      try {
        const fullSyncDue = force || Date.now() - readLastFullSync() >= RECHECK_INTERVAL_MS;
        if (activeSync) {
          const joinedFullSync = activeSyncIsFull;
          await activeSync;
          if (!fullSyncDue || joinedFullSync) return;
        }

        activeSyncIsFull = fullSyncDue;
        activeSync = performSync(fullSyncDue)
          .then(() => {
            if (fullSyncDue) writeLastFullSync();
          })
          .finally(() => {
            activeSync = null;
            activeSyncIsFull = false;
          });
        await activeSync;
      } finally {
        syncRunsRef.current -= 1;
        if (syncRunsRef.current === 0) setIsSyncing(false);
      }
    },
    [performSync],
  );

  useEffect(() => {
    let active = true;

    const scheduleNextSync = () => {
      if (!active) return;
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      const remaining = Math.max(0, readLastFullSync() + RECHECK_INTERVAL_MS - Date.now());
      timerRef.current = window.setTimeout(() => {
        void runSync().finally(scheduleNextSync);
      }, remaining);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void runSync().finally(scheduleNextSync);
      }
    };

    void runSync().finally(scheduleNextSync);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      active = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, [runSync]);

  return (
    <CultivarDataSyncContext.Provider value={{ isSyncing, forceRecheck: () => runSync(true) }}>
      {children}
    </CultivarDataSyncContext.Provider>
  );
};

export const useCultivarDataSync = () => {
  const context = useContext(CultivarDataSyncContext);
  if (!context) throw new Error("useCultivarDataSync must be used within CultivarDataSync");
  return context;
};

export default CultivarDataSync;
