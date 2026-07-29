import { useEffect, useState } from "react";
import { KeyRound, LockKeyhole, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  isSecureStorageUnlocked,
  lockSecureStorage,
  SECURE_STORAGE_EVENT,
  unlockSecureStorage,
} from "@/lib/secureStorage";
import { showError, showSuccess } from "@/utils/toast";

const VaultSessionGuard = ({ children }: { children: React.ReactNode }) => {
  const [unlocked, setUnlocked] = useState(isSecureStorageUnlocked);

  useEffect(() => {
    const sync = () => setUnlocked(isSecureStorageUnlocked());
    window.addEventListener(SECURE_STORAGE_EVENT, sync);
    return () => window.removeEventListener(SECURE_STORAGE_EVENT, sync);
  }, []);

  const handleUnlock = async () => {
    const passphrase = window.prompt("Create or enter your secure vault passphrase (12+ characters):");
    if (!passphrase) return;

    try {
      await unlockSecureStorage(passphrase);
      setUnlocked(true);
      showSuccess("Secure vault unlocked for this browser session.");
    } catch (error) {
      showError(error instanceof Error ? error.message : "Secure storage could not be unlocked.");
    }
  };

  if (!unlocked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
        <section className="w-full max-w-lg rounded-[2rem] border-2 border-amber-300 bg-card p-6 shadow-sm dark:border-amber-900">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
              <ShieldAlert className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-2xl font-black">Vault locked</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Sensitive vault, clone, breeding, and rotation records stay hidden until you unlock them. The vault will lock after inactivity and whenever this tab is backgrounded.
              </p>
            </div>
          </div>
          <Button type="button" className="mt-6 h-11 w-full rounded-2xl font-bold" onClick={handleUnlock}>
            <KeyRound className="mr-2 h-4 w-4" />
            Unlock vault
          </Button>
        </section>
      </main>
    );
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-[60]">
        <Button
          type="button"
          variant="outline"
          className="rounded-full border-2 bg-card/95 font-bold shadow-lg backdrop-blur"
          onClick={() => lockSecureStorage()}
        >
          <LockKeyhole className="mr-2 h-4 w-4" />
          Lock vault
        </Button>
      </div>
      {children}
    </>
  );
};

export default VaultSessionGuard;