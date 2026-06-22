import { useState } from "react";
import { KeyRound, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAiSettings } from "@/hooks/useAiSettings";

type AiKeyFormProps = {
  title?: string;
  description?: string;
};

const AiKeyForm = ({
  title = "Connect AI",
  description = "Paste your OpenAI API key to unlock the AI features.",
}: AiKeyFormProps) => {
  const { saveKey } = useAiSettings();
  const [value, setValue] = useState("");

  const submit = () => {
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
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") submit();
          }}
          placeholder="sk-..."
          className="h-11 rounded-2xl font-mono text-sm"
          autoComplete="off"
        />
        <Button type="button" className="h-11 rounded-2xl font-bold" onClick={submit} disabled={!value.trim()}>
          Save key
        </Button>
      </div>
      <p className="mt-3 flex items-start gap-1.5 text-[11px] font-semibold leading-relaxed text-muted-foreground">
        <Lock className="mt-0.5 h-3 w-3 shrink-0" />
        Your key is stored only in this browser and is sent straight to OpenAI — never to any other server.
        Get one at platform.openai.com/api-keys.
      </p>
    </div>
  );
};

export default AiKeyForm;
