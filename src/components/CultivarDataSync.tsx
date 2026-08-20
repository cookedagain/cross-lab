import { useEffect, useMemo, useRef } from "react";
import { useVault } from "@/hooks/useVaultStore";
import { fetchBreederAvailability } from "@/lib/breederCatalog";
import { lookupWebLineage } from "@/lib/lineageScraper";

const RECHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;
const LAST_FULL_SYNC_KEY = "crosslab-cultivar-data-sync-v1";
const LINEAGE_CONCURRENCY = 2;

let activeSync: Promise<void> | null = null;
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

const CultivarDataSync = () => {
  const { vaultSeeds } = useVault();
  const timerRef = useRef<number | null>(null);
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

  useEffect(() => {
    let active = true;

    const scheduleNextSync = () => {
      if (!active) return;
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      const remaining = Math.max(0, readLastFullSync() + RECHECK_INTERVAL_MS - Date.now());
      timerRef.current = window.setTimeout(() => {
        void runSync();
      }, remaining);
    };

    const performSync = async (force: boolean) => {
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
    };

    const runSync = async () => {
      const fullSyncDue = Date.now() - readLastFullSync() >= RECHECK_INTERVAL_MS;
      const joinedExistingSync = activeSync !== null;
      if (!activeSync) {
        activeSync = performSync(fullSyncDue).finally(() => {
          if (fullSyncDue) writeLastFullSync();
          activeSync = null;
        });
      }
      await activeSync;
      if (joinedExistingSync && active) await performSync(false);
      scheduleNextSync();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") void runSync();
    };

    void runSync();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      active = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, [breeders, cultivars]);

  return null;
};

export default CultivarDataSync;
