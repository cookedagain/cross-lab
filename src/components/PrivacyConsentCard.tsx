import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRIVACY_NOTICE, useExternalDataConsent } from "@/lib/privacy";

const PrivacyConsentCard = ({ compact = false }: { compact?: boolean }) => {
  const { consent, accept } = useExternalDataConsent();
  if (consent) return null;

  return (
    <div className={`rounded-2xl border border-amber-300 bg-amber-50 p-3 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100 ${compact ? "text-xs" : "text-sm"}`}>
      <p className="flex items-start gap-2 font-bold">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
        Privacy consent required
      </p>
      <p className="mt-1 leading-relaxed">{PRIVACY_NOTICE}</p>
      <Button type="button" size="sm" className="mt-3 rounded-xl font-bold" onClick={accept}>
        I understand — enable external lookups
      </Button>
    </div>
  );
};

export default PrivacyConsentCard;
