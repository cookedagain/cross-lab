// Lightweight AI client for Vault Lab.
//
// To keep things simple for a personal tool, the user supplies their own
// Gemini API key, which is stored in localStorage and used to call the
// Gemini API directly from the browser. No key ships with
// the app and nothing is sent anywhere except Google.

const KEY_STORAGE = "vault-lab-ai-key";
const KEY_EVENT = "vault-lab-ai-key-change";

export const AI_MODEL = "gemini-2.5-flash";
const BASE_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

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

// Helper to convert OpenAI-style messages to Gemini-style content
function convertMessagesToGeminiContent(messages: AiMessage[]) {
  const contents = [];
  let systemInstruction = "";

  for (const message of messages) {
    if (message.role === "system") {
      // Gemini uses a systemInstruction field for system messages
      systemInstruction = message.content;
      continue;
    }

    // Map roles: 'user' -> 'user', 'assistant' -> 'model'
    const role = message.role === "assistant" ? "model" : "user";
    contents.push({
      role: role,
      parts: [{ text: message.content }],
    });
  }

  return { contents, systemInstruction };
}

export async function callAI(messages: AiMessage[], options: CallOptions = {}): Promise<string> {
  const key = getStoredApiKey();
  if (!key) throw new MissingKeyError();

  const { contents, systemInstruction } = convertMessagesToGeminiContent(messages);

  const endpoint = `${BASE_ENDPOINT}/${AI_MODEL}:generateContent?key=${key}`;

  const config: any = {
    temperature: options.temperature ?? 0.7,
  };

  if (options.json) {
    // Use responseMimeType for JSON output
    config.responseMimeType = "application/json";
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: contents,
        config: {
          ...config,
          ...(systemInstruction ? { systemInstruction } : {}),
        },
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
  // Gemini response structure: data.candidates[0].content.parts[0].text
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
}
