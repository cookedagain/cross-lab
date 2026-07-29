import { ShieldCheck, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { revokeAllExternalDataConsent, useExternalConsentStatus } from "@/lib/privacy";

const PrivacyConsentCard = ({ compact = false }: { compact?: boolean }) => {
  const consents = useExternalConsentStatus();
  const enabled = Object.values(consents).filter(Boolean).length;

  return (
    <div className={`rounded-2xl border border-border bg-muted/40 p-3 ${compact ? "text-xs" : "text-sm"}`}>
      <p className="flex items-start gap-2 font-bold">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        External lookup privacy
      </p>
      <p className="mt-1 leading-relaxed text-muted-foreground">
        Searches require separate permission for each service and never run automatically. The exact query is shown before anything is sent.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-background px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
          {enabled}/3 services enabled
        </span>
        {enabled > 0 && (
          <Button type="button" variant="outline" size="sm" className="rounded-xl border-2 font-bold" onClick={revokeAllExternalDataConsent}>
            <ShieldOff className="mr-1.5 h-3.5 w-3.5" />
            Revoke all
          </Button>
        )}
      </div>
    </div>
  );
};

export default PrivacyConsentCard;