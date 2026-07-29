import { useEffect, useRef, useState } from "react";
import { KeyRound, LockKeyhole, ShieldAlert, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVault } from "@/hooks/useVaultStore";
import { decryptBackup, encryptBackup } from "@/lib/backupCrypto";
import {
  isSecureStorageUnlocked,
  SECURE_STORAGE_EVENT,
  unlockSecureStorage,
} from "@/lib/secureStorage";
import { showError, showSuccess } from "@/utils/toast";

const MAX_BACKUP_BYTES = 2 * 1024 * 1024;

const VaultBackup = () => {
  const { exportData, importData } = useVault();
  const fileRef = useRef<HTMLInputElement>(null);
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
      showSuccess("Secure vault storage unlocked for this tab.");
    } catch (error) {
      showError(error instanceof Error ? error.message : "Secure storage could not be unlocked.");
    }
  };

  const handleExport = async () => {
    if (!unlocked) return;
    const passphrase = window.prompt("Create a passphrase for this encrypted backup (12+ characters):");
    if (!passphrase) return;
    if (passphrase.length < 12) {
      showError("Use a backup passphrase with at least 12 characters.");
      return;
    }
    try {
      const encrypted = await encryptBackup(exportData(), passphrase);
      const blob = new Blob([encrypted], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `crosslab-encrypted-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      showSuccess("Encrypted backup downloaded. Keep the passphrase separate from the file.");
    } catch {
      showError("The backup could not be encrypted in this browser.");
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_BACKUP_BYTES) {
      showError("That backup is too large. The maximum supported size is 2 MB.");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const text = String(reader.result);
        const parsed = JSON.parse(text) as { algorithm?: string; ciphertext?: string };
        if (parsed.algorithm !== "AES-GCM" || !parsed.ciphertext) {
          showError("Plain JSON backups are not accepted. Export a new encrypted backup instead.");
          return;
        }
        const passphrase = window.prompt("Enter the backup passphrase:");
        if (!passphrase) return;
        importData(await decryptBackup(text, passphrase));
      } catch (error) {
        showError(error instanceof Error ? error.message : "That backup could not be decrypted.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  return (
    <div className="rounded-3xl border border-border bg-background p-4">
      {!unlocked && (
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="text-sm font-black">Secure vault is locked</p>
              <p className="mt-1 text-xs leading-relaxed">Sensitive records are not read or saved until you unlock them. The passphrase is never stored with the data.</p>
            </div>
          </div>
          <Button type="button" className="rounded-2xl font-bold" onClick={handleUnlock}>
            <KeyRound className="mr-2 h-4 w-4" />
            Unlock vault
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-primary">Backup & restore</p>
          <p className="text-sm text-muted-foreground">Backups are encrypted with a separate passphrase before download. Keep that passphrase separate from the file.</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button type="button" variant="outline" className="rounded-2xl border-2 font-bold" onClick={handleExport} disabled={!unlocked}>
            <LockKeyhole className="mr-2 h-4 w-4" />
            Encrypted export
          </Button>
          <Button type="button" className="rounded-2xl font-bold" onClick={() => fileRef.current?.click()} disabled={!unlocked}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={handleImport} disabled={!unlocked} />
        </div>
      </div>
    </div>
  );
};

export default VaultBackup;