import { useCallback, useEffect, useState } from "react";

export type ExternalFeature = "cannareviews" | "lineage" | "breeder";

const CONSENT_KEYS: Record<ExternalFeature, string> = {
  cannareviews: "vaultlab-external-consent-cannareviews-v1",
  lineage: "vaultlab-external-consent-lineage-v1",
  breeder: "vaultlab-external-consent-breeder-v1",
};

const CONSENT_EVENT = "vaultlab-external-data-consent-change";
const LEGACY_CONSENT_KEY = "vaultlab-external-data-consent-v1";

const EXACT_EXTERNAL_CACHE_KEYS = [
  "vaultlab-cannareviews-cache-v2",
  "crosslab-web-lineage-cache-v4-direct",
  "crosslab-breeder-availability-v2",
];

const consentRevocationHandlers = new Set<() => void>();

export const PRIVACY_NOTICE =
  "External searches are off by default. When you choose a service, only the displayed strain or breeder query is sent to that named public service. Do not enter identifying details, medical notes, secrets, or private notes into names or breeder fields.";

export const cleanExternalText = (value: string, max = 120) =>
  value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/[^\p{L}\p{N}\s#&'().+×x-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

export const hasExternalDataConsent = (feature?: ExternalFeature): boolean => {
  if (typeof window === "undefined") return false;

  if (feature) return window.localStorage.getItem(CONSENT_KEYS[feature]) === "accepted";

  return Object.values(CONSENT_KEYS).some((key) => window.localStorage.getItem(key) === "accepted");
};

export const getExternalConsentState = (): Record<ExternalFeature, boolean> => ({
  cannareviews: hasExternalDataConsent("cannareviews"),
  lineage: hasExternalDataConsent("lineage"),
  breeder: hasExternalDataConsent("breeder"),
});

export const clearExternalDataCaches = () => {
  if (typeof window === "undefined") return;

  const clearStorage = (storage: Storage) => {
    for (const key of Object.keys(storage)) {
      if (EXACT_EXTERNAL_CACHE_KEYS.includes(key) || key.startsWith("crosslab-store-products-v1:")) {
        storage.removeItem(key);
      }
    }
  };

  try {
    clearStorage(window.localStorage);
  } catch {
    // Storage may be unavailable.
  }

  try {
    clearStorage(window.sessionStorage);
  } catch {
    // Storage may be unavailable.
  }
};

export const registerConsentRevocationHandler = (handler: () => void) => {
  consentRevocationHandlers.add(handler);
  return () => consentRevocationHandlers.delete(handler);
};

export const setExternalDataConsent = (feature: ExternalFeature, accepted: boolean) => {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(LEGACY_CONSENT_KEY);
  if (accepted) {
    window.localStorage.setItem(CONSENT_KEYS[feature], "accepted");
  } else {
    window.localStorage.removeItem(CONSENT_KEYS[feature]);
  }

  if (!accepted) clearExternalDataCaches();
  if (!accepted) for (const handler of consentRevocationHandlers) handler();

  window.dispatchEvent(new Event(CONSENT_EVENT));
};

export const revokeAllExternalDataConsent = () => {
  if (typeof window === "undefined") return;

  for (const key of Object.values(CONSENT_KEYS)) window.localStorage.removeItem(key);
  window.localStorage.removeItem(LEGACY_CONSENT_KEY);
  clearExternalDataCaches();
  for (const handler of consentRevocationHandlers) handler();
  window.dispatchEvent(new Event(CONSENT_EVENT));
};

export function useExternalDataConsent(feature: ExternalFeature) {
  const [consent, setConsent] = useState(() => hasExternalDataConsent(feature));

  useEffect(() => {
    const sync = () => setConsent(hasExternalDataConsent(feature));
    window.addEventListener(CONSENT_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CONSENT_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [feature]);

  const accept = useCallback(() => {
    setExternalDataConsent(feature, true);
    setConsent(true);
  }, [feature]);

  const revoke = useCallback(() => {
    setExternalDataConsent(feature, false);
    setConsent(false);
  }, [feature]);

  return { consent, accept, revoke };
}

export function useExternalConsentStatus() {
  const [consents, setConsents] = useState(getExternalConsentState);

  useEffect(() => {
    const sync = () => setConsents(getExternalConsentState());
    window.addEventListener(CONSENT_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CONSENT_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return consents;
}