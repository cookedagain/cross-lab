import { useState } from "react";
import { KeyRound, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAiSettings } from "@/hooks/useAiSettings";
import { PRIVACY_NOTICE, useExternalDataConsent } from "@/lib/privacy";

 type AiKeyFormProps = {
  title?: string;
  description?: string;
};

const AiKeyForm = ({
  title = "Connect AI",
  description = "Paste your Gemini API key to unlock the AI features.",
}: AiKeyFormProps) => {
  const { saveKey } = useAiSettings();
  const { consent, accept } = useExternalDataConsent();
  const [value, setValue] = useState("");

  const submit = () => {
    if (!consent) return;
    if (value.trim()) saveKey(value);
  };

  return (
    <div className="rounded-3xl border-2 border-dashed border-primary/40 bg-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
          <KeyRound className="h-4 w-4" />
        </span>
        <div>
          <p className="font-display text-base font-black leading-tight">{title}</p>
          <p className="text-xs font-semibold text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="password"
          value={value}
          onChange={(event) => setValue(event.target.value.slice(0, 300))}
          onKeyDown={(event) => {
            if (event.key === "Enter") submit();
          }}
          placeholder="AIza..."
          className="h-11 rounded-2xl font-mono text-sm"
          autoComplete="off"
        />
        <Button type="button" className="h-11 rounded-2xl font-bold" onClick={submit} disabled={!value.trim() || !consent}>
          Use for this session
        </Button>
      </div>
      {!consent && (
        <div className="mt-3 rounded-2xl bg-amber-50 p-3 text-xs text-amber-950 dark:bg-amber-950/30 dark:text-amber-100">
          <p className="font-bold">Review before enabling AI</p>
          <p className="mt-1 leading-relaxed">{PRIVACY_NOTICE}</p>
          <Button type="button" size="sm" className="mt-2 rounded-xl font-bold" onClick={accept}>
            I understand and consent
          </Button>
        </div>
      )}
      <p className="mt-3 flex items-start gap-1.5 text-[11px] font-semibold leading-relaxed text-muted-foreground">
        <Lock className="mt-0.5 h-3 w-3 shrink-0" />
        The key stays in memory for this tab, is sent to Google only in a request header, and is removed when the tab closes or you remove it. Use a restricted, quota-limited key.
      </p>
    </div>
  );
};

export default AiKeyForm;
