import { hasExternalDataConsent } from "@/lib/privacy";

const LEGACY_KEY_STORAGE = "vault-lab-ai-key";
const KEY_EVENT = "vault-lab-ai-key-change";
const MAX_MESSAGE_CHARS = 6000;
const MAX_HISTORY_MESSAGES = 20;
const MAX_TOTAL_CHARS = 24000;

export const AI_MODEL = "gemini-2.5-flash";
const BASE_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

export type AiRole = "system" | "user" | "assistant";
export type AiMessage = { role: AiRole; content: string };

let inMemoryApiKey = "";

export function getStoredApiKey(): string {
  return inMemoryApiKey;
}

export function setStoredApiKey(key: string) {
  inMemoryApiKey = key.trim().slice(0, 300);
  try {
    // Remove keys saved by older versions immediately. Keys are intentionally
    // held only in this tab's memory and are never persisted.
    localStorage.removeItem(LEGACY_KEY_STORAGE);
    window.dispatchEvent(new Event(KEY_EVENT));
  } catch {
    // ignore browser storage/event failures
  }
}

export function hasApiKey(): boolean {
  return inMemoryApiKey.length > 0;
}

export const AI_KEY_EVENT = KEY_EVENT;

export class MissingKeyError extends Error {
  constructor() {
    super("No API key set");
    this.name = "MissingKeyError";
  }
}

export class PrivacyConsentError extends Error {
  constructor() {
    super("Privacy consent is required before sending vault data to an external service.");
    this.name = "PrivacyConsentError";
  }
}

type CallOptions = {
  temperature?: number;
  json?: boolean;
};

const limitContent = (content: string) => content.trim().slice(0, MAX_MESSAGE_CHARS);

function convertMessagesToGeminiContent(messages: AiMessage[]) {
  const systemParts: string[] = [];
  const contents: { role: "user" | "model"; parts: [{ text: string }] }[] = [];
  let totalChars = 0;

  for (const message of messages.slice(-MAX_HISTORY_MESSAGES)) {
    const content = limitContent(message.content);
    if (!content) continue;
    if (message.role === "system") {
      systemParts.push(content);
      continue;
    }
    if (totalChars + content.length > MAX_TOTAL_CHARS) break;
    totalChars += content.length;
    contents.push({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: content }],
    });
  }

  const systemInstruction = systemParts.length
    ? systemParts.join("\n\n--- FIXED POLICY / UNTRUSTED DATA BOUNDARY ---\n\n")
    : undefined;
  return { contents, systemInstruction };
}

export async function callAI(messages: AiMessage[], options: CallOptions = {}): Promise<string> {
  const key = getStoredApiKey();
  if (!key) throw new MissingKeyError();
  if (!hasExternalDataConsent()) throw new PrivacyConsentError();

  const { contents, systemInstruction } = convertMessagesToGeminiContent(messages);
  const endpoint = `${BASE_ENDPOINT}/${AI_MODEL}:generateContent`;
  const config: Record<string, unknown> = { temperature: options.temperature ?? 0.7 };
  if (options.json) config.responseMimeType = "application/json";

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": key,
      },
      body: JSON.stringify({
        contents,
        ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction }] } } : {}),
        generationConfig: config,
      }),
    });
  } catch {
    throw new Error("Network error — check your connection and try again.");
  }

  if (!response.ok) {
    let detail = `${response.status}`;
    try {
      const data = await response.json();
      detail = data?.error?.message ?? detail;
    } catch {
      // ignore parse failures
    }
    if (response.status === 403) {
      throw new Error("Your API key was rejected (403). Double-check it and re-enter.");
    }
    if (response.status === 429) {
      throw new Error("Rate limited or out of quota (429). Try again shortly.");
    }
    throw new Error(`AI request failed: ${detail}`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
}
