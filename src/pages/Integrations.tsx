import { Link } from "react-router-dom";
import { ArrowLeft, Plug, Server, Bluetooth, Cloud, AlertTriangle, Home, Settings2, Activity } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const Integrations = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-card/90 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                <Plug className="h-4 w-4" />
              </span>
              <h1 className="font-display text-xl font-black">Device Integrations</h1>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container max-w-4xl py-8">
        <div className="mb-8 rounded-3xl bg-muted/50 p-6">
          <h2 className="font-display text-2xl font-black">Connecting AC Infinity & VIVOSUN</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            A reference guide for the two owned AC Infinity Controller AI+ units and the VIVOSUN GrowHub ecosystem. The two planned Spectron 7 AI 4K cameras remain status-to-confirm.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* AC Infinity */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                <Bluetooth className="h-5 w-5" />
              </span>
              <h3 className="font-display text-lg font-bold">AC Infinity</h3>
            </div>
            <ul className="space-y-3 text-sm font-medium text-muted-foreground">
              <li className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                No official public developer API is recorded for the Controller AI+.
              </li>
              <li className="flex items-start gap-2">
                <Settings2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Community reverse-engineering exists, primarily over <strong>Bluetooth</strong> (e.g., <code className="text-xs">jquast/acinf</code>).
              </li>
              <li className="flex items-start gap-2">
                <Server className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Integration requires running a local script or Home Assistant integration to communicate with the controller's Bluetooth payload.
              </li>
            </ul>
          </div>

          {/* Vivosun */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                <Cloud className="h-5 w-5" />
              </span>
              <h3 className="font-display text-lg font-bold">Vivosun GrowHub</h3>
            </div>
            <ul className="space-y-3 text-sm font-medium text-muted-foreground">
              <li className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                No official public local LAN API. It is a cloud-first ecosystem.
              </li>
              <li className="flex items-start gap-2">
                <Settings2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Unofficial projects exist (e.g., <code className="text-xs">pyvivosun</code>, Home Assistant integrations) that reverse-engineer the <strong>cloud API</strong> and MQTT shadows.
              </li>
              <li className="flex items-start gap-2">
                <Server className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Local access is mostly limited to the GrowCam; controller telemetry goes through the cloud.
              </li>
            </ul>
          </div>
        </div>

        {/* Architecture */}
        <div className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Home className="h-5 w-5" />
            </span>
            <h3 className="font-display text-xl font-bold">Recommended Architecture</h3>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-muted/50 p-5">
              <p className="mb-2 font-bold text-foreground">Option A: Home Assistant Bridge (Best)</p>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                Run Home Assistant on the mini-PC. Use community plugins to pull in AC Infinity and Vivosun data. Vault Lab can then query the Home Assistant local API to display a unified dashboard.
              </p>
              <ul className="space-y-1.5 text-xs font-semibold text-muted-foreground">
                <li>✓ Unified local API</li>
                <li>✓ Handles the Bluetooth/Cloud complexity</li>
                <li>✓ Ready-made automations</li>
              </ul>
            </div>
            <div className="rounded-2xl bg-muted/50 p-5">
              <p className="mb-2 font-bold text-foreground">Option B: Custom Backend</p>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                Write a custom Node or Python service running on the mini-PC that continuously polls the community libraries, exposes a local REST API, and feeds this React app.
              </p>
              <ul className="space-y-1.5 text-xs font-semibold text-muted-foreground">
                <li>✓ Maximum control over the data</li>
                <li>✗ Requires maintaining reverse-engineered code</li>
                <li>✗ Rebuilding what Home Assistant already does</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Data points */}
        <div className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
              <Activity className="h-5 w-5" />
            </span>
            <h3 className="font-display text-xl font-bold">Data Points to Surface</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Temperature", "Relative Humidity", "VPD", "Fan Speed", "Light Intensity", "Controller Mode", "Humidifier State", "Active Alarms"].map(metric => (
              <span key={metric} className="rounded-lg bg-muted px-3 py-1.5 text-sm font-semibold text-muted-foreground">
                {metric}
              </span>
            ))}
          </div>
          
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
            <p className="font-bold">Caveats</p>
            <p className="mt-1 leading-relaxed opacity-90">
              Because these integrations are unofficial, they may break if the manufacturer updates firmware or cloud auth. They are great for dashboarding and monitoring, but exercise caution when using them for mission-critical environmental control.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Integrations;
