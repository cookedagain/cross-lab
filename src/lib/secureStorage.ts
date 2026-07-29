const DB_NAME = "vaultlab-passphrase-storage-v2";
const STORE_NAME = "records";
const META_STORE_NAME = "metadata";
const LEGACY_DB_NAME = "vaultlab-secure-storage-v1";
const KEY_ID = "origin-key";
const SALT_ID = "salt";
const VERIFIER_ID = "__vaultlab-passphrase-verifier__";
const MIGRATION_ID = "legacy-plaintext-migration-v1";
const PASSPHRASE_ITERATIONS = 210000;
const AUTO_LOCK_MS = 15 * 60 * 1000;

const LEGACY_PLAINTEXT_KEYS = [
  "crosslab-seed-counts",
  "crosslab-ethos-multipass",
  "crosslab-incoming-drops-arrived-v3",
  "crosslab-breeding-lots",
  "crosslab-clone-mothers",
  "crosslab-clone-slots",
  "vaultlab-rotation-products",
  "vaultlab-rotation-archive",
] as const;

type StoredRecord = { iv: ArrayBuffer; ciphertext: ArrayBuffer };
type MigrationMarker = { version: 1; completedAt: string };

export const SECURE_STORAGE_EVENT = "vaultlab-secure-storage-change";

let activeKey: CryptoKey | null = null;
let autoLockTimer: number | null = null;

const dispatchStorageEvent = () => {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(SECURE_STORAGE_EVENT));
};

const clearAutoLockTimer = () => {
  if (autoLockTimer !== null) {
    window.clearTimeout(autoLockTimer);
    autoLockTimer = null;
  }
};

const scheduleAutoLock = () => {
  if (typeof window === "undefined" || !activeKey) return;
  clearAutoLockTimer();
  autoLockTimer = window.setTimeout(() => {
    lockSecureStorage();
  }, AUTO_LOCK_MS);
};

const registerActivity = () => {
  if (activeKey) scheduleAutoLock();
};

if (typeof window !== "undefined") {
  for (const eventName of ["pointerdown", "keydown", "touchstart", "scroll"]) {
    window.addEventListener(eventName, registerActivity, { passive: true });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      lockSecureStorage();
    } else {
      registerActivity();
    }
  });
}

const openDb = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is unavailable."));
      return;
    }

    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
      if (!db.objectStoreNames.contains(META_STORE_NAME)) db.createObjectStore(META_STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open secure storage."));
  });

const getMeta = async <T,>(db: IDBDatabase, key: string): Promise<T | undefined> =>
  new Promise<T | undefined>((resolve, reject) => {
    const request = db.transaction(META_STORE_NAME, "readonly").objectStore(META_STORE_NAME).get(key);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error ?? new Error("Could not read secure storage metadata."));
  });

const putMeta = async (db: IDBDatabase, key: string, value: unknown) =>
  new Promise<void>((resolve, reject) => {
    const request = db.transaction(META_STORE_NAME, "readwrite").objectStore(META_STORE_NAME).put(value, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("Could not write secure storage metadata."));
  });

const getRecord = async (db: IDBDatabase, key: string): Promise<StoredRecord | undefined> =>
  new Promise<StoredRecord | undefined>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve(request.result as StoredRecord | undefined);
    request.onerror = () => reject(request.error ?? new Error("Could not read secure storage."));
  });

const putRecord = async (db: IDBDatabase, key: string, record: StoredRecord) =>
  new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put(record, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("Could not write secure storage."));
  });

const putRecordsWithMigrationMarker = async (
  db: IDBDatabase,
  records: Array<{ key: string; record: StoredRecord }>,
) =>
  new Promise<void>((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME, META_STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const metadata = transaction.objectStore(META_STORE_NAME);

    for (const entry of records) store.put(entry.record, entry.key);
    metadata.put({ version: 1, completedAt: new Date().toISOString() } satisfies MigrationMarker, MIGRATION_ID);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Secure storage migration failed."));
    transaction.onabort = () => reject(transaction.error ?? new Error("Secure storage migration was aborted."));
  });

const deriveKey = async (passphrase: string, salt: Uint8Array) => {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: PASSPHRASE_ITERATIONS, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
};

const encryptValue = async (value: unknown, key: CryptoKey): Promise<StoredRecord> => {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(JSON.stringify(value)),
  );

  return { iv: iv.slice().buffer, ciphertext };
};

const decryptValue = async <T,>(record: StoredRecord, key: CryptoKey): Promise<T> => {
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(record.iv) },
    key,
    record.ciphertext,
  );
  return JSON.parse(new TextDecoder().decode(plain)) as T;
};

const getOrCreateSalt = async (db: IDBDatabase) => {
  const existing = await getMeta<ArrayBuffer>(db, SALT_ID);
  if (existing) return new Uint8Array(existing);

  const salt = crypto.getRandomValues(new Uint8Array(16));
  await putMeta(db, SALT_ID, salt.slice().buffer);
  return salt;
};

const openLegacyDbIfPresent = async (): Promise<IDBDatabase | null> => {
  if (typeof indexedDB === "undefined") return null;

  const databases = typeof indexedDB.databases === "function" ? await indexedDB.databases() : [];
  if (databases.length > 0 && !databases.some((database) => database.name === LEGACY_DB_NAME)) return null;

  return new Promise<IDBDatabase | null>((resolve, reject) => {
    let created = false;
    const request = indexedDB.open(LEGACY_DB_NAME, 1);

    request.onupgradeneeded = () => {
      created = true;
      request.transaction?.abort();
    };
    request.onsuccess = () => {
      if (created) {
        request.result.close();
        void new Promise<void>((done) => {
          const deletion = indexedDB.deleteDatabase(LEGACY_DB_NAME);
          deletion.onsuccess = () => done();
          deletion.onerror = () => done();
          deletion.onblocked = () => done();
        }).then(() => resolve(null));
        return;
      }
      resolve(request.result);
    };
    request.onerror = () => {
      if (created) resolve(null);
      else reject(request.error ?? new Error("Could not open legacy secure storage."));
    };
  });
};

const migrateLegacyDb = async (targetDb: IDBDatabase, newKey: CryptoKey) => {
  const legacyDb = await openLegacyDbIfPresent();
  if (!legacyDb) return;

  try {
    const values = await new Promise<{ keys: IDBValidKey[]; values: unknown[] }>((resolve, reject) => {
      const transaction = legacyDb.transaction("records", "readonly");
      const store = transaction.objectStore("records");
      const keysRequest = store.getAllKeys();
      const valuesRequest = store.getAll();

      transaction.oncomplete = () => resolve({ keys: keysRequest.result, values: valuesRequest.result });
      transaction.onerror = () => reject(transaction.error ?? new Error("Could not read legacy secure storage."));
    });

    const legacyKey = values.values[values.keys.findIndex((key) => key === KEY_ID)] as CryptoKey | undefined;
    if (!legacyKey) return;

    const migratedRecords: Array<{ key: string; record: StoredRecord }> = [];
    for (let index = 0; index < values.keys.length; index += 1) {
      const recordKey = values.keys[index];
      if (recordKey === KEY_ID) continue;

      const legacyRecord = values.values[index] as StoredRecord;
      const plain = await decryptValue<unknown>(legacyRecord, legacyKey);
      migratedRecords.push({
        key: String(recordKey),
        record: await encryptValue(plain, newKey),
      });
    }

    for (const entry of migratedRecords) {
      await putRecord(targetDb, entry.key, entry.record);
      const verified = await getRecord(targetDb, entry.key);
      if (!verified) throw new Error("Legacy secure storage migration could not be verified.");
      await decryptValue(verified, newKey);
    }
  } finally {
    legacyDb.close();
    await new Promise<void>((resolve) => {
      const deletion = indexedDB.deleteDatabase(LEGACY_DB_NAME);
      deletion.onsuccess = () => resolve();
      deletion.onerror = () => resolve();
      deletion.onblocked = () => resolve();
    });
  }
};

const migrateLegacyPlaintext = async (db: IDBDatabase, newKey: CryptoKey) => {
  const marker = await getMeta<MigrationMarker>(db, MIGRATION_ID);
  const legacyValues: Array<{ key: string; value: unknown }> = [];

  for (const key of LEGACY_PLAINTEXT_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw === null) continue;

    let value: unknown;
    try {
      value = JSON.parse(raw);
    } catch {
      throw new Error(`Legacy record "${key}" could not be validated.`);
    }
    legacyValues.push({ key, value });
  }

  if (marker?.version === 1) {
    for (const { key } of legacyValues) localStorage.removeItem(key);
    return;
  }

  const encrypted = await Promise.all(
    legacyValues.map(async ({ key, value }) => ({
      key,
      record: await encryptValue(value, newKey),
    })),
  );

  await putRecordsWithMigrationMarker(db, encrypted);

  for (const { key, value } of legacyValues) {
    const stored = await getRecord(db, key);
    if (!stored) throw new Error(`Legacy record "${key}" could not be verified.`);
    const verified = await decryptValue<unknown>(stored, newKey);
    if (JSON.stringify(verified) !== JSON.stringify(value)) {
      throw new Error(`Legacy record "${key}" failed verification.`);
    }
  }

  for (const { key } of legacyValues) localStorage.removeItem(key);
};

export const isSecureStorageUnlocked = () => activeKey !== null;

export async function unlockSecureStorage(passphrase: string) {
  if (passphrase.length < 12) {
    throw new Error("Use a secure storage passphrase with at least 12 characters.");
  }

  const db = await openDb();
  const salt = await getOrCreateSalt(db);
  const candidate = await deriveKey(passphrase, salt);
  const verifier = await getRecord(db, VERIFIER_ID);

  if (verifier) {
    const value = await decryptValue<string>(verifier, candidate);
    if (value !== "vaultlab-passphrase-verifier") {
      throw new Error("That secure storage passphrase was not accepted.");
    }
  } else {
    await putRecord(db, VERIFIER_ID, await encryptValue("vaultlab-passphrase-verifier", candidate));
  }

  await migrateLegacyDb(db, candidate);
  await migrateLegacyPlaintext(db, candidate);

  activeKey = candidate;
  scheduleAutoLock();
  dispatchStorageEvent();
}

export const lockSecureStorage = () => {
  activeKey = null;
  clearAutoLockTimer();
  dispatchStorageEvent();
};

export async function readSecure<T>(key: string, fallback: T): Promise<T> {
  if (!activeKey) throw new Error("Secure storage is locked. Unlock it with the storage passphrase.");

  const db = await openDb();
  const record = await getRecord(db, key);
  if (!record) return fallback;

  return decryptValue<T>(record, activeKey);
}

export async function writeSecure(key: string, value: unknown) {
  if (!activeKey) throw new Error("Secure storage is locked. Unlock it with the storage passphrase.");

  const db = await openDb();
  const record = await encryptValue(value, activeKey);
  await putRecord(db, key, record);

  const stored = await getRecord(db, key);
  if (!stored) throw new Error("Secure storage write could not be verified.");
  await decryptValue(stored, activeKey);
  scheduleAutoLock();
}