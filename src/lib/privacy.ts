import { useCallback, useEffect, useState } from "react";

const CONSENT_KEY = "vaultlab-external-data-consent-v1";
const CONSENT_EVENT = "vaultlab-external-data-consent-change";

const EXACT_EXTERNAL_CACHE_KEYS = [
  "vaultlab-cannareviews-cache-v2",
  "crosslab-web-lineage-cache-v4-direct",
  "crosslab-breeder-availability-v2",
];

const consentRevocationHandlers = new Set<() => void>();

export const PRIVACY_NOTICE =
  "External lookup features send only the selected strain or breeder search terms to the named public service and may cache returned snippets locally for up to 24 hours. AI is disabled in this browser-only build; never enter identifying details, medical notes, secrets, or private notes into external features.";

export const hasExternalDataConsent = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(CONSENT_KEY) === "accepted";
};

export const clearExternalDataCaches = () => {
  if (typeof window === "undefined") return;

  const clearStorage = (storage: Storage) => {
    for (const key of Object.keys(storage)) {
      if (
        EXACT_EXTERNAL_CACHE_KEYS.includes(key) ||
        key.startsWith("crosslab-store-products-v1:")
      ) {
        storage.removeItem(key);
      }
    }
  };

  try {
    clearStorage(window.localStorage);
  } catch {
    // Ignore unavailable storage.
  }

  try {
    clearStorage(window.sessionStorage);
  } catch {
    // Ignore unavailable storage.
  }
};

export const registerConsentRevocationHandler = (handler: () => void) => {
  consentRevocationHandlers.add(handler);
  return () => consentRevocationHandlers.delete(handler);
};

export const setExternalDataConsent = (accepted: boolean) => {
  if (typeof window === "undefined") return;

  if (accepted) {
    window.localStorage.setItem(CONSENT_KEY, "accepted");
  } else {
    window.localStorage.removeItem(CONSENT_KEY);
    clearExternalDataCaches();
    for (const handler of consentRevocationHandlers) handler();
  }

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