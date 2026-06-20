import { useEffect, useMemo, useState } from "react";
import { ExternalLink, RefreshCw, Sparkles, Star } from "lucide-react";
import CollapsibleSection from "@/components/CollapsibleSection";
import { useRotation } from "@/hooks/useRotationStore";
import {
  CATALYST_SITE,
  fetchMedicalCatalog,
  type MedicalCatalog,
  type MedicalProduct,
} from "@/data/medicalProducts";

const StarRow = ({ value }: { value: number }) => (
  <span className="inline-flex items-center gap-0.5 text-amber-500">
    {Array.from({ length: 5 }).map((_, index) => (
      <Star key={index} className={`h-3.5 w-3.5 ${index < Math.round(value) ? "fill-current" : "opacity-30"}`} />
    ))}
  </span>
);

const potencyLabel = (product: Pick<MedicalProduct, "category" | "thc" | "cbd">) => {
  if (product.cbd >= 20 && product.thc <= 2) return "CBD-dominant / non-intoxicating";
  if (product.cbd >= 8 && product.thc >= 5) return "Balanced THC:CBD";
  if (product.category === "Rosin" || product.category === "Vape") return "Very high potency / rapid onset";
  if (product.category === "Hash") return "High potency / longer body effect";
  if (product.thc >= 26) return "High THC";
  if (product.thc >= 18) return "Moderate THC";
  return "Low-to-moderate potency";
};

const fallbackTreatmentUses = (product: Pick<MedicalProduct, "category" | "thc" | "cbd" | "effects">) => {
  if (product.cbd >= 20 && product.thc <= 2) return ["Anxiety", "Inflammation", "Daytime support"];
  if (product.effects.some((effect) => /sleep|heavy|body/i.test(effect))) return ["Insomnia", "Pain", "Muscle tension"];
  if (product.effects.some((effect) => /mood|creative|energetic/i.test(effect))) return ["Low mood", "Fatigue", "Daytime stress"];
  if (product.category === "Vape") return ["Breakthrough symptoms", "Fast relief"];
  return ["Pain", "Stress", "Appetite support"];
};

const infoBlurb = (product: MedicalProduct) =>
  product.description ||
  `${product.name} is a ${potencyLabel(product).toLowerCase()} ${product.category.toLowerCase()} option with ${product.effects.join(", ").toLowerCase()} effects.`;

const RecommendedProducts = () => {
  const { products, archived } = useRotation();
  const [catalog, setCatalog] = useState<MedicalCatalog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchMedicalCatalog()
      .then((result) => {
        if (active) setCatalog(result);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const recommendations = useMemo(() => {
    if (!catalog) return [];
    const ownedBrands = new Set([...products, ...archived].map((p) => p.brand.toLowerCase()));
    const ownedCategories = new Set([...products, ...archived].map((p) => p.category));

    return catalog.items
      .map((item) => {
        const reasons: string[] = [];
        let score = item.rating * 10;
        if (!ownedBrands.has(item.brand.toLowerCase())) {
          score += 8;
          reasons.push(`New brand for you: ${item.brand}`);
        }
        if (ownedCategories.has(item.category)) {
          score += 6;
          reasons.push(`Matches a category you run: ${item.category}`);
        }
        reasons.push(`${potencyLabel(item)} · via ${item.source}`);
        return { item, score: Math.round(score), reasons: reasons.slice(0, 3) };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);
  }, [catalog, products, archived]);

  const syncedLabel = catalog
    ? new Date(catalog.syncedAt).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <CollapsibleSection
      title="Recommended products"
      icon={<Sparkles className="h-5 w-5" />}
      description="Community-reviewed medical products to try next, ranked against your current rotation. Favours new brands and categories you already enjoy."
    >
      <a
        href={CATALYST_SITE}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-4 inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-black text-primary transition hover:bg-primary/20"
      >
        Browse Catalyst
        <ExternalLink className="h-3.5 w-3.5" />
      </a>

      <div className="mb-4 flex items-center gap-2 rounded-2xl bg-muted/50 px-3 py-2 text-xs font-semibold text-muted-foreground">
        <RefreshCw className="h-3.5 w-3.5" />
        Catalog synced {syncedLabel} · refreshes daily
      </div>

      {loading ? (
        <p className="rounded-2xl bg-muted/50 p-4 text-sm font-semibold text-muted-foreground">
          Syncing the medical product catalog…
        </p>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {recommendations.map((rec, index) => {
            const uses = rec.item.treatmentUses?.length ? rec.item.treatmentUses : fallbackTreatmentUses(rec.item);
            return (
              <a
                key={rec.item.id}
                href={rec.item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-3xl border border-border bg-background p-4 transition-colors hover:border-primary"
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-black text-primary">
                      {index + 1}
                    </span>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-muted-foreground">
                      {rec.item.category}
                    </span>
                  </div>
                  <StarRow value={rec.item.rating} />
                </div>

                <p className="font-display text-lg font-bold leading-tight">{rec.item.name}</p>
                <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
                  {rec.item.brand} · THC {rec.item.thc}% · CBD {rec.item.cbd}%
                </p>

                <div className="mt-3 rounded-2xl bg-primary/10 p-3">
                  <p className="text-[10px] font-black uppercase tracking-wide text-primary">Product blurb</p>
                  <p className="mt-1 text-xs font-semibold leading-relaxed text-foreground">{infoBlurb(rec.item)}</p>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-2xl bg-card p-3">
                    <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">Potency</p>
                    <p className="mt-1 text-xs font-bold">{potencyLabel(rec.item)}</p>
                  </div>
                  <div className="rounded-2xl bg-card p-3">
                    <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">Effects</p>
                    <p className="mt-1 text-xs font-bold">{rec.item.effects.join(", ")}</p>
                  </div>
                  <div className="rounded-2xl bg-card p-3">
                    <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">May suit</p>
                    <p className="mt-1 text-xs font-bold">{uses.join(", ")}</p>
                  </div>
                </div>

                <ul className="mt-3 space-y-1.5">
                  {rec.reasons.map((reason) => (
                    <li key={reason} className="flex items-start gap-2 text-xs font-semibold leading-relaxed text-muted-foreground">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </a>
            );
          })}
        </div>
      )}
    </CollapsibleSection>
  );
};

export default RecommendedProducts;
