import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bot, Loader2, Send, Sparkles, User } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AiKeyForm from "@/components/AiKeyForm";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import { useAiSettings } from "@/hooks/useAiSettings";
import { useExternalDataConsent } from "@/lib/privacy";
import { useVault } from "@/hooks/useVaultStore";
import { askVaultChat, type ChatTurn } from "@/lib/aiFeatures";
import { confidenceMeta } from "@/lib/confidence";

const QUICK_PROMPTS = [
  "Which keepers should I protect first?",
  "Best beginner-friendly strains in my vault?",
  "Highest estimated THC picks",
  "Most mold-resistant for a humid grow",
  "Suggest a gassy cross to hunt",
];

const AiVaultChat = () => {
  const { hasKey, clearKey } = useAiSettings();
  const { consent } = useExternalDataConsent();

  const { vaultSeeds, getSeedCount } = useVault();
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!consent) {
      setMessages([]);
      setInput("");
      setError("");
    }
  }, [consent]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || loading) return;
    setError("");
    const history = messages;
    setMessages((current) => [...current, { role: "user", content: question }]);
    setInput("");
    setLoading(true);
    try {
      const reply = await askVaultChat(question, history, vaultSeeds, getSeedCount);
      setMessages((current) => [...current, { role: "assistant", content: reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-primary bg-primary/10 px-3 py-1.5 text-xs font-black text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Ask AI
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border p-5 text-left">
          <SheetTitle className="flex items-center gap-2 font-display">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Bot className="h-4 w-4" />
            </span>
            Vault sommelier
          </SheetTitle>
          <SheetDescription>Ask about your strains — answers are grounded in your vault.</SheetDescription>
          <div className="flex items-center justify-between gap-2 pt-1">
            <ConfidenceBadge meta={confidenceMeta.aiGenerated} />
            {hasKey && <button type="button" className="text-[10px] font-bold text-muted-foreground underline" onClick={clearKey}>Remove session key</button>}
          </div>
        </SheetHeader>

        {!hasKey ? (
          <div className="p-5">
            <AiKeyForm description="Paste your Gemini API key to chat with your vault for this session." />
          </div>
        ) : (
          <>
            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-muted-foreground">Try one of these:</p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => send(prompt)}
                        className="rounded-full border-2 border-border bg-card px-3 py-1.5 text-left text-xs font-bold text-muted-foreground transition hover:border-primary hover:text-primary"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-2 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                      message.role === "user"
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {message.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                  </span>
                  <div
                    className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-card text-foreground"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking…
                </div>
              )}

              {error && (
                <p className="rounded-2xl bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive">
                  {error}
                </p>
              )}
            </div>

            <div className="border-t border-border p-4">
              <p className="mb-2 text-[10px] font-semibold leading-relaxed text-muted-foreground">
                Tip: tap a strain name in the vault to open its{" "}
                <Link to="/" className="font-bold text-primary hover:underline">
                  detail page
                </Link>
                .
              </p>
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") send(input);
                  }}
                  placeholder="Ask about your vault…"
                  className="h-11 rounded-2xl font-semibold"
                  disabled={loading}
                />
                <Button
                  type="button"
                  className="h-11 w-11 shrink-0 rounded-2xl p-0"
                  onClick={() => send(input)}
                  disabled={loading || !input.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default AiVaultChat;