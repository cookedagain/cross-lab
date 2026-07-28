import { useCallback, useEffect, useState } from "react";

const CONSENT_KEY = "vaultlab-external-data-consent-v1";
const CONSENT_EVENT = "vaultlab-external-data-consent-change";

export const PRIVACY_NOTICE =
  "This feature sends only the minimum selected names and estimates to Google Gemini or the named public lookup service. Do not enter identifying details, medical notes, or secrets in these fields. Results are advisory and third-party services may retain request data.";

export const hasExternalDataConsent = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(CONSENT_KEY) === "accepted";
};

export const setExternalDataConsent = (accepted: boolean) => {
  if (typeof window === "undefined") return;
  if (accepted) window.localStorage.setItem(CONSENT_KEY, "accepted");
  else window.localStorage.removeItem(CONSENT_KEY);
  window.dispatchEvent(new Event(CONSENT_EVENT));
};

export function useExternalDataConsent() {
  const [consent, setConsent] = useState(hasExternalDataConsent);

  useEffect(() => {
    const sync = () => setConsent(hasExternalDataConsent());
    window.addEventListener(CONSENT_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CONSENT_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const accept = useCallback(() => {
    setExternalDataConsent(true);
    setConsent(true);
  }, []);

  const revoke = useCallback(() => {
    setExternalDataConsent(false);
    setConsent(false);
  }, []);

  return { consent, accept, revoke };
}
