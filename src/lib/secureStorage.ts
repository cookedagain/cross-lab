const DB_NAME = "vaultlab-secure-storage-v1";
const STORE_NAME = "records";
const KEY_ID = "origin-key";

type StoredRecord = { iv: ArrayBuffer; ciphertext: ArrayBuffer };

const openDb = () => new Promise<IDBDatabase>((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, 1);
  request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

const getKey = async () => {
  const db = await openDb();
  const existing = await new Promise<CryptoKey | undefined>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(KEY_ID);
    request.onsuccess = () => resolve(request.result as CryptoKey | undefined);
    request.onerror = () => reject(request.error);
  });
  if (existing) return existing;
  const created = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  await new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put(created, KEY_ID);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  return created;
};

export async function readSecure<T>(key: string, fallback: T): Promise<T> {
  try {
    const db = await openDb();
    const cryptoKey = await getKey();
    const record = await new Promise<StoredRecord | undefined>((resolve, reject) => {
      const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(key);
      request.onsuccess = () => resolve(request.result as StoredRecord | undefined);
      request.onerror = () => reject(request.error);
    });
    if (record) {
      const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(record.iv) }, cryptoKey, record.ciphertext);
      return JSON.parse(new TextDecoder().decode(plain)) as T;
    }
    const legacy = localStorage.getItem(key);
    if (legacy) {
      const parsed = JSON.parse(legacy) as T;
      await writeSecure(key, parsed);
      return parsed;
    }
  } catch {
    // Return the supplied safe fallback for corrupt or unavailable storage.
  }
  return fallback;
}

export async function writeSecure(key: string, value: unknown) {
  try {

    const db = await openDb();
    const cryptoKey = await getKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      new TextEncoder().encode(JSON.stringify(value)),
    );
    const record: StoredRecord = { iv: iv.buffer, ciphertext };
    await new Promise<void>((resolve, reject) => {
      const request = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put(record, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    localStorage.removeItem(key);
  } catch {
    // Keep the app usable if IndexedDB or Web Crypto is unavailable.
  }
}
