import { useMemo, useState } from "react";
import { Copy, Dices, Leaf, Sparkles, Check, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import SeedSelect from "@/components/SeedSelect";
import { SEEDS, type Seed } from "@/data/seeds";
import { generateCrossNames, getCrossProfile } from "@/lib/crossName";
import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  const [parentA, setParentA] = useState<Seed | null>(null);
  const [parentB, setParentB] = useState<Seed | null>(null);
  const [salt, setSalt] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);

  const names = useMemo(() => {
    if (!parentA || !parentB) return [];
    return generateCrossNames(parentA, parentB, salt);
  }, [parentA, parentB, salt]);

  const profile = useMemo(() => {
    if (!parentA || !parentB) return null;
    return getCrossProfile(parentA, parentB);
  }, [parentA, parentB]);

  const surprise = () => {
    const a = SEEDS[Math.floor(Math.random() * SEEDS.length)];
    let b = SEEDS[Math.floor(Math.random() * SEEDS.length)];
    while (b.id === a.id) b = SEEDS[Math.floor(Math.random() * SEEDS.length)];
    setParentA(a);
    setParentB(b);
    setSalt((s) => s + 1);
  };

  const copy = async (name: string) => {
    await navigator.clipboard.writeText(name);
    setCopied(name);
    toast.success("Copied to clipboard", { description: name });
    setTimeout(() => setCopied(null), 1500);
  };

  const ready = parentA && parentB;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/60 bg-card/60 backdrop-blur">
        <div className="container flex items-center justify-between py-5">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <Leaf className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <p className="font-display text-xl font-extrabold tracking-tight">
                CrossLab
              </p>
              <p className="text-xs text-muted-foreground">
                Strain cross-name generator
              </p>
            </div>
          </div>
          <span className="hidden rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground sm:inline">
            {SEEDS.length} seeds in your vault
          </span>
        </div>
      </header>

      <main className="container max-w-3xl pb-24 pt-10">
        {/* Hero */}
        <div className="mb-10 text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-secondary px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            Breed something new
          </span>
          <h1 className="font-display text-4xl font-black leading-tight tracking-tight sm:text-5xl">
            Name your next{" "}
            <span className="text-primary">cross</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base text-muted-foreground">
            Pick two seeds from your collection and we'll dream up names for the
            offspring.
          </p>
        </div>

        {/* Selectors */}
        <div className="rounded-3xl border-2 border-border bg-card p-5 shadow-sm sm:p-7">
          <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
            <SeedSelect
              label="A"
              accent="green"
              value={parentA}
              onChange={setParentA}
            />
            <div className="flex items-center justify-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-display text-lg font-bold text-muted-foreground">
                ×
              </span>
            </div>
            <SeedSelect
              label="B"
              accent="purple"
              value={parentB}
              onChange={setParentB}
            />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="h-12 flex-1 rounded-2xl text-base font-semibold"
              disabled={!ready}
              onClick={() => setSalt((s) => s + 1)}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {names.length ? "Regenerate names" : "Generate names"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-2xl border-2 text-base font-semibold"
              onClick={surprise}
            >
              <Dices className="mr-2 h-4 w-4" />
              Surprise me
            </Button>
          </div>
        </div>

        {/* Terpene profile */}
        {ready && profile && (
          <div className="mt-8 rounded-3xl border-2 border-border bg-card p-5 shadow-sm sm:p-7">
            <div className="mb-4 flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-secondary text-accent">
                <FlaskConical className="h-4 w-4" />
              </span>
              <h2 className="font-display text-lg font-bold">
                Expected terpene profile
              </h2>
            </div>

            <p className="mb-5 text-sm text-foreground/80">{profile.summary}</p>

            {profile.terpenes.length > 0 ? (
              <div className="space-y-3">
                {profile.terpenes.map((t) => (
                  <div key={t.key}>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: t.info.color }}
                        />
                        <span className="text-sm font-semibold">
                          {t.info.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {t.info.aroma} · {t.info.effect}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground">
                        {t.share}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${t.share}%`,
                          backgroundColor: t.info.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Not enough flavor data on these parents to estimate terpenes.
              </p>
            )}

            {profile.flavors.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {profile.flavors.map((f) => (
                  <span
                    key={f}
                    className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                  >
                    {f}
                  </span>
                ))}
              </div>
            )}

            <p className="mt-4 text-[11px] leading-snug text-muted-foreground">
              Estimated from parent flavors — actual terpenes vary by phenotype
              and grow.
            </p>
          </div>
        )}

        {/* Results */}
        {ready && names.length > 0 && (
          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="font-display text-lg font-bold">Suggested names</h2>
              <span className="text-xs text-muted-foreground">
                Tap a name to copy
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {names.map((item, i) => (
                <button
                  key={item.name}
                  onClick={() => copy(item.name)}
                  className="group flex items-start justify-between gap-3 rounded-2xl border-2 border-border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary font-display text-sm font-bold text-accent">
                      {i + 1}
                    </span>
                    <span className="flex flex-col gap-1">
                      <span className="font-display text-lg font-bold leading-tight">
                        {item.name}
                      </span>
                      <span className="text-xs leading-snug text-muted-foreground">
                        {item.note}
                      </span>
                    </span>
                  </div>
                  {copied === item.name ? (
                    <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />
                  ) : (
                    <Copy className="mt-1 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {!ready && (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Choose both parents to start generating names.
          </p>
        )}
      </main>

      <MadeWithDyad />
    </div>
  );
};

export default Index;
