import { Lock, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRIVACY_NOTICE, useExternalDataConsent } from "@/lib/privacy";

type AiKeyFormProps = {
  title?: string;
  description?: string;
};

const AiKeyForm = ({
  title = "AI unavailable",
  description = "Private provider keys are not accepted in this browser-only app.",
}: AiKeyFormProps) => {
  const { consent, accept } = useExternalDataConsent();

  return (
    <div className="rounded-3xl border-2 border-dashed border-primary/40 bg-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
          <Server className="h-4 w-4" />
        </span>
        <div>
          <p className="font-display text-base font-black leading-tight">{title}</p>
          <p className="text-xs font-semibold text-muted-foreground">{description}</p>
        </div>
      </div>

      <p className="rounded-2xl bg-muted/60 p-3 text-sm leading-relaxed text-muted-foreground">
        AI requests must go through a trusted backend that keeps the provider credential off this device. This build intentionally does not accept or send Gemini API keys from browser JavaScript.
      </p>

      {!consent && (
        <div className="mt-3 rounded-2xl bg-amber-50 p-3 text-xs text-amber-950 dark:bg-amber-950/30 dark:text-amber-100">
          <p className="font-bold">Review before enabling external features</p>
          <p className="mt-1 leading-relaxed">{PRIVACY_NOTICE}</p>
          <Button type="button" size="sm" className="mt-2 rounded-xl font-bold" onClick={accept}>
            I understand and consent
          </Button>
        </div>
      )}

      <p className="mt-3 flex items-start gap-1.5 text-[11px] font-semibold leading-relaxed text-muted-foreground">
        <Lock className="mt-0.5 h-3 w-3 shrink-0" />
        No private API key is stored, requested, or sent by this browser build.
      </p>
    </div>
  );
};

export default AiKeyForm;