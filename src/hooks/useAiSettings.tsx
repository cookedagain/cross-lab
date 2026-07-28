import { useCallback, useEffect, useState } from "react";
import { AI_KEY_EVENT, getStoredApiKey, setStoredApiKey } from "@/lib/aiClient";

export function useAiSettings() {
  const [apiKey, setApiKey] = useState<string>(() => getStoredApiKey());

  useEffect(() => {
    const sync = () => setApiKey(getStoredApiKey());
    window.addEventListener(AI_KEY_EVENT, sync);
    return () => window.removeEventListener(AI_KEY_EVENT, sync);
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
