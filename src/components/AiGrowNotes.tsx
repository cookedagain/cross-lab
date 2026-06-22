import { useState } from "react";
import { Check, Copy, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import AiKeyForm from "@/components/AiKeyForm";
import { useAiSettings } from "@/hooks/useAiSettings";
import { generateGrowNotes } from "@/lib/aiFeatures";
import type { Seed } from "@/data/seeds";

const TENTS = [
  "Vivosun VGrow smart box (<100W)",
  "AC Infinity 2×2 (220W)",
  "AC Infinity 4×4 (500W)",
];

const SECTION_LABELS: Record<string, string> = {
  "TRAINING:": "Training",
  "FEEDING:": "Feeding",
  "ENVIRONMENT:": "Environment",
  "TIMELINE:": "Timeline",
  "WATCH-OUTS:": "Watch-outs",
};

type Section = { label: string; body: string };

const parseNotes = (text: string): Section[] => {
  const lines = text.split("\n");
  const sections: Section[] = [];
  let current: Section | null = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const headerKey = Object.keys(SECTION_LABELS).find((key) =>
      trimmed.toUpperCase().startsWith(key),
    );
    if (headerKey) {
      if (current) sections.push(current);
      const rest = trimmed.slice(headerKey.length).trim();
      current = { label: SECTION_LABELS[headerKey], body: rest };
    } else if (current) {
      current.body = current.body ? `${current.body} ${trimmed}` : trimmed;
    }
  }
  if (current) sections.push(current);
  return sections;
};

const AiGrowNotes = ({ seed, count }: { seed: Seed; count: number }) => {
  const { hasKey } = useAiSettings();
  const [tent, setTent] = useState(TENTS[1]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const run = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await generateGrowNotes(seed, count, tent);
      setNotes(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(notes);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const sections = notes ? parseNotes(notes) : [];

  return (
    <div className="rounded-3xl border border-border bg-card p-5 lg:col-span-2">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <p className="text-xs font-black uppercase tracking-wide text-primary">AI grow notes</p>
      </div>

      {!hasKey ? (
        <AiKeyForm description="Paste your OpenAI API key to generate grow notes." />
      ) : (
        <>
          <p className="mb-3 text-xs font-semibold text-muted-foreground">
            Tailored guidance grounded in this strain's estimated stretch, flowering time, and resilience.
          </p>
          <div className="mb-3 flex flex-wrap gap-2">
            {TENTS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setTent(option)}
                className={`rounded-full border-2 px-3 py-1 text-xs font-bold transition ${
                  tent === option
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" className="h-10 rounded-2xl font-bold" onClick={run} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {notes ? "Regenerate" : "Generate grow notes"}
            </Button>
            {notes && (
              <Button type="button" variant="outline" className="h-10 rounded-2xl border-2 font-bold" onClick={copy}>
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            )}
          </div>

          {error && (
            <p className="mt-3 rounded-2xl bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive">
              {error}
            </p>
          )}

          {sections.length > 0 && (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {sections.map((section) => (
                <div key={section.label} className="rounded-2xl border border-border bg-background p-3">
                  <p className="mb-1 text-[10px] font-black uppercase tracking-wide text-primary">{section.label}</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">{section.body}</p>
                </div>
              ))}
            </div>
          )}

          {notes && sections.length === 0 && (
            <p className="mt-4 whitespace-pre-wrap rounded-2xl border border-border bg-background p-3 text-xs leading-relaxed text-muted-foreground">
              {notes}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default AiGrowNotes;
