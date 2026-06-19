import { useRef } from "react";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVault } from "@/hooks/useVaultStore";
import { showSuccess } from "@/utils/toast";

const VaultBackup = () => {
  const { exportData, importData } = useVault();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `crosslab-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showSuccess("Backup downloaded.");
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => importData(String(reader.result));
    reader.readAsText(file);
    event.target.value = "";
  };

  return (
    <div className="rounded-3xl border border-border bg-background p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-primary">Backup & restore</p>
          <p className="text-sm text-muted-foreground">
            Save your seed counts, Multipass packs, and breeding lots to a file — or restore them on another device.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button type="button" variant="outline" className="rounded-2xl border-2 font-bold" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button type="button" className="rounded-2xl font-bold" onClick={() => fileRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
        </div>
      </div>
    </div>
  );
};

export default VaultBackup;