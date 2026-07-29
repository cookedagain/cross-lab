import { hasExternalDataConsent, registerConsentRevocationHandler } from "@/lib/privacy";

const LEGACY_KEY_STORAGE = "vault-lab-ai-key";
const KEY_EVENT = "vault-lab-ai-key-change";

export const AI_MODEL = "gemini-2.5-flash";

export type AiRole = "system" | "user" | "assistant";
export type AiMessage = { role: AiRole; content: string };

let inMemoryApiKey = "";

export function getStoredApiKey(): string {
  return "";
}

export function setStoredApiKey(_key: string) {
  inMemoryApiKey = "";
  try {
    localStorage.removeItem(LEGACY_KEY_STORAGE);
    window.dispatchEvent(new Event(KEY_EVENT));
  } catch {
    // Browser storage may be unavailable.
  }
}

export function clearSessionApiKey() {
  setStoredApiKey("");
}

export function hasApiKey(): boolean {
  return false;
}

export const AI_KEY_EVENT = KEY_EVENT;

export class MissingKeyError extends Error {
  constructor() {
    super("AI is not configured. Connect a trusted backend before using AI features.");
    this.name = "MissingKeyError";
  }
}

export class AiBackendUnavailableError extends Error {
  constructor() {
    super("AI is disabled in this browser-only build. Connect a trusted backend to enable it.");
    this.name = "AiBackendUnavailableError";
  }
}

export class PrivacyConsentError extends Error {
  constructor() {
    super("Privacy consent is required before sending data to an external service.");
    this.name = "PrivacyConsentError";
  }
}

type CallOptions = {
  temperature?: number;
  json?: boolean;
};

registerConsentRevocationHandler(clearSessionApiKey);

export async function callAI(_messages: AiMessage[], _options: CallOptions = {}): Promise<string> {
  if (!hasExternalDataConsent()) throw new PrivacyConsentError();
  throw new AiBackendUnavailableError();
}