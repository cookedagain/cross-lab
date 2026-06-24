"use client";

import React, { useState, useMemo } from "react";
import { Blend, Sparkles, HelpCircle, Info, Flame, Moon, Sun, Compass, AlertCircle } from "lucide-react";
import { useRotation } from "@/hooks/useRotationStore";
import { TypeBadge } from "@/components/TypeBadge";
import CollapsibleSection from "@/components/CollapsibleSection";

type StashItem = {
  id: string;
  name: string;
  category: "Flower" | "Cartridge" | "Disposable" | "Edible" | "Concentrate" | "Cannabinoid";
  subCategory?: string;
  thc: number;
  cbd: number;
  cbg?: number;
  cbn?: number;
  primaryEffect: "Heavy/Sedating" | "Balanced/Hybrid" | "Uplifting/Energetic" | "Clear/Medicinal" | "Psychedelic";
  flavors: string[];
  notes?: string;
};

// Pre-populated stash list from the user's prompt
const STASH_PRESETS: StashItem[] = [
  // Flower - Heavy / Evening
  { id: "preset-afghan-layer-cake", name: "Afghan Layer Cake", category: "Flower", subCategory: "Heavy / Evening", thc: 24, cbd: 0.1, primaryEffect: "Heavy/Sedating", flavors: ["Cake", "Hash", "Earth"] },
  { id: "preset-london-pound-cake", name: "London Pound Cake", category: "Flower", subCategory: "Heavy / Evening", thc: 26, cbd: 0.1, primaryEffect: "Heavy/Sedating", flavors: ["Cake", "Berry", "Lemon"] },
  { id: "preset-jealousy", name: "Jealousy", category: "Flower", subCategory: "Heavy / Evening", thc: 27, cbd: 0.1, primaryEffect: "Heavy/Sedating", flavors: ["Gelato", "Gas", "Pepper"] },
  { id: "preset-sherbert-glue", name: "Sherbert Glue", category: "Flower", subCategory: "Heavy / Evening", thc: 25, cbd: 0.1, primaryEffect: "Heavy/Sedating", flavors: ["Sherb", "Glue", "Gas"] },
  { id: "preset-alien-pie", name: "Alien Pie", category: "Flower", subCategory: "Heavy / Evening", thc: 23, cbd: 0.1, primaryEffect: "Heavy/Sedating", flavors: ["Pine", "Sour", "Dough"] },
  
  // Flower - Balanced / Modern Hybrids
  { id: "preset-game-over", name: "Game Over", category: "Flower", subCategory: "Balanced / Modern Hybrids", thc: 24, cbd: 0.1, primaryEffect: "Balanced/Hybrid", flavors: ["Gas", "Sweet", "Funk"] },
  { id: "preset-cali-octane", name: "Cali Octane", category: "Flower", subCategory: "Balanced / Modern Hybrids", thc: 25, cbd: 0.1, primaryEffect: "Balanced/Hybrid", flavors: ["Gas", "Fuel", "Citrus"] },
  { id: "preset-super-boof", name: "Super Boof", category: "Flower", subCategory: "Balanced / Modern Hybrids", thc: 26, cbd: 0.1, primaryEffect: "Balanced/Hybrid", flavors: ["Cherry", "Citrus", "Cookies"] },
  { id: "preset-cosmic-cherry", name: "Cosmic Cherry", category: "Flower", subCategory: "Balanced / Modern Hybrids", thc: 22, cbd: 0.1, primaryEffect: "Balanced/Hybrid", flavors: ["Cherry", "Sweet", "Floral"] },
  
  // Flower - Fruit / Candy
  { id: "preset-lemon-zkittlez", name: "Lemon Zkittlez", category: "Flower", subCategory: "Fruit / Candy", thc: 21, cbd: 0.1, primaryEffect: "Uplifting/Energetic", flavors: ["Lemon", "Candy", "Sweet"] },
  { id: "preset-diesel-dipped-cookies", name: "Diesel Dipped Cookies", category: "Flower", subCategory: "Fruit / Candy", thc: 23, cbd: 0.1, primaryEffect: "Balanced/Hybrid", flavors: ["Diesel", "Cookies", "Dough"] },
  { id: "preset-amethyst", name: "Amethyst", category: "Flower", subCategory: "Fruit / Candy", thc: 22, cbd: 0.1, primaryEffect: "Balanced/Hybrid", flavors: ["Grape", "Sweet", "Berry"] },

  // Cartridges
  { id: "preset-harbour-lr-night", name: "Harbour LR Night (Granddaddy Bruce)", category: "Cartridge", subCategory: "Live Resin", thc: 75, cbd: 1, primaryEffect: "Heavy/Sedating", flavors: ["Grape", "Pine", "Gas"] },
  { id: "preset-apes-in-space", name: "Apes In Space", category: "Cartridge", subCategory: "Live Resin", thc: 78, cbd: 1, primaryEffect: "Heavy/Sedating", flavors: ["Gas", "Earth", "Skunk"] },
  { id: "preset-sour-tangie", name: "Sour Tangie", category: "Cartridge", subCategory: "Live Resin", thc: 72, cbd: 1, primaryEffect: "Uplifting/Energetic", flavors: ["Tangerine", "Sour", "Citrus"] },
  { id: "preset-grapezilla", name: "Grapezilla (Easy-Dose)", category: "Cartridge", subCategory: "Distillate", thc: 85, cbd: 0.5, primaryEffect: "Balanced/Hybrid", flavors: ["Grape", "Sweet", "Candy"] },

  // Disposables
  { id: "preset-peach-crescendo", name: "Peach Crescendo", category: "Disposable", thc: 74, cbd: 1, primaryEffect: "Balanced/Hybrid", flavors: ["Peach", "Citrus", "Gas"] },
  { id: "preset-frosted-oranges", name: "Frosted Oranges", category: "Disposable", thc: 70, cbd: 1, primaryEffect: "Uplifting/Energetic", flavors: ["Orange", "Sweet", "Cream"] },
  { id: "preset-sticky-papaya", name: "Sticky Papaya", category: "Disposable", thc: 73, cbd: 1, primaryEffect: "Heavy/Sedating", flavors: ["Papaya", "Tropical", "Glue"] },

  // Edibles
  { id: "preset-phytoca-gummies", name: "Phytoca 60mg Gummies", category: "Edible", thc: 60, cbd: 0.1, primaryEffect: "Heavy/Sedating", flavors: ["Fruit", "Sweet"] },

  // Concentrates & Cannabinoids
  { id: "preset-dry-sift", name: "Refined Dry Sift", category: "Concentrate", thc: 55, cbd: 1, primaryEffect: "Balanced/Hybrid", flavors: ["Hash", "Earth", "Spicy"] },
  { id: "preset-diamonds", name: "Diamonds", category: "Concentrate", thc: 98, cbd: 0.1, primaryEffect: "Psychedelic", flavors: ["Clean", "Neutral"] },
  { id: "preset-sugar-wax", name: "Sugar Wax", category: "Concentrate", thc: 82, cbd: 0.5, primaryEffect: "Balanced/Hybrid", flavors: ["Sweet", "Gas"] },
  { id: "preset-live-resin-extract", name: "Live Resin Extract", category: "Concentrate", thc: 76, cbd: 1, primaryEffect: "Balanced/Hybrid", flavors: ["Loud", "Terpy", "Gas"] },
  
  // Pure Cannabinoids
  { id: "preset-d8-distillate", name: "Delta-8 Distillate", category: "Cannabinoid", thc: 80, cbd: 0.1, primaryEffect: "Clear/Medicinal", flavors: ["Neutral"], notes: "Mild psychoactive, body comfort" },
  { id: "preset-thc-o", name: "THC-O", category: "Cannabinoid", thc: 90, cbd: 0.1, primaryEffect: "Psychedelic", flavors: ["Neutral"], notes: "Highly introspective, delayed onset" },
  { id: "preset-cbd-isolate", name: "CBD Isolate", category: "Cannabinoid", thc: 0.1, cbd: 99, primaryEffect: "Clear/Medicinal", flavors: ["Neutral"], notes: "Non-intoxicating, anti-anxiety, anti-inflammatory" },
  { id: "preset-cbg-isolate", name: "CBG Isolate", category: "Cannabinoid", thc: 0.1, cbd: 0.1, cbg: 99, primaryEffect: "Clear/Medicinal", flavors: ["Neutral"], notes: "Mental focus, gut health, daytime support" },
  { id: "preset-cbn-isolate", name: "CBN Isolate", category: "Cannabinoid", thc: 0.1, cbd: 0.1, cbn: 99, primaryEffect: "Heavy/Sedating", flavors: ["Neutral"], notes: "Highly sedative, sleep maintenance" },
];

const StashMixer = () => {
  const { products } = useRotation();
  const [itemAId, setItemAId] = useState<string>("");
  const [itemBId, setItemBId] = useState<string>("");

  // Combine active rotation products with presets to give the user a rich selection
  const allAvailableItems = useMemo(() => {
    const rotationItems: StashItem[] = products.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category === "Other" ? "Concentrate" : (p.category as any),
      thc: p.thc,
      cbd: p.cbd,
      primaryEffect: p.thc >= 26 ? "Heavy/Sedating" : p.thc >= 18 ? "Balanced/Hybrid" : "Clear/Medicinal",
      flavors: p.notes ? p.notes.split(",").map((f) => f.trim()) : ["Custom"],
    }));

    // Filter out presets that might duplicate rotation items by name
    const filteredPresets = STASH_PRESETS.filter(
      (preset) => !rotationItems.some((rot) => rot.name.toLowerCase() === preset.name.toLowerCase())
    );

    return [...rotationItems, ...filteredPresets];
  }, [products]);

  const itemA = useMemo(() => allAvailableItems.find((i) => i.id === itemAId) ?? null, [itemAId, allAvailableItems]);
  const itemB = useMemo(() => allAvailableItems.find((i) => i.id === itemBId) ?? null, [itemBId, allAvailableItems]);

  // Calculate the synergy and expected effects of the mix
  const mixReport = useMemo(() => {
    if (!itemA || !itemB) return null;

    const isSame = itemA.id === itemB.id;
    
    // 1. Combined Cannabinoid Profile
    const avgThc = (itemA.thc + itemB.thc) / 2;
    const avgCbd = (itemA.cbd + itemB.cbd) / 2;
    const hasCbg = itemA.cbg || itemB.cbg;
    const hasCbn = itemA.cbn || itemB.cbn;

    // 2. Flavor Synergy
    const combinedFlavors = Array.from(new Set([...itemA.flavors, ...itemB.flavors])).filter(f => f !== "Neutral" && f !== "Custom");
    let flavorProfile = "Balanced Blend";
    if (combinedFlavors.length > 0) {
      if (combinedFlavors.includes("Gas") && (combinedFlavors.includes("Sweet") || combinedFlavors.includes("Candy") || combinedFlavors.includes("Cake"))) {
        flavorProfile = "Sweet Gas / Dessert Fuel";
      } else if (combinedFlavors.includes("Lemon") || combinedFlavors.includes("Citrus") || combinedFlavors.includes("Orange")) {
        flavorProfile = "Zesty Citrus / Fruit Salad";
      } else if (combinedFlavors.includes("Hash") || combinedFlavors.includes("Earth")) {
        flavorProfile = "Spicy Hash / Forest Floor";
      } else {
        flavorProfile = combinedFlavors.slice(0, 3).join(" + ");
      }
    }

    // 3. Effect Synergy & Timing
    let synergyScore = 85; // Base synergy
    let timing: "Daytime" | "Anytime" | "Evening" | "Nighttime" = "Anytime";
    let synergyDescription = "";
    const effects = new Set([itemA.primaryEffect, itemB.primaryEffect]);

    if (effects.has("Heavy/Sedating") && (itemA.cbn || itemB.cbn || effects.has("Heavy/Sedating"))) {
      timing = "Nighttime";
      synergyScore = 95;
      synergyDescription = "Ultimate couch-lock and sleep maintenance. The heavy body load of both profiles stacks to create a deeply sedating evening experience.";
    } else if (effects.has("Heavy/Sedating") && effects.has("Uplifting/Energetic")) {
      timing = "Anytime";
      synergyScore = 78;
      synergyDescription = "A 'push-pull' hybrid effect. You will experience a bright, cerebral onset followed by a soft, comforting body relaxation. Great for social unwinding.";
    } else if (effects.has("Uplifting/Energetic") && (itemA.cbg || itemB.cbg || effects.has("Uplifting/Energetic"))) {
      timing = "Daytime";
      synergyScore = 92;
      synergyDescription = "High-focus, energetic synergy. Perfect for creative tasks, chores, or daytime socializing without heavy brain fog.";
    } else if (effects.has("Clear/Medicinal")) {
      timing = "Daytime";
      synergyScore = 90;
      synergyDescription = "Anxiety-reducing, clear-headed relief. The high CBD/CBG content buffers the psychoactive intensity of the THC, leaving you functional and calm.";
    } else {
      timing = "Evening";
      synergyDescription = "A well-rounded, cozy hybrid experience. Expect a happy mood lift paired with a gentle physical release.";
    }

    // Special Cannabinoid Boosts
    const boosts: string[] = [];
    if (itemA.category === "Cannabinoid" || itemB.category === "Cannabinoid") {
      const cannabinoid = itemA.category === "Cannabinoid" ? itemA : itemB;
      boosts.push(`Infused with pure ${cannabinoid.name} to target specific therapeutic goals.`);
      if (cannabinoid.name.includes("CBD")) {
        boosts.push("CBD infusion: significantly reduces potential THC-induced anxiety and racing thoughts.");
      }
      if (cannabinoid.name.includes("CBG")) {
        boosts.push("CBG infusion: enhances cognitive clarity, focus, and provides digestive comfort.");
      }
      if (cannabinoid.name.includes("CBN")) {
        boosts.push("CBN infusion: triggers rapid sleep onset and deep physical recovery.");
      }
    }

    // Fun Salad Bowl Name
    const nameA = itemA.name.split(" ")[0];
    const nameB = itemB.name.split(" ").slice(-1)[0];
    const saladName = isSame ? itemA.name : `${nameA} ${nameB}`;

    return {
      saladName,
      avgThc,
      avgCbd,
      flavorProfile,
      timing,
      synergyScore,
      synergyDescription,
      boosts,
      isSame,
    };
  }, [itemA, itemB]);

  return (
    <CollapsibleSection
      title="Stash Mixer & Salad Bowl"
      icon={<Blend className="h-5 w-5" />}
      description="Select two strains, cartridges, or pure cannabinoids from your stash to calculate their combined entourage effects, flavor synergy, and optimal timing."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Selector A */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-black uppercase tracking-wide text-muted-foreground">Product A</span>
          <select
            value={itemAId}
            onChange={(e) => setItemAId(e.target.value)}
            className="h-11 w-full rounded-2xl border border-border bg-card px-3 text-sm font-semibold"
          >
            <option value="">— Select first item —</option>
            {allAvailableItems.map((item) => (
              <option key={`a-${item.id}`} value={item.id}>
                [{item.category}] {item.name} ({item.thc}% THC)
              </option>
            ))}
          </select>
          {itemA && (
            <div className="rounded-2xl bg-muted/40 p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold">{itemA.name}</span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">
                  {itemA.primaryEffect}
                </span>
              </div>
              <p className="mt-1 text-muted-foreground">
                THC: {itemA.thc}% · CBD: {itemA.cbd}% · Flavors: {itemA.flavors.join(", ")}
              </p>
            </div>
          )}
        </div>

        {/* Selector B */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-black uppercase tracking-wide text-muted-foreground">Product B</span>
          <select
            value={itemBId}
            onChange={(e) => setItemBId(e.target.value)}
            className="h-11 w-full rounded-2xl border border-border bg-card px-3 text-sm font-semibold"
          >
            <option value="">— Select second item —</option>
            {allAvailableItems.map((item) => (
              <option key={`b-${item.id}`} value={item.id}>
                [{item.category}] {item.name} ({item.thc}% THC)
              </option>
            ))}
          </select>
          {itemB && (
            <div className="rounded-2xl bg-muted/40 p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold">{itemB.name}</span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">
                  {itemB.primaryEffect}
                </span>
              </div>
              <p className="mt-1 text-muted-foreground">
                THC: {itemB.thc}% · CBD: {itemB.cbd}% · Flavors: {itemB.flavors.join(", ")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mix Report Output */}
      {mixReport && (
        <div className="mt-6 rounded-3xl border-2 border-primary/20 bg-background p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wide text-primary">Your Salad Bowl Mix</p>
              <h3 className="font-display text-2xl font-black text-foreground">{mixReport.saladName}</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-black text-primary-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                {mixReport.synergyScore}/100 Synergy
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-black text-muted-foreground">
                {mixReport.timing === "Daytime" && <Sun className="h-3.5 w-3.5 text-amber-500" />}
                {mixReport.timing === "Nighttime" && <Moon className="h-3.5 w-3.5 text-indigo-500" />}
                {mixReport.timing}
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* Combined Potency */}
            <div className="rounded-2xl bg-card p-4">
              <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">Combined Potency</p>
              <p className="mt-1 font-display text-xl font-black text-foreground">
                ~{mixReport.avgThc.toFixed(1)}% THC
              </p>
              <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
                CBD: {mixReport.avgCbd.toFixed(1)}%
              </p>
            </div>

            {/* Flavor Profile */}
            <div className="rounded-2xl bg-card p-4">
              <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">Flavor Synergy</p>
              <p className="mt-1 font-display text-xl font-black text-foreground">
                {mixReport.flavorProfile}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
                Entourage terpene blend
              </p>
            </div>

            {/* Optimal Timing */}
            <div className="rounded-2xl bg-card p-4">
              <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">Best Suited For</p>
              <p className="mt-1 font-display text-xl font-black text-foreground">
                {mixReport.timing === "Daytime" ? "Productivity & Focus" : mixReport.timing === "Nighttime" ? "Deep Sleep & Pain" : "Relaxed Unwinding"}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
                Optimal circadian window
              </p>
            </div>
          </div>

          {/* Synergy Description */}
          <div className="mt-4 rounded-2xl bg-primary/5 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-primary">Expected Effects & Synergy</p>
            <p className="mt-1 text-sm leading-relaxed text-foreground">
              {mixReport.synergyDescription}
            </p>
          </div>

          {/* Cannabinoid Boosts */}
          {mixReport.boosts.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">Cannabinoid Infusion Notes</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {mixReport.boosts.map((boost, idx) => (
                  <div key={idx} className="flex items-start gap-2 rounded-xl border border-border bg-card p-3 text-xs">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <p className="leading-relaxed text-muted-foreground">{boost}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warning for mixing high potency */}
          {mixReport.avgThc > 50 && (
            <div className="mt-4 flex items-start gap-2 rounded-2xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="leading-relaxed">
                <span className="font-bold">High Potency Warning:</span> This mix averages over 50% THC. Expect rapid onset and intense psychoactive effects. Dose conservatively.
              </p>
            </div>
          )}
        </div>
      )}
    </CollapsibleSection>
  );
};

export default StashMixer;