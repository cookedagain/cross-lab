"use client";

import React, { useState, useMemo } from "react";
import { Dices, Sparkles, Sun, Snowflake, Flower, Leaf, ShieldAlert, Award, Flame, User } from "lucide-react";
import { useVault } from "@/hooks/useVaultStore";
import { estimateAdvancedMetrics, estimateLineageSplit, estimateSeedGrowth } from "@/lib/crossName";
import { scaleYieldForStation } from "@/lib/growStations";
import { getSeedRarity } from "@/lib/rarity";
import { TypeBadge } from "@/components/TypeBadge";
import { RarityBadge } from "@/components/RarityBadge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { showSuccess } from "@/utils/toast";
import type { Seed, SeedType } from "@/data/seeds";

type Season = "Summer" | "Autumn" | "Winter" | "Spring";
type StationCategory = "<100W" | "220W" | "500W";

const SEASONS: { value: Season; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: "Summer", label: "Summer", icon: <Sun className="h-4 w-4 text-amber-500" />, desc: "Favors high mold resilience & Sativa-leaning strains for heat/humidity." },
  { value: "Autumn", label: "Autumn", icon: <Leaf className="h-4 w-4 text-orange-500" />, desc: "Balanced conditions. Great for any hybrid or moderate flowering strain." },
  { value: "Winter", label: "Winter", icon: <Snowflake className="h-4 w-4 text-blue-500" />, desc: "Favors fast flowering & Indica-leaning strains to beat the cold." },
  { value: "Spring", label: "Spring", icon: <Flower className="h-4 w-4 text-pink-500" />, desc: "Fresh start. Favors high ease-of-grow and vigorous strains." },
];

const STATIONS: { value: StationCategory; label: string; desc: string }[] = [
  { value: "<100W", label: "VGrow Smart Box (<100W)", desc: "Prefers compact/low-stretch strains and Autoflowers." },
  { value: "220W", label: "AC Infinity 2×2 (220W)", desc: "Prefers compact-to-medium stretch and Feminized/Regulars." },
  { value: "500W", label: "AC Infinity 4×4 (500W)", desc: "Prefers high stretch, high potency, and premium/rare genetics." },
];

const SEED_TYPES: { value: SeedType | "Any"; label: string }[] = [
  { value: "Any", label: "Any Type" },
  { value: "Feminized", label: "Fem" },
  { value: "Regular", label: "Reg" },
  { value: "Autoflower", label: "Auto" },
];

const RandomSeedPicker = () => {
  const { vaultSeeds, getSeedCount, seedWithCount } = useVault();
  const [station, setStation] = useState<StationCategory>("220W");
  const [season, setSeason] = useState<Season>("Spring");
  const [selectedType, setSelectedType] = useState<SeedType | "Any">("Any");
  const [preserveStock, setPreserveStock] = useState(true);
  const [pickedSeed, setPickedSeed] = useState<Seed | null>(null);

  // Recommended/Advanced Filters
  const [selectedBreeder, setSelectedBreeder] = useState<string>("Any");
  const [easyGrowOnly, setEasyGrowOnly] = useState<boolean>(false);
  const [frostMonsterOnly, setFrostMonsterOnly] = useState<boolean>(false);
  const [loudTerpsOnly, setLoudTerpsOnly] = useState<boolean>(false);

  // Get list of breeders currently in stock
  const availableBreeders = useMemo(() => {
    const breeders = new Set<string>();
    vaultSeeds.forEach((seed) => {
      if (getSeedCount(seed) > 0 && !seed.breeder.includes("Burn Pile")) {
        breeders.add(seed.breeder);
      }
    });
    return ["Any", ...Array.from(breeders).sort()];
  }, [vaultSeeds, getSeedCount]);

  const filteredSeeds = useMemo(() => {
    const inStock = vaultSeeds.filter(
      (seed) => !seed.breeder.includes("Burn Pile") && getSeedCount(seed) > 0
    );

    return inStock.filter((seed) => {
      // 1. Seed Type Filter
      if (selectedType !== "Any" && seed.type !== selectedType) {
        return false;
      }

      // 2. Stock Preservation Rule (preserve if count <= 5)
      const count = getSeedCount(seed);
      if (preserveStock && count <= 5) {
        return false;
      }

      // 3. Breeder Filter
      if (selectedBreeder !== "Any" && seed.breeder !== selectedBreeder) {
        return false;
      }

      const adv = estimateAdvancedMetrics(seed);

      // 4. Ease of Grow Filter
      if (easyGrowOnly && adv.easeOfGrow < 4) {
        return false;
      }

      // 5. Frost Monster Filter
      if (frostMonsterOnly && adv.resinDensity < 4) {
        return false;
      }

      // 6. Loud Terps Filter
      if (loudTerpsOnly && adv.terpeneIntensity < 4) {
        return false;
      }

      // 7. Station suitability filter
      if (station === "<100W") {
        // High stretch is tough in a micro box
        if (adv.stretchFactor === "High") return false;
      }

      // 8. Season suitability filter
      const split = estimateLineageSplit(seed);
      if (season === "Summer") {
        // Summer needs mold resilience or sativa lean
        if (adv.moldResilience < 3 && split.sativa < 40) return false;
      } else if (season === "Winter") {
        // Winter needs fast flowering or indica lean
        if (adv.floweringWeeks > 9.5 && split.indica < 40) return false;
      }

      return true;
    });
  }, [
    vaultSeeds,
    getSeedCount,
    station,
    season,
    selectedType,
    preserveStock,
    selectedBreeder,
    easyGrowOnly,
    frostMonsterOnly,
    loudTerpsOnly,
  ]);

  const handlePick = () => {
    if (filteredSeeds.length === 0) {
      setPickedSeed(null);
      return;
    }
    const randomIndex = Math.floor(Math.random() * filteredSeeds.length);
    const selected = filteredSeeds[randomIndex];
    setPickedSeed(selected);
    showSuccess(`Picked ${selected.name}!`);
  };

  const pickedSeedDetails = useMemo(() => {
    if (!pickedSeed) return null;
    const count = getSeedCount(pickedSeed);
    const countedSeed = seedWithCount(pickedSeed);
    const adv = estimateAdvancedMetrics(pickedSeed);
    const split = estimateLineageSplit(pickedSeed);
    const rarity = getSeedRarity(countedSeed);

    return {
      seed: pickedSeed,
      count,
      adv,
      split,
      rarity,
    };
  }, [pickedSeed, getSeedCount, seedWithCount]);

  return (
    <div className="rounded-[2rem] border-2 border-border bg-card p-5 shadow-sm sm:p-7 mt-8">
      <div className="mb-5 flex items-start gap-3">
        <span className="mt-0.5 text-primary">
          <Dices className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-display text-2xl font-black tracking-tight">Random Seed Picker</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Let the dice decide your next run. Customize your setup, season, and stock preservation rules to find the perfect match.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* 1. Station Selection */}
        <div className="space-y-3 rounded-2xl border border-border bg-background p-4">
          <p className="text-xs font-black uppercase tracking-wide text-primary">1. Select Grow Station</p>
          <div className="space-y-2">
            {STATIONS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  setStation(item.value);
                  setPickedSeed(null);
                }}
                className={`w-full rounded-xl border-2 p-3 text-left transition-all ${
                  station === item.value
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <p className="text-sm font-bold">{item.label}</p>
                <p className="mt-1 text-[11px] text-muted-foreground leading-tight">{item.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Season Selection */}
        <div className="space-y-3 rounded-2xl border border-border bg-background p-4">
          <p className="text-xs font-black uppercase tracking-wide text-primary">2. Select Season</p>
          <div className="space-y-2">
            {SEASONS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  setSeason(item.value);
                  setPickedSeed(null);
                }}
                className={`w-full rounded-xl border-2 p-3 text-left transition-all ${
                  season === item.value
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span className="text-sm font-bold">{item.label}</span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground leading-tight">{item.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Stock Rules & Seed Type */}
        <div className="space-y-4 rounded-2xl border border-border bg-background p-4 flex flex-col justify-between">
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-wide text-primary">3. Stock & Type Rules</p>
            
            {/* Seed Type Selector */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">Seed Type</span>
              <div className="grid grid-cols-4 gap-1">
                {SEED_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => {
                      setSelectedType(type.value);
                      setPickedSeed(null);
                    }}
                    className={`rounded-lg border py-1.5 text-xs font-bold transition-all ${
                      selectedType === type.value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preserve Stock Toggle */}
            <label className="flex items-center gap-2 rounded-xl border border-border bg-card p-2.5 cursor-pointer hover:border-primary/30 transition-colors">
              <input
                type="checkbox"
                checked={preserveStock}
                onChange={(e) => {
                  setPreserveStock(e.target.checked);
                  setPickedSeed(null);
                }}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold leading-tight">Preserve Low Stock</p>
                <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">Exclude strains with ≤5 seeds</p>
              </div>
            </label>

            <div className="rounded-xl bg-muted/50 p-2.5 text-xs text-muted-foreground">
              <p className="font-bold text-foreground">Eligible Pool Size</p>
              <p className="mt-1">
                There are <span className="font-bold text-primary">{filteredSeeds.length}</span> strains matching your current filters.
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={handlePick}
            disabled={filteredSeeds.length === 0}
            className="w-full h-11 rounded-xl font-bold text-sm"
          >
            <Dices className="mr-2 h-4 w-4" />
            Roll the Dice
          </Button>
        </div>
      </div>

      {/* Recommended / Advanced Filters Section */}
      <div className="mt-6 rounded-2xl border border-border bg-background p-4">
        <p className="text-xs font-black uppercase tracking-wide text-primary mb-3">Recommended Filters & Options</p>
        <div className="grid gap-4 sm:grid-cols-4">
          {/* Breeder Filter */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wide text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" /> Breeder
            </label>
            <select
              value={selectedBreeder}
              onChange={(e) => {
                setSelectedBreeder(e.target.value);
                setPickedSeed(null);
              }}
              className="w-full rounded-xl border-2 border-border bg-card px-3 py-2 text-xs font-bold focus:border-primary focus:outline-none"
            >
              {availableBreeders.map((breeder) => (
                <option key={breeder} value={breeder}>
                  {breeder}
                </option>
              ))}
            </select>
          </div>

          {/* Easy of Grow Toggle */}
          <label className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-3 cursor-pointer hover:border-primary/30 transition-colors">
            <input
              type="checkbox"
              checked={easyGrowOnly}
              onChange={(e) => {
                setEasyGrowOnly(e.target.checked);
                setPickedSeed(null);
              }}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold leading-tight flex items-center gap-1">
                <Award className="h-3.5 w-3.5 text-emerald-500" /> Beginner Friendly
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">High ease-of-grow rating</p>
            </div>
          </label>

          {/* Frost Monster Toggle */}
          <label className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-3 cursor-pointer hover:border-primary/30 transition-colors">
            <input
              type="checkbox"
              checked={frostMonsterOnly}
              onChange={(e) => {
                setFrostMonsterOnly(e.target.checked);
                setPickedSeed(null);
              }}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold leading-tight flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-sky-500" /> Frost Monster
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">Maximum resin density</p>
            </div>
          </label>

          {/* Loud Terps Toggle */}
          <label className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-3 cursor-pointer hover:border-primary/30 transition-colors">
            <input
              type="checkbox"
              checked={loudTerpsOnly}
              onChange={(e) => {
                setLoudTerpsOnly(e.target.checked);
                setPickedSeed(null);
              }}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold leading-tight flex items-center gap-1">
                <Flame className="h-3.5 w-3.5 text-amber-500" /> Loud Terpenes
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">Intense aroma profile</p>
            </div>
          </label>
        </div>
      </div>

      {/* Picked Seed Result Card */}
      {pickedSeedDetails && (
        <div className="mt-6 rounded-3xl border-2 border-primary/20 bg-primary/5 p-5 animate-in fade-in duration-300">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wide text-primary flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Your Random Selection
              </p>
              <h3 className="font-display text-2xl font-black text-foreground mt-1">
                {pickedSeedDetails.seed.name}
              </h3>
              <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                {pickedSeedDetails.seed.breeder} · {pickedSeedDetails.count} seeds in stock
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <RarityBadge rarity={pickedSeedDetails.rarity} />
              <TypeBadge type={pickedSeedDetails.seed.type} />
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-card p-3 text-xs">
              <p className="text-[9px] font-black uppercase text-muted-foreground">Circadian Window</p>
              <p className="mt-1 font-bold text-foreground">
                {season === "Summer" ? "Heat-Resistant Run" : season === "Winter" ? "Cold-Resistant Run" : "Optimal Season Run"}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {pickedSeedDetails.split.sativa}% Sativa / {pickedSeedDetails.split.indica}% Indica
              </p>
            </div>

            <div className="rounded-2xl bg-card p-3">
              <p className="text-[9px] font-black uppercase text-muted-foreground">Flowering & Stretch</p>
              <p className="mt-1 font-bold text-foreground">
                ~{pickedSeedDetails.adv.floweringWeeks} Weeks
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {pickedSeedDetails.adv.stretchFactor} stretch factor
              </p>
            </div>

            <div className="rounded-2xl bg-card p-3">
              <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">Full-Station Yield ({station})</p>
              {(() => {
                const estimates = estimateSeedGrowth(pickedSeedDetails.seed);
                const est = estimates.find((e) => e.wattage === station) ?? estimates[1];
                const stationYield = scaleYieldForStation(est.yieldG, station);
                return (
                  <>
                    <p className="mt-1 font-display text-lg font-black text-foreground">
                      {stationYield.min}–{stationYield.max}g
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      H: {est.heightCm.min}–{est.heightCm.max}cm per plant
                    </p>
                  </>
                );
              })()}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to={`/strain/${encodeURIComponent(pickedSeedDetails.seed.id)}`}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              View full strain profile
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default RandomSeedPicker;
