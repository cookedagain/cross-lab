import { useCallback, useEffect, useState } from "react";
import { AI_KEY_EVENT, getStoredApiKey, setStoredApiKey } from "@/lib/aiClient";

// Reactive access to the locally-stored AI API key. All AI components share
// this so entering the key in one place instantly unlocks the others.
export function useAiSettings() {
  const [apiKey, setApiKey] = useState<string>(() => getStoredApiKey());

  useEffect(() => {
    const sync = () => setApiKey(getStoredApiKey());
    window.addEventListener(AI_KEY_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(AI_KEY_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const saveKey = useCallback((key: string) => {
    setStoredApiKey(key);
    setApiKey(getStoredApiKey());
  }, []);

  const clearKey = useCallback(() => {
    setStoredApiKey("");
    setApiKey("");
  }, []);

  return { apiKey, hasKey: apiKey.length > 0, saveKey, clearKey };
}
