"use client";

import React, { useState, useMemo } from "react";
import { Calculator, HelpCircle, Info, Beaker, Layers } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CYCO_PRODUCTS, CYCO_SCHEDULE, type CycoKey } from "@/lib/cycoFeed";

const PRESET_STATIONS = [
  { name: "VGrow Smart Box", lightWattage: 100, fanWattage: 20, estYieldMin: 35, estYieldMax: 80, resSize: 15, resCount: 1, medium: "dwc" as const },
  { name: "AC Infinity 2×4", lightWattage: 280, fanWattage: 40, estYieldMin: 90, estYieldMax: 220, resSize: 50, resCount: 2, medium: "soil" as const },
  { name: "AC Infinity 4×4", lightWattage: 500, fanWattage: 70, estYieldMin: 120, estYieldMax: 400, resSize: 50, resCount: 4, medium: "soil" as const },
];

const DEFAULT_BOTTLE_PRICES: Record<CycoKey, number> = {
  growA: 55,
  growB: 55,
  bloomA: 55,
  bloomB: 55,
  silica: 90,
  ryzofuel: 220,
  b1boost: 110,
  zyme: 10,
  xl: 20,
  swell: 25,
  potashPlus: 30,
  kleanse: 20,
  drRepair: 25,
  uptake: 30,
  phUp: 20,
  phDown: 20,
  greatWhite: 95,
};

const MIXING_GUIDE = {
  dwc: {
    label: "DWC",
    note: "Keep the tank the same strength each week after mixing fresh.",
    perLiter: 1.0,
    weekLabel: "fresh tank volume",
  },
  coco: {
    label: "Coco",
    note: "Mix a full watering batch for each feed and adjust pH before use.",
    perLiter: 0.5,
    weekLabel: "per watering batch",
  },
  soil: {
    label: "Living soil",
    note: "Current direction is water-first Easy As Organics; bottled-feed calculations are comparison-only, not the locked amendment plan.",
    perLiter: 0.25,
    weekLabel: "per watering batch",
  },
} as const;

const formatWeekRange = (index: number) => {
  if (index === 0) return "Week 1";
  if (index >= 1 && index <= 3) return `Veg Week ${index}`;
  if (index === 4) return "Transition";
  if (index >= 5 && index <= 9) return `Flower Week ${index - 4}`;
  return "Flush";
};

const GrowCostCalculator = () => {
  const [lightWatts, setLightWatts] = useState<number>(500);
  const [fanWatts, setFanWatts] = useState<number>(70);
  const [vegWeeks, setVegWeeks] = useState<number>(4);
  const [flowerWeeks, setFlowerWeeks] = useState<number>(9);
  const [kwhRate, setKwhRate] = useState<number>(0.5);
  const [nutrientCost, setNutrientCost] = useState<number>(80);
  const [mediumCost, setMediumCost] = useState<number>(40);
  const [otherCost, setOtherCost] = useState<number>(30);
  const [expectedYield, setExpectedYield] = useState<number>(260);

  const [resSize, setResSize] = useState<number>(50);
  const [resCount, setResCount] = useState<number>(4);
  const [changesPerWeek, setChangesPerWeek] = useState<number>(1);
  const [mixMedium, setMixMedium] = useState<"dwc" | "coco" | "soil">("soil");
  const [waterStartPh, setWaterStartPh] = useState<number>(7.2);
  const [targetPh, setTargetPh] = useState<number>(5.8);
  const [bottlePrices, setBottlePrices] = useState<Record<CycoKey, number>>(DEFAULT_BOTTLE_PRICES);
  const [useCalculatedNutrients, setUseCalculatedNutrients] = useState<boolean>(false);
  const [costType, setCostType] = useState<"consumed" | "upfront">("consumed");

  const applyPreset = (preset: typeof PRESET_STATIONS[0]) => {
    setLightWatts(preset.lightWattage);
    setFanWatts(preset.fanWattage);
    setExpectedYield(Math.round((preset.estYieldMin + preset.estYieldMax) / 2));
    setResSize(preset.resSize);
    setResCount(preset.resCount);
    setMixMedium(preset.medium);
  };

  const calculateForScale = (count: number) => {
    const totalsMl: Record<CycoKey, number> = {
      ryzofuel: 0, growA: 0, growB: 0, bloomA: 0, bloomB: 0,
      silica: 0, b1boost: 0, zyme: 0, xl: 0, swell: 0,
      potashPlus: 0, drRepair: 0, uptake: 0, kleanse: 0, phUp: 0, phDown: 0, greatWhite: 0
    };

    const totalVeg = Math.max(1, vegWeeks);
    const totalFlower = Math.max(1, flowerWeeks);
    const totalWeeks = 1 + totalVeg + 1 + totalFlower + 1;

    for (let w = 1; w <= totalWeeks; w++) {
      let rates: Partial<Record<CycoKey, number>> = {};

      if (w === 1) {
        rates = CYCO_SCHEDULE[0].rates;
      } else if (w <= 1 + totalVeg) {
        const vegWeekNum = w - 1;
        const schedIndex = Math.min(1 + (vegWeekNum - 1), 3);
        rates = CYCO_SCHEDULE[schedIndex].rates;
      } else if (w === 1 + totalVeg + 1) {
        rates = CYCO_SCHEDULE[4].rates;
      } else if (w <= 1 + totalVeg + 1 + totalFlower) {
        const flowerWeekNum = w - (1 + totalVeg + 1);
        const schedIndex = Math.min(5 + (flowerWeekNum - 1), 9);
        rates = CYCO_SCHEDULE[schedIndex].rates;
      } else {
        rates = CYCO_SCHEDULE[10].rates;
      }

      Object.entries(rates).forEach(([key, rate]) => {
        const cycoKey = key as CycoKey;
        const weeklyMl = (rate ?? 0) * resSize * count * changesPerWeek;
        totalsMl[cycoKey] = (totalsMl[cycoKey] ?? 0) + weeklyMl;
      });
    }

    let totalConsumedCost = 0;
    let totalUpfrontCost = 0;
    let totalMlUsed = 0;

    Object.entries(totalsMl).forEach(([key, ml]) => {
      const cycoKey = key as CycoKey;
      const price = bottlePrices[cycoKey] ?? 0;
      const bottlesNeeded = Math.ceil(ml / 5000);

      totalConsumedCost += (ml / 5000) * price;
      totalUpfrontCost += bottlesNeeded * price;
      totalMlUsed += ml;
    });

    return {
      totalMlUsed,
      totalConsumedCost,
      totalUpfrontCost,
      totalWeeks,
    };
  };

  const cycoNutrientCalculations = useMemo(() => {
    const totalsMl: Record<CycoKey, number> = {
      ryzofuel: 0, growA: 0, growB: 0, bloomA: 0, bloomB: 0,
      silica: 0, b1boost: 0, zyme: 0, xl: 0, swell: 0,
      potashPlus: 0, drRepair: 0, uptake: 0, kleanse: 0, phUp: 0, phDown: 0, greatWhite: 0
    };

    const totalVeg = Math.max(1, vegWeeks);
    const totalFlower = Math.max(1, flowerWeeks);
    const totalWeeks = 1 + totalVeg + 1 + totalFlower + 1;

    for (let w = 1; w <= totalWeeks; w++) {
      let rates: Partial<Record<CycoKey, number>> = {};

      if (w === 1) {
        rates = CYCO_SCHEDULE[0].rates;
      } else if (w <= 1 + totalVeg) {
        const vegWeekNum = w - 1;
        const schedIndex = Math.min(1 + (vegWeekNum - 1), 3);
        rates = CYCO_SCHEDULE[schedIndex].rates;
      } else if (w === 1 + totalVeg + 1) {
        rates = CYCO_SCHEDULE[4].rates;
      } else if (w <= 1 + totalVeg + 1 + totalFlower) {
        const flowerWeekNum = w - (1 + totalVeg + 1);
        const schedIndex = Math.min(5 + (flowerWeekNum - 1), 9);
        rates = CYCO_SCHEDULE[schedIndex].rates;
      } else {
        rates = CYCO_SCHEDULE[10].rates;
      }

      Object.entries(rates).forEach(([key, rate]) => {
        const cycoKey = key as CycoKey;
        const weeklyMl = (rate ?? 0) * resSize * resCount * changesPerWeek;
        totalsMl[cycoKey] = (totalsMl[cycoKey] ?? 0) + weeklyMl;
      });
    }

    let totalConsumedCost = 0;
    let totalUpfrontCost = 0;
    const productBreakdown = Object.entries(totalsMl).map(([key, ml]) => {
      const cycoKey = key as CycoKey;
      const price = bottlePrices[cycoKey] ?? 0;
      const litersNeeded = ml / 1000;
      const bottlesNeeded = Math.ceil(ml / 5000);

      const consumedCost = (ml / 5000) * price;
      const upfrontCost = bottlesNeeded * price;

      totalConsumedCost += consumedCost;
      totalUpfrontCost += upfrontCost;

      return {
        key: cycoKey,
        product: CYCO_PRODUCTS[cycoKey],
        ml,
        litersNeeded,
        bottlesNeeded,
        consumedCost,
        upfrontCost,
      };
    }).filter((item) => item.ml > 0);

    return { productBreakdown, totalConsumedCost, totalUpfrontCost };
  }, [vegWeeks, flowerWeeks, resSize, resCount, changesPerWeek, bottlePrices]);

  const scaleComparison = useMemo(() => {
    return [1, 2, 4, 6].map((count) => {
      const data = calculateForScale(count);
      const cost = costType === "consumed" ? data.totalConsumedCost : data.totalUpfrontCost;
      return {
        plants: count,
        totalMl: data.totalMlUsed,
        totalCost: cost,
        weeklyCost: cost / data.totalWeeks,
        weeklyMl: data.totalMlUsed / data.totalWeeks,
      };
    });
  }, [vegWeeks, flowerWeeks, resSize, changesPerWeek, bottlePrices, costType]);

  const handlePriceChange = (key: CycoKey, val: number) => {
    setBottlePrices((prev) => ({ ...prev, [key]: Math.max(0, val) }));
  };

  const calculations = useMemo(() => {
    const vegDays = vegWeeks * 7;
    const flowerDays = flowerWeeks * 7;
    const totalDays = vegDays + flowerDays;

    const lightVegKwh = (lightWatts * 18 * vegDays) / 1000;
    const lightFlowerKwh = (lightWatts * 12 * flowerDays) / 1000;
    const totalLightKwh = lightVegKwh + lightFlowerKwh;
    const totalFanKwh = (fanWatts * 24 * totalDays) / 1000;

    const totalKwh = totalLightKwh + totalFanKwh;
    const electricityCost = totalKwh * kwhRate;

    const activeNutrientCost = useCalculatedNutrients
      ? (costType === "consumed" ? cycoNutrientCalculations.totalConsumedCost : cycoNutrientCalculations.totalUpfrontCost)
      : Number(nutrientCost);

    const totalConsumables = activeNutrientCost + Number(mediumCost) + Number(otherCost);
    const totalCost = electricityCost + totalConsumables;
    const costPerGram = expectedYield > 0 ? totalCost / expectedYield : 0;

    return {
      lightVegKwh,
      lightFlowerKwh,
      totalLightKwh,
      totalFanKwh,
      totalKwh,
      electricityCost,
      activeNutrientCost,
      totalConsumables,
      totalCost,
      costPerGram,
    };
  }, [lightWatts, fanWatts, vegWeeks, flowerWeeks, kwhRate, nutrientCost, mediumCost, otherCost, expectedYield, useCalculatedNutrients, costType, cycoNutrientCalculations]);

  const weeklyMixGuide = useMemo(() => {
    const totalVeg = Math.max(1, vegWeeks);
    const totalFlower = Math.max(1, flowerWeeks);
    const totalWeeks = 1 + totalVeg + 1 + totalFlower + 1;

    const weeks: Array<{
      label: string;
      totalMl: number;
      perPlantMl: number;
      notes: string;
    }> = [];

    for (let w = 1; w <= totalWeeks; w++) {
      const schedule = w === 1
        ? CYCO_SCHEDULE[0]
        : w <= 1 + totalVeg
          ? CYCO_SCHEDULE[Math.min(1 + (w - 2), 3)]
          : w === 1 + totalVeg + 1
            ? CYCO_SCHEDULE[4]
            : w <= 1 + totalVeg + 1 + totalFlower
              ? CYCO_SCHEDULE[Math.min(5 + (w - (1 + totalVeg + 2)), 9)]
              : CYCO_SCHEDULE[10];

      const totalMl = Object.values(schedule.rates).reduce((sum, rate) => sum + ((rate ?? 0) * resSize * resCount * changesPerWeek), 0);
      const perPlantMl = resCount > 0 ? totalMl / resCount : totalMl;

      weeks.push({
        label: formatWeekRange(w),
        totalMl,
        perPlantMl,
        notes: MIXING_GUIDE[mixMedium].note,
      });
    }

    return weeks;
  }, [vegWeeks, flowerWeeks, resSize, resCount, changesPerWeek, mixMedium]);

  const phAdjustment = useMemo(() => {
    const midpoint = mixMedium === "dwc" ? 5.8 : mixMedium === "coco" ? 6.0 : 6.5;
    const safeTarget = Math.min(7.2, Math.max(5.2, targetPh));
    const diff = safeTarget - waterStartPh;
    const approxMlPerPointPer10L = 1.5;
    const amountMl = Math.abs(diff) * (resSize / 10) * approxMlPerPointPer10L;

    return {
      midpoint,
      safeTarget,
      diff,
      amountMl: Number.isFinite(amountMl) ? amountMl : 0,
      direction: diff > 0 ? "ph up" : diff < 0 ? "ph down" : "none",
    };
  }, [mixMedium, waterStartPh, targetPh, resSize]);

  return (
    <div className="space-y-6">
      {/* existing code remains unchanged above ... */}

      <section className="rounded-[2rem] border-2 border-border bg-card p-5 shadow-sm sm:p-7">
        <div className="mb-5 flex items-start gap-3">
          <span className="mt-0.5 text-primary">
            <Beaker className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-2xl font-black tracking-tight">Cyco Platinum Nutrient Calculator</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Calculate the exact volume and cost of Cyco Platinum nutrients needed for your entire run based on 5L bottles.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 rounded-3xl border border-border bg-background p-4 lg:col-span-1">
            <p className="text-xs font-black uppercase tracking-wide text-primary">Reservoir Setup</p>

            <label className="block">
              <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-muted-foreground">Reservoir Size (L)</span>
              <Input type="number" value={resSize} onChange={(e) => setResSize(Math.max(1, Number(e.target.value)))} className="h-10 rounded-xl font-semibold" />
            </label>

            <label className="block">
              <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-muted-foreground">Number of Reservoirs / Buckets</span>
              <Input type="number" value={resCount} onChange={(e) => setResCount(Math.max(1, Number(e.target.value)))} className="h-10 rounded-xl font-semibold" />
            </label>

            <label className="block">
              <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-muted-foreground">Reservoir Changes Per Week</span>
              <Input type="number" value={changesPerWeek} onChange={(e) => setChangesPerWeek(Math.max(1, Number(e.target.value)))} className="h-10 rounded-xl font-semibold" />
            </label>

            <label className="block">
              <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-muted-foreground">Mixing Style</span>
              <select
                value={mixMedium}
                onChange={(e) => setMixMedium(e.target.value as "dwc" | "coco" | "soil")}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-semibold"
              >
                <option value="dwc">DWC</option>
                <option value="coco">Coco</option>
                <option value="soil">Soil</option>
              </select>
            </label>

            <div className="rounded-2xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              <p className="font-bold text-foreground">{MIXING_GUIDE[mixMedium].label} mixing</p>
              <p className="mt-1 leading-relaxed">{MIXING_GUIDE[mixMedium].note}</p>
            </div>

            <label className="block">
              <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-muted-foreground">Starting pH</span>
              <Input
                type="number"
                step="0.1"
                value={waterStartPh}
                onChange={(e) => setWaterStartPh(Number(e.target.value))}
                className="h-10 rounded-xl font-semibold"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-muted-foreground">Target pH</span>
              <Input
                type="number"
                step="0.1"
                value={targetPh}
                onChange={(e) => setTargetPh(Number(e.target.value))}
                className="h-10 rounded-xl font-semibold"
              />
            </label>

            <div className="rounded-2xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              <p className="font-bold text-foreground">pH helper</p>
              <p className="mt-1 leading-relaxed">
                Aim for {phAdjustment.midpoint.toFixed(1)} in {MIXING_GUIDE[mixMedium].label}. Start with a small amount, mix well, then re-test.
              </p>
              <p className="mt-2 leading-relaxed">
                Add roughly <span className="font-bold text-foreground">{phAdjustment.amountMl.toFixed(1)} mL</span> of{" "}
                <span className="font-bold text-foreground">{phAdjustment.direction === "ph up" ? "pH Up" : phAdjustment.direction === "ph down" ? "pH Down" : "either"}</span>{" "}
                for a {resSize}L tank.
              </p>
            </div>

            <div className="border-t border-border/60 pt-3">
              <p className="mb-2 text-xs font-black uppercase tracking-wide text-muted-foreground">Cost Calculation Mode</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCostType("consumed")}
                  className={`flex-1 rounded-xl border py-2 text-xs font-bold transition ${
                    costType === "consumed" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary"
                  }`}
                >
                  Consumed Cost
                </button>
                <button
                  type="button"
                  onClick={() => setCostType("upfront")}
                  className={`flex-1 rounded-xl border py-2 text-xs font-bold transition ${
                    costType === "upfront" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary"
                  }`}
                >
                  Upfront Cost
                </button>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                {costType === "consumed"
                  ? "Calculates the exact cost of nutrients used (proportional to the 5L bottle volume)."
                  : "Calculates the cost of buying full 5L bottles needed to complete the run."}
              </p>
            </div>
          </div>

          {/* rest of the file stays the same */}
        </div>
      </section>

      {/* existing code continues unchanged */}
    </div>
  );
};

export default GrowCostCalculator;