import { AlertTriangle, CalendarClock, PackageCheck, PackageOpen } from "lucide-react";
import {
  PIXIE_DIRECTLY_EXCLUDED,
  PIXIE_OUTBOUND_RECORDS,
  VAULT_LEDGER_STATUS,
} from "@/data/vaultStatus";

const VaultLedgerStatus = () => (
  <section className="mb-6 rounded-[2rem] border-2 border-amber-400/50 bg-amber-500/10 p-5 shadow-sm">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="max-w-3xl">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-xs font-black uppercase tracking-[0.18em]">Working ledger · provisional</p>
        </div>
        <h2 className="mt-2 font-display text-2xl font-black">
          {VAULT_LEDGER_STATUS.workingPhysicalSeeds.toLocaleString()} seeds · {VAULT_LEDGER_STATUS.workingPhysicalRows} held rows
        </h2>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-muted-foreground">
          The Pixie65 parcel was sent by registered post on 14 September, but its pinned 71-seed / 11-line composition still requires a physical recount. These post-dispatch figures are working arithmetic, not a confirmed audit.
        </p>
        <p className="mt-2 text-xs font-black text-amber-900 dark:text-amber-100">
          Current gifting floor: retain at least five seeds per cultivar unless Tom approves a named exception. Long-term target: ten.
        </p>
      </div>
      <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-amber-400/40 bg-background/70 px-3 py-2 text-xs font-black text-amber-900 dark:text-amber-100">
        <CalendarClock className="h-4 w-4" />
        Authority · {VAULT_LEDGER_STATUS.authorityDate}
      </span>
    </div>

    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-2xl bg-background/75 p-3">
        <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">Pre-dispatch confirmed</p>
        <p className="mt-1 font-display text-xl font-black">{VAULT_LEDGER_STATUS.preOutboundSeeds.toLocaleString()}</p>
        <p className="text-xs font-semibold text-muted-foreground">{VAULT_LEDGER_STATUS.preOutboundRows} rows</p>
      </div>
      <div className="rounded-2xl bg-background/75 p-3">
        <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">Pinned outbound</p>
        <p className="mt-1 font-display text-xl font-black">−{VAULT_LEDGER_STATUS.provisionalOutboundSeeds}</p>
        <p className="text-xs font-semibold text-muted-foreground">{VAULT_LEDGER_STATUS.provisionalOutboundLines} provisional lines</p>
      </div>
      <div className="rounded-2xl bg-background/75 p-3">
        <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">Count-known incoming</p>
        <p className="mt-1 font-display text-xl font-black">+{VAULT_LEDGER_STATUS.countKnownIncomingSeeds}</p>
        <p className="text-xs font-semibold text-muted-foreground">Not yet physical</p>
      </div>
      <div className="rounded-2xl bg-background/75 p-3">
        <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">Conditional future floor</p>
        <p className="mt-1 font-display text-xl font-black">{VAULT_LEDGER_STATUS.workingFutureFloor.toLocaleString()}</p>
        <p className="text-xs font-semibold text-muted-foreground">Also provisional</p>
      </div>
    </div>

    <details className="mt-4 rounded-2xl border border-amber-400/30 bg-background/70 p-4">
      <summary className="cursor-pointer list-none text-sm font-black text-foreground">
        Review the pinned Pixie65 outbound record
      </summary>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-xs">
          <thead className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="pb-2 pr-4">Cultivar</th>
              <th className="pb-2 pr-4">Source</th>
              <th className="pb-2 pr-4">Pre-send</th>
              <th className="pb-2 pr-4">Sent</th>
              <th className="pb-2">Working retained</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70 font-semibold">
            {PIXIE_OUTBOUND_RECORDS.map((record) => (
              <tr key={`${record.breeder}-${record.cultivar}`}>
                <td className="py-2 pr-4 text-foreground">{record.cultivar}</td>
                <td className="py-2 pr-4 text-muted-foreground">{record.breeder}</td>
                <td className="py-2 pr-4">{record.preSend}</td>
                <td className="py-2 pr-4">{record.provisionalSent}</td>
                <td className="py-2">{record.workingRetained}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <p className="flex items-start gap-2 rounded-xl bg-muted/60 p-3 text-xs font-semibold leading-relaxed text-muted-foreground">
          <PackageCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          Dispatch is confirmed. Postage was 3 × A$1.85 = A$5.55.
        </p>
        <div className="rounded-xl bg-emerald-500/10 p-3 text-xs font-semibold leading-relaxed text-emerald-900 dark:text-emerald-100">
          <p className="mb-1 flex items-center gap-2 font-black"><PackageOpen className="h-4 w-4" />Directly confirmed as not sent</p>
          {PIXIE_DIRECTLY_EXCLUDED.map((item) => <p key={item}>• {item}</p>)}
        </div>
      </div>
    </details>
  </section>
);

export default VaultLedgerStatus;
