import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Archive,
  ArrowLeft,
  History,
  Minus,
  Pill,
  Plus,
  RotateCcw,
  Star,
  Trash2,
  RefreshCw,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import CollapsibleSection from "@/components/CollapsibleSection";
import RecommendedProducts from "@/components/RecommendedProducts";
import StashMixer from "@/components/StashMixer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ROTATION_CATEGORIES,
  clampWeight,
  useRotation,
  type RotationCategory,
} from "@/hooks/useRotationStore";

const CATEGORY_STYLES: Record<RotationCategory, string> = {
  Flower: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-900",
  Hash: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-900",
  Rosin: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-200 dark:border-yellow-900",
  Vape: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/50 dark:text-sky-200 dark:border-sky-900",
  Oil: "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/50 dark:text-violet-200 dark:border-violet-900",
  Edible: "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-950/50 dark:text-pink-200 dark:border-pink-900",
  Other: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-700",
};

const StarRating = ({
  value,
  onChange,
  readOnly = false,
}: {
  value: number;
  onChange?: (next: number) => void;
  readOnly?: boolean;
}) => (
  <span className="inline-flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, index) => {
      const filled = index < value;
      return (
        <button
          key={index}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(index + 1)}
          className={`text-amber-500 ${readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"} transition`}
          aria-label={`${index + 1} star${index === 0 ? "" : "s"}`}
        >
          <Star className={`h-4 w-4 ${filled ? "fill-current" : "opacity-30"}`} />
        </button>
      );
    })}
  </span>
);

type ProductInfoInput = {
  name: string;
  category: RotationCategory;
  thc: number;
  cbd: number;
  notes: string;
};

const getPotencyInfo = (product: ProductInfoInput) => {
  if (product.cbd >= 20 && product.thc <= 2) return "CBD-dominant / low intoxication";
  if (product.cbd >= 8 && product.thc >= 5) return "Balanced THC:CBD";
  if (product.category === "Vape" || product.category === "Rosin") return "Very high potency / rapid onset";
  if (product.category === "Hash") return "High potency / longer body effect";
  if (product.thc >= 26) return "High THC";
  if (product.thc >= 18) return "Moderate THC";
  return "Low-to-moderate potency";
};

const inferEffects = (product: ProductInfoInput) => {
  const text = `${product.name} ${product.notes}`.toLowerCase();
  if (product.cbd >= 20 && product.thc <= 2) return ["Calming", "Clear", "Daytime-friendly"];
  if (/diesel|sour|haze|jack|lemon|vape|sativa/i.test(text)) return ["Uplifting", "Fast relief", "Functional"];
  if (/pink|kush|cookies|gelato|indica|night|sleep|hash|rosin/i.test(text)) return ["Relaxing", "Body comfort", "Sleepy"];
  if (product.thc >= 26) return ["Strong relief", "Heavy", "Appetite support"];
  return ["Balanced", "Comfort", "Mood support"];
};

const inferTreatmentUses = (product: ProductInfoInput) => {
  const text = `${product.name} ${product.notes}`.toLowerCase();
  const effects = inferEffects(product).join(" ").toLowerCase();
  if (product.cbd >= 20 && product.thc <= 2) return ["Anxiety", "Inflammation", "Daytime baseline support"];
  if (/sleepy|relaxing|body|heavy/.test(effects)) return ["Insomnia", "Pain", "Muscle tension"];
  if (/uplifting|functional|fast/.test(effects)) return ["Breakthrough symptoms", "Fatigue", "Low mood"];
  return ["Stress", "Mild pain", "Appetite support"];
};

const getProductBlurb = (product: ProductInfoInput) => {
  const potency = getPotencyInfo(product).toLowerCase();
  const effects = inferEffects(product).join(", ").toLowerCase();
  return `${product.name} reads as a ${potency} ${product.category.toLowerCase()} option with ${effects} effects based on its format, potency, and your notes.`;
};

const Rotation = () => {
  const {
    products,
    archived,
    addProduct,
    updateRemaining,
    updateRating,
    removeProduct,
    archiveProduct,
    restoreProduct,
    removeArchived,
  } = useRotation();

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState<RotationCategory>("Flower");
  const [thc, setThc] = useState(20);
  const [cbd, setCbd] = useState(0);
  const [startWeight, setStartWeight] = useState(10);
  const [notes, setNotes] = useState("");

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    addProduct({
      name: trimmed,
      brand: brand.trim(),
      category,
      thc: Number(thc) || 0,
      cbd: Number(cbd) || 0,
      startWeight: clampWeight(startWeight),
      remainingWeight: clampWeight(startWeight),
      notes: notes.trim(),
      rating: 0,
    });
    setName("");
    setBrand("");
    setThc(20);
    setCbd(0);
    setStartWeight(10);
    setNotes("");
  };

  const totals = useMemo(() => {
    const totalProducts = products.length;
    const totalRemaining = products.reduce((sum, product) => sum + product.remainingWeight, 0);
    const totalStart = products.reduce((sum, product) => sum + product.startWeight, 0);
    return {
      totalProducts,
      totalRemaining: Math.round(totalRemaining * 100) / 100,
      totalStart: Math.round(totalStart * 100) / 100,
    };
  }, [products]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/70 bg-card/90 backdrop-blur">
        <div className="container flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <Pill className="h-6 w-6" />
            </span>
            <div>
              <p className="font-display text-2xl font-black tracking-tight">Current Rotation</p>
              <p className="text-sm text-muted-foreground">Medical cannabis products you're running right now</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border-2 border-border bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Seed vault
            </Link>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-2xl border-2"
              onClick={() => window.location.reload()}
              title="Refresh page"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container max-w-5xl pb-20 pt-8">
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-[1.75rem] border-2 border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-muted-foreground">Products</p>
            <p className="mt-2 font-display text-4xl font-black">{totals.totalProducts}</p>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">in rotation</p>
          </div>
          <div className="rounded-[1.75rem] border-2 border-primary/30 bg-primary/5 p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Remaining</p>
            <p className="mt-2 font-display text-4xl font-black text-primary">{totals.totalRemaining}g</p>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">across all products</p>
          </div>
          <div className="rounded-[1.75rem] border-2 border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-muted-foreground">Previously used</p>
            <p className="mt-2 font-display text-4xl font-black">{archived.length}</p>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">in your history</p>
          </div>
        </section>

        <CollapsibleSection
          title="Add a product"
          icon={<Plus className="h-5 w-5" />}
          description="Log what you currently have in rotation, including its starting weight."
        >
          <div className="rounded-3xl border border-border bg-background p-4">
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleAdd();
              }}
              placeholder="Product / strain name (e.g. Pink Kush)"
              className="mb-3 h-11 rounded-2xl font-semibold"
            />
            <Input
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
              placeholder="Brand / producer (e.g. Little Green Pharma)"
              className="mb-3 h-11 rounded-2xl font-semibold"
            />
            <Input
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Notes (effects, time of day, batch…)"
              className="mb-3 h-11 rounded-2xl font-semibold"
            />

            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground">Category:</span>
              {ROTATION_CATEGORIES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setCategory(option)}
                  className={`rounded-full border px-3 py-1 text-xs font-black transition ${
                    category === option
                      ? CATEGORY_STYLES[option]
                      : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="rounded-2xl border border-border bg-card p-3">
                <span className="block text-[10px] font-black uppercase tracking-wide text-muted-foreground">THC %</span>
                <Input
                  type="number"
                  min={0}
                  value={thc}
                  onChange={(event) => setThc(Number(event.target.value))}
                  className="mt-1 h-9 border-0 bg-transparent p-0 text-lg font-black shadow-none focus-visible:ring-0"
                />
              </label>
              <label className="rounded-2xl border border-border bg-card p-3">
                <span className="block text-[10px] font-black uppercase tracking-wide text-muted-foreground">CBD %</span>
                <Input
                  type="number"
                  min={0}
                  value={cbd}
                  onChange={(event) => setCbd(Number(event.target.value))}
                  className="mt-1 h-9 border-0 bg-transparent p-0 text-lg font-black shadow-none focus-visible:ring-0"
                />
              </label>
              <label className="rounded-2xl border border-border bg-card p-3">
                <span className="block text-[10px] font-black uppercase tracking-wide text-muted-foreground">Start weight (g)</span>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={startWeight}
                  onChange={(event) => setStartWeight(Number(event.target.value))}
                  className="mt-1 h-9 border-0 bg-transparent p-0 text-lg font-black shadow-none focus-visible:ring-0"
                />
              </label>
            </div>

            <Button type="button" className="mt-4 h-11 rounded-2xl font-bold" onClick={handleAdd} disabled={!name.trim()}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add to rotation
            </Button>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="In rotation"
          icon={<Pill className="h-5 w-5" />}
          description="Rate each product and adjust remaining weight as you use it. When you finish one, send it to your history."
          badge={
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
              {products.length}
            </span>
          }
        >
          {products.length === 0 ? (
            <p className="rounded-2xl bg-muted/50 p-4 text-sm font-semibold text-muted-foreground">
              Nothing in rotation yet. Add your current medical cannabis products above to start tracking weights.
            </p>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {products.map((product) => {
                const used = Math.max(0, product.startWeight - product.remainingWeight);
                const pct = product.startWeight > 0 ? (product.remainingWeight / product.startWeight) * 100 : 0;
                return (
                  <div key={product.id} className="rounded-3xl border border-border bg-background p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${CATEGORY_STYLES[product.category]}`}>
                            {product.category}
                          </span>
                          {product.brand && (
                            <span className="text-xs font-semibold text-muted-foreground">{product.brand}</span>
                          )}
                        </div>
                        <p className="font-display text-lg font-bold leading-tight">{product.name}</p>
                        <p className="mt-0.5 text-[11px] font-bold text-muted-foreground">
                          THC {product.thc}% · CBD {product.cbd}%
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary"
                          onClick={() => archiveProduct(product.id)}
                          title="Move to previously used"
                        >
                          <Archive className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive"
                          onClick={() => removeProduct(product.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {product.notes && (
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{product.notes}</p>
                    )}

                    <div className="mt-3 rounded-2xl bg-primary/10 p-3">
                      <p className="text-[10px] font-black uppercase tracking-wide text-primary">Product info</p>
                      <p className="mt-1 text-xs font-semibold leading-relaxed text-foreground">{getProductBlurb(product)}</p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        <div className="rounded-xl bg-card p-2">
                          <p className="text-[9px] font-black uppercase text-muted-foreground">Potency</p>
                          <p className="mt-0.5 text-[11px] font-bold">{getPotencyInfo(product)}</p>
                        </div>
                        <div className="rounded-xl bg-card p-2">
                          <p className="text-[9px] font-black uppercase text-muted-foreground">Effects</p>
                          <p className="mt-0.5 text-[11px] font-bold">{inferEffects(product).join(", ")}</p>
                        </div>
                        <div className="rounded-xl bg-card p-2">
                          <p className="text-[9px] font-black uppercase text-muted-foreground">May help with</p>
                          <p className="mt-0.5 text-[11px] font-bold">{inferTreatmentUses(product).join(", ")}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[11px] font-bold text-muted-foreground">Your rating:</span>
                      <StarRating value={product.rating} onChange={(next) => updateRating(product.id, next)} />
                    </div>

                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-[11px] font-bold">
                        <span>Remaining</span>
                        <span>
                          {product.remainingWeight}g / {product.startWeight}g
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="mt-1 text-[10px] font-semibold text-muted-foreground">Used {Math.round(used * 100) / 100}g so far</p>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold text-muted-foreground">Adjust:</span>
                      {[-1, -0.5, -0.1].map((step) => (
                        <Button
                          key={step}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-full border-2 px-2.5 text-xs font-bold"
                          onClick={() => updateRemaining(product.id, product.remainingWeight + step)}
                        >
                          <Minus className="mr-0.5 h-3 w-3" />
                          {Math.abs(step)}g
                        </Button>
                      ))}
                      <div className="flex items-center rounded-full border border-border bg-card p-1">
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={product.remainingWeight}
                          onChange={(event) => updateRemaining(product.id, Number(event.target.value))}
                          className="h-7 w-20 border-0 bg-transparent p-0 text-center text-sm font-black shadow-none focus-visible:ring-0"
                        />
                        <span className="pr-2 text-xs font-bold text-muted-foreground">g</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CollapsibleSection>

        {/* Stash Mixer Section */}
        <StashMixer />

        <CollapsibleSection
          title="Previously used"
          icon={<History className="h-5 w-5" />}
          description="Products you've finished or moved out of rotation. Restore one to bring it back, with your rating kept."
          badge={
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-black text-muted-foreground">
              {archived.length}
            </span>
          }
          defaultOpen={false}
        >
          {archived.length === 0 ? (
            <p className="rounded-2xl bg-muted/50 p-4 text-sm font-semibold text-muted-foreground">
              Nothing here yet. When you finish a product, use the archive button to move it into your history.
            </p>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {archived.map((product) => (
                <div key={product.id} className="rounded-3xl border border-border bg-muted/30 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${CATEGORY_STYLES[product.category]}`}>
                          {product.category}
                        </span>
                        {product.brand && (
                          <span className="text-xs font-semibold text-muted-foreground">{product.brand}</span>
                        )}
                      </div>
                      <p className="font-display text-lg font-bold leading-tight">{product.name}</p>
                      <p className="mt-0.5 text-[11px] font-bold text-muted-foreground">
                        THC {product.thc}% · CBD {product.cbd}% · finished {new Date(product.archivedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary"
                        onClick={() => restoreProduct(product.id)}
                        title="Restore to rotation"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive"
                        onClick={() => removeArchived(product.id)}
                        title="Delete from history"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {product.notes && (
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{product.notes}</p>
                  )}

                  <div className="mt-3 rounded-2xl bg-background p-3">
                    <p className="text-[10px] font-black uppercase tracking-wide text-primary">Product info</p>
                    <p className="mt-1 text-xs font-semibold leading-relaxed text-foreground">{getProductBlurb(product)}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">
                        {getPotencyInfo(product)}
                      </span>
                      {inferEffects(product).map((effect) => (
                        <span key={effect} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-black text-muted-foreground">
                          {effect}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 text-[11px] font-semibold text-muted-foreground">
                      Used for: {inferTreatmentUses(product).join(", ")}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[11px] font-bold text-muted-foreground">Rated:</span>
                    <StarRating value={product.rating} readOnly />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CollapsibleSection>

        <RecommendedProducts />
      </main>
    </div>
  );
};

export default Rotation;