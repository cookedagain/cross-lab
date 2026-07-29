const DB_NAME = "vaultlab-passphrase-storage-v2";
const STORE_NAME = "records";
const META_STORE_NAME = "metadata";
const LEGACY_DB_NAME = "vaultlab-secure-storage-v1";
const KEY_ID = "origin-key";
const SALT_ID = "salt";
const VERIFIER_ID = "__vaultlab-passphrase-verifier__";
const PASSPHRASE_ITERATIONS = 210000;

type StoredRecord = { iv: ArrayBuffer; ciphertext: ArrayBuffer };

export const SECURE_STORAGE_EVENT = "vaultlab-secure-storage-change";

let activeKey: CryptoKey | null = null;

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

const dispatchStorageEvent = () => {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(SECURE_STORAGE_EVENT));
};

const getMeta = async <T,>(db: IDBDatabase, key: string): Promise<T | undefined> =>
  new Promise<T | undefined>((resolve, reject) => {
    const request = db.transaction(META_STORE_NAME, "readonly").objectStore(META_STORE_NAME).get(key);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
  });

const putMeta = async (db: IDBDatabase, key: string, value: unknown) =>
  new Promise<void>((resolve, reject) => {
    const request = db.transaction(META_STORE_NAME, "readwrite").objectStore(META_STORE_NAME).put(value, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });

const getRecord = async (db: IDBDatabase, key: string): Promise<StoredRecord | undefined> =>
  new Promise<StoredRecord | undefined>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve(request.result as StoredRecord | undefined);
    request.onerror = () => reject(request.error);
  });

const putRecord = async (db: IDBDatabase, key: string, record: StoredRecord) =>
  new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put(record, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
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
      else reject(request.error);
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
      transaction.onerror = () => reject(transaction.error);
    });

    const legacyKey = values.values[values.keys.findIndex((key) => key === KEY_ID)] as CryptoKey | undefined;
    if (!legacyKey) return;

    for (let index = 0; index < values.keys.length; index += 1) {
      const recordKey = values.keys[index];
      if (recordKey === KEY_ID) continue;

      const legacyRecord = values.values[index] as StoredRecord;
      const plain = await decryptValue<unknown>(legacyRecord, legacyKey);
      await putRecord(targetDb, String(recordKey), await encryptValue(plain, newKey));
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

  activeKey = candidate;
  await migrateLegacyDb(db, candidate);
  dispatchStorageEvent();
}

export const lockSecureStorage = () => {
  activeKey = null;
  dispatchStorageEvent();
};

export async function readSecure<T>(key: string, fallback: T): Promise<T> {
  if (!activeKey) throw new Error("Secure storage is locked. Unlock it with the storage passphrase.");

  const db = await openDb();
  const record = await getRecord(db, key);
  if (record) return decryptValue<T>(record, activeKey);

  const legacy = localStorage.getItem(key);
  if (!legacy) return fallback;

  const parsed = JSON.parse(legacy) as T;
  await writeSecure(key, parsed);
  const migrated = await getRecord(db, key);
  if (!migrated) throw new Error("Secure storage migration could not be verified.");
  localStorage.removeItem(key);
  return parsed;
}

export async function writeSecure(key: string, value: unknown) {
  if (!activeKey) throw new Error("Secure storage is locked. Unlock it with the storage passphrase.");

  const db = await openDb();
  await putRecord(db, key, await encryptValue(value, activeKey));
  if (!(await getRecord(db, key))) throw new Error("Secure storage write could not be verified.");
  localStorage.removeItem(key);
}