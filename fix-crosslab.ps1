# ============================================================
#  CrossLab - fix everything missing
#  Run from the app root:  powershell -ExecutionPolicy Bypass -File .\fix-crosslab.ps1
# ============================================================

$ErrorActionPreference = "Stop"

# Move to the folder this script lives in (the app root)
Set-Location -Path $PSScriptRoot
Write-Host "Working in: $(Get-Location)" -ForegroundColor Cyan

# ------------------------------------------------------------
# 1. Make sure we are actually in a project folder
# ------------------------------------------------------------
if (-not (Test-Path ".\package.json")) {
    Write-Host "ERROR: package.json not found. Run this from your app root." -ForegroundColor Red
    exit 1
}

# ------------------------------------------------------------
# 2. Clean reinstall of dependencies (fixes 'Cannot find module typescript')
# ------------------------------------------------------------
Write-Host "`nRemoving node_modules and lockfile cache..." -ForegroundColor Yellow
if (Test-Path ".\node_modules") { Remove-Item ".\node_modules" -Recurse -Force }

Write-Host "Installing dependencies (npm install)..." -ForegroundColor Yellow
npm install

# Ensure TypeScript is present as a dev dependency
Write-Host "Ensuring TypeScript is installed..." -ForegroundColor Yellow
npm install -D typescript

# ------------------------------------------------------------
# 3. Recreate any missing source files
# ------------------------------------------------------------
function Ensure-File {
    param(
        [string]$Path,
        [string]$Content
    )
    $dir = Split-Path -Parent $Path
    if ($dir -and -not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    if (-not (Test-Path $Path)) {
        Set-Content -Path $Path -Value $Content -Encoding UTF8
        Write-Host "Created: $Path" -ForegroundColor Green
    } else {
        Write-Host "OK (exists): $Path" -ForegroundColor DarkGray
    }
}

# --- src/components/made-with-dyad.tsx ---
$madeWithDyad = @'
export const MadeWithDyad = () => {
  return (
    <div className="p-4 text-center">
      <a
        href="https://www.dyad.sh/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-muted-foreground hover:text-primary"
      >
        Made with Dyad
      </a>
    </div>
  );
};
'@
Ensure-File -Path ".\src\components\made-with-dyad.tsx" -Content $madeWithDyad

# --- src/utils/toast.ts (thin wrapper around sonner) ---
$toastUtil = @'
import { toast } from "sonner";

export const showSuccess = (message: string) => {
  toast.success(message);
};

export const showError = (message: string) => {
  toast.error(message);
};

export const showLoading = (message: string) => {
  return toast.loading(message);
};

export const dismissToast = (toastId: string | number) => {
  toast.dismiss(toastId);
};
'@
Ensure-File -Path ".\src\utils\toast.ts" -Content $toastUtil

# ------------------------------------------------------------
# 4. Type-check to confirm everything resolves
# ------------------------------------------------------------
Write-Host "`nRunning TypeScript check..." -ForegroundColor Yellow
npx tsc --noEmit

Write-Host "`nAll done. Start the app with:  npm run dev" -ForegroundColor Cyan
