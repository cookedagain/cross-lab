const ENVELOPE_VERSION = 1;
const PBKDF2_ITERATIONS = 250000;

type BackupEnvelope = {
  version: number;
  algorithm: "AES-GCM";
  iterations: number;
  salt: string;
  iv: string;
  ciphertext: string;
};

const toBase64 = (bytes: Uint8Array) => {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

const fromBase64 = (value: string) => {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
};

const deriveKey = async (passphrase: string, salt: Uint8Array) => {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
};

export async function encryptBackup(json: string, passphrase: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(json));
  const envelope: BackupEnvelope = {
    version: ENVELOPE_VERSION,
    algorithm: "AES-GCM",
    iterations: PBKDF2_ITERATIONS,
    salt: toBase64(salt),
    iv: toBase64(iv),
    ciphertext: toBase64(new Uint8Array(ciphertext)),
  };
  return JSON.stringify(envelope, null, 2);
}

export async function decryptBackup(text: string, passphrase: string): Promise<string> {
  const envelope = JSON.parse(text) as Partial<BackupEnvelope>;
  if (
    envelope.version !== ENVELOPE_VERSION ||
    envelope.algorithm !== "AES-GCM" ||
    !envelope.salt ||
    !envelope.iv ||
    !envelope.ciphertext
  ) {
    throw new Error("This is not an encrypted CrossLab backup.");
  }
  const salt = fromBase64(envelope.salt);
  const iv = fromBase64(envelope.iv);
  const key = await deriveKey(passphrase, salt);
  try {
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, fromBase64(envelope.ciphertext));
    return new TextDecoder().decode(plain);
  } catch {
    throw new Error("The backup password is incorrect or the file was changed.");
  }
}
