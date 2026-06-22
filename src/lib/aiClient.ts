// Lightweight AI client for Vault Lab.
//
// To keep things simple for a personal tool, the user supplies their own
// OpenAI API key, which is stored in localStorage and used to call the
// OpenAI Chat Completions API directly from the browser. No key ships with
// the app and nothing is sent anywhere except OpenAI.

const KEY_STORAGE = "vault-lab-ai-key";
const KEY_EVENT = "vault-lab-ai-key-change";

export const AI_MODEL = "gpt-4o-mini";
const ENDPOINT = "https://api.openai.com/v1/chat/completions";

export type AiRole = "system" | "user" | "assistant";
export type AiMessage = { role: AiRole; content: string };

export function getStoredApiKey(): string {
  try {
    return localStorage.getItem(KEY_STORAGE) ?? "";
  } catch {
    return "";
  }
}

export function setStoredApiKey(key: string) {
  try {
    const trimmed = key.trim();
    if (trimmed) {
      localStorage.setItem(KEY_STORAGE, trimmed);
    } else {
      localStorage.removeItem(KEY_STORAGE);
    }
    window.dispatchEvent(new Event(KEY_EVENT));
  } catch {
    // ignore storage failures
  }
}

export function hasApiKey(): boolean {
  return getStoredApiKey().length > 0;
}

export const AI_KEY_EVENT = KEY_EVENT;

export class MissingKeyError extends Error {
  constructor() {
    super("No API key set");
    this.name = "MissingKeyError";
  }
}

type CallOptions = {
  temperature?: number;
  json?: boolean;
};

export async function callAI(messages: AiMessage[], options: CallOptions = {}): Promise<string> {
  const key = getStoredApiKey();
  if (!key) throw new MissingKeyError();

  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        temperature: options.temperature ?? 0.7,
        ...(options.json ? { response_format: { type: "json_object" } } : {}),
        messages,
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
    if (response.status === 401) {
      throw new Error("Your API key was rejected (401). Double-check it and re-enter.");
    }
    if (response.status === 429) {
      throw new Error("Rate limited or out of quota (429). Try again shortly.");
    }
    throw new Error(`AI request failed: ${detail}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content?.trim() ?? "";
}
