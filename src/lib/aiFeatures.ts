import type { Seed } from "@/data/seeds";
import { VAULT_LEDGER_STATUS } from "@/data/vaultStatus";
import type { CrossName, NameCategory, TraitGoal } from "@/lib/crossName";
import { AiMessage, callAI } from "@/lib/aiClient";
import {
  buildCrossNameContext,
  buildVaultRoster,
  seedFactSheet,
  SYSTEM_PROMPT,
} from "@/lib/aiContext";

// ---- Feature 4: Grow notes ------------------------------------------------

export async function generateGrowNotes(seed: Seed, count: number, tent: string): Promise<string> {
  const facts = seedFactSheet(seed, count);
  const messages: AiMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content:
        `Write concise, practical grow notes for the strain below, tailored for this setup: ${tent}.\n\n` +
        `${facts}\n\n` +
        `Use these exact section headers, each on its own line followed by 1-3 short sentences:\n` +
        `TRAINING:\nFEEDING:\nENVIRONMENT:\nTIMELINE:\nWATCH-OUTS:\n\n` +
        `Base your advice on the stretch factor, flowering time, mold resilience, ease of grow, and any ` +
        `genetic flags above. Keep it grounded and avoid hype.`,
    },
  ];
  return callAI(messages, { temperature: 0.6 });
}

// ---- Feature 3: AI cross names --------------------------------------------

const VALID_CATEGORIES: NameCategory[] = [
  "Commercial",
  "Terpene-Inspired",
  "Breeder Tribute",
  "Keeper Weirdos",
];

export async function generateAiCrossNames(
  parentA: Seed,
  parentB: Seed,
  goals: TraitGoal[],
): Promise<CrossName[]> {
  const context = buildCrossNameContext(parentA, parentB, goals);
  const messages: AiMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content:
        `Invent creative strain names for this cross. Use the flavor and terpene cues below.\n\n` +
        `${context}\n\n` +
        `Return ONLY JSON of the form: {"names":[{"name":"...","category":"...","note":"..."}]}.\n` +
        `Provide 8 names. "category" must be exactly one of: Commercial, Terpene-Inspired, Breeder Tribute, Keeper Weirdos. ` +
        `"note" is one short sentence explaining the name / predicted nose. Keep names 1-3 words, no quotes inside.`,
    },
  ];

  const raw = await callAI(messages, { temperature: 0.95, json: true });
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("The AI returned an unexpected format. Try again.");
  }

  const list = (parsed as { names?: unknown }).names;
  if (!Array.isArray(list)) throw new Error("The AI returned no names. Try again.");

  const names: CrossName[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const entry = item as Record<string, unknown>;
    const name = typeof entry.name === "string" ? entry.name.trim() : "";
    if (!name) continue;
    const category = VALID_CATEGORIES.includes(entry.category as NameCategory)
      ? (entry.category as NameCategory)
      : "Commercial";
    const note = typeof entry.note === "string" ? entry.note.trim() : "";
    names.push({ name, category, note });
  }

  if (names.length === 0) throw new Error("The AI returned no usable names. Try again.");
  return names;
}

// ---- Feature 1: Vault chat ------------------------------------------------

export type ChatTurn = { role: "user" | "assistant"; content: string };

export async function askVaultChat(
  question: string,
  history: ChatTurn[],
  seeds: Seed[],
  getCount: (seed: Seed) => number,
): Promise<string> {
  const roster = buildVaultRoster(seeds, getCount);
  const messages: AiMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "system",
      content:
        `Ledger authority: ${VAULT_LEDGER_STATUS.authorityDate}. The displayed physical ledger is a WORKING / PROVISIONAL ` +
        `${VAULT_LEDGER_STATUS.workingPhysicalSeeds}-seed, ${VAULT_LEDGER_STATUS.workingPhysicalRows}-row post-dispatch state. ` +
        `Do not call it confirmed until the pinned ${VAULT_LEDGER_STATUS.provisionalOutboundSeeds}-seed Pixie65 parcel is recounted. ` +
        `The pre-dispatch confirmed state was ${VAULT_LEDGER_STATUS.preOutboundSeeds} seeds across ${VAULT_LEDGER_STATUS.preOutboundRows} rows.\n\n` +
        `Here is the working vault roster. Answer using only these cultivars and figures:\n\n${roster}`,
    },
    ...history.map((turn) => ({ role: turn.role, content: turn.content } as AiMessage)),
    { role: "user", content: question },
  ];
  return callAI(messages, { temperature: 0.5 });
}
